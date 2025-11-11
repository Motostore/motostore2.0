// src/app/ui/payment/logos.ts
export type Payment = {
  id?: number | string
  name?: string | null
  type?: string | null
  bankName?: string | null
}

const NAME_LOGOS: Record<string, string> = {
  // VE
  'bancamiga': '/logos/bancamiga.svg',
  'mercantil': '/logos/mercantil.svg',
  'pago móvil': '/logos/pago-movil.svg',
  'pago movil': '/logos/pago-movil.svg',

  // CO
  'bancolombia': '/logos/bancolombia.svg',
  'bre-b': '/logos/bre-b.svg',
  'breb': '/logos/bre-b.svg',
  'nequi': '/logos/nequi.svg',
  'transfiya': '/logos/transfiya.svg',

  // US (Zelle)
  'zelle': '/logos/zelle.svg',
  'majority': '/logos/majority.svg',
  'común': '/logos/comun.svg',
  'comun': '/logos/comun.svg',
  'panas': '/logos/panas.svg',

  // Wallets
  'binance': '/logos/binance.svg',
  'zinli': '/logos/zinli.svg',
  'paypal': '/logos/paypal.svg',
  'wally': '/logos/wally.svg',
}

const TYPE_FALLBACK: Record<string, string> = {
  'BANK_TRANSFER': '/logos/_bank.svg',
  'MOBILE_PAYMENT': '/logos/_mobile.svg',
  'ZELLE_PAYMENT': '/logos/zelle.svg',   // si no hay marca específica
  'BINANCE_PAYMENT': '/logos/binance.svg',
  'ZINLI_PAYMENT': '/logos/zinli.svg',
  'WALLY_PAYMENT': '/logos/_wallet.svg',
}

// Devuelve la mejor ruta para el logo o un fallback
export function paymentLogo(p: Payment): string {
  const hay = (s?: string | null) => (s ?? '').toLowerCase()

  const a = hay(p.bankName)
  const b = hay(p.name)

  for (const key of Object.keys(NAME_LOGOS)) {
    if (a.includes(key) || b.includes(key)) {
      return NAME_LOGOS[key]
    }
  }

  if (p.type && TYPE_FALLBACK[p.type]) return TYPE_FALLBACK[p.type]
  return '/logos/_generic.svg'
}
