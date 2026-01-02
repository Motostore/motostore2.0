import { cookies } from "next/headers";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ReceiptRefundIcon, 
  ShoppingBagIcon,
  HashtagIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

// --- TIPOS ---
type Transaction = {
  id: number;
  type?: string; // deposit, withdraw, order, etc.
  amount?: number;
  note?: string;
  created_at?: string;
  // Mapeamos los campos del backend de Python al frontend
  status?: string; 
};

export const dynamic = "force-dynamic"; 

// --- DATA FETCHING (SOLUCIÓN ERROR 422) ---
async function getPurchases(): Promise<Transaction[]> {
  // 1. Configuración de API
  let baseUrl = process.env.API_BASE || "http://127.0.0.1:8000/api/v1";
  baseUrl = baseUrl.replace(/\/$/, "");

  // 2. Obtenemos el ID del usuario
  // En producción esto viene de la sesión. Para desarrollo usamos la variable estática o el ID 1 (Superuser).
  const userId = process.env.NEXT_PUBLIC_WALLET_STATIC_USERID || "1";

  // 3. Construimos el endpoint con el user_id OBLIGATORIO para Python
  const endpointBase = baseUrl.endsWith("/api/v1") 
      ? `${baseUrl}/transactions` 
      : `${baseUrl}/api/v1/transactions`;
  
  // ¡AQUÍ ESTÁ LA SOLUCIÓN AL 422! -> Agregamos ?user_id=...
  const endpoint = `${endpointBase}?user_id=${userId}`;

  console.log("📡 Conectando a:", endpoint);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    // Si el backend de Python da error, mostramos qué pasó
    console.error(`❌ Backend Error (${res.status}):`, text);
    throw new Error(`Error ${res.status}: ${text || res.statusText}`);
  }

  // Parseamos y adaptamos los datos si es necesario
  const data = text ? JSON.parse(text) : [];
  
  // El backend de Python devuelve 'type' y 'note'. 
  // Si tu tabla usa 'status' o 'name', aquí podrías necesitar un adaptador.
  // Por ahora lo pasamos directo.
  return data;
}

// --- HELPERS VISUALES ---
function getStatusBadge(item: Transaction) {
  // Python devuelve "type" (deposit, order, payment-approved) en lugar de un status simple
  // Vamos a deducir el estado basado en el tipo o nota
  
  let label = "Completado";
  let colorClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
  let Icon = CheckCircleIcon;

  const type = (item.type || "").toLowerCase();
  
  if (type.includes("pending") || type.includes("proces")) {
    label = "Pendiente";
    colorClass = "bg-amber-50 text-amber-600 border-amber-100";
    Icon = ClockIcon;
  } else if (type.includes("reject") || type.includes("fail")) {
    label = "Rechazado";
    colorClass = "bg-red-50 text-red-600 border-red-100";
    Icon = XCircleIcon;
  } else if (type === "withdraw") {
    label = "Retiro";
    colorClass = "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      <Icon className="w-4 h-4" /> {label}
    </span>
  );
}

function formatMoney(amount: any) {
  const num = Number(amount);
  return Number.isFinite(num) 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num) 
    : "$0.00";
}

// --- COMPONENTE PRINCIPAL ---
export default async function MyPurchasesPage() {
  let purchases: Transaction[] = [];
  let errorMsg = null;

  try {
    purchases = await getPurchases();
  } catch (err: any) {
    console.error("❌ Error en UI:", err);
    errorMsg = String(err?.message ?? "Error desconocido");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-2xl shadow-sm">
          <ReceiptRefundIcon className="w-8 h-8 text-[#E33127]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Movimientos</h1>
          <p className="text-slate-500 text-sm font-medium">Historial de transacciones, recargas y pagos.</p>
        </div>
      </div>

      {/* ESTADO DE ERROR */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-[#E33127] font-bold mb-2 flex items-center justify-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            No pudimos cargar tus movimientos
          </p>
          <code className="text-xs text-red-800 bg-red-100/50 px-2 py-1 rounded">
            {errorMsg}
          </code>
        </div>
      )}

      {/* TABLA DE COMPRAS */}
      {!errorMsg && (
        <>
          {purchases.length === 0 ? (
            // ESTADO VACÍO
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Aún no tienes movimientos</h3>
              <p className="text-sm text-slate-400 max-w-xs text-center mt-1">
                Tus recargas y transacciones aparecerán aquí.
              </p>
            </div>
          ) : (
            // LISTADO DE DATOS
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Tipo / Nota</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {purchases.map((p) => (
                      <tr key={p.id} className="group hover:bg-red-50/10 transition-colors duration-200">
                        
                        {/* ID */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700 text-sm">#{p.id}</span>
                        </td>

                        {/* Tipo / Nota */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm uppercase group-hover:text-[#E33127] transition-colors">
                              {p.type || "Transacción"}
                            </span>
                            {p.note && (
                              <span className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">
                                {p.note}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-300" />
                            {p.created_at ? new Date(p.created_at).toLocaleDateString("es-VE", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                          </div>
                        </td>

                        {/* Estado (Calculado) */}
                        <td className="px-6 py-4">
                          {getStatusBadge(p)}
                        </td>

                        {/* Monto */}
                        <td className="px-6 py-4 text-right">
                          <span className={`font-black text-base tracking-tight ${
                             (p.amount || 0) < 0 ? 'text-red-500' : 'text-slate-900'
                          }`}>
                            {formatMoney(p.amount)}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}