"use client";

import { useSession } from "next-auth/react";

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "$0.00";

  const raw = String(value).trim();

  if (/^\$?\d{1,3}(\.\d{3})*(,\d+)?$/.test(raw)) {
    return raw.startsWith("$") ? raw : `$${raw}`;
  }

  const clean = raw.replace(/[^\d.,-]/g, "").replace(",", ".");
  const num = Number(clean);
  if (Number.isNaN(num)) {
    return raw.startsWith("$") ? raw : `$${raw}`;
  }

  return (
    "$" +
    num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export default function HeaderUserBlock() {
  const { data: session, status } = useSession();
  const u: any = session?.user;

  const username =
    u?.username ?? u?.name ?? u?.email?.split("@")[0] ?? "invitado";

  const saldoRaw = u?.balanceText ?? 0;
  const utilRaw = u?.utilityText ?? 0;

  const saldo = status === "loading" ? "—" : formatMoney(saldoRaw);
  const utilidades = status === "loading" ? "—" : formatMoney(utilRaw);

  return (
    <div className="flex flex-col items-end gap-1 text-sm text-slate-700">
      <div>
        Bienvenido,{" "}
        <span className="font-semibold text-slate-900">{username}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <span>
          <span className="hidden sm:inline">💵</span>{" "}
          <span className="font-medium text-slate-800">
            Saldo: {saldo}
          </span>
        </span>
        <span>
          <span className="hidden sm:inline">🚀</span>{" "}
          <span className="font-medium text-slate-800">
            Utilidades: {utilidades}
          </span>
        </span>
      </div>
    </div>
  );
}









