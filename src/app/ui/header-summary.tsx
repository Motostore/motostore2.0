"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";

// --- HELPERS ---
function pickToken(session: any): string | null {
  const u = session?.user ?? {};
  return u?.token ?? u?.accessToken ?? (session as any)?.accessToken ?? null;
}

function formatMoney(n: number, currency: string) {
  try {
    const safeN = Number(n) || 0;
    switch (currency) {
      case "COP": return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(safeN);
      case "VES": return new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES", maximumFractionDigits: 2 }).format(safeN);
      case "USD": default: return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(safeN);
    }
  } catch {
    return `${currency} 0.00`;
  }
}

// --- FETCHER INTELIGENTE (BUSCADOR DE TESOROS) ---
const fetcherWithToken = async ([_, token]: [string, string]) => {
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  
  // 1. INTENTO PRINCIPAL: Datos del usuario (/me) que suele tener el saldo
  console.log("🔍 Buscando saldo en /api-proxy/me ...");
  let res = await fetch("/api-proxy/me", { headers, cache: "no-store" });
  
  if (!res.ok) {
    // 2. INTENTO SECUNDARIO: Billetera directa (/wallet)
    console.log("⚠️ /me falló. Probando /api-proxy/wallet ...");
    res = await fetch("/api-proxy/wallet", { headers, cache: "no-store" });
  }

  // 3. INTENTO TERCIARIO: Dashboard Summary
  if (!res.ok) {
     console.log("⚠️ /wallet falló. Probando /api-proxy/dashboard/summary ...");
     res = await fetch("/api-proxy/dashboard/summary", { headers, cache: "no-store" });
  }

  if (!res.ok) {
    console.error("❌ No se pudo obtener saldo de ninguna ruta.");
    return null;
  }

  const data = await res.json();
  console.log("✅ Datos recibidos del Backend:", data); // ¡ESTO ES LO IMPORTANTE!
  return data;
};

export default function HeaderSummary({ refreshMs = 5000 }: { refreshMs?: number }) {
  const { data: session, status } = useSession();
  const token = pickToken(session);

  const { data, isLoading } = useSWR(
    (status === "authenticated" && token) ? ["/summary-smart", token] : null,
    fetcherWithToken,
    { refreshInterval: refreshMs, revalidateOnFocus: true }
  );

  // --- BÚSQUEDA PROFUNDA ---
  // Buscamos el saldo donde sea que el backend lo haya puesto
  let rawBalance = 0;
  let rawProfit = 0;
  
  if (data) {
    // A veces el backend devuelve { data: { ... } } o directamente { ... }
    // "src" será el objeto donde realmente están los datos
    const src = data.data || data; 
    
    // Lista de posibles nombres para el saldo (busca en orden)
    rawBalance = src.balance ?? src.saldo ?? src.total_balance ?? src.wallet?.balance ?? src.amount ?? 0;
    
    // Lista de posibles nombres para la utilidad
    rawProfit = src.profit ?? src.utilidad ?? src.total_profit ?? src.earnings ?? 0;
  }

  const currency = (data?.currency || data?.data?.currency) ?? "USD";
  
  const balText = isLoading ? "..." : formatMoney(rawBalance, currency);
  const proText = isLoading ? "..." : formatMoney(rawProfit, currency);

  return (
    <span className="inline-flex items-center gap-4 text-sm animate-in fade-in">
      <div className="flex flex-col items-end leading-tight md:flex-row md:items-center md:gap-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider md:text-sm md:normal-case md:text-slate-600 md:font-normal">
            Saldo:
        </span>
        <strong className="text-emerald-600 font-bold text-base md:text-sm">
            {balText}
        </strong>
      </div>
      
      {/* Utilidades */}
      <div className="flex flex-col items-end leading-tight md:flex-row md:items-center md:gap-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider md:text-sm md:normal-case md:text-slate-600 md:font-normal">
            Utilidad:
        </span>
        <strong className="text-blue-600 font-bold text-base md:text-sm">
            {proText}
        </strong>
      </div>
    </span>
  );
}





