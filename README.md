<p align="center">
  <img src="icon.svg" alt="Payment Name Logo" width="21%">
</p>

# Payment Name on StartOS

> Everything not listed in this document should behave the same as upstream
> Payment Name. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Payment Name publishes a BIP-353 payment name — `alice@example.com` — that resolves to the user's BIP-352 silent payment address, and then keeps re-resolving it to catch the name being repointed at somebody else. It holds no keys, moves no money, and needs no Bitcoin node.

- **Upstream repo:** <https://github.com/bitsagarob/payment-name-startos>
- **Wrapper repo:** <https://github.com/Start9-Community/payment-name-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

A two-line Debian build that installs nothing. The package's entire runtime is the health check and the action, both of which execute in the StartOS JS runtime rather than inside the container.

| Property      | Value                                         |
| ------------- | --------------------------------------------- |
| Image         | Built from `Dockerfile` (`FROM debian`, slim) |
| Architectures | x86_64, aarch64                               |
| Command       | `sleep infinity`                              |

| Subcontainer  | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `primary-sub` | The `sleep infinity` daemon — nothing to attach to for diagnosis |

**Attaching to `primary-sub` will tell you nothing about this service.** The container has no logs, no config, and no process worth inspecting. Everything diagnosable is in the service logs, which carry the JS runtime's output, and in the health-check message.

## Volume and Data Layout

One volume holding two small JSON files. There is no database and no cache.

| Volume | Mount Point | Purpose                                                 |
| ------ | ----------- | ------------------------------------------------------- |
| `main` | `/data`     | The published name's settings and the hosted-domain key |

**`hosted-key.json` is irreplaceable.** It is the only proof of ownership over a name claimed on the hosted domain — lose it and that name can never be updated or released again by this server, and the only recourse is to pick a different name.

## File Models

Two models, both JSON, both written exclusively by the Configure action. Nothing is re-asserted on start, so a hand edit survives until the next time the action runs — at which point the whole file is rewritten from the form.

| File                      | Volume | Format | Modelled                | Written by                                |
| ------------------------- | ------ | ------ | ----------------------- | ----------------------------------------- |
| `/data/payment-name.json` | `main` | JSON   | Yes — `FileHelper.json` | Install (empty), Configure action         |
| `/data/hosted-key.json`   | `main` | JSON   | Yes — `FileHelper.json` | Configure action, first hosted claim only |

`payment-name.json` holds `mode` (`off` / `own` / `hosted`), the silent payment address, the local part and the domain of the published name, and the `checkRecord` toggle. Install seeds it with an empty merge, so every field takes its schema default and `mode` is `off`.

`hosted-key.json` holds one field: the hex-encoded secret key that signs requests to the hosted domain. It is generated the first time a hosted name is claimed and never regenerated, never sent anywhere, and never surfaced in the UI — only signatures made with it leave the server.

The package keeps no `store.json`.

## Dependencies

None, deliberately. Publishing a payment name needs an address and a DNS record, not a Bitcoin node; requiring a particular scanning backend would exclude everyone who scans a different way or who only receives.

## Network Access and Interfaces

None. This package serves nothing — it has no ports, no bindings, and no interfaces, and its service page carries no address list.

All of its network traffic is outbound: DNS-over-HTTPS to `cloudflare-dns.com` and `dns.google` for the watchdog, and HTTPS to `silentpayments.net` when the user chooses a hosted name.

**DNS-over-HTTPS is not an optimization here.** The StartOS container resolver forwards queries without `RRSIG` or the `AD` flag, so over port 53 a DNSSEC-signed answer cannot be told from an unsigned one — and BIP-353 requires wallets to reject an unsigned name. Going over HTTPS is what makes "is this name actually signed?" answerable at all.

## Installation and First-Run Flow

Install writes an empty settings file, starts the daemon, and stops. There is no account, no credential, and no task — the health check reports `disabled` and the service sits idle until the user runs the Configure action.

Nothing is published without the user's address, which the package cannot derive: it comes from wallet keys that never leave the wallet.

## Actions

One action, `payment-name`, visible and runnable in any service state. It is both the setup form and the only control the package has.

### Payment Name

Sets where the name lives, the address, and the name itself, and — for a hosted name — claims it on `silentpayments.net` in the same call.

The form is a union on where the name is published, so the fields below the selection are the ones that selection actually uses: `None` has none, a hosted name takes an address and a local part, and only a name on your own domain asks for a domain. A support agent reading a user's screenshot should expect the field set to differ between the three.

- **When to run it:** to publish a name for the first time, to change the address a published name points at, to rename, or to stop publishing.
- **What it changes:** `payment-name.json` always; `hosted-key.json` on the first hosted claim; and, in hosted mode, the record on `silentpayments.net`.
- **Cost:** a second or two — one HTTPS round trip in hosted mode, none in the other two. It does not interrupt the service.
- **Repeat safety:** idempotent. Re-running with the same values in `own` mode returns the same DNS record; in hosted mode it updates a name this server already owns rather than failing.
- **What happens next:** the service restarts so the watchdog re-checks against the new values rather than serving a cached verdict about the old ones.
- **Outputs:** in `own` mode, the payment name plus the exact TXT record name and value to publish. In `hosted` mode, the payment name, already live.

