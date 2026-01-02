import { getServerSession } from "next-auth"; // 👈 IMPORTACIÓN CORRECTA PARA V4
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 👈 IMPORTAMOS TU CONFIGURACIÓN
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ReceiptRefundIcon, 
  ShoppingBagIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

// --- TIPOS ---
type Transaction = {
  id: number;
  type?: string; 
  amount?: number;
  note?: string;
  created_at?: string;
  status?: string; 
};

// Forzamos renderizado dinámico porque depende de datos del usuario
export const dynamic = "force-dynamic"; 

// --- DATA FETCHING ---
async function getPurchases() {
  // 1. OBTENER SESIÓN USANDO getServerSession Y TUS OPCIONES
  const session = await getServerSession(authOptions);

  // Extraemos el token. En tu config lo guardaste en session.user.accessToken
  // Usamos 'any' o casting seguro por si TypeScript se queja del tipo
  const token = (session?.user as any)?.accessToken || (session as any)?.accessToken;

  if (!token) {
    console.error("❌ No hay token de sesión. El usuario no está logueado.");
    return [];
  }

  // 2. Definir URL Base
  let baseUrl = process.env.API_BASE || "http://127.0.0.1:8000/api/v1";
  baseUrl = baseUrl.replace(/\/$/, "");

  const path = baseUrl.endsWith("/api/v1") 
      ? "/transactions" 
      : "/api/v1/transactions";

  // 3. Construcción de URL (Mantenemos user_id por compatibilidad con tu backend)
  const userId = process.env.NEXT_PUBLIC_WALLET_STATIC_USERID || "1";
  const endpoint = `${baseUrl}${path}?user_id=${userId}`;

  console.log("🚀 FETCHING CON TOKEN:", endpoint); 

  // 4. FETCH CON AUTHORIZATION HEADER
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      // 🔥 LA CLAVE DEL ÉXITO: Inyectamos el Token Bearer
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`❌ ERROR BACKEND (${res.status}):`, text);
    if (res.status === 401) {
        // Opcional: Podrías lanzar un error específico o retornar vacío
        console.error("Token expirado o inválido");
    }
    throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
  }

  return text ? JSON.parse(text) : [];
}

// --- HELPERS VISUALES ---
function getStatusBadge(item: Transaction) {
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
  } else if (type === "deposit") {
    label = "Depósito";
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
    console.error("❌ Error UI:", err);
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
          <code className="text-xs text-red-800 bg-red-100/50 px-2 py-1 rounded block mt-2 max-w-xl mx-auto overflow-x-auto">
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
                              <span className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate" title={p.note}>
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

                        {/* Estado */}
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




