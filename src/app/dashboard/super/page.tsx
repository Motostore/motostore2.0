import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  ServerStackIcon, 
  UsersIcon, 
  CommandLineIcon, 
  BanknotesIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

export default async function SuperPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/super");
  }

  const userRole = (session as any).user.role;
  const userName = (session.user as any).name;

  if (userRole !== "SUPERUSER") {
    redirect("/dashboard?error=AccessDenied");
  }

  // Renderizado Estilo Moto Store - FULL PREMIUM
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
            {/* Ícono de la marca destacado */}
            <div className="p-4 bg-white rounded-3xl border border-red-200 shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-[#E33127]" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Panel de <span className="text-[#E33127] border-b-4 border-[#E33127]/50">Administración</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg mt-1">
                    Acceso privilegiado al núcleo del sistema.
                </p>
            </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Banner de Bienvenida */}
        <div className="mb-10 rounded-3xl bg-white p-8 border border-slate-200 shadow-2xl shadow-slate-300/50 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">¡Bienvenido de vuelta, {userName}!</h2>
                <p className="text-sm text-slate-500 mt-1.5">Tu rol de administración global está activo. Revisa el estado y gestiona las herramientas.</p>
            </div>
            {/* GOD MODE más llamativo */}
            <span className="px-4 py-2 rounded-full bg-red-50 text-[#E33127] text-sm font-black uppercase tracking-widest border-2 border-red-200 shadow-lg">
                GOD MODE
            </span>
        </div>

        {/* Grid de Herramientas Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* CARD 1: ESTADO DEL SISTEMA (SERVER) */}
            <AdminCard 
                icon={ServerStackIcon}
                title="Estado del Sistema"
                desc="Verificar todos los servicios operativos y microservicios."
                status="Online"
                statusColor="text-emerald-600"
                iconBg="bg-emerald-50"
                href="#"
            />

            {/* CARD 2: GESTIÓN DE USUARIOS */}
            <AdminCard 
                icon={UsersIcon}
                title="Gestión de Usuarios"
                desc="Administrar permisos, roles y supervisar usuarios."
                status="Acceder"
                statusColor="text-blue-600"
                iconBg="bg-blue-50"
                href="/dashboard/users/list"
            />

            {/* CARD 3: LOGS DE TRANSACCIONES */}
            <AdminCard 
                icon={CommandLineIcon}
                title="Logs de Auditoría"
                desc="Revisar el historial completo de eventos y errores críticos."
                status="Ver Logs"
                statusColor="text-slate-700"
                iconBg="bg-slate-100"
                href="#"
            />

            {/* CARD 4: FINANZAS GLOBALES (TESORERÍA) */}
            <AdminCard 
                icon={BanknotesIcon}
                title="Tesorería Global"
                desc="Auditoría financiera y balance total de la plataforma."
                status="Auditado"
                statusColor="text-purple-600"
                iconBg="bg-purple-50"
                href="#"
            />

        </div>
      </div>
    </div>
  );
}

// Subcomponente de Tarjeta (FULL PREMIUM ORO PRO+++)
function AdminCard({ icon: Icon, title, desc, status, statusColor, iconBg, href }: any) {
    const Component = href ? Link : 'div';
    
    return (
        <Component 
            href={href || '#'}
            // PREMIUM: Border-2, Sombra alta en hover, flex-grow para igualar altura
            className={`group bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl transition-all duration-300 h-full flex flex-col justify-between ${
                href ? 'hover:scale-[1.01] hover:shadow-2xl hover:border-[#E33127] cursor-pointer' : ''
            }`}
        >
            <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                    {/* ICONO GRANDE Y CON FONDO CIRCULAR/SUAVE */}
                    <div className={`p-3 rounded-full ${iconBg} transition-colors shadow-md`}>
                        <Icon className={`w-8 h-8 ${statusColor}`} />
                    </div>
                    {/* ETIQUETA DE ESTADO - Más contrastante y sutil */}
                    <span className={`text-[10px] font-extrabold uppercase ${statusColor} bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm`}>
                        {status}
                    </span>
                </div>
                
                {/* TÍTULO MÁS IMPACTANTE */}
                <h3 className="font-extrabold text-slate-900 text-2xl mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 min-h-[40px] flex-grow">{desc}</p>
            </div>
            
            {/* FOOTER INTERACTIVO PREMIUM */}
            {href && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-500">Acción Requerida</span>
                    {/* Botón/Píldora de Acción */}
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#E33127] text-white rounded-full text-xs font-bold transition-all duration-300 group-hover:bg-red-700">
                        Ir a la herramienta
                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
                    </span>
                </div>
            )}
        </Component>
    )
}


