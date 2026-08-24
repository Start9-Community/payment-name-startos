import { sdk } from './sdk'

/**
 * The whole of this package's state is one small JSON file naming what was
 * published and where. Worth keeping: losing it does not lose the DNS record,
 * but it does lose the watchdog that notices if that record changes.
 */
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main'),
)
