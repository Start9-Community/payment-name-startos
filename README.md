<h1 align="center">Payment Name</h1>

<p align="center">
  <em>Get paid in bitcoin by name, instead of by a long random address.</em><br>
  <sub>A service for <a href="https://start9.com">StartOS</a>, the operating system for self-hosted servers.</sub>
</p>

<p align="center">
  <a href="https://start9.com"><img src="https://img.shields.io/badge/for-StartOS-5b3df5?style=flat-square" alt="for StartOS"></a>
  <a href="https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki"><img src="https://img.shields.io/badge/BIP--353-payment%20names-f7931a?style=flat-square" alt="BIP-353"></a>
  <a href="https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki"><img src="https://img.shields.io/badge/BIP--352-silent%20payments-f7931a?style=flat-square" alt="BIP-352"></a>
  <a href="#it-needs-nothing-else"><img src="https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square" alt="no dependencies"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

---

## What this is

Instead of giving people a bitcoin address like this:

```
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

you give them a name like this:

```
alice@example.com
```

They type it into their wallet and pay you. That is the whole idea.

You install this on your own [StartOS](https://start9.com) server, paste in your address, and pick
a name. It publishes the name for you and then keeps an eye on it.

## Why bother

**A bitcoin address is a public record.** Put one on your website or your invoices, and every
person who pays you can look up every other payment you have ever received to it. And your balance.
Forever. That is why most people never publish one, and instead send a fresh address to each person
by hand.

**Silent payments fix that.** It is a newer kind of bitcoin address, where each person paying you
works out a fresh, unrelated address of their own. Two people who pay you cannot tell they paid the
same person, and neither can anyone else looking at the blockchain. So you can safely publish one
address and keep it for life.
([BIP-352](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki), if you want the spec.)

**The catch is that nobody can read one out loud.** A silent payment address is 116 characters. It
solved the privacy problem and created a usability one.

**This closes that gap.** It publishes a name that points at your address, using a bitcoin standard
called [BIP-353](https://github.com/bitcoin/bips/blob/master/bip-0353.mediawiki). Wallets already
understand it: Sparrow and Cake Wallet both resolve these names today.

## What you need

- A **[StartOS](https://start9.com) server**. That is a Start9 box, or StartOS installed on your
  own hardware.
- A **silent payment address**, the `sp1...` string. Your wallet makes it, not this. In Sparrow,
  create a wallet with policy type *Single Signature SP* and copy it from the Receive tab.
- Either a **domain you control** with DNSSEC turned on, or use a hosted name.

## It needs nothing else

No bitcoin node. No Electrum server. No scanning server. It holds none of your keys and cannot
touch your money.

That is worth explaining, because it surprises people. Getting paid privately has two separate
halves:

1. **Receiving.** Your wallet makes an address, people pay it, coins arrive. **No server is
   involved at any point.** This package is about this half.
2. **Finding** those payments afterwards. That needs something to scan the blockchain for you,
   such as [Frigate](https://github.com/sparrowwallet/frigate).

Tying this to one particular scanner would shut out everyone who scans a different way.

**That said, run your own scanner.** The silent payments protocol hands your *scan key* to whichever
server your wallet is pointed at. That key cannot spend your coins. It does reveal every payment
you will ever receive.

## It watches your name, and that is the point

Once published, a payment name is the kind of thing nobody ever checks again. Which is exactly what
makes it worth attacking.

If whoever controls the domain quietly points your name at their own address, every payment from
then on goes to them. Every signature still checks out, so no wallet warns anybody. And because
silent payments are unlinkable, you could not follow the money to see where it went.

The bitcoin standard has **no security section at all**, and nothing else in the ecosystem notices
this. So this package re-checks your published name and **turns red** if it stops pointing at you.

On your own domain that is a nicety. On someone else's domain it is the only protection there is.

### It asks two resolvers, on purpose

A warning light that goes off for no reason is worse than none.

Turning on DNSSEC flips a domain from *unsigned* to *signed*, and DNS resolvers holding the old
answer refuse the name until their caches expire. During that window one resolver calls a perfectly
good name broken while another is already happy.

So it asks **two**, treats "the resolver refused to answer" as different from "there is no record",
and only reports a problem when everyone who answered agrees.

It reports: a missing record, a record pointing somewhere else, DNSSEC not working, and more than
one payment record on the same name. That last one means nobody can pay you at all, because the
standard tells wallets to refuse a name carrying several.

### Checked against real names in the wild

| Name | Result |
|---|---|
| `conorokus@twelve.cash` | accepted; properly signed, valid address |
| `satoshi@twelve.cash` | flagged unpayable; **5 conflicting records** |
| `matt@mattcorallo.com` | accepted |
| a name that does not exist | handled |

## Two modes

- **On a domain you control.** The action returns the exact TXT record to publish. Nobody but you
  can repoint it. Your domain needs DNSSEC, or wallets will refuse the name.
- **Hosted, on [silentpayments.net](https://silentpayments.net).** For people who do not own a
  domain. Free, no account, and this claims it for you: type a name, press save, done. The service
  is a third party, so it could in principle repoint your name; that is precisely what the watchdog
  above is for.

  There is no password to keep. On first use the package generates a key, stores it in its own
  volume, and signs each request with it, so the name is bound to a key that never leaves your
  server. Losing that volume without a backup means losing the ability to change or release the
  name.

## Using it

Install it, then open **Actions & Config → Payment Name** on your server.

Choose whether the name goes on your own domain or a hosted one, paste your `sp1...` address, pick
a name, and save. If you chose your own domain, it hands you the exact DNS record to add. Then the
health check watches it from there on.

## Building it yourself

```
./build.sh x86
```

That produces the `.s9pk` you can sideload onto StartOS. Everything below is why the script exists
rather than a plain `make`, and is only interesting if you are changing the package.

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

## How it works inside

The container runs `sleep infinity`. All the work happens in a StartOS health check, which executes
in the OS's JavaScript runtime rather than inside the container. The image exists only to give the
service something to be.

## Related

- **[silentpayments.net](https://silentpayments.net)** hands out hosted names, if you do not own a
  domain.
- **[Frigate](https://github.com/sparrowwallet/frigate)** is the scanner that finds the payments
  once people start sending them.
- **[StartOS](https://start9.com)** is the operating system this runs on.

## Licence

MIT. See [LICENSE](LICENSE).
