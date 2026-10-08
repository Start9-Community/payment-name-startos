import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:4',
  releaseNotes: {
    en_US:
      'Updated to start-sdk 3.0.3; requires StartOS 0.4.0.2 or later. The Payment name field in the Payment Name action explains what each of its choices does.',
    es_ES:
      'Actualizado a start-sdk 3.0.3; requiere StartOS 0.4.0.2 o posterior. El campo Nombre de pago de la acción Payment Name explica qué hace cada una de sus opciones.',
    de_DE:
      'Auf start-sdk 3.0.3 aktualisiert; erfordert StartOS 0.4.0.2 oder neuer. Das Feld „Zahlungsname“ in der Aktion „Payment Name“ erklärt, was jede seiner Optionen bewirkt.',
    pl_PL:
      'Zaktualizowano do start-sdk 3.0.3; wymaga StartOS 0.4.0.2 lub nowszego. Pole „Nazwa płatności” w akcji „Payment Name” wyjaśnia, co robi każda z jego opcji.',
    fr_FR:
      "Mise à jour vers start-sdk 3.0.3 ; nécessite StartOS 0.4.0.2 ou une version ultérieure. Le champ Nom de paiement de l'action Payment Name explique ce que fait chacun de ses choix.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
