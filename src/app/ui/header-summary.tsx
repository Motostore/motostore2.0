// src/app/ui/header-summary.tsx
'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

function formatCOP(n: number) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${(n ?? 0).toLocaleString()}`;
  }
}

export default function HeaderSummary({ refreshMs = 60_000 }: { refreshMs?: number }) {
  const { data, isLoading } = useSWR('/api/summary', fetcher, {
    refreshInterval: refreshMs,
    revalidateOnFocus: true,
  });

  const balance = useMemo(() => (data?.balance ?? 0) as number, [data]);
  const profit  = useMemo(() => (data?.profit  ?? 0) as number, [data]);

  const balText = isLoading ? '—' : formatCOP(balance);
  const proText = isLoading ? '—' : formatCOP(profit);

  return (
    <span className="inline-flex items-center gap-4 text-sm">
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>💵</span>
        <span className="text-slate-600">Saldo:</span>
        <strong className="font-semibold">{balText}</strong>
      </span>
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>🚀</span>
        <span className="text-slate-600">Utilidades:</span>
        <strong className="font-semibold">{proText}</strong>
      </span>
    </span>
  );
}

