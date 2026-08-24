import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'payment-name',
  title: 'Payment Name',
  license: 'mit',
  packageRepo: 'https://github.com/bitsagarob/payment-name-startos',
  upstreamRepo: 'https://github.com/bitsagarob/payment-name-startos',
  marketingUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki',
  donationUrl: 'https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki',
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerBuild: { dockerfile: 'Dockerfile', workdir: '.' } },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // Deliberately none. Publishing a payment name needs your address and a DNS
  // record, not a Bitcoin node. Tying this to a particular scanning server
  // would exclude everyone who scans a different way, or who only receives.
  dependencies: {},
})
