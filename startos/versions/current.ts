import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:3',
  releaseNotes: {
    en_US:
      "Adds an optional BOLT 12 Lightning offer. One payment name can now be paid over Lightning or on-chain, and the sender's wallet decides which. The watchdog also checks the Lightning half, but only if you set one. New icon.",
    es_ES:
      'Añade una oferta Lightning BOLT 12 opcional. Un mismo nombre de pago puede cobrarse ahora por Lightning o en cadena, y el monedero de quien paga elige la vía. El vigilante comprueba también la parte Lightning, pero solo si la has configurado. Icono nuevo.',
    de_DE:
      'Ergänzt ein optionales BOLT-12-Lightning-Angebot. Ein Zahlungsname nimmt jetzt Zahlungen per Lightning oder On-Chain an, und die Wallet des Zahlenden entscheidet. Die Überwachung prüft auch den Lightning-Teil, aber nur wenn du einen gesetzt hast. Neues Symbol.',
    pl_PL:
      'Dodaje opcjonalną ofertę Lightning BOLT 12. Jedna nazwa płatności przyjmuje teraz płatności przez Lightning albo on-chain, a portfel płacącego wybiera drogę. Nadzór sprawdza także część Lightning, ale tylko jeśli ją ustawisz. Nowa ikona.',
    fr_FR:
      'Ajoute une offre Lightning BOLT 12 facultative. Un même nom de paiement peut désormais être payé par Lightning ou on-chain, et le portefeuille du payeur choisit. La surveillance vérifie aussi la partie Lightning, mais seulement si vous en avez défini une. Nouvelle icône.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
