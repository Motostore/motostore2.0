import { BellAlertIcon } from "@heroicons/react/24/outline"; // Icono temático
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import NotificationsTable from "@/app/ui/notifications/table";

export default function NotificationsPage({
    searchParams,
  }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }) {
    // 1. Limpieza de datos
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    return (
    <main className="min-h-screen bg-slate-50 pb-20 animate-in fade-in">
        
        {/* HEADER PREMIUM */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                        <BellAlertIcon className="w-6 h-6 text-[#E33127]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            Notificaciones
                        </h1>
                        <p className="text-slate-500 font-medium text-xs mt-1">
                            Historial de alertas y avisos del sistema.
                        </p>
                    </div>
                </div>

                {/* Perfil a la derecha (Mantenemos tu componente) */}
                <div className="flex items-center gap-3">
                    <HeaderProfile />
                </div>
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 mt-8">
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Aquí pasamos los datos limpios a la tabla */}
                <NotificationsTable query={query} currentPage={currentPage}/>
            </section>
        </div>
    </main>
    );
}