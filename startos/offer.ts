import { i18n } from './i18n'

/**
 * BOLT 12 offer validation.
 *
 * An offer has no checksum. BOLT 12 says so outright, unlike bech32m, which is
 * why the offer field is optional here and the silent payment address is not:
 * a swapped character in an offer is publishable and undetectable, while the
 * same mistake in an `sp1` address fails immediately.
 *
 * What can still be checked is structure, and it catches everything except a
 * substitution: the prefix, a bech32 alphabet, a clean 5-bit unpacking, a TLV
 * stream that parses and ends exactly, and the one field the spec makes
 * mandatory. Verified against the real offer published at mattcorallo.com.
 */

const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

/**
 * Capped by the QR code, not by DNS. A name should stay scannable as a single
 * code that pays either way, and a byte-mode encoder tops out well before DNS
 * complains. DNS is the looser limit: a silent payment address plus a 435
 * character offer measures 773 bytes over DNSSEC, past the 512 byte UDP limit
 * and into EDNS or TCP, which works but is worth knowing.
 */
export const MAX_OFFER_LENGTH = 700

/**
 * BOLT 12's BigSize integer. A non-canonical encoding is rejected, because two
 * spellings of one number mean two byte strings for the same offer.
 */
function readBigSize(
  buf: Uint8Array,
  i: number,
): { value: number; next: number } | null {
  if (i >= buf.length) return null
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const first = buf[i]
  if (first < 0xfd) return { value: first, next: i + 1 }
  if (first === 0xfd) {
    if (i + 3 > buf.length) return null
    const value = view.getUint16(i + 1)
    return value < 0xfd ? null : { value, next: i + 3 }
  }
  if (first === 0xfe) {
    if (i + 5 > buf.length) return null
    const value = view.getUint32(i + 1)
    return value < 0x10000 ? null : { value, next: i + 5 }
  }
  if (i + 9 > buf.length) return null
  const value = view.getBigUint64(i + 1)
  return value < 0x100000000n ? null : { value: Number(value), next: i + 9 }
}

/**
 * Undo the bech32 5-bit grouping. There is no checksum to strip. Trailing bits
 * must be fewer than five and all zero, exactly as bech32 requires, so at
 * least a truncated offer is caught here.
 */
function fromWords(chars: string): Uint8Array | null {
  let acc = 0
  let bits = 0
  const out: number[] = []
  for (const ch of chars) {
    const v = BECH32.indexOf(ch)
    if (v < 0) return null
    acc = (acc << 5) | v
    bits += 5
    while (bits >= 8) {
      bits -= 8
      out.push((acc >> bits) & 0xff)
    }
  }
  if (bits >= 5 || ((acc << (8 - bits)) & 0xff) !== 0) return null
  return Uint8Array.from(out)
}

/**
 * Walk the TLV stream. Types must strictly increase and the stream must end
 * exactly, which together catch a mangled paste that the missing checksum
 * would otherwise let through.
 *
 * Unknown even types are deliberately NOT rejected. A reader paying the offer
 * must reject them, but "unknown" there means unknown to a wallet, and a field
 * added to BOLT 12 after this was written would be known to the payer and not
 * to us. Refusing it here would break a valid offer.
 */
function tlvTypes(buf: Uint8Array): number[] | null {
  const types: number[] = []
  let i = 0
  let last = -1
  while (i < buf.length) {
    const type = readBigSize(buf, i)
    if (!type || type.value <= last) return null
    const len = readBigSize(buf, type.next)
    if (!len) return null
    const end = len.next + len.value
    if (end > buf.length) return null
    types.push(type.value)
    last = type.value
    i = end
  }
  return types
}

export type OfferResult =
  { ok: true; offer: string | null } | { ok: false; reason: string }

/** @param input what the user pasted, or nothing */
export function validateOffer(input: string | null | undefined): OfferResult {
  const raw = (input ?? '').trim()
  if (!raw) return { ok: true, offer: null }

  // BOLT 12 lets a writer break a long offer with `+` and whitespace and says
  // readers must put it back together. People paste what their wallet showed
  // them, so accept it and store the joined form.
  const joined = raw.replace(/\+\s*/g, '')

  if (joined.length > MAX_OFFER_LENGTH)
    return {
      ok: false,
      reason: i18n('That Lightning offer is too long to publish.'),
    }

  // All lowercase or all uppercase, never mixed. Mixed case in bech32 is how a
  // corrupted copy usually announces itself.
  if (/[a-z]/.test(joined) && /[A-Z]/.test(joined))
    return {
      ok: false,
      reason: i18n(
        'That Lightning offer mixes upper and lower case. Copy it again from your wallet.',
      ),
    }
  const offer = joined.toLowerCase()

  if (!offer.startsWith('lno1'))
    return {
      ok: false,
      reason: i18n(
        'A BOLT 12 offer starts with lno1. Copy it from your Lightning wallet.',
      ),
    }

  const bytes = fromWords(offer.slice(4))
  if (bytes === null || bytes.length === 0)
    return {
      ok: false,
      reason: i18n(
        'That Lightning offer is not valid. Some of it is missing or mistyped.',
      ),
    }

  const types = tlvTypes(bytes)
  if (types === null)
    return {
      ok: false,
      reason: i18n(
        'That Lightning offer is not valid. Some of it is missing or mistyped.',
      ),
    }

  // offer_issuer_id, or offer_paths when the node is reached through a blinded
  // path instead. Without one of the two there is nobody to pay.
  if (!types.includes(22) && !types.includes(16))
    return {
      ok: false,
      reason: i18n(
        'That Lightning offer names no node to pay. Copy it again from your wallet.',
      ),
    }

  return { ok: true, offer }
}
