import { cookies } from "next/headers";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  UserGroupIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

// --- TIPOS (Adaptados al Backend Python) ---
type Transaction = {
  id: number;
  type: string;        // deposit, order, payment-approved, etc.
  amount: number;
  note?: string;       // Aquí suele venir info extra
  created_at: string;  // ISO Date
  // Campos opcionales por si el backend evoluciona
  status?: string;
  user_email?: string; 
};

// --- DATA FETCHING ---
async function getAllPurchases(): Promise<Transaction[]> {
  // 1. Configuración de API (Fix para Mac 127.0.0.1)
  let baseUrl = process.env.API_BASE || "http://127.0.0.1:8000/api/v1";
  baseUrl = baseUrl.replace(/\/$/, "");

  // 2. Endpoint correcto
  const path = baseUrl.endsWith("/api/v1") 
      ? "/transactions/all" 
      : "/api/v1/transactions/all";

  // 3. Actor ID (Admin) - Requerido por Python
  // Usamos el ID del admin actual (o 1 por defecto en dev)
  const actorId = process.env.NEXT_PUBLIC_WALLET_STATIC_USERID || "1";
  
  const endpoint = `${baseUrl}${path}?actor_id=${actorId}`;

  console.log("📡 Admin fetching all transactions:", endpoint);

  // 4. Cookies (Next.js 15 Async)
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`❌ Error Fetching All Transactions (${res.status}):`, text);
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return text ? JSON.parse(text) : [];
}

// --- HELPERS VISUALES ---
const nfCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getStatusBadge(type: string = "") {
  const t = type.toLowerCase();
  
  // Lógica de colores basada en el tipo de transacción de Python
  if (t.includes("approved") || t.includes("deposit") || t.includes("completed")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircleIcon className="w-4 h-4" /> Completado
      </span>
    );
  }
  if (t.includes("pending") || t.includes("process")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
        <ClockIcon className="w-4 h-4" /> Pendiente
      </span>
    );
  }
  if (t.includes("reject") || t.includes("fail") || t.includes("withdraw")) {
    // Withdraw lo ponemos gris o rojo según prefieras, aquí rojo para atención
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
        <XCircleIcon className="w-4 h-4" /> {t.includes("withdraw") ? "Retiro" : "Rechazado"}
      </span>
    );
  }
  
  // Default
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase">
      {type}
    </span>
  );
}

function prettyService(type: string) {
  const t = type.toLowerCase();
  if (t.includes("streaming")) return "🎬 Streaming";
  if (t.includes("license")) return "🔑 Licencias";
  if (t.includes("recharge")) return "⚡ Recargas";
  if (t.includes("order")) return "📦 Orden de Compra";
  if (t.includes("deposit")) return "💰 Depósito Wallet";
  if (t.includes("payment")) return "💳 Reporte Pago";
  return type.toUpperCase();
}

// --- COMPONENTE PRINCIPAL ---
export default async function UsersPurchasesPage() {
  let data: Transaction[] = [];
  let errorMsg: string | null = null;

  try {
    data = await getAllPurchases();
  } catch (e: any) {
    errorMsg = e?.message ?? "Error desconocido";
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100">
          <UserGroupIcon className="w-8 h-8 text-[#E33127]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ventas Globales</h1>
          <p className="text-slate-500 text-sm font-medium">Monitoreo de todas las transacciones de usuarios en tiempo real.</p>
        </div>
      </div>

      {/* ERROR STATE */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
           <p className="text-[#E33127] font-bold mb-1">Error de Conexión</p>
           <p className="text-sm text-red-600/80">{errorMsg}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!errorMsg && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <BanknotesIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-400">Sin registros</h3>
          <p className="text-sm text-slate-400">No hay movimientos registrados en el sistema global.</p>
        </div>
      )}

      {/* DATA TABLE */}
      {!errorMsg && data.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tipo / Detalle</th>
                  <th className="px-6 py-4">Referencia / Nota</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((t) => {
                  const monto = Number(t.amount);
                  
                  return (
                    <tr key={t.id} className="group hover:bg-red-50/10 transition-colors duration-200">
                      
                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm">#{t.id}</span>
                      </td>

                      {/* Tipo */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-[#E33127] transition-colors block">
                          {prettyService(t.type)}
                        </span>
                      </td>

                      {/* Nota / Referencia */}
                      <td className="px-6 py-4">
                         <div className="flex items-start gap-2 max-w-[250px]">
                            {t.note ? (
                              <>
                                <DocumentTextIcon className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-500 font-medium truncate" title={t.note}>
                                  {t.note}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-300 italic">Sin nota</span>
                            )}
                         </div>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 text-right">
                        <span className={`font-black text-sm tracking-tight ${monto < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                          {Number.isFinite(monto) ? nfCurrency.format(monto) : "—"}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(t.type)}
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-sm text-slate-500 font-medium">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString("es-VE", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "—"}
                          <CalendarDaysIcon className="w-4 h-4 text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



