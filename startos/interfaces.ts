import { sdk } from './sdk'

/**
 * No interfaces. This package serves nothing over the network: it publishes a
 * DNS record elsewhere and watches it. Everything the user needs is in the
 * Configure action and the health check.
 */
export const setInterfaces = sdk.setupInterfaces(async () => [])
