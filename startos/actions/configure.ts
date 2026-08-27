import { sdk } from '../sdk'
import { i18n } from '../i18n'
import {
  paymentNameJson,
  recordName,
  recordValue,
  shape,
} from '../fileModels/payment-name.json'
import { DOMAIN, SP_ADDRESS, USERNAME, validate } from '../checker'
import { validateOffer } from '../offer'
import { hostedKeyJson } from '../fileModels/hosted-key.json'
import {
  claim,
  decodeKey,
  encodeKey,
  HOSTED_DOMAIN,
  HostedError,
  release,
  updateAddress,
} from '../hosted'
import { generateSecretKey } from 'nostr-tools/pure'
import { z } from '@start9labs/start-sdk'

const { InputSpec, Value, Variants } = sdk

const address = Value.text({
  name: i18n('Your silent payment address'),
  description: i18n(
    'Copy this from your wallet. It starts with sp1. This package cannot work it out for you: it is derived from your wallet keys, which never leave your wallet.',
  ),
  required: true,
  default: null,
  placeholder: 'sp1q...',
  inputmode: 'text',
  patterns: [
    {
      regex: SP_ADDRESS.source,
      description: i18n(
        'Must start with sp1 and be about 116 characters long.',
      ),
    },
  ],
})

/**
 * Optional, unlike the address, because a BOLT 12 offer has no checksum: a
 * swapped character is publishable and undetectable. No `patterns` entry for
 * the same reason, since a regex would promise a check it cannot make. The
 * real validation is a TLV walk in offer.ts.
 */
const offer = Value.text({
  name: i18n('Lightning offer'),
  description: i18n(
    "Optional. A BOLT 12 offer from a Lightning wallet, starting lno1. Add one and the same name pays over Lightning too, with the sender's wallet choosing which. Leave it empty if you do not have one.",
  ),
  required: false,
  default: null,
  placeholder: 'lno1...',
  inputmode: 'text',
})

const username = Value.text({
  name: i18n('Name'),
  description: i18n('The part before the @.'),
  required: true,
  default: null,
  placeholder: 'alice',
  inputmode: 'text',
  patterns: [
    {
      regex: USERNAME.source,
      description: i18n(
        'Lowercase letters, digits, dot, dash and underscore only.',
      ),
    },
  ],
})

const domain = Value.text({
  name: i18n('Domain'),
  description: i18n(
    'Your domain must have DNSSEC enabled, or wallets will refuse the name.',
  ),
  required: true,
  default: null,
  placeholder: 'example.com',
  inputmode: 'text',
  patterns: [
    {
      regex: DOMAIN.source,
      description: i18n('A domain name, like example.com.'),
    },
  ],
})

const checkRecord = Value.toggle({
  name: i18n('Warn me if my payment name changes'),
  description: i18n(
    'Re-check the published record and raise a warning if it stops pointing at your address. Worth leaving on, especially for a hosted name: whoever runs the domain could point it somewhere else, and this is what would tell you.',
  ),
  default: true,
})

const inputSpec = InputSpec.of({
  publish: Value.union({
    name: i18n('Payment name'),
    description: i18n(
      'Publish a human-readable payment name, like alice@example.com, that resolves to your silent payment address. Anyone can then pay you by typing that name into their wallet.',
    ),
    default: 'off',
    variants: Variants.of({
      off: { name: i18n('None'), spec: InputSpec.of({}) },
      own: {
        name: i18n('On a domain I control'),
        spec: InputSpec.of({ address, offer, username, domain, checkRecord }),
      },
      hosted: {
        name: i18n('Hosted for me on silentpayments.net'),
        spec: InputSpec.of({ address, offer, username, checkRecord }),
      },
    }),
  }),
})

/**
 * Give up a hosted name this server is no longer publishing, so it does not sit
 * claimed on a domain nothing here can reach any more.
 */
