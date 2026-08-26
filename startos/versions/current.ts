import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:2',
  releaseNotes: {
    en_US:
      'Initial release for StartOS. Publishes a BIP 353 payment name for your silent payment address — on a domain you control, or on a hosted one — and warns you if that name ever stops pointing at you.',
    es_ES:
      'Lanzamiento inicial para StartOS. Publica un nombre de pago BIP 353 para tu dirección de pago silencioso — en un dominio que controlas o en uno alojado — y te avisa si ese nombre deja de apuntar a ti.',
    de_DE:
      'Erstveröffentlichung für StartOS. Veröffentlicht einen BIP-353-Zahlungsnamen für deine Silent-Payment-Adresse — auf einer eigenen oder einer gehosteten Domain — und warnt dich, wenn dieser Name nicht mehr auf dich verweist.',
    pl_PL:
      'Pierwsze wydanie dla StartOS. Publikuje nazwę płatności BIP 353 dla Twojego adresu cichej płatności — w domenie, którą kontrolujesz, albo w hostowanej — i ostrzega, jeśli ta nazwa przestanie wskazywać na Ciebie.',
    fr_FR:
      'Version initiale pour StartOS. Publie un nom de paiement BIP 353 pour votre adresse de paiement silencieux — sur un domaine que vous contrôlez ou sur un domaine hébergé — et vous prévient si ce nom cesse de pointer vers vous.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
