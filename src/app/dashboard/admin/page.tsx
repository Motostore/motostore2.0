import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  BanknotesIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ShieldExclamationIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { normalizeRole } from '@/app/lib/roles'; // ✅ Usamos el estándar

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  // 1. Si no hay sesión, al Login
  if (!session) {
      redirect("/api/auth/signin?callbackUrl=/dashboard/admin");
  }

  // 2. OBTENER ROL NORMALIZADO
  const role = normalizeRole(user?.role); 

  // 3. SEGURIDAD DE JERARQUÍA
  // Si NO es Admin NI Superuser, lo mandamos al dashboard normal
  if (role !== "ADMIN" && role !== "SUPERUSER") {
      redirect("/dashboard?error=AccessDenied");
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 animate-in fade-in">
      
      {/* BOTÓN VOLVER AL DASHBOARD */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Volver al Panel Principal
        </Link>
      </div>

      {/* ENCABEZADO */}
      <div className="max-w-7xl mx-auto px-6 mt-4 mb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-3xl border border-blue-200 shadow-lg shadow-blue-500/10">
                <ShieldExclamationIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Panel de <span className="text-blue-600">Operaciones</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    {role === 'SUPERUSER' 
                        ? 'Supervisión de alto nivel.' 
                        : 'Gestión operativa diaria.'}
                </p>
            </div>
        </div>
      </div>

      {/* BOTONES DE NAVEGACIÓN (Rutas Actualizadas) */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. PAGOS Y REPORTES */}
            <Link href="/dashboard/reports/movimiento" className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl">
                        <BanknotesIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors">Aprobar Pagos</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Revisar reportes de Zelle y Binance.</p>
            </Link>

            {/* 2. INVENTARIO */}
            <Link href="/dashboard/products" className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-orange-50 p-3 rounded-2xl">
                         <CubeIcon className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-orange-700 transition-colors">Inventario</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Ver licencias y stock disponible.</p>
            </Link>

            {/* 3. USUARIOS (Ruta corregida: /users en vez de /users/list) */}
            <Link href="/dashboard/users" className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                        <UserGroupIcon className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-700 transition-colors">Directorio Usuarios</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Gestionar clientes y distribuidores.</p>
            </Link>

      </div>
    </div>
  );
}





