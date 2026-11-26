import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:5',
  releaseNotes: {
    en_US:
      'Updated to start-sdk 4.1.0; requires StartOS 0.4.2 or later. Fixes the payment name check using more memory every time it ran while the service was up.',
    es_ES:
      'Actualizado a start-sdk 4.1.0; requiere StartOS 0.4.2 o posterior. Corrige que la comprobación del nombre de pago usara más memoria cada vez que se ejecutaba mientras el servicio estaba en marcha.',
    de_DE:
      'Auf start-sdk 4.1.0 aktualisiert; erfordert StartOS 0.4.2 oder neuer. Behebt, dass die Prüfung des Zahlungsnamens bei jedem Lauf mehr Speicher belegte, solange der Dienst lief.',
    pl_PL:
      'Zaktualizowano do start-sdk 4.1.0; wymaga StartOS 0.4.2 lub nowszego. Naprawia sprawdzanie nazwy płatności, które przy każdym uruchomieniu zużywało więcej pamięci, dopóki usługa działała.',
    fr_FR:
      'Mise à jour vers start-sdk 4.1.0 ; nécessite StartOS 0.4.2 ou une version ultérieure. Corrige la vérification du nom de paiement, qui utilisait davantage de mémoire à chaque exécution tant que le service tournait.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
