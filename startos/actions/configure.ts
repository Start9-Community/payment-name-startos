import { sdk } from '../sdk'
import { i18n } from '../i18n'
import {
  paymentNameJson,
  recordName,
  recordValue,
} from '../file-models/payment-name.json'
import { validate } from '../checker'
import { hostedKeyJson } from '../file-models/hosted-key.json'
import {
  checkAvailable,
  claim,
  decodeKey,
  encodeKey,
  HostedError,
  updateAddress,
} from '../hosted'
import { generateSecretKey } from 'nostr-tools/pure'

const { InputSpec, Value } = sdk

/**
 * The domain this package offers as the easy option. Users who want nobody
 * else in the loop should pick "my own domain" instead.
 */
export const HOSTED_DOMAIN = 'silentpayments.net'

const inputSpec = InputSpec.of({
  mode: Value.select({
    name: i18n('Payment name'),
    description: i18n(
      'Publish a human-readable payment name, like alice@example.com, that resolves to your silent payment address. Anyone can then pay you by typing that name into their wallet.',
    ),
    default: 'off',
    values: {
      off: i18n('None'),
      own: i18n('On a domain I control'),
      hosted: i18n('Hosted for me on silentpayments.net'),
    },
  }),
  address: Value.text({
    name: i18n('Your silent payment address'),
    description: i18n(
      'Copy this from your wallet. It starts with sp1. This package cannot work it out for you: it is derived from your wallet keys, which never leave your wallet.',
    ),
    required: false,
    default: null,
    placeholder: 'sp1q...',
    inputmode: 'text',
  }),
  username: Value.text({
    name: i18n('Name'),
    description: i18n(
      'The part before the @. Lowercase letters, digits, dot, dash and underscore only.',
    ),
    required: false,
    default: null,
    placeholder: 'alice',
    inputmode: 'text',
  }),
  domain: Value.text({
    name: i18n('Domain'),
    description: i18n(
      'Only used when publishing on a domain you control. Your domain must have DNSSEC enabled, or wallets will refuse the name.',
    ),
    required: false,
    default: null,
    placeholder: 'example.com',
    inputmode: 'text',
  }),
  checkRecord: Value.toggle({
    name: i18n('Warn me if my payment name changes'),
    description: i18n(
      'Re-check the published record and raise a warning if it stops pointing at your address. Worth leaving on, especially for a hosted name: whoever runs the domain could point it somewhere else, and this is what would tell you.',
    ),
    default: true,
  }),
})

export const configure = sdk.Action.withInput(
  'payment-name',
  async ({ effects }) => ({
    name: i18n('Payment Name'),
    description: i18n(
      'Publish a human-readable name that resolves to your silent payment address.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  inputSpec,
  async () => {
    const cfg = await paymentNameJson.read().once()
    return {
      mode: cfg?.mode ?? 'off',
      address: cfg?.address ?? null,
      username: cfg?.username ?? null,
      domain: cfg?.domain ?? null,
      checkRecord: cfg?.checkRecord ?? true,
    }
  },
  async ({ effects, input }) => {
    if (input.mode === 'off') {
      await paymentNameJson.merge(effects, { mode: 'off' })
      return {
        version: '1',
        title: i18n('Payment Name'),
        message: i18n('Payment name publishing is off.'),
        result: null,
      }
    }

    const domain = input.mode === 'hosted' ? HOSTED_DOMAIN : input.domain
    const check = validate({
      address: input.address,
      username: input.username,
      domain,
    })
    if (!check.ok) throw new Error(check.reason)

    const username = input.username!.trim().toLowerCase()
    const address = input.address!.trim()
    const dom = domain!.trim().toLowerCase()

    await paymentNameJson.merge(effects, {
      mode: input.mode,
      address,
      username,
      domain: dom,
      checkRecord: input.checkRecord,
    })

    if (input.mode === 'own') {
      // Nothing to call: the user publishes this themselves, which is the
      // whole point of this mode.
      return {
        version: '1',
        title: i18n('Publish this DNS record'),
        message: i18n(
          'Add this TXT record to your domain, then make sure DNSSEC is enabled. Without DNSSEC, wallets will refuse the name.',
        ),
        result: {
          type: 'group',
          value: [
            {
              name: i18n('Your payment name'),
              description: i18n('Give this to anyone who wants to pay you.'),
              type: 'single',
              value: `${username}@${dom}`,
              copyable: true,
              qr: true,
              masked: false,
            },
            {
              name: i18n('Record name'),
              description: i18n('The DNS name to create, of type TXT.'),
              type: 'single',
              value: recordName(username, dom),
              copyable: true,
              qr: false,
              masked: false,
            },
            {
              name: i18n('Record value'),
              description: i18n('The exact contents of that TXT record.'),
              type: 'single',
              value: recordValue(address),
              copyable: true,
              qr: false,
              masked: false,
            },
          ],
        },
      }
    }

    // Hosted: claim the name on the user's behalf by signing the request with
    // a key held here. Nothing is copied by hand and no password exists.
    const store = await hostedKeyJson.read().once()
    let secretKey = store?.secretKey
    if (!secretKey) {
      secretKey = encodeKey(generateSecretKey())
      await hostedKeyJson.merge(effects, { secretKey })
    }
    const key = decodeKey(secretKey)

    try {
      // Ask first, so the common failure is a clear message rather than a
      // rejected claim after the user thinks they are done.
      const free = await checkAvailable(username)
      if (!free.available)
        throw new HostedError(free.reason ?? 'That name is not available.')

      const already = await paymentNameJson.read().once()
      const result =
        already?.mode === 'hosted' && already.username === username
          ? await updateAddress(key, username, address)
          : await claim(key, username, address)

      return {
        version: '1',
        title: i18n('Payment Name'),
        message: i18n('Your payment name is live. Nothing else to do.'),
        result: {
          type: 'group',
          value: [
            {
              name: i18n('Your payment name'),
              description: i18n('Give this to anyone who wants to pay you.'),
              type: 'single',
              value: result.name,
              copyable: true,
              qr: true,
              masked: false,
            },
          ],
        },
      }
    } catch (e) {
      // The settings are already saved above, so the user can retry without
      // retyping. Say what failed rather than swallowing it.
      throw new Error(
        e instanceof HostedError
          ? e.message
          : `Could not claim that name: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  },
)
