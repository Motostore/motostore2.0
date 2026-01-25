"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  ShoppingBagIcon, 
  SparklesIcon, 
  TvIcon, 
  MusicalNoteIcon, 
  PlayCircleIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

// --- TIPOS ---
type Product = {
  id: number;
  provider: string;
  type: string;
  price: number;
  category: string;
  busy: boolean;
};

type GroupedProduct = {
  key: string; // Ej: "Netflix-Pantalla"
  provider: string;
  type: string;
  price: number;
  category: string;
  stock: number;
  sampleId: number; // ID de uno disponible para vender
};

// --- HELPERS ---
const formatMoney = (amount: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const getCategoryIcon = (cat: string) => {
  if (cat === "Musica") return <MusicalNoteIcon className="w-6 h-6 text-purple-500" />;
  if (cat === "IPTV") return <TvIcon className="w-6 h-6 text-orange-500" />;
  return <PlayCircleIcon className="w-6 h-6 text-red-500" />;
};

export default function StorePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [buying, setBuying] = useState<string | null>(null); // Guardamos la KEY del producto que se está comprando

  // 1. CARGAR INVENTARIO
  useEffect(() => {
    async function fetchInventory() {
      if (!session?.user) return;
      try {
        const token = (session as any).accessToken;
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";
        if (!baseUrl.endsWith("/api/v1")) baseUrl += "/api/v1";

        // Traemos TODAS las cuentas (luego filtramos las disponibles)
        const res = await fetch(`${baseUrl}/streaming/profiles`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.content || []);
            setProducts(list);
        }
      } catch (e) {
        console.error("Error cargando tienda:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [session]);

  // 2. AGRUPAR PRODUCTOS (Lógica Inteligente)
  // Convierte 50 cuentas sueltas en tarjetas de producto ordenadas
  const groupedProducts = useMemo(() => {
    const groups: Record<string, GroupedProduct> = {};

    products.forEach(p => {
        // Solo vendemos lo que NO está ocupado (busy: false) y está activo
        if (p.busy) return; 

        const key = `${p.provider}-${p.type}`;
        
        if (!groups[key]) {
            groups[key] = {
                key,
                provider: p.provider,
                type: p.type,
                price: p.price,
                category: p.category,
                stock: 0,
                sampleId: p.id
            };
        }
        groups[key].stock += 1;
    });

    return Object.values(groups);
  }, [products]);

  // 3. PROCESAR COMPRA
  const handleBuy = async (product: GroupedProduct) => {
    if (!confirm(`¿Confirmas la compra de ${product.provider} (${product.type}) por ${formatMoney(product.price)}?`)) return;

    setBuying(product.key);
    
    try {
        const token = (session as any).accessToken;
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://motostore-api.onrender.com/api/v1";
        if (!baseUrl.endsWith("/api/v1")) baseUrl += "/api/v1";

        // 🔥 AQUÍ OCURRE LA MAGIA: 
        // Llamamos al endpoint "purchase" (asegúrate de que tu backend tenga esto o usa 'transactions')
        // Si tu backend no tiene un endpoint específico de "asignar cuenta", 
        // enviamos el ID de una cuenta disponible (sampleId).
        const res = await fetch(`${baseUrl}/store/purchase`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: product.sampleId, // Enviamos el ID real de una cuenta disponible
                amount: product.price,
                description: `${product.provider} - ${product.type}` // Esto es lo que saldrá en el reporte
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Error al procesar la compra");
        }

        alert("✅ ¡Compra exitosa! Revisa tus credenciales en 'Mis Suscripciones'.");
        
        // Recargar inventario para actualizar stock
        window.location.reload();

    } catch (error: any) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        setBuying(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER TIENDA */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                Tienda <span className="text-[#E33127]">Oficial</span>
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
                <SparklesIcon className="w-4 h-4 text-yellow-500"/> 
                Entrega inmediata y automática las 24/7
            </p>
        </div>
        <div className="bg-slate-900 px-5 py-2 rounded-full shadow-lg shadow-slate-900/20 border border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Disponible</p>
            <p className="text-white font-black text-lg flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-[#E33127]"/> 
                {groupedProducts.length} Productos
            </p>
        </div>
      </div>

      {/* ESTADO DE CARGA */}
      {loading && (
        <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E33127] mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold">Cargando catálogo...</p>
        </div>
      )}

      {/* ESTADO VACÍO */}
      {!loading && groupedProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
            <ExclamationCircleIcon className="w-16 h-16 text-slate-300 mb-4"/>
            <h3 className="text-xl font-bold text-slate-400">Stock Agotado</h3>
            <p className="text-sm text-slate-400 mt-1">Estamos reponiendo inventario. Vuelve pronto.</p>
        </div>
      )}

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groupedProducts.map((p) => (
          <div key={p.key} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-100 transition-all duration-300 flex flex-col justify-between h-full">
            
            {/* CABECERA TARJETA */}
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-red-50 transition-colors">
                        {getCategoryIcon(p.category)}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                        <CheckBadgeIcon className="w-3 h-3"/> Stock: {p.stock}
                    </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{p.provider}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{p.type}</p>
            </div>

            {/* PRECIO Y BOTÓN */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Precio</span>
                    <span className="text-2xl font-black text-slate-900">{formatMoney(p.price)}</span>
                </div>

                <button 
                    onClick={() => handleBuy(p)}
                    disabled={buying === p.key}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-[#E33127] shadow-lg shadow-slate-900/10 hover:shadow-red-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {buying === p.key ? (
                        <>Procesando...</>
                    ) : (
                        <>Comprar Ahora</>
                    )}
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}