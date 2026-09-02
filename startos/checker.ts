import { i18n } from './i18n'
import {
  paymentNameJson,
  recordName,
  recordValue,
} from './fileModels/payment-name.json'

/** bech32m data part of a version-0 silent payment address: two 33-byte keys. */
export const SP_ADDRESS = /^sp1[02-9ac-hj-np-z]{100,150}$/

export const DOMAIN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

/** BIP-353 restricts the local part to these, so a name cannot be spelled two ways. */
export const USERNAME = /^[a-z0-9\-_.]{1,63}$/

export type Validated =
  | { ok: true; address: string; username: string; domain: string }
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
      reason: i18n(
        'That does not look like a silent payment address. It should start with sp1 and be about 116 characters. Copy it from your wallet.',
      ),
    }
  if (!USERNAME.test(username))
    return {
      ok: false,
      reason: i18n(
        'A payment name may use only lowercase letters, digits, dot, dash and underscore.',
      ),
    }
  if (!DOMAIN.test(domain))
    return { ok: false, reason: i18n('That does not look like a domain name.') }

  return { ok: true, address, username, domain }
}

/**
 * DNS-over-HTTPS, not the container resolver: StartOS forwards DNS without
 * RRSIG or the AD flag, so a signed answer cannot be told from an unsigned one
 * over port 53.
 */
const RESOLVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/resolve',
]

/**
 * A named parameter of a BIP-321 URI's query string. BIP-353 allows a name to
 * carry several payment instructions in one record, so comparing the whole
 * string would report a user who added a second instruction as repointed.
 * More than one occurrence of the same key is never a legitimate value —
 * `\0` cannot appear in a real address or offer — so it can only ever fail a
 * comparison, whether the caller expected a specific value or none at all.
 */
function paramOf(record: string, key: string): string | null {
  const q = record.toLowerCase().indexOf('?')
  if (q < 0) return null
  const values = new URLSearchParams(record.toLowerCase().slice(q + 1)).getAll(
    key,
  )
  if (values.length <= 1) return values[0] ?? null
  return values.join('\0')
}

/**
 * A BIP-321 URI reduced to what it instructs a payer to do: the part before the
 * `?` verbatim, then its parameters sorted. Ordering and a trailing separator
 * are spelling, and the hosted service picks the spelling, not this package.
 */
function canonical(uri: string): string {
  const lower = uri.toLowerCase()
  const q = lower.indexOf('?')
  if (q < 0) return lower
  const params = [...new URLSearchParams(lower.slice(q + 1))].sort().map(String)
  return [lower.slice(0, q), ...params].join('\n')
}

/**
 * Does this record still carry what the user configured?
 *
 * In `hosted` mode this package is the record's only legitimate writer — the
 * hosted service will not touch a name without the NIP-98 key that lives
 * solely in this package's volume — so the whole record is compared against
 * what publishing `address`/`offer` would produce. That catches an addition of
 * any name, without having to name it first.
 *
 * `own` mode can't use that shortcut: the user's own DNS provider may
 * legitimately carry payment instructions this package never asked for, so
 * only the parameters it actually manages are compared, `null` included for
 * an unset offer — an offer that appears without the user having set one is
 * the same silent repoint this package exists to catch, one parameter over.
 */
function carries(
  record: string,
  mode: 'own' | 'hosted',
  address: string,
  offer?: string,
): boolean {
  if (mode === 'hosted')
    return canonical(record) === canonical(recordValue(address, offer))
  if (paramOf(record, 'sp') !== address) return false
  return paramOf(record, 'lno') === (offer ? offer.toLowerCase() : null)
}

type Lookup = {
  ok: boolean
  records: string[]
  validated: boolean | undefined
}

async function lookup(url: string, name: string): Promise<Lookup> {
  const res = await fetch(`${url}?name=${encodeURIComponent(name)}&type=TXT`, {
    headers: { accept: 'application/dns-json' },
  })
  if (!res.ok) return { ok: false, records: [], validated: undefined }

  const body = (await res.json()) as {
    Status?: number
    AD?: boolean
    Answer?: { type: number; data: string }[]
  }
  // A non-zero Status is the resolver refusing to answer, most often a DNSSEC
  // validation failure — not the same as "no record".
  if (body.Status !== undefined && body.Status !== 0)
    return { ok: false, records: [], validated: undefined }

  // TXT RDATA is one or more quoted character-strings, joined in order with no
  // separator.
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
 * Two resolvers, and a problem is reported only when every one that answered
 * agrees: enabling DNSSEC hard-fails resolvers holding the unsigned answer
 * until their caches expire, and a check that cries wolf stops being believed.
 */
export async function checkPublishedRecord(): Promise<{
  state: 'match' | 'mismatch' | 'missing' | 'unknown'
  detail: string
}> {
  const cfg = await paymentNameJson.read().once()
  if (
    !cfg ||
    cfg.mode === 'off' ||
    !cfg.address ||
    !cfg.username ||
    !cfg.domain
  )
    return { state: 'unknown', detail: i18n('No payment name configured.') }

  const mode = cfg.mode
  const name = recordName(cfg.username, cfg.domain)
  const expected = cfg.address.toLowerCase()
  const expectedOffer = cfg.offer?.toLowerCase()

  const results = await Promise.all(
    RESOLVERS.map((r) =>
      lookup(r, name).catch((): Lookup => ({
        ok: false,
        records: [],
        validated: undefined,
      })),
    ),
  )

  const answered = results.filter((r) => r.ok)
  if (answered.length === 0)
    return {
      state: 'unknown',
      detail: i18n(
        'Could not reach any DNS resolver to check your payment name. This is usually a network problem here, not a problem with your name.',
      ),
    }

  const good = answered.filter(
    (r) =>
      r.records.length === 1 &&
      carries(r.records[0], mode, expected, expectedOffer) &&
      r.validated !== false,
  )
  if (good.length > 0)
    return {
      state: 'match',
      detail: i18n('${name} points at your address.', { name }),
    }

  const multi = answered.find((r) => r.records.length > 1)
  if (multi)
    return {
      state: 'mismatch',
      detail: i18n(
        '${name} has ${count} payment records. Wallets refuse a name with more than one, so nobody can pay you until the extras are removed.',
        // A number here would reach Intl.NumberFormat, which throws under the
        // service container's LANG=C.UTF-8.
        { name, count: String(multi.records.length) },
      ),
    }

  const wrong = answered.find(
    (r) =>
      r.records.length === 1 &&
      !carries(r.records[0], mode, expected, expectedOffer),
  )
  if (wrong)
    return {
      state: 'mismatch',
      detail: i18n(
        '${name} no longer points at your address. Someone who controls that domain may have changed it. Do not treat that name as yours until you find out why.',
        { name },
      ),
    }

  const unsigned = answered.find(
    (r) => r.records.length === 1 && r.validated === false,
  )
  if (unsigned)
    return {
      state: 'mismatch',
      detail: i18n(
        '${name} matches your address but is not DNSSEC-signed, so wallets will refuse it.',
        { name },
      ),
    }

  return {
    state: 'missing',
    detail: i18n(
      'No payment record found at ${name}. If you have just published it, DNS can take a while to catch up.',
      { name },
    ),
  }
}
