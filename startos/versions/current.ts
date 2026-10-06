import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:4',
  releaseNotes: {
    en_US: `Adds an optional BOLT 12 Lightning offer, so one payment name can be paid over Lightning or on-chain and the sender's wallet decides which. The watchdog covers the offer as well, and on a hosted name it covers the whole published record. New icon.

- The Payment name field in the Payment Name action explains what each of its choices does.`,
    es_ES: `Añade una oferta Lightning BOLT 12 opcional, para que un mismo nombre de pago pueda cobrarse por Lightning o en cadena y el monedero de quien paga elija la vía. El vigilante cubre también la oferta y, en un nombre alojado, el registro publicado completo. Icono nuevo.

- El campo Nombre de pago de la acción Payment Name explica qué hace cada una de sus opciones.`,
    de_DE: `Ergänzt ein optionales BOLT-12-Lightning-Angebot, sodass derselbe Zahlungsname per Lightning oder On-Chain bezahlt werden kann und die Wallet des Zahlenden entscheidet. Die Überwachung erfasst auch das Angebot und bei einem gehosteten Namen den gesamten veröffentlichten Eintrag. Neues Symbol.

- Das Feld „Zahlungsname“ in der Aktion „Payment Name“ erklärt, was jede seiner Optionen bewirkt.`,
    pl_PL: `Dodaje opcjonalną ofertę Lightning BOLT 12, dzięki czemu jedna nazwa płatności przyjmuje płatności przez Lightning albo on-chain, a portfel płacącego wybiera drogę. Nadzór obejmuje także ofertę, a przy nazwie hostowanej — cały opublikowany rekord. Nowa ikona.

- Pole „Nazwa płatności” w akcji „Payment Name” wyjaśnia, co robi każda z jego opcji.`,
    fr_FR: `Ajoute une offre Lightning BOLT 12 facultative, afin qu'un même nom de paiement puisse être payé par Lightning ou on-chain, le portefeuille du payeur choisissant la voie. La surveillance couvre aussi l'offre et, pour un nom hébergé, l'intégralité de l'enregistrement publié. Nouvelle icône.

- Le champ Nom de paiement de l'action Payment Name explique ce que fait chacun de ses choix.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
