export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Payment Name': 0,
  'Payment Name': 1,
  'No payment name published yet': 2,
  'Publishing, but not watching for changes': 3,
  'Payment name is published and matches your address': 4,

  // checker.ts
  'That does not look like a silent payment address. It should start with sp1 and be about 116 characters. Copy it from your wallet.': 5,
  'A payment name may use only lowercase letters, digits, dot, dash and underscore.': 6,
  'That does not look like a domain name.': 7,
  'No payment name configured.': 8,
  'Could not reach any DNS resolver to check your payment name. This is usually a network problem here, not a problem with your name.': 9,
  '${name} points at your address.': 10,
  '${name} has ${count} payment records. Wallets refuse a name with more than one, so nobody can pay you until the extras are removed.': 11,
  '${name} no longer points at your address. Someone who controls that domain may have changed it. Do not treat that name as yours until you find out why.': 12,
  '${name} matches your address but is not DNSSEC-signed, so wallets will refuse it.': 13,
  'No payment record found at ${name}. If you have just published it, DNS can take a while to catch up.': 14,

  // hosted.ts
  'Could not reach ${origin}. Nothing was changed.': 15,
  '${origin} returned something unreadable.': 16,
  'Request failed (${status}).': 17,

  // actions/configure.ts
  'Payment name': 18,
  'Publish a human-readable payment name, like alice@example.com, that resolves to your silent payment address. Anyone can then pay you by typing that name into their wallet.': 19,
  None: 20,
  'On a domain I control': 21,
  'Hosted for me on silentpayments.net': 22,
  'Your silent payment address': 23,
  'Copy this from your wallet. It starts with sp1. This package cannot work it out for you: it is derived from your wallet keys, which never leave your wallet.': 24,
  'Must start with sp1 and be about 116 characters long.': 25,
  Name: 26,
  'The part before the @.': 27,
  'Lowercase letters, digits, dot, dash and underscore only.': 28,
  Domain: 29,
  'Your domain must have DNSSEC enabled, or wallets will refuse the name.': 30,
  'A domain name, like example.com.': 31,
  'Warn me if my payment name changes': 32,
  'Re-check the published record and raise a warning if it stops pointing at your address. Worth leaving on, especially for a hosted name: whoever runs the domain could point it somewhere else, and this is what would tell you.': 33,
  'Your previous hosted name ${name} has been released.': 34,
  'Could not release your previous hosted name ${name}: ${detail}': 35,
  'Publish a human-readable name that resolves to your silent payment address.': 36,
  Configuration: 37,
  'Payment name publishing is off.': 38,
  'Publish this DNS record': 39,
  'Add this TXT record to your domain, then make sure DNSSEC is enabled. Without DNSSEC, wallets will refuse the name.': 40,
  'Your payment name': 41,
  'Give this to anyone who wants to pay you.': 42,
  'Record name': 43,
  'The DNS name to create, of type TXT.': 44,
  'Record value': 45,
  'The exact contents of that TXT record.': 46,
  '${name} is taken by someone else, or by a previous install of this package whose key is gone. Pick another name.': 47,
  'Your payment name is live. Nothing else to do.': 48,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
