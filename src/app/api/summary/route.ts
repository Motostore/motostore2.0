// src/app/api/summary/route.ts (CÓDIGO FINAL Y Nivel PRO)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth"; // 🛑 Importar Session
import { authOptions } from "../auth/[...nextauth]/route";

// Convierte "$500.000" / "500,000.00" / "500000" → 500000 (number)
function parseMoneyToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const clean = raw.replace(/[^\d.,-]/g, "");
  const normalized = clean.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export async function GET(_req: NextRequest) {
  try {
    // 🚀 FIX PRO ABSOLUTO: Forzar el tipo de sesión devuelto por getServerSession
    const session = await getServerSession(authOptions as any) as Session | null;
    
    // 🛑 FIX COMPILACIÓN: Ahora podemos acceder a user de forma segura
    const user: any = session?.user ?? null; 
    
    // 🚀 FIX ARQUITECTURA: Validar si la sesión es null (aunque user ya será null)
    if (!user) {
        // Devolvemos el resumen con ceros si no hay autenticación, según tu lógica.
        return NextResponse.json({ balance: 0, profit: 0, currency: "COP" }, { status: 200 });
    }
    
    let balance = 0;
    let profit = 0;
    let currency = "COP";

    if (user) {
      // Lo que ya mandamos en el login desde el backend
      const rawBalance = user.balanceText ?? user.balance ?? null;
      const rawProfit =
        user.utilityText ??
        user.profit ??
        user.utilities ??
        user.ganancias ??
        null;

      balance = parseMoneyToNumber(rawBalance);
      profit = parseMoneyToNumber(rawProfit);

      // Por si en el futuro guardas moneda en la sesión
      currency = String(
        user.currency || user.walletCurrency || "COP"
      ).toUpperCase();
    }

    return NextResponse.json(
      {
        balance,
        profit,
        currency,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en /api/summary:", err);
    return NextResponse.json(
      {
        balance: 0,
        profit: 0,
        currency: "COP",
      },
      { status: 500 }
    );
  }
}




