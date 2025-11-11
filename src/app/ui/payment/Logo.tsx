// src/app/ui/payment/Logo.tsx
'use client';
import React from 'react';
import { paymentLogo, Payment } from './logos';

type Props = { m: Payment; size?: number };

export default function Logo({ m, size = 40 }: Props) {
  const src = paymentLogo(m);
  // Usamos <img> simple para permitir onError como fallback visual
  return (
    <img
      src={src}
      alt={`${m.name || m.bankName || 'Método'} logo`}
      width={size}
      height={size}
      className="w-10 h-10 object-contain select-none"
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logos/_generic.svg'; }}
    />
  );
}
