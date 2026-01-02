"use client";

import { useEffect, useState } from "react";

type BalanceDTO = {
  balance: number;
  currency?: string;
};

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

/**
 * Hook para leer el saldo de la wallet del usuario autenticado.
 */
export function useWalletBalance() {
  const [balance, setBalance] = useState<BalanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const res = await fetch(`${API}/api/v1/wallet/balance`, {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as BalanceDTO;
        if (!cancel) {
          setBalance(json);
        }
      } catch (err: any) {
        if (!cancel) {
          setError(err?.message || "Error al obtener el saldo");
          setBalance(null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  return { balance, loading, error };
}



