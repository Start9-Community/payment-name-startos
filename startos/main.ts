import { sdk } from './sdk'
import { i18n } from './i18n'
import { paymentNameJson } from './fileModels/payment-name.json'
import { checkPublishedRecord } from './checker'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Payment Name'))

  // Restart when the published name changes, so a fresh check runs against the
  // new values rather than serving a stale verdict from the cache below.
  await paymentNameJson.read().const(effects)

  // The check is a DNS-over-HTTPS request and health checks run on a short
  // interval, so cache the verdict. Five minutes is far quicker than any
  // realistic response to a repointed name, and polite to the resolver.
  let cache: { at: number; state: string; detail: string } | null = null

  return sdk.Daemons.of(effects).addDaemon('primary', {
    // Nothing to run. This package's work happens in the health check below,
    // which executes in the StartOS JS runtime rather than in the container.
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'primary-sub',
    ),
    exec: { command: ['sleep', 'infinity'] },
    ready: {
      display: i18n('Payment Name'),
      fn: async () => {
        const cfg = await paymentNameJson.read().once()
        // 'disabled', not 'success'. A green tick for "you have not set this
        // up" claims something is working when nothing is happening at all.
        if (!cfg || cfg.mode === 'off')
          return {
            result: 'disabled',
            message: i18n('No payment name published yet'),
          }
        if (!cfg.checkRecord)
          return {
            result: 'disabled',
            message: i18n('Publishing, but not watching for changes'),
          }

        const now = Date.now()
        if (!cache || now - cache.at > 300_000) {
          const checked = await checkPublishedRecord()
          cache = { at: now, ...checked }
        }

        switch (cache.state) {
          case 'match':
            return {
              result: 'success',
              message: i18n(
                'Payment name is published and matches your address',
              ),
            }
          // A name that no longer points at the user is the whole reason this
          // package exists, so it fails loudly rather than warning quietly.
          case 'mismatch':
            return { result: 'failure', message: cache.detail }
          // Not published yet is the normal state right after configuring, and
          // an unreachable resolver is not evidence about the name either way.
          default:
            return { result: 'loading', message: cache.detail }
        }
      },
    },
    requires: [],
  })
})
