import {
  paymentNameJson,
  recordName,
  recordValue,
} from './file-models/payment-name.json'

/**
 * Silent payment addresses are bech32m with hrp `sp` (mainnet). Version 0
 * encodes two 33-byte compressed keys, which lands at 116 characters. Reject
 * anything else rather than publishing a record nobody can pay.
 */
const SP_ADDRESS = /^sp1[02-9ac-hj-np-z]{100,150}$/

/** Conservative: labels, no leading/trailing dash, at least one dot. */
const DOMAIN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

/**
 * BIP-353 restricts the local part to these characters. It is stricter than an
 * email address deliberately, so a name cannot be spelled two ways.
 */
const USERNAME = /^[a-z0-9\-_.]{1,63}$/

export type Validated =
  | { ok: true }
  | { ok: false; reason: string }

export function validate(input: {
  address?: string | null
  username?: string | null
  domain?: string | null
}): Validated {
  const address = (input.address ?? '').trim()
  const username = (input.username ?? '').trim().toLowerCase()
  const domain = (input.domain ?? '').trim().toLowerCase()

  if (!SP_ADDRESS.test(address))
    return {
      ok: false,
      reason:
        'That does not look like a silent payment address. It should start with sp1 and be about 116 characters. Copy it from your wallet.',
    }
  if (!USERNAME.test(username))
    return {
      ok: false,
      reason:
        'A payment name may use only lowercase letters, digits, dot, dash and underscore.',
    }
  if (!DOMAIN.test(domain))
    return { ok: false, reason: 'That does not look like a domain name.' }

  return { ok: true }
}

/**
 * Resolve the published TXT record over DNS-over-HTTPS and report whether it
 * still carries the configured address.
 *
 * This is monitoring, not payment validation. A payer's wallet does the real
 * work: it validates the DNSSEC chain itself and is forbidden from trusting a
 * resolver's word for it. Here we only need to notice a change, so asking a
 * public resolver is adequate, and being wrong in the pessimistic direction
 * (reporting a problem that is not there) is the safe failure.
 */
/** Public DNS-over-HTTPS resolvers. Two, so one flapping cannot raise a false alarm. */
const RESOLVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/resolve',
]

type Lookup = {
  ok: boolean
  records: string[]
  validated: boolean | undefined
}

async function lookup(url: string, name: string): Promise<Lookup> {
  const res = await fetch(
    `${url}?name=${encodeURIComponent(name)}&type=TXT`,
    { headers: { accept: 'application/dns-json' } },
  )
  if (!res.ok) return { ok: false, records: [], validated: undefined }

  const body = (await res.json()) as {
    Status?: number
    AD?: boolean
    Answer?: { type: number; data: string }[]
  }
  // A non-zero Status is the resolver refusing to answer, most often because
  // DNSSEC validation failed. That is not the same as "no record", so it must
  // not be reported as one.
  if (body.Status !== undefined && body.Status !== 0)
    return { ok: false, records: [], validated: undefined }

  // TXT RDATA is one or more quoted character-strings which must be joined in
  // order with no separator. Anything not starting `bitcoin:` is not ours.
  const records = (body.Answer ?? [])
    .filter((a) => a.type === 16)
    .map((a) =>
      (a.data.match(/"((?:[^"\\]|\\.)*)"/g) ?? [a.data])
        .map((s) => s.replace(/^"|"$/g, ''))
        .join(''),
    )
    .filter((s) => s.toLowerCase().startsWith('bitcoin:'))

  return { ok: true, records, validated: body.AD }
}

/**
 * Resolve the published record and report whether it still carries the
 * configured address.
 *
 * Monitoring, not payment validation: a payer's wallet validates the DNSSEC
 * chain itself and is forbidden by the spec from trusting a resolver's word.
 * Here we only need to notice a change.
 *
 * Two resolvers, and a problem is only reported when both agree. Turning
 * DNSSEC on flips a zone from "unsigned, trust it" to "signed, verify it", and
 * resolvers holding the old state hard-fail until their caches expire. That is
 * correct behaviour on their part, but a single-resolver check turns it into a
 * red alert on a name that is perfectly fine. This check exists to be believed,
 * so it must not cry wolf.
 */
export async function checkPublishedRecord(): Promise<{
  state: 'match' | 'mismatch' | 'missing' | 'unknown'
  detail: string
}> {
  const cfg = await paymentNameJson.read().once()
  if (!cfg || cfg.mode === 'off' || !cfg.address || !cfg.username || !cfg.domain)
    return { state: 'unknown', detail: 'No payment name configured.' }

  const name = recordName(cfg.username, cfg.domain)
  const expected = recordValue(cfg.address).toLowerCase()

  const results = await Promise.all(
    RESOLVERS.map((r) =>
      lookup(r, name).catch(
        (): Lookup => ({ ok: false, records: [], validated: undefined }),
      ),
    ),
  )

  const answered = results.filter((r) => r.ok)
  if (answered.length === 0)
    return {
      state: 'unknown',
      detail:
        'Could not reach any DNS resolver to check your payment name. This is usually a network problem here, not a problem with your name.',
    }

  const good = answered.filter(
    (r) =>
      r.records.length === 1 &&
      r.records[0].toLowerCase() === expected &&
      r.validated !== false,
  )
  if (good.length > 0)
    return { state: 'match', detail: `${name} points at your address.` }

  // Every resolver that answered disagrees with what was published. Pick the
  // most specific complaint to show.
  const multi = answered.find((r) => r.records.length > 1)
  if (multi)
    return {
      state: 'mismatch',
      detail: `${name} has ${multi.records.length} payment records. Wallets refuse a name with more than one, so nobody can pay you until the extras are removed.`,
    }

  const wrong = answered.find(
    (r) => r.records.length === 1 && r.records[0].toLowerCase() !== expected,
  )
  if (wrong)
    return {
      state: 'mismatch',
      detail: `${name} no longer points at your address. Someone who controls that domain may have changed it. Do not treat that name as yours until you find out why.`,
    }

  const unsigned = answered.find(
    (r) => r.records.length === 1 && r.validated === false,
  )
  if (unsigned)
    return {
      state: 'mismatch',
      detail: `${name} matches your address but is not DNSSEC-signed, so wallets will refuse it.`,
    }

  return {
    state: 'missing',
    detail: `No payment record found at ${name}. If you have just published it, DNS can take a while to catch up.`,
  }
}