async function releaseStale(
  prior: z.infer<typeof shape> | null,
  keep: string | null,
): Promise<string | null> {
  if (prior?.mode !== 'hosted' || !prior.username || prior.username === keep)
    return null

  const secretKey = (await hostedKeyJson.read().once())?.secretKey
  if (!secretKey) return null

  const name = `${prior.username}@${HOSTED_DOMAIN}`
  try {
    await release(decodeKey(secretKey), prior.username)
    return i18n('Your previous hosted name ${name} has been released.', {
      name,
    })
  } catch (e) {
    return i18n(
      'Could not release your previous hosted name ${name}: ${detail}',
      {
        name,
        detail: e instanceof Error ? e.message : String(e),
      },
    )
  }
}

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
    // `other` carries the fields across a variant switch, so changing where the
    // name lives does not make the user paste a 116-character address again.
    const shared = {
      address: cfg?.address,
      username: cfg?.username,
      offer: cfg?.offer,
      checkRecord: cfg?.checkRecord ?? true,
    }
    const own = { ...shared, domain: cfg?.domain }

    if (cfg?.mode === 'own')
      return {
        publish: {
          selection: 'own' as const,
          value: own,
          other: { hosted: shared },
        },
      }
    if (cfg?.mode === 'hosted')
      return {
        publish: {
          selection: 'hosted' as const,
          value: shared,
          other: { own },
        },
      }
    return {
      publish: {
        selection: 'off' as const,
        value: {},
        other: { own, hosted: shared },
      },
    }
  },
  async ({ effects, input }) => {
    const prior = await paymentNameJson.read().once()
    const { publish } = input

    if (publish.selection === 'off') {
      const note = await releaseStale(prior, null)
      await paymentNameJson.merge(effects, { mode: 'off' })
      return {
        version: '1',
        title: i18n('Payment Name'),
        message: [i18n('Payment name publishing is off.'), note]
          .filter(Boolean)
          .join(' '),
        result: null,
      }
    }

    const check = validate({
      address: publish.value.address,
      username: publish.value.username,
      domain:
        publish.selection === 'own' ? publish.value.domain : HOSTED_DOMAIN,
    })
    if (!check.ok) throw new Error(check.reason)
    const { address, username, domain } = check
    const { checkRecord } = publish.value

    const offerCheck = validateOffer(publish.value.offer)
    if (!offerCheck.ok) throw new Error(offerCheck.reason)
    const offer = offerCheck.offer ?? undefined

    if (publish.selection === 'own') {
      const note = await releaseStale(prior, null)

      await paymentNameJson.merge(effects, {
        mode: 'own',
        address,
        offer,
        username,
        domain,
        checkRecord,
      })
      return {
        version: '1',
        title: i18n('Publish this DNS record'),
        message: [
          i18n(
            'Add this TXT record to your domain, then make sure DNSSEC is enabled. Without DNSSEC, wallets will refuse the name.',
          ),
          note,
        ]
          .filter(Boolean)
          .join(' '),
        result: {
          type: 'group',
          value: [
            {
              name: i18n('Your payment name'),
              description: i18n('Give this to anyone who wants to pay you.'),
              type: 'single',
              value: `${username}@${domain}`,
              copyable: true,
              qr: true,
              masked: false,
            },
            {
              name: i18n('Record name'),
              description: i18n('The DNS name to create, of type TXT.'),
              type: 'single',
              value: recordName(username, domain),
              copyable: true,
              qr: false,
              masked: false,
            },
            {
              name: i18n('Record value'),
              description: i18n('The exact contents of that TXT record.'),
              type: 'single',
              value: recordValue(address, offer),
              copyable: true,
              qr: false,
              masked: false,
            },
          ],
        },
      }
    }

    const store = await hostedKeyJson.read().once()
    let secretKey = store?.secretKey
    if (!secretKey) {
      secretKey = encodeKey(generateSecretKey())
      await hostedKeyJson.merge(effects, { secretKey })
    }
    const key = decodeKey(secretKey)

    let result
    try {
      result = await claim(key, username, address, offer)
    } catch (e) {
      // 409 is the service reporting the name already exists, which is the only
      // thing that distinguishes a first claim from an update.
      if (!(e instanceof HostedError) || e.status !== 409) throw e
      try {
        result = await updateAddress(key, username, address, offer)
      } catch (inner) {
        // 404 means the name is not there to update, so the claim's own refusal
        // was the real reason and this fallback never had anything to say. Show
        // that instead: "No such name." is the least true thing the user could
        // be told about a name the service has just refused to issue.
        if (inner instanceof HostedError && inner.status === 404) throw e
        throw new HostedError(
          inner instanceof HostedError && inner.status === 403
            ? i18n(
                '${name} is taken by someone else, or by a previous install of this package whose key is gone. Pick another name.',
                { name: `${username}@${HOSTED_DOMAIN}` },
              )
            : inner instanceof Error
              ? inner.message
              : String(inner),
        )
      }
    }

    // Only after the new name is secured: a rename that released first and then
    // failed to claim would leave the user with neither.
    const note = await releaseStale(prior, username)

    await paymentNameJson.merge(effects, {
      mode: 'hosted',
      address,
      offer,
      username,
      domain,
      checkRecord,
    })

    return {
      version: '1',
      title: i18n('Payment Name'),
      message: [i18n('Your payment name is live. Nothing else to do.'), note]
        .filter(Boolean)
        .join(' '),
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
  },
)
