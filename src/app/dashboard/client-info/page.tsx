// src/app/dashboard/client-info/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWalletBalance } from "@/app/lib/wallet.service";
// 🛑 IMPORTAR useSession
import { useSession } from "next-auth/react"; 

export default function ClientInfoPage() {
  const { data: session, status } = useSession(); // 🛑 OBTENER LA SESIÓN
  
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("COP");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formatea el saldo según la moneda
  function formatBalance(value: number, curr: string) {
    // ... (Tu función de formato de balance es correcta)
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

    // Bs.F (Venezuela)
    if (upper === "BSF" || upper === "BS.F" || upper === "BS") {
      return `Bs.F ${value.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    // Fallback genérico
    return `${upper} ${value.toLocaleString("es-CO")}`;
  }

  useEffect(() => {
    // Aseguramos que la sesión esté cargada y exista un usuario
    if (status !== 'authenticated' || !session?.user?.id) {
        if (status === 'unauthenticated') {
            setError("Usuario no autenticado.");
            setLoading(false);
        }
        return; 
    }

    // 🛑 OBTENER EL ID DEL USUARIO (asumimos que está en la sesión y es un número)
    const userId = Number(session.user.id);

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 🛑 CORRECCIÓN TS2554: PASAMOS EL userId
        const data = await getWalletBalance(userId); 

        // Intentamos leer varias posibles claves por si tu API usa otro nombre
        const b =
          (data && (data.balance ?? data.saldo ?? data.amount)) ?? 0;
        const c = (data && (data.currency ?? data.moneda)) ?? "COP";

        setBalance(Number(b));
        setCurrency(String(c).toUpperCase());
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar el saldo");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]); // 🛑 AÑADIR status y session como dependencias de useEffect

  return (
    <main className="min-h-screen px-6 py-8 bg-slate-950 text-slate-50">
      {/* ... (El resto del JSX es el mismo) ... */}
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
            <p className="mt-3 text-sm text-slate-400">
              Cargando saldo…
            </p>
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
            Tu cuenta está configurada como <strong>CLIENTE</strong>. Desde aquí
            podrás consultar información básica y, más adelante, el detalle de tus
            productos o servicios.
          </p>
          <p className="text-slate-400">
            Si necesitas cambiar de rango (por ejemplo a reseller, distribuidor, etc.),
            debes contactar con un <strong>SUPERUSER</strong> o <strong>ADMIN</strong>.
          </p>
        </section>

        <div className="mt-6 flex gap-3">
          <Link
            href="/support"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Contactar soporte
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100"
          >
            Ir al login
          </Link>
        </div>
      </div>
    </main>
  );
}



