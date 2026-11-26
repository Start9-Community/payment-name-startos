import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:5',
  releaseNotes: {
    en_US:
      'Fixes the Payment Name health check using more memory the longer the service ran.',
    es_ES:
      'Corrige que la comprobación de estado Payment Name usara más memoria cuanto más tiempo llevaba en marcha el servicio.',
    de_DE:
      'Behebt, dass die Zustandsprüfung „Payment Name“ umso mehr Speicher belegte, je länger der Dienst lief.',
    pl_PL:
      'Naprawia kontrolę stanu Payment Name, która zużywała tym więcej pamięci, im dłużej działała usługa.',
    fr_FR:
      "Corrige la vérification d'état Payment Name, qui utilisait d'autant plus de mémoire que le service tournait longtemps.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
