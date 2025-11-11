// src/app/dashboard/purchases/mine/page.tsx
import { cookies } from "next/headers";

type Transaction = {
  id: number;
  date?: string;
  amount?: number;
  status?: string;
  reference?: string;
  serviceType?: string;
  name?: string;
};

export const dynamic = "force-dynamic"; // no cache

async function getPurchases(): Promise<Transaction[]> {
  const API = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080").replace(/\/$/, "");

  // 👉 Tomamos las cookies de la request del usuario y las mandamos al API
  const cookieHeader = cookies().toString();

  const res = await fetch(`${API}/api/v1/transactions`, {
    headers: {
      Accept: "application/json",
      // MUY IMPORTANTE: reenviar cookies al backend
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    // Si el backend devolvió error, mostramos el detalle para depurar
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }

  // Si viene vacío, devolvemos []
  return text ? JSON.parse(text) : [];
}

export default async function MyPurchasesPage() {
  let purchases: Transaction[] = [];
  try {
    purchases = await getPurchases();
  } catch (err: any) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Mis compras</h1>
        <p className="text-sm text-gray-600">Historial de compras del usuario actual.</p>
        <p className="mt-4 text-red-600">Error: {String(err?.message ?? err)}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Mis compras</h1>
      <p className="text-sm text-gray-600">Historial de compras del usuario actual.</p>

      {purchases.length === 0 ? (
        <p className="mt-6 text-gray-500">Aún no tienes compras.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Servicio</th>
                <th className="px-4 py-2 text-left">Referencia</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">
                    {p.date ? new Date(p.date).toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-2">{p.serviceType ?? p.name ?? "—"}</td>
                  <td className="px-4 py-2">{p.reference ?? "—"}</td>
                  <td className="px-4 py-2">{p.status ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    {Number.isFinite(Number(p.amount)) ? Number(p.amount).toFixed(2) : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}




