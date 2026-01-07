// src/app/dashboard/client-info/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWalletBalance } from "@/app/lib/wallet.service";
import { useSession } from "next-auth/react";

export default function ClientInfoPage() {
  const { data: session, status } = useSession();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("COP");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formatea el saldo según la moneda
  function formatBalance(value: number, curr: string) {
    const upper = curr.toUpperCase();

    if (upper === "USD") {
      return `$ ${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    if (upper === "COP") {
      return `COP ${value.toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    if (upper === "BSF" || upper === "BS.F" || upper === "BS") {
      return `Bs.F ${value.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${upper} ${value.toLocaleString("es-CO")}`;
  }

  useEffect(() => {
    // 1. Si está cargando la sesión, no hacemos nada aún
    if (status === "loading") return;

    // 2. Si no está autenticado, mostramos error
    if (status === "unauthenticated") {
      setError("Debes iniciar sesión para ver esta información.");
      setLoading(false);
      return;
    }

    // 3. Verificamos que exista el ID
    // NOTA: session.user.id debe estar configurado en tu authOptions
    if (session?.user?.id) {
      const userId = Number(session.user.id);

      async function load() {
        try {
          setLoading(true);
          setError(null);

          // Llamada al servicio pasando el ID
          const data = await getWalletBalance(userId);

          const b = (data && (data.balance ?? data.saldo ?? data.amount)) ?? 0;
          const c = (data && (data.currency ?? data.moneda)) ?? "COP";

          setBalance(Number(b));
          setCurrency(String(c).toUpperCase());
        } catch (e: any) {
          console.error(e);
          setError("No se pudo cargar el saldo. Intenta más tarde.");
        } finally {
          setLoading(false);
        }
      }

      load();
    } else {
        // Caso raro: está autenticado pero no hay ID en la sesión
        setError("No se pudo identificar tu cuenta.");
        setLoading(false);
    }
  }, [status, session]);

  return (
    <main className="min-h-screen px-6 py-8 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Panel de cliente
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Información de tu cuenta
          </h1>
        </header>

        {/* Tarjeta de wallet */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Wallet
          </p>

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
              Cargando saldo...
            </div>
          )}

          {error && !loading && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              <p className="mt-2 text-sm text-slate-300">
                Saldo disponible
              </p>
              <p className="mt-1 text-3xl font-semibold text-emerald-400">
                {balance !== null ? formatBalance(balance, currency) : "—"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Este saldo se utiliza para consumir tus productos/servicios.
              </p>
            </>
          )}
        </section>

        {/* Info de rol */}
        <section className="space-y-3 text-sm text-slate-200">
          <p>
            Tu cuenta está configurada como <strong>CLIENTE</strong>.
          </p>
          <p className="text-slate-400">
            ID de Usuario: <span className="font-mono">{session?.user?.id || "N/A"}</span>
          </p>
        </section>

        <div className="mt-6 flex gap-3">
          <Link
            href="/support"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </main>
  );
}


