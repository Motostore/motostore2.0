import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  ShoppingBagIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  TicketIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

// --- TIPOS ---
type Transaction = {
  id: number;
  type?: string; 
  amount?: number;
  note?: string; // Aquí suele venir el nombre del producto
  description?: string; // A veces viene aquí
  created_at?: string;
  status?: string; 
  reference?: string;
};

export const dynamic = "force-dynamic"; 

// --- DATA FETCHING ---
async function getPurchases() {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.accessToken || (session as any)?.accessToken;

  if (!token) return [];

  // Conexión Inteligente (Render o Local)
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";
  baseUrl = baseUrl.replace(/\/$/, ""); // Quitar slash final si existe
  if (!baseUrl.endsWith("/api/v1")) baseUrl += "/api/v1";

  // Endpoint: Pedimos las transacciones del usuario
  const endpoint = `${baseUrl}/transactions?limit=50`; 

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    // Si el backend devuelve { items: [...] } o array directo
    const list = Array.isArray(data) ? data : (data.items || data.data || []);
    
    // FILTRO IMPORTANTE: Solo mostramos 'compras' (purchase/order) o transacciones negativas (gastos)
    // Ajusta esta lógica según cómo tu backend nombre las compras
    return list.filter((t: Transaction) => {
        const type = (t.type || "").toLowerCase();
        return type.includes('purchase') || type.includes('order') || type.includes('compra') || (t.amount || 0) < 0;
    });

  } catch (err) {
    console.error("Error fetching purchases:", err);
    return [];
  }
}

// --- HELPERS ---
function formatMoney(amount: any) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(Number(amount) || 0));
}

function getProductIcon(note: string = "") {
  const lower = note.toLowerCase();
  if (lower.includes("netflix") || lower.includes("screen") || lower.includes("tv")) return "📺";
  if (lower.includes("capcut") || lower.includes("edit")) return "🎬";
  if (lower.includes("spotify") || lower.includes("music")) return "🎵";
  if (lower.includes("xbox") || lower.includes("game")) return "🎮";
  return "📦";
}

// --- COMPONENTE PRINCIPAL ---
export default async function MyPurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#E33127]/10 rounded-2xl shadow-sm border border-[#E33127]/20">
            <ShoppingBagIcon className="w-8 h-8 text-[#E33127]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Compras</h1>
            <p className="text-slate-500 text-sm font-medium">Licencias, cuentas y servicios adquiridos.</p>
          </div>
        </div>
      </div>

      {/* LISTA DE COMPRAS (ESTILO TARJETA, NO TABLA ABURRIDA) */}
      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <TicketIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">Sin compras recientes</h3>
          <p className="text-sm text-slate-400 mt-1">Visita la tienda para adquirir tus primeros servicios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {purchases.map((p) => (
            <div key={p.id} className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300">
              
              {/* IZQUIERDA: Info del Producto */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                  {getProductIcon(p.note || p.description)}
                </div>
                
                <div>
                  {/* Aquí convertimos la NOTA en el TÍTULO del producto */}
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#E33127] transition-colors">
                    {p.note || p.description || "Producto Digital"}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("es-VE", { month: 'short', day: 'numeric', year: 'numeric' }) : "Fecha desc."}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="font-mono">REF: {p.reference || p.id}</span>
                  </div>
                </div>
              </div>

              {/* DERECHA: Precio y Botón */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pl-18 md:pl-0">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Pagado</p>
                  <p className="text-xl font-black text-slate-900">{formatMoney(p.amount)}</p>
                </div>

                {/* Botón Simulado (En el futuro abrirá un Modal con la clave) */}
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-[#E33127] hover:shadow-lg hover:shadow-red-500/30 transition-all transform active:scale-95">
                  <EyeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver Datos</span>
                  <span className="sm:hidden">Ver</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}




