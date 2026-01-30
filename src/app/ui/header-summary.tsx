// src/app/ui/header-summary.tsx
"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

type SummaryDTO = {
  balance: number;
  profit: number;
  currency?: string; // "USD" (default), "VES" o "COP"
};

function formatMoney(n: number, currency: string) {
  try {
    switch (currency) {
      case "COP":
        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }).format(n);
      case "VES":
        return new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "VES",
          maximumFractionDigits: 2,
        }).format(n);
      case "USD":
      default:
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(n);
    }
  } catch {
    return `${currency} ${(n ?? 0).toLocaleString()}`;
  }
}

export default function HeaderSummary({
  refreshMs = 60_000,
}: {
  refreshMs?: number;
}) {
  const { data, isLoading } = useSWR<SummaryDTO>("/api/summary", fetcher, {
    refreshInterval: refreshMs,
    revalidateOnFocus: true,
  });

  const balance = (data?.balance ?? 0) as number;
  const profit = (data?.profit ?? 0) as number;
  const currency = (data?.currency as string | undefined) ?? "USD";

  const balText = isLoading ? "—" : formatMoney(balance, currency);
  const proText = isLoading ? "—" : formatMoney(profit, currency);

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





