// src/app/dashboard/purchases/users/page.tsx
export const dynamic = "force-dynamic";

type Tx = {
  id: number;
  amount: number;
  clientId: number;
  managerId: number;
  paymentMethodId: number;
  serviceId: number;
  serviceType: "EXCHANGE" | "LICENSES" | "MARKETING" | "RECHARGES" | "STREAMING";
  status: "PENDING" | "PROCESSED" | "REJECTED";
  reference?: string | null;
  name?: string | null;
  email?: string | null;
  date: string; // ISO
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

async function getAllPurchases(): Promise<Tx[]> {
  const res = await fetch(`${API}/api/v1/transactions/all`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    credentials: "include",            // <- IMPORTANTE: envía cookies/sesión
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text || ""}`.trim());
  }
  try {
    return (await res.json()) as Tx[];
  } catch {
    return [];
  }
}

/* ---- helpers UI ---- */
const nfCurrency = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function statusChipClasses(s: Tx["status"]) {
  switch (s) {
    case "PROCESSED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

function prettyService(t: Tx["serviceType"]) {
  switch (t) {
    case "STREAMING":  return "🎬 Streaming";
    case "LICENSES":   return "🔑 Licencias";
    case "RECHARGES":  return "⚡ Recargas";
    case "EXCHANGE":   return "💱 Cambios";
    case "MARKETING":  return "📣 Marketing";
    default:           return t;
  }
}

export default async function UsersPurchasesPage() {
  let data: Tx[] = [];
  let error: string | null = null;

  try {
    data = await getAllPurchases();
  } catch (e: any) {
    error = e?.message ?? "Error desconocido";
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Compras de usuarios</h1>
        <p className="text-sm text-slate-600">Compras administradas por el sistema.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          Error al cargar compras: {error}
        </div>
      )}

      {!data || data.length === 0 ? (
        <p className="text-slate-500">Aún no hay compras registradas.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Servicio</th>
                <th className="px-3 py-2 text-left">Referencia</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => {
                const fecha = new Date(t.date);
                const monto = Number(t.amount);
                const cliente = t.email || t.name || `Cliente #${t.clientId}`;

                return (
                  <tr key={t.id} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-medium text-slate-800">{t.id}</td>
                    <td className="px-3 py-2">{cliente}</td>
                    <td className="px-3 py-2">{prettyService(t.serviceType)}</td>
                    <td className="px-3 py-2">{t.reference || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {Number.isFinite(monto) ? nfCurrency.format(monto) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ring-1 ${statusChipClasses(t.status)}`}>
                        {t.status === "PROCESSED" ? "PROCESSED" : t.status === "REJECTED" ? "REJECTED" : "PENDING"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {isNaN(fecha.getTime())
                        ? "—"
                        : fecha.toLocaleString("es-VE", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



