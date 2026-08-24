# Payment Name

Get paid by name instead of by a long random address.

## What this does

You publish a name like `alice@example.com`. Anyone can type it into their wallet and pay you.
Behind that name sits your silent payment address, so every payment lands somewhere new and
nobody can link them to each other, or work out what you have been paid.

This package does not hold any keys and does not need a Bitcoin node. It publishes a name, and
then it watches that name.

## Before you start

You need two things:

1. **Your silent payment address.** It starts with `sp1` and you copy it from your wallet.
   Nothing here can work it out for you, because it comes from keys that never leave your wallet.
2. **A domain with DNSSEC enabled**, if you want to publish on a domain you control. Without
   DNSSEC, wallets will refuse the name. Your DNS provider will have a switch for it.

## Publishing on your own domain

Open **Actions & Config → Payment Name**, choose *On a domain I control*, paste your address, pick
a name, and save. You get back the exact DNS record to create: a name, a type, and a value. Add it
at your DNS provider and you are done.

Nobody but you can change where that name points.

## Why it keeps watching

Once published, a silent payment address never changes, so nobody ever re-checks it. That makes a
payment name a set-and-forget thing, which is exactly what makes it worth attacking.

If whoever controls the domain quietly points your name at their own address, every payment you
receive from that moment on goes to them. The signatures would all still be valid, so no wallet
would complain. And because silent payments are unlinkable, you could not follow the money to see
where it went.

So this package re-checks your record and turns red if it stops matching. On your own domain that
is a nicety. On someone else's domain it is the only protection there is.

## Hosted names

Not available yet. The setting is there and your choice is saved, but the service behind it does
not exist. Use your own domain for now.

## What this cannot do

- It cannot receive or spend anything. It holds no keys.
- It cannot find your payments. That is a scanning server's job, such as Frigate.
- It cannot fix a name you published somewhere you do not control. It can only tell you.
