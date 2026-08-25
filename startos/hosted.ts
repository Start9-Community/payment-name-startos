import { finalizeEvent, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { sha256 } from '@noble/hashes/sha2'

/**
 * Claiming a name on a hosted domain, on the user's behalf.
 *
 * The alternative was a password the service hands out once and the user has
 * to keep safe. That is fine for a person filling in a form and useless here:
 * this box would have to store it anyway, and the user would have to carry it
 * between machines.
 *
 * So instead this holds a key, and proves who it is by signing each request.
 * Nothing to write down, nothing to lose, and the name is bound to a key that
 * never leaves the volume.
 */

const KIND = 27235

/** Where the hosted service lives. Also the origin every signature covers. */
export const HOSTED_ORIGIN = 'https://silentpayments.net'

export type ClaimResult = {
  name: string
  address: string
  record?: { name: string; type: string; value: string }
}

export class HostedError extends Error {}

/**
 * Sign one request under NIP-98.
 *
 * The `u` tag must be the exact absolute URL the server will compare against,
 * query string included, and the payload tag must hash the bytes actually sent
 * rather than a re-serialised copy of the object. Both are checked strictly at
 * the other end, so both are built from the same values used to send.
 */
function authHeader(
  secretKey: Uint8Array,
  method: string,
  url: string,
  body: string | null,
): string {
  const tags: string[][] = [
    ['u', url],
    ['method', method],
  ]
  if (body !== null)
    tags.push(['payload', bytesToHex(sha256(new TextEncoder().encode(body)))])

  const event = finalizeEvent(
    {
      kind: KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: '',
    },
    secretKey,
  )

  return `Nostr ${Buffer.from(JSON.stringify(event)).toString('base64')}`
}

async function call(
  secretKey: Uint8Array,
  method: string,
  path: string,
  payload?: unknown,
): Promise<any> {
  const url = HOSTED_ORIGIN + path
  const body = payload === undefined ? null : JSON.stringify(payload)

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        authorization: authHeader(secretKey, method, url, body),
      },
      body: body ?? undefined,
    })
  } catch (e) {
    throw new HostedError(
      `Could not reach ${HOSTED_ORIGIN}. Nothing was changed. ${e instanceof Error ? e.message : ''}`.trim(),
    )
  }

  let json: any
  try {
    json = await res.json()
  } catch {
    throw new HostedError(`${HOSTED_ORIGIN} returned something unreadable.`)
  }

  if (!res.ok) throw new HostedError(json?.error ?? `Request failed (${res.status})`)
  return json
}

export const pubkeyOf = (secretKey: Uint8Array) => getPublicKey(secretKey)

export const encodeKey = (k: Uint8Array) => bytesToHex(k)
export const decodeKey = (s: string) => hexToBytes(s)

/** Is this name free on the hosted domain? */
export async function checkAvailable(username: string): Promise<{
  available: boolean
  reason: string | null
}> {
  const res = await fetch(
    `${HOSTED_ORIGIN}/api/check?name=${encodeURIComponent(username)}`,
  ).catch(() => null)
  if (!res || !res.ok)
    throw new HostedError(`Could not reach ${HOSTED_ORIGIN} to check that name.`)
  const j = await res.json()
  return { available: !!j.available, reason: j.reason ?? null }
}

export const claim = (k: Uint8Array, username: string, address: string) =>
  call(k, 'POST', '/api/claim', { username, address }) as Promise<ClaimResult>

export const updateAddress = (k: Uint8Array, username: string, address: string) =>
  call(k, 'PUT', `/api/name/${username}`, { address }) as Promise<ClaimResult>

export const release = (k: Uint8Array, username: string) =>
  call(k, 'DELETE', `/api/name/${username}`) as Promise<{ released: string }>
