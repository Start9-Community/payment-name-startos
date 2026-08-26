# Payment Name

## Documentation

- [BIP-353: DNS Payment Instructions](https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki) — the specification for the payment names this publishes, including what wallets require of them.
- [BIP-352: Silent Payments](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki) — the specification for the `sp1...` addresses a payment name points at.

## What you get on StartOS

- A payment name — `alice@example.com` — that anyone can type into their wallet instead of copying a 116-character address.
- Two ways to publish it: on a domain you own, or on a shared domain that this claims for you.
- A watchdog that keeps re-checking the published name and turns the service red if it ever stops pointing at your address.

There are no interfaces to open and nothing to log into. The Actions tab is the whole service.

## Before you start

You need your **silent payment address** — the long string beginning `sp1`. Copy it from a wallet that supports silent payments; nothing here can work it out for you, because it comes from keys that never leave your wallet.

If you want to publish on a domain you own, that domain must have **DNSSEC enabled**. Without it, wallets refuse the name. Your DNS provider will have a switch for it.

## Getting set up

1. Open the **Actions** tab and run **Payment Name**.
2. Under **Payment name**, choose where the name should live — _On a domain I control_, or _Hosted for me on silentpayments.net_. The rest of the form changes to match what that choice needs.
3. Paste your `sp1...` address and pick the name you want before the `@`. On your own domain, enter that domain too.
4. Leave _Warn me if my payment name changes_ on.
5. Save.

On a hosted name you are finished — the action claims it and reports it live.

On your own domain, the action hands back three values: your payment name, the DNS **record name**, and the DNS **record value**. Create a TXT record at your provider with exactly that name and value, then confirm DNSSEC is on. The health check goes green once the record has propagated, which can take a while.

## Using Payment Name

### Sharing your name

Give out `you@yourdomain.com` the way you would an email address. A wallet that understands payment names resolves it and pays your silent payment address. Each person paying you derives a fresh address of their own, so publishing one name for life reveals nothing about what you have been paid.

### The health check is the point

Once a payment name is published, nobody ever looks at it again — which is exactly what makes it worth attacking. If whoever controls the domain quietly repoints your name at their own address, every payment from then on goes to them, no wallet complains, and because silent payments cannot be linked to each other you could not follow the money. On your own domain that risk is small. On a hosted domain it is the only thing standing between you and a silent repoint.

So the service re-checks your record and goes red if it stops matching. Three things make it red:

- **Your name no longer points at your address.** Someone with control of the domain changed it. Stop giving that name out until you know why.
- **The record matches but is not DNSSEC-signed.** The value is right, but wallets will refuse the name. Check DNSSEC at your DNS provider.
- **The name carries more than one payment record.** Wallets refuse a name with several, so nobody can pay you at all until the extras are deleted.

A message about the record not being found yet, or about no resolver being reachable, is not an alarm — the first means DNS has not caught up, the second means this server's own internet connection is having trouble.

### Changing or stopping

Run **Payment Name** again to point the name at a different address, rename it, or set it to _None_ to stop publishing.

If you are on a hosted name, switching to _None_, switching to your own domain, or renaming gives the old hosted name back automatically. If that cannot be done at the time — the service is unreachable, say — the result message tells you, and the old name stays claimed.

## Limitations

- **A hosted name is only ever yours while this server holds its key.** The key lives in the service's data and is included in StartOS backups. If you lose it without a backup, that name can never be changed or released again, and the only way forward is to pick a different one.
- **This does not find your payments.** It publishes a name and watches it. Detecting the coins people send you needs a scanning wallet or server, which is a separate thing entirely.
