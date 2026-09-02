import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:3',
  releaseNotes: {
    en_US:
      "Adds an optional BOLT 12 Lightning offer. One payment name can now be paid over Lightning or on-chain, and the sender's wallet decides which. The watchdog also checks the Lightning half against exactly what you configured, so one appearing that you never set gets caught too. New icon.",
    es_ES:
      'Añade una oferta Lightning BOLT 12 opcional. Un mismo nombre de pago puede cobrarse ahora por Lightning o en cadena, y el monedero de quien paga elige la vía. El vigilante también compara la parte Lightning con lo que configuraste exactamente, así que una oferta que aparezca sin que la hayas puesto también se detecta. Icono nuevo.',
    de_DE:
      'Ergänzt ein optionales BOLT-12-Lightning-Angebot. Ein Zahlungsname nimmt jetzt Zahlungen per Lightning oder On-Chain an, und die Wallet des Zahlenden entscheidet. Die Überwachung vergleicht den Lightning-Teil auch genau mit dem, was du eingestellt hast, sodass ein Angebot, das ohne dein Zutun auftaucht, ebenfalls erkannt wird. Neues Symbol.',
    pl_PL:
      'Dodaje opcjonalną ofertę Lightning BOLT 12. Jedna nazwa płatności przyjmuje teraz płatności przez Lightning albo on-chain, a portfel płacącego wybiera drogę. Nadzór porównuje też część Lightning dokładnie z tym, co skonfigurowano, więc oferta, która pojawi się bez twojej wiedzy, również zostanie wykryta. Nowa ikona.',
    fr_FR:
      "Ajoute une offre Lightning BOLT 12 facultative. Un même nom de paiement peut désormais être payé par Lightning ou on-chain, et le portefeuille du payeur choisit. La surveillance compare aussi la partie Lightning exactement à ce que vous avez configuré, donc une offre apparue sans que vous l'ayez définie sera également détectée. Nouvelle icône.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
