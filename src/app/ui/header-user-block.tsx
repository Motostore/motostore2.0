// src/app/ui/header-user-block.tsx
'use client';

import useSWR from 'swr';

type Metrics = {
  balance?: number | null;
  profits?: number | null;
};

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error('Error al cargar');
    return r.json();
  });

function formatMoney(v?: number | null) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  try {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}

export default function HeaderUserBlock() {
  const { data, error, isLoading } = useSWR<Metrics>('/api/me/metrics', fetcher, {
    refreshInterval: 30_000, // refresca cada 30s
  });

  const saldo = formatMoney(data?.balance);
  const util = formatMoney(data?.profits);

  return (
    <div className="flex items-center gap-5 text-sm">
      <span className="inline-flex items-center gap-1 text-slate-700">
        <span role="img" aria-label="saldo">💵</span>
        <span className="hidden sm:inline">Saldo:</span>
        <strong className="tabular-nums">{isLoading ? '…' : saldo}</strong>
      </span>

      <span className="inline-flex items-center gap-1 text-slate-700">
        <span role="img" aria-label="utilidades">🚀</span>
        <span className="hidden sm:inline">Utilidades:</span>
        <strong className="tabular-nums">{isLoading ? '…' : util}</strong>
      </span>

      {error ? (
        <span className="text-xs text-red-600">Sin datos</span>
      ) : null}
    </div>
  );
}

