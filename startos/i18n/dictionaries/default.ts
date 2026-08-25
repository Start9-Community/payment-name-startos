export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Payment Name': 0,
  'Payment Name': 1,
  'Payment name is published and matches your address': 2,
  'No payment name published yet': 3,
  'Publishing, but not watching for changes': 4,
  // actions/configure.ts
  'Payment name': 13,
  'Publish a human-readable name that resolves to your silent payment address.': 14,
  'Publish a human-readable payment name, like alice@example.com, that resolves to your silent payment address. Anyone can then pay you by typing that name into their wallet.': 15,
  Configuration: 16,
  None: 17,
  'On a domain I control': 18,
  'Hosted for me on silentpayments.net': 19,
  'Your silent payment address': 20,
  'Copy this from your wallet. It starts with sp1. This package cannot work it out for you: it is derived from your wallet keys, which never leave your wallet.': 21,
  Name: 22,
  'The part before the @. Lowercase letters, digits, dot, dash and underscore only.': 23,
  Domain: 24,
  'Only used when publishing on a domain you control. Your domain must have DNSSEC enabled, or wallets will refuse the name.': 25,
  'Warn me if my payment name changes': 26,
  'Re-check the published record and raise a warning if it stops pointing at your address. Worth leaving on, especially for a hosted name: whoever runs the domain could point it somewhere else, and this is what would tell you.': 27,
  'Payment name publishing is off.': 28,
  'Publish this DNS record': 29,
  'Add this TXT record to your domain, then make sure DNSSEC is enabled. Without DNSSEC, wallets will refuse the name.': 30,
  'Your payment name': 31,
  'Give this to anyone who wants to pay you.': 32,
  'Record name': 33,
  'The DNS name to create, of type TXT.': 34,
  'Record value': 35,
  'The exact contents of that TXT record.': 36,
  'Your payment name is live. Nothing else to do.': 37,
} as const

export type LangDict = Partial<Record<keyof typeof dict, string>>

export default dict
