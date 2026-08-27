import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * A BIP-353 payment name published for this user's silent payment address.
 *
 * The address is entered by the user, not discovered. It is derived from the
 * wallet's scan and spend keys, which never leave the wallet, so nothing on
 * this machine can work it out.
 *
 * Two modes, and the difference is who can change where the name points:
 *
 * - `own`   the user controls the domain. Nobody but them can repoint it.
 * - `hosted` someone else controls the domain. Convenient, and it means that
 *   operator could silently repoint the name at their own address. DNSSEC does
 *   not help: it proves the domain owner said something, not that the user
 *   agreed. This is why `checkRecord` exists.
 */
export const shape = z.object({
  mode: z.enum(['off', 'own', 'hosted']).catch('off'),
  /** bech32m, hrp `sp`, mainnet. Validated in the configure action. */
  address: z.string().optional().catch(undefined),
  /**
   * An optional BOLT 12 offer, so one name pays over Lightning or on-chain and
   * the sender's wallet decides which.
   *
   * Optional, and the address is not, because a BOLT 12 offer carries no
   * checksum: a swapped character is publishable and nothing can detect it.
   * The address is bech32m and a typo in it fails immediately, so it stays the
   * leg that always works.
   */
  offer: z.string().optional().catch(undefined),
  /** The local part, e.g. `alice` in alice@example.com. */
  username: z.string().optional().catch(undefined),
  /** The domain part. Fixed by the provider in `hosted` mode. */
  domain: z.string().optional().catch(undefined),
  /**
   * Re-resolve the published record and warn if it stops matching. In hosted
   * mode this is the only thing standing between the user and a silent
   * repoint, so it defaults on.
   */
  checkRecord: z.boolean().catch(true),
})

export const paymentNameJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/payment-name.json',
  },
  shape,
)

/** The DNS owner name a BIP-353 record lives at. */
export const recordName = (username: string, domain: string) =>
  `${username}.user._bitcoin-payment.${domain}`

/**
 * The record's contents: a BIP-321 URI. The silent payment address is always
 * present; a BOLT 12 offer rides alongside it as `lno` when the user gave one,
 * and the payer's wallet picks a rail.
 */
export const recordValue = (address: string, offer?: string) =>
  offer ? `bitcoin:?sp=${address}&lno=${offer}` : `bitcoin:?sp=${address}`
