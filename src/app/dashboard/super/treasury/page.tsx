import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import { BanknotesIcon } from "@heroicons/react/24/outline";

// Asegúrese de que esta ruta sea correcta
import UpdateRatesForm from "../../../components/UpdateRatesForm"; 

export default async function TreasuryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/super/treasury");
  }

  const userRole = (session as any).user.role;
  if (userRole !== "SUPERUSER") {
    redirect("/dashboard?error=AccessDenied");
  }

  // DATOS INICIALES
  const initialRates = [
    { code: 'VE', rate: 54.00, isManual: true, label: "Tasa USDT" },
    { code: 'CO', rate: 4100.00, isManual: false, label: "Colombia" },
    { code: 'PE', rate: 3.80, isManual: false, label: "Perú" },
    { code: 'CL', rate: 980.00, isManual: false, label: "Chile" }
  ];

  const defaultProfit = 5.00;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-3xl border border-red-200 shadow-lg">
                <BanknotesIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                    Tesorería <span className="text-red-600 border-b-4 border-red-600/50">Global</span>
                </h1>
                <p className="text-slate-500 font-bold text-sm mt-1 tracking-wider uppercase">
                    Control Centralizado de Tasas
                </p>
            </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* LAYOUT: FORMULARIO + PANEL INFORMATIVO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* IZQUIERDA: Componente con Banner y Formulario */}
            <div className="lg:col-span-2">
                <UpdateRatesForm 
                    initialRates={initialRates}
                    initialProfit={defaultProfit}
                />
            </div>

            {/* DERECHA: PANEL ESTADO DEL SISTEMA (AHORA BLANCO Y LIMPIO) */}
            <div className="lg:col-span-1 h-fit">
                
                {/* Fondo BLANCO (bg-white) con borde ROJO sutil para mantener limpieza */}
                <div className="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-xl relative overflow-hidden">
                    
                    <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic border-b border-slate-100 pb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                        Estado del Sistema
                    </h3>
                    
                    <ul className="space-y-6">
                        <li className="flex flex-col">
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">
                                Motor de Cobros
                            </span>
                            <span className="text-sm font-medium text-slate-500">
                                Las tasas se sincronizan <b className="text-slate-900">en tiempo real</b> con la API de recargas.
                            </span>
                        </li>

                        <li className="flex flex-col">
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">
                                Tasa USDT (Manual)
                            </span>
                            <span className="text-sm font-medium text-slate-500">
                                Usted tiene el control total. Ajuste este valor según la volatilidad del mercado.
                            </span>
                        </li>

                        <li className="flex flex-col">
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">
                                Monedas Regionales
                            </span>
                            <span className="text-sm font-medium text-slate-500">
                                Colombia, Perú y Chile operan con tasas de referencia automáticas (modo informativo).
                            </span>
                        </li>
                    </ul>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <span className="inline-block px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
                            Panel Administrativo
                        </span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}