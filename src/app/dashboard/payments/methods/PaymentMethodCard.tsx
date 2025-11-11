'use client';
import React from 'react';

type PaymentType =
  | 'BANK_TRANSFER'
  | 'MOBILE_PAYMENT'
  | 'ZELLE_PAYMENT'
  | 'BINANCE_PAYMENT'
  | 'PAYPAL_PAYMENT'
  | 'ZINLI_PAYMENT'
  | 'WALLY_PAYMENT'
  | string;

type PM = {
  id?: string;
  name?: string | null;
  bankName?: string | null;
  bankCode?: string | null;   // Código del banco (0105)
  idNumber?: string | null;   // Cédula
  ownerPhone?: string | null; // Teléfono
  ownerEmail?: string | null;
  type?: PaymentType | null;
  label?: string | null;      // Texto del pill (opcional)
};

/* Texto debajo del título según el tipo */
function detailsByType(m: PM) {
  const t = (m.type ?? '').toUpperCase();

  if (t === 'MOBILE_PAYMENT') {
    const rows: string[] = [];
    if (m.bankName) rows.push(`Banco: ${m.bankName}`);
    if (m.bankCode) rows.push(`Código: ${m.bankCode}`);
    if (m.idNumber) rows.push(`Cédula: ${m.idNumber}`);
    if (m.ownerPhone) rows.push(`Teléfono: ${m.ownerPhone}`);
    return rows.join(' · ');
  }

  if (t === 'BANK_TRANSFER') return m.bankName ?? '';
  if (t === 'ZELLE_PAYMENT') return m.ownerEmail ? `Email: ${m.ownerEmail}` : '';

  const rows: string[] = [];
  if (m.ownerEmail) rows.push(`Email: ${m.ownerEmail}`);
  if (m.ownerPhone) rows.push(`Teléfono: ${m.ownerPhone}`);
  if (m.bankName) rows.push(`Banco: ${m.bankName}`);
  return rows.join(' · ');
}

/* Íconos (neutros para billeteras y Zelle) */
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M3 7.5C3 6.12 4.12 5 5.5 5H16a1 1 0 0 0 0-2H8.5C6.02 3 4 5.02 4 7.5V18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3H6.5A1.5 1.5 0 0 1 5 8.5V7.5Z" fill="currentColor" opacity=".15"/>
    <path d="M19 10.5H6.5A2.5 2.5 0 0 1 4 8V7.5C4 5.57 5.57 4 7.5 4H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="16" y="10.5" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="19" cy="14" r="1" fill="currentColor"/>
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="2.75" y="8.75" width="18.5" height="3.5" fill="currentColor" opacity=".2"/>
    <rect x="6" y="15" width="4.5" height="1.5" rx=".75" fill="currentColor"/>
  </svg>
);

function pickIcon(t?: string) {
  const type = (t ?? '').toUpperCase();

  // 🇺🇸 Zelle → tarjeta
  if (type === 'ZELLE_PAYMENT') return <CardIcon />;

  // 💳 Billeteras (un solo ícono)
  if (type === 'BINANCE_PAYMENT' || type === 'PAYPAL_PAYMENT' || type === 'ZINLI_PAYMENT' || type === 'WALLY_PAYMENT') {
    return <WalletIcon />;
  }

  if (type === 'MOBILE_PAYMENT') return <span role="img" aria-label="mobile">📱</span>;
  if (type === 'BANK_TRANSFER') return <span role="img" aria-label="bank">🏦</span>;
  return <span role="img" aria-label="generic">💠</span>;
}

function Pill({ text }: { text: string }) {
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
      {text}
    </span>
  );
}

export default function PaymentMethodCard({ m }: { m: PM }) {
  const title = m.name ?? '—';
  const subtitle = detailsByType(m);
  const badge = (m.label || m.type || '').toString();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl leading-none text-gray-700">
          {pickIcon(m.type)}
        </div>
        <div>
          <div className="text-base font-semibold text-gray-900">{title}</div>
          {subtitle ? (
            <div className="text-sm text-gray-600">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {badge ? <Pill text={badge} /> : null}
    </div>
  );
}



