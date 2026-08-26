export const short = {
  en_US: 'Get paid by name instead of by a long random address.',
  es_ES: 'Cobra con un nombre en vez de una dirección larga y aleatoria.',
  de_DE: 'Lass dich per Name bezahlen statt per langer Zufallsadresse.',
  pl_PL: 'Otrzymuj płatności na nazwę zamiast długiego losowego adresu.',
  fr_FR: 'Soyez payé par nom plutôt que par une longue adresse aléatoire.',
}

export const long = {
  en_US: `Publish a payment name like alice@example.com that anyone can pay from their wallet, and that resolves to your silent payment address.

A normal bitcoin address is a public account statement. Put one on your website or your invoices and every person who pays you can see every other payment you ever received to it, and your balance, forever. That is why almost nobody publishes one.

A silent payment address fixes that: each payer's wallet derives a fresh, unlinkable address from it, so it is safe to publish the same one for life. This package gives that address a human-readable name, published in DNS the way BIP 353 specifies, so people can pay you by typing something they can actually read.

It works with any wallet or scanning setup. It never sees your keys, and it does not need a Bitcoin node.

Two ways to publish. On a domain you control, it hands you the exact DNS record to add, and nobody but you can ever change where your name points. Or use a hosted domain, which is easier and means trusting whoever runs it.

Either way it keeps watching. If your published name ever stops pointing at your address, this tells you. That matters more than it sounds: a silent payment address never changes, so nobody re-checks it, and a name quietly repointed somewhere else would capture every payment you receive from then on without you noticing.`,

  es_ES: `Publica un nombre de pago como alice@example.com que cualquiera pueda pagar desde su monedero y que resuelva a tu dirección de pago silencioso.

Una dirección de bitcoin normal es un extracto de cuenta público. Ponla en tu web o en tus facturas y cada persona que te pague podrá ver todos los demás pagos que has recibido en ella, y tu saldo, para siempre. Por eso casi nadie publica una.

Una dirección de pago silencioso lo soluciona: el monedero de cada pagador deriva de ella una dirección nueva e imposible de vincular, así que es seguro publicar siempre la misma. Este paquete le da a esa dirección un nombre legible, publicado en DNS tal como especifica el BIP 353, para que la gente pueda pagarte escribiendo algo que se puede leer.

Funciona con cualquier monedero o sistema de escaneo. Nunca ve tus claves y no necesita un nodo de Bitcoin.

Dos formas de publicar. En un dominio que controlas, te entrega el registro DNS exacto que hay que añadir, y nadie más que tú podrá cambiar adónde apunta tu nombre. O usa un dominio alojado, que es más fácil y supone confiar en quien lo gestiona.

En ambos casos sigue vigilando. Si tu nombre publicado deja de apuntar a tu dirección, te avisa. Importa más de lo que parece: una dirección de pago silencioso nunca cambia, así que nadie vuelve a comprobarla, y un nombre redirigido en silencio a otro sitio capturaría todos los pagos que recibas a partir de entonces sin que te dieras cuenta.`,

  de_DE: `Veröffentliche einen Zahlungsnamen wie alice@example.com, den jeder aus seiner Wallet bezahlen kann und der auf deine Silent-Payment-Adresse verweist.

Eine gewöhnliche Bitcoin-Adresse ist ein öffentlicher Kontoauszug. Stell eine auf deine Website oder deine Rechnungen, und jeder, der dich bezahlt, sieht jede andere Zahlung, die du je darauf erhalten hast, und dein Guthaben, für immer. Deshalb veröffentlicht sie fast niemand.

Eine Silent-Payment-Adresse löst das: Die Wallet jedes Zahlenden leitet daraus eine frische, nicht verknüpfbare Adresse ab, sodass dieselbe Adresse lebenslang veröffentlicht werden kann. Dieses Paket gibt ihr einen lesbaren Namen, im DNS veröffentlicht wie in BIP 353 festgelegt, sodass Leute dich bezahlen können, indem sie etwas eintippen, das sie auch lesen können.

Es funktioniert mit jeder Wallet und jedem Scan-Setup. Es sieht deine Schlüssel nie und braucht keinen Bitcoin-Node.

Zwei Wege zu veröffentlichen. Auf einer eigenen Domain nennt es dir den exakten DNS-Eintrag, und niemand außer dir kann je ändern, wohin dein Name verweist. Oder nutze eine gehostete Domain: einfacher, aber du vertraust dem Betreiber.

So oder so bleibt die Überwachung aktiv. Verweist dein veröffentlichter Name irgendwann nicht mehr auf deine Adresse, erfährst du es. Das wiegt schwerer, als es klingt: Eine Silent-Payment-Adresse ändert sich nie, also prüft sie niemand nach, und ein still umgeleiteter Name würde ab dann jede Zahlung abfangen, ohne dass du es merkst.`,

  pl_PL: `Opublikuj nazwę płatności, na przykład alice@example.com, którą każdy może opłacić ze swojego portfela i która wskazuje na Twój adres cichej płatności.

Zwykły adres bitcoin to publiczny wyciąg z konta. Umieść go na stronie albo na fakturach, a każdy, kto Ci zapłaci, zobaczy wszystkie inne płatności, jakie kiedykolwiek na niego otrzymałeś, oraz Twoje saldo, na zawsze. Dlatego prawie nikt go nie publikuje.

Adres cichej płatności to rozwiązuje: portfel każdego płacącego wyprowadza z niego świeży, niemożliwy do powiązania adres, więc ten sam adres można bezpiecznie publikować przez całe życie. Ten pakiet nadaje mu czytelną nazwę, opublikowaną w DNS zgodnie z BIP 353, aby ludzie mogli Ci zapłacić, wpisując coś, co da się przeczytać.

Działa z dowolnym portfelem i dowolnym sposobem skanowania. Nigdy nie widzi Twoich kluczy i nie potrzebuje węzła Bitcoin.

Dwa sposoby publikacji. W domenie, którą kontrolujesz, pakiet podaje dokładny rekord DNS do dodania i nikt poza Tobą nie zmieni tego, gdzie wskazuje Twoja nazwa. Albo skorzystaj z domeny hostowanej: łatwiej, ale trzeba zaufać temu, kto ją prowadzi.

W obu przypadkach monitorowanie trwa dalej. Jeśli opublikowana nazwa przestanie wskazywać na Twój adres, dowiesz się o tym. To ważniejsze, niż brzmi: adres cichej płatności nigdy się nie zmienia, więc nikt go nie sprawdza ponownie, a nazwa po cichu przekierowana gdzie indziej przechwytywałaby od tej pory każdą Twoją płatność, a Ty byś tego nie zauważył.`,

  fr_FR: `Publiez un nom de paiement comme alice@example.com que n'importe qui peut payer depuis son portefeuille et qui renvoie vers votre adresse de paiement silencieux.

Une adresse bitcoin ordinaire est un relevé de compte public. Mettez-la sur votre site ou vos factures et chaque personne qui vous paie verra tous les autres paiements que vous avez reçus dessus, ainsi que votre solde, pour toujours. C'est pourquoi presque personne n'en publie.

Une adresse de paiement silencieux corrige cela : le portefeuille de chaque payeur en dérive une adresse neuve et impossible à relier aux autres, si bien que la même adresse peut être publiée à vie. Ce paquet lui donne un nom lisible, publié dans le DNS selon le BIP 353, pour que l'on puisse vous payer en saisissant quelque chose de réellement lisible.

Cela fonctionne avec n'importe quel portefeuille et n'importe quel dispositif de scan. Vos clés ne sont jamais vues et aucun nœud Bitcoin n'est nécessaire.

Deux façons de publier. Sur un domaine que vous contrôlez, le paquet vous donne l'enregistrement DNS exact à ajouter, et personne d'autre que vous ne pourra jamais changer la cible de votre nom. Ou utilisez un domaine hébergé : plus simple, mais cela revient à faire confiance à celui qui l'exploite.

Dans les deux cas, la surveillance continue. Si votre nom publié cesse un jour de pointer vers votre adresse, vous en êtes informé. Cela compte plus qu'il n'y paraît : une adresse de paiement silencieux ne change jamais, donc personne ne la revérifie, et un nom discrètement redirigé ailleurs capterait tous les paiements que vous recevez ensuite sans que vous vous en aperceviez.`,
}
