import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:4',
  releaseNotes: {
    en_US:
      'Hosted-mode watchdog now compares the whole published record, not just the sp and lno parameters, so a payment instruction added under any other name is caught too. Own-domain mode is unchanged: it still compares only what this package manages, since your own DNS provider may legitimately carry instructions it does not.',
    es_ES:
      'El vigilante en modo alojado ahora compara el registro publicado completo, no solo los parámetros sp y lno, así que una instrucción de pago añadida bajo cualquier otro nombre también se detecta. El modo de dominio propio no cambia: sigue comparando solo lo que este paquete gestiona, ya que tu propio proveedor de DNS puede llevar legítimamente instrucciones que no le corresponden.',
    de_DE:
      'Die Überwachung im gehosteten Modus vergleicht jetzt den gesamten veröffentlichten Datensatz, nicht nur die Parameter sp und lno, sodass eine unter einem anderen Namen hinzugefügte Zahlungsanweisung ebenfalls erkannt wird. Der Modus für die eigene Domain bleibt unverändert: Er vergleicht weiterhin nur das, was dieses Paket verwaltet, da dein eigener DNS-Anbieter rechtmäßig Anweisungen tragen kann, die es nicht verwaltet.',
    pl_PL:
      'Nadzór w trybie hostowanym porównuje teraz cały opublikowany rekord, a nie tylko parametry sp i lno, więc instrukcja płatności dodana pod dowolną inną nazwą również zostanie wykryta. Tryb własnej domeny pozostaje bez zmian: nadal porównuje tylko to, czym zarządza ten pakiet, ponieważ twój własny dostawca DNS może zgodnie z prawem przenosić instrukcje, którymi ten pakiet nie zarządza.',
    fr_FR:
      "La surveillance en mode hébergé compare désormais l'intégralité de l'enregistrement publié, pas seulement les paramètres sp et lno, si bien qu'une instruction de paiement ajoutée sous un autre nom est également détectée. Le mode domaine propre reste inchangé : il continue de ne comparer que ce que ce paquet gère, car votre propre fournisseur DNS peut légitimement porter des instructions qu'il ne gère pas.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
