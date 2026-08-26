import { finalizeEvent } from 'nostr-tools/pure'
import { getToken } from 'nostr-tools/nip98'
import { bytesToHex, hexToBytes } from 'nostr-tools/utils'
import { i18n } from './i18n'

/**
 * Claiming a name on the hosted domain. The alternative — a password handed out
 * once — would still have to be stored on this box, so instead a key generated
 * here signs each request under NIP-98 and never leaves the volume.
 */

/** The domain this package offers as the easy option. */
export const HOSTED_DOMAIN = 'silentpayments.net'

/** Where the hosted service lives. Also the origin every signature covers. */
export const HOSTED_ORIGIN = `https://${HOSTED_DOMAIN}`

export type ClaimResult = { name: string }

export class HostedError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

export const encodeKey = (k: Uint8Array) => bytesToHex(k)
export const decodeKey = (s: string) => hexToBytes(s)

async function call<T>(
  secretKey: Uint8Array,
  method: string,
  path: string,
  payload?: Record<string, string>,
): Promise<T> {
  const url = HOSTED_ORIGIN + path
  // getToken hashes JSON.stringify(payload), so the body must be that same
  // string rather than a re-serialised copy.
  const body = payload === undefined ? undefined : JSON.stringify(payload)

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        authorization: await getToken(
          url,
          method,
          (e) => finalizeEvent(e, secretKey),
          true,
          payload,
        ),
      },
      body,
    })
  } catch (e) {
    throw new HostedError(
      `${i18n('Could not reach ${origin}. Nothing was changed.', {
        origin: HOSTED_ORIGIN,
      })} ${e instanceof Error ? e.message : ''}`.trim(),
    )
  }

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new HostedError(
      i18n('${origin} returned something unreadable.', {
        origin: HOSTED_ORIGIN,
      }),
    )
  }

  if (!res.ok) {
    const error = (json as { error?: unknown } | null)?.error
    throw new HostedError(
      typeof error === 'string'
        ? error
        : i18n('Request failed (${status}).', { status: res.status }),
      res.status,
    )
  }
  return json as T
}

export const claim = (k: Uint8Array, username: string, address: string) =>
  call<ClaimResult>(k, 'POST', '/api/claim', { username, address })

export const updateAddress = (
  k: Uint8Array,
  username: string,
  address: string,
) => call<ClaimResult>(k, 'PUT', `/api/name/${username}`, { address })

export const release = (k: Uint8Array, username: string) =>
  call<{ released: string }>(k, 'DELETE', `/api/name/${username}`)
