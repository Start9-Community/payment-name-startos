export const short = {
  en_US: 'Get paid by name instead of by a long random address.',
}

export const long = {
  en_US: `Publish a payment name like alice@example.com that anyone can pay from their wallet, and that resolves to your silent payment address.

A normal bitcoin address is a public account statement. Put one on your website or your invoices and every person who pays you can see every other payment you ever received to it, and your balance, forever. That is why almost nobody publishes one.

A silent payment address fixes that: each payer's wallet derives a fresh, unlinkable address from it, so it is safe to publish the same one for life. This package gives that address a human-readable name, published in DNS the way BIP 353 specifies, so people can pay you by typing something they can actually read.

It works with any wallet or scanning setup. It never sees your keys, and it does not need a Bitcoin node.

Two ways to publish. On a domain you control, it hands you the exact DNS record to add, and nobody but you can ever change where your name points. Or use a hosted domain, which is easier and means trusting whoever runs it.

Either way it keeps watching. If your published name ever stops pointing at your address, this tells you. That matters more than it sounds: a silent payment address never changes, so nobody re-checks it, and a name quietly repointed somewhere else would capture every payment you receive from then on without you noticing.`,
}