**Switching away from a hosted name releases it.** Choosing `off`, choosing `own`, or renaming while in `hosted` mode sends a delete to `silentpayments.net` first, so the name does not sit claimed on a domain this server no longer publishes to. If that call fails the local change still applies and the result message says the release did not happen — the name is then stranded until the same key can reach the service again.

**A failed hosted claim writes nothing.** The settings are saved only after the service confirms the name, so a claim that fails leaves the package exactly as it was rather than watching a name the user never got.

## Tasks

None. The service is never held on a prompt, and its ordinary controls are always available.

## Health Checks

One check, `primary`, displayed as "Payment Name". It is the entire point of the package rather than a readiness probe: it re-resolves the published record and compares it to what the user published.

| Result     | What it means                                                                             |
| ---------- | ----------------------------------------------------------------------------------------- |
| `disabled` | No name published, or the watchdog toggle is off. Nothing is being checked.               |
| `success`  | The record resolves, is DNSSEC-signed, and carries the configured address.                |
| `loading`  | No record found yet, or no resolver could be reached. Neither is evidence about the name. |
| `failure`  | The record resolves and does **not** match: repointed, unsigned, or duplicated.           |

**A `failure` here is a security event, not a fault in the package.** It means the name a user has been handing out no longer resolves to their address, and every payment made to it from now on goes somewhere else. The message says which of the three cases it is:

- _no longer points at your address_ — whoever controls the domain changed the record.
- _is not DNSSEC-signed_ — the value is right but wallets will refuse the name; usually DNSSEC was turned off or the zone was re-signed badly.
- _has N payment records_ — more than one BIP-353 record exists at the name, and the spec tells wallets to refuse all of them, so nobody can pay at all.

**`loading` is deliberately not a failure.** A name published minutes ago has not propagated, and an unreachable resolver says nothing about the record; treating either as an alarm would train the user to ignore the one that matters.

Two resolvers are queried and a problem is reported only when every resolver that answered agrees. Enabling DNSSEC on a zone hard-fails resolvers still holding the unsigned answer until their caches expire, which a single-resolver check would report as a compromised name.

The verdict is cached for five minutes, so the poll interval does not turn into a DoH request per tick. Changing the settings restarts the service, which discards the cache.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. There is nothing to dump and nothing excluded.

- **Included:** the published name's settings and the hosted-domain key.
- **This backup contains the key that controls any hosted name on the server.** Anyone holding it can repoint that name at their own address. Treat it accordingly.
- **Restore:** the watchdog resumes on the first start with no further input. A restore is the only way to recover the hosted key — the DNS record survives regardless, since it lives on somebody else's nameservers, but without the key it can never be changed or released again.

## Limitations and Differences

1. **It cannot publish a record on a domain you control.** In `own` mode it produces the record and the user adds it at their DNS provider; there is no registrar or nameserver integration.
2. **It does not verify the DNSSEC chain itself.** It asks two public resolvers whether the answer validated. That is adequate for noticing a change and is _not_ what a paying wallet does, which validates the chain independently as BIP-353 requires.
3. **Hosted names depend on a third party.** `silentpayments.net` controls that zone and could repoint a name; the watchdog exists to make that visible, not to prevent it.
4. **A hosted name whose key is lost is gone.** There is no recovery flow and no support channel in the package — pick another name.
5. **It cannot find your payments.** Detecting silent payments needs a scanning backend, which this package deliberately does not provide or require.
6. **It holds no keys and moves no money.** The silent payment address must be copied in from a wallet; nothing here can derive it.
7. **Only mainnet addresses are accepted.** The validator requires the `sp1` human-readable part.
8. **No interfaces.** There is nothing to open, and no address to copy from the service page.

---

## Quick Reference for AI Consumers

```yaml
package_id: payment-name
image: ./Dockerfile # FROM debian slim; installs nothing
architectures:
  - x86_64
  - aarch64
subcontainers:
  - primary-sub # sleep infinity; nothing to inspect
volumes:
  main: /data
file_models:
  - /data/payment-name.json # mode, address, name, domain, watchdog toggle
  - /data/hosted-key.json # NIP-98 signing key for the hosted domain; irreplaceable
startos_managed_env_vars: []
dependencies: []
interfaces: {} # none; the package serves nothing
actions:
  - payment-name
tasks: []
health_checks:
  - primary # displayed "Payment Name"; the DNS watchdog, not a readiness probe
outbound_hosts:
  - cloudflare-dns.com # DNS-over-HTTPS
  - dns.google # DNS-over-HTTPS
  - silentpayments.net # hosted names only
```
