<h1 align="center">Payment Name</h1>

<p align="center">
  <em>Get paid by name instead of by a long random address.</em>
</p>

<p align="center">
  <a href="https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki"><img src="https://img.shields.io/badge/BIP--353-payment%20names-f7931a?style=flat-square" alt="BIP-353"></a>
  <a href="https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki"><img src="https://img.shields.io/badge/BIP--352-silent%20payments-f7931a?style=flat-square" alt="BIP-352"></a>
  <a href="https://start9.com"><img src="https://img.shields.io/badge/StartOS-0.4.0-blue?style=flat-square" alt="StartOS 0.4.0"></a>
  <a href="#no-dependencies-deliberately"><img src="https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square" alt="no dependencies"></a>
  <a href="#the-watchdog-is-the-point"><img src="https://img.shields.io/badge/watchdog-two%20resolvers-brightgreen?style=flat-square" alt="watchdog"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

---

Publish a name like `alice@example.com` that anyone can pay from their wallet, and that resolves
to your silent payment address. Then keep an eye on it, because a payment name is exactly the
kind of thing nobody ever re-checks.

## Why a name at all

A normal bitcoin address is a public account statement. Put one on your website or your invoices
and every person who pays you can read every other payment you ever received to it, and your
balance, forever. That is why almost nobody publishes one.

A [BIP-352](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki) silent payment address
fixes that: each payer's wallet derives a fresh, unlinkable address from it, so the same address
is safe to publish for life. Which finally makes it worth giving that address a name a human can
read and type.

[BIP-353](https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki) is how that name is
published: one DNSSEC-signed TXT record at `alice.user._bitcoin-payment.example.com`, containing
a `bitcoin:` URI. This package writes that record for you and then watches it.

Wallets already understand it. Sparrow resolves these names and validates the DNSSEC chain itself
rather than trusting a resolver.

## No dependencies, deliberately

No Bitcoin node. No Electrum server. No scanning server. It holds no keys.

Silent payments has two independent halves:

- **Receiving** is your wallet deriving an address and other people paying it. No server involved
  at any point.
- **Finding** those payments afterwards needs a scanner, such as
  [Frigate](https://github.com/sparrowwallet/frigate).

This package is the first half only. Tying it to one scanning server would exclude everyone who
scans another way, or who only ever receives.

That said, **anyone publishing a payment name should run their own scanner.** The silent payments
protocol hands your *scan private key* to whichever server your wallet points at. It cannot spend
your coins. It reveals every payment you will ever receive.

## The watchdog is the point

Once published, a silent payment address never rotates, so nobody re-checks it. A payment name is
a set-and-forget pointer, which is exactly what makes it worth attacking.

If whoever controls the domain repoints your name at their own address, every payment from that
moment on goes to them. Every signature still validates, so no wallet complains. And because
silent payments outputs are unlinkable, you cannot follow the money to see where it went.

BIP-353 has **no Security Considerations section**, and nothing in the ecosystem detects this.
Nostr's NIP-05 has the rule that would prevent it, *"clients must always follow public keys, not
addresses"*. BIP-353 has no equivalent, and it caps caching at the record's TTL, so a repoint
reaches every payer within minutes.

So the health check re-resolves your record and **fails loudly** when it stops matching. On your
own domain that is a nicety. On someone else's it is the only protection there is.

### It asks two resolvers, on purpose

A check whose only job is to cry wolf must not cry wolf.

Turning DNSSEC on flips a zone from *unsigned, trust it* to *signed, verify it*, and resolvers
holding the old state hard-fail until their caches expire. That is correct of them, and during
that window one resolver will call a perfectly good name unpayable while another is already happy.

This queries **two** resolvers, treats a non-zero DNS status as *refused to answer* rather than
*no record*, and reports a problem only when every resolver that answered agrees.

It reports on: a missing record, a record that no longer matches, DNSSEC not validating, and more
than one `bitcoin:` record at the name. That last one is an outage rather than a warning, because
the spec says a wallet seeing several must refuse them all.

### Verified against live records

| Name | Result |
|---|---|
| `conorokus@twelve.cash` | accepted; DNSSEC-signed, 116-character `sp1` address |
| `satoshi@twelve.cash` | flagged unpayable; **5 conflicting records** |
| `matt@mattcorallo.com` | accepted; on-chain plus BOLT 12 |
| a name that does not exist | handled |

The `satoshi` case is live breakage at the only public provider today, caused by having no way to
update a name once it is claimed.

## Two modes

- **On a domain you control.** The action returns the exact TXT record to publish. Nobody but you
  can repoint it. Your domain needs DNSSEC, or wallets will refuse the name.
- **Hosted.** Stubbed. The setting saves and says so plainly; the service behind it does not exist
  yet.

## Using it

Install, then open **Actions & Config → Payment Name**.

You need your silent payment address, the `sp1...` string from your wallet. In Sparrow that is a
wallet with Policy Type **Single Signature SP**, and the address is on the Receive tab. Nothing
here can derive it for you: it comes from keys that never leave your wallet.

## Building

```
./build.sh x86
```

`start-cli` requires a packaging workspace in this repo's **parent** directory and fills it with a
74 MB clone of the Start9 monorepo, a build key and its own `AGENTS.md`. It also resolves symlinks,
so linking this repo into a workspace elsewhere does not work. The build therefore runs in a synced
copy under `~/.cache/s9-workspace` and the `.s9pk` is copied back.

Three environment quirks the script handles, all found the hard way:

- `start-cli` resolves the configured StartOS host at startup even for offline commands like
  `pack`, and hard fails if the scaffolded `dev-vm.local` does not resolve.
- It shells out to `docker`, which may need root. The script uses `sudo` for the build rather than
  putting the build user in the `docker` group, which is equivalent to giving it root.
- `docker buildx` is required and ships separately (`docker-buildx` on Debian and Ubuntu). Without
  it the error is an unhelpful `unknown shorthand flag: 'f' in -f`.

`make` also derives its ingredient list before it builds the TypeScript bundle, so the script
bundles first and runs make twice.

## Notes

The container runs `sleep infinity`. All the work happens in a StartOS health check, which executes
in the OS's JavaScript runtime rather than inside the container. The image exists only to give the
service something to be.

## Licence

MIT. See [LICENSE](LICENSE).
