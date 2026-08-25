import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:1',
  releaseNotes: {
    en_US: `First release.

Publish a BIP 353 payment name for your silent payment address, on a domain you control, and keep an eye on it afterwards.

Hosted names on a shared domain are stubbed out for now: the setting is saved, but the service behind it does not exist yet.`,
  },
  migrations: {},
})
