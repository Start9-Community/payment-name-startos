import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * The key that owns any name claimed on the hosted domain.
 *
 * Kept apart from payment-name.json because this is the credential, not a
 * setting. Whoever holds it controls where the name points, so losing it means
 * losing the ability to change or release that name. It is inside the volume,
 * so a StartOS backup covers it.
 *
 * Generated on first use and never sent anywhere: only signatures made with it
 * leave this box.
 */
export const shape = z.object({
  secretKey: z.string().optional().catch(undefined),
})

export const hostedKeyJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/hosted-key.json' },
  shape,
)
