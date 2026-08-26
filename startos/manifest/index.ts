import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'payment-name',
  title: 'Payment Name',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/payment-name-startos',
  upstreamRepo: 'https://github.com/bitsagarob/payment-name-startos',
  marketingUrl:
    'https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerBuild: { dockerfile: 'Dockerfile', workdir: '.' } },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
