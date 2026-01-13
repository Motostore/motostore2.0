import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  BanknotesIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 1. Si no hay sesión, al Login
  if (!session || !session.user) {
      redirect("/api/auth/signin?callbackUrl=/dashboard/admin");
  }

  // 2. OBTENER ROL
  const userRole = (session as any).user.role; // Puede ser CLIENT, ADMIN o SUPERUSER

  // 3. SEGURIDAD DE JERARQUÍA
  // Permitimos el acceso si es ADMIN ... O SI ES SUPERUSER (Jerarquía Superior)
  if (userRole !== "ADMIN" && userRole !== "SUPERUSER") {
      redirect("/dashboard?error=AccessDenied");
  }

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ENCABEZADO */}
      <div className="max-w-7xl mx-auto px-6 mt-6 mb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-3xl border border-blue-200 shadow-lg">
                <ShieldExclamationIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Panel de <span className="text-blue-600">Operaciones</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    {/* Mensaje personalizado según rol */}
                    {userRole === 'SUPERUSER' 
                        ? 'Acceso de supervisión global (Modo Dios activado).' 
                        : 'Selecciona qué quieres gestionar hoy:'}
                </p>
            </div>
        </div>
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. IR A PAGOS */}
            <Link href="/dashboard/payments/approvals" className="bg-white p-6 rounded-3xl border hover:border-blue-500 shadow-md hover:shadow-xl transition-all group">
                <BanknotesIcon className="w-10 h-10 text-emerald-600 mb-4 bg-emerald-50 p-2 rounded-xl" />
                <h3 className="font-bold text-xl text-slate-900">Gestionar Pagos</h3>
                <p className="text-slate-500 text-sm mt-2">Aprobar depósitos y recargas.</p>
            </Link>

            {/* 2. IR A INVENTARIO */}
            <Link href="/dashboard/products" className="bg-white p-6 rounded-3xl border hover:border-blue-500 shadow-md hover:shadow-xl transition-all group">
                <CubeIcon className="w-10 h-10 text-orange-600 mb-4 bg-orange-50 p-2 rounded-xl" />
                <h3 className="font-bold text-xl text-slate-900">Inventario</h3>
                <p className="text-slate-500 text-sm mt-2">Ver productos y stock.</p>
            </Link>

            {/* 3. IR A USUARIOS */}
            <Link href="/dashboard/users/list" className="bg-white p-6 rounded-3xl border hover:border-blue-500 shadow-md hover:shadow-xl transition-all group">
                <UserGroupIcon className="w-10 h-10 text-blue-600 mb-4 bg-blue-50 p-2 rounded-xl" />
                <h3 className="font-bold text-xl text-slate-900">Lista de Usuarios</h3>
                <p className="text-slate-500 text-sm mt-2">Ver clientes y distribuidores.</p>
            </Link>

      </div>
    </div>
  );
}





