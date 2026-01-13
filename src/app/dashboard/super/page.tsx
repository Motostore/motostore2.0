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
    // FIX 1: Usamos w-full y quitamos min-h-screen para evitar conflictos con el layout
    <div className="w-full bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      {/* FIX 2: Ajuste de márgenes (mt-6 mb-8) para alinear con el menú nuevo sin dejar huecos */}
      <div className="max-w-7xl mx-auto px-6 mt-6 mb-8">
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
                    Acceso privilegiado al núcleo del sistema Moto Store LLC.
                </p>
            </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Banner de Bienvenida */}
        <div className="mb-10 rounded-3xl bg-white p-8 border border-slate-200 shadow-2xl shadow-slate-300/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">¡Bienvenido de vuelta, {userName}!</h2>
                <p className="text-sm text-slate-500 mt-1.5">Tu rol de administración global está activo. Revisa el estado y gestiona las herramientas.</p>
            </div>
            {/* GOD MODE más llamativo */}
            <span className="px-4 py-2 rounded-full bg-red-50 text-[#E33127] text-xs font-black uppercase tracking-widest border border-red-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E33127] animate-pulse"/>
                GOD MODE
            </span>
        </div>

        {/* Grid de Herramientas Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
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
            {/* FIX 3: Conectado a la ruta real de tesorería */}
            <AdminCard 
                icon={BanknotesIcon}
                title="Tesorería Global"
                desc="Auditoría financiera y balance total de la plataforma."
                status="Auditado"
                statusColor="text-purple-600"
                iconBg="bg-purple-50"
                href="/dashboard/super/treasury" 
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
            // PREMIUM: Diseño de tarjeta limpio y moderno
            className={`group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 h-full flex flex-col justify-between ${
                href ? 'hover:scale-[1.02] hover:shadow-xl hover:border-red-100 hover:ring-1 hover:ring-red-100 cursor-pointer' : ''
            }`}
        >
            <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                    {/* ICONO GRANDE Y CON FONDO CIRCULAR/SUAVE */}
                    <div className={`p-3 rounded-2xl ${iconBg} transition-colors shadow-sm`}>
                        <Icon className={`w-6 h-6 ${statusColor}`} />
                    </div>
                    {/* ETIQUETA DE ESTADO */}
                    <span className={`text-[9px] font-extrabold uppercase ${statusColor} bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm`}>
                        {status}
                    </span>
                </div>
                
                {/* TÍTULO */}
                <h3 className="font-extrabold text-slate-900 text-xl mb-2 tracking-tight group-hover:text-[#E33127] transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
            
            {/* FOOTER INTERACTIVO PREMIUM */}
            {href && (
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-end">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-[#E33127] transition-colors">
                        Gestionar
                        <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-1"/>
                    </span>
                </div>
            )}
        </Component>
    )
}

