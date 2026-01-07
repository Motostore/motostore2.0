import TopNav from "../ui/dashboard/topnav"; 
import BrandHeader from "../ui/dashboard/brand-header";
import DashboardMarquee from "../ui/dashboard/dashboard-marquee";
import IAMotoMotoAssistant from "../ui/dashboard/IAMotoMotoAssistant"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* --- CABECERA FIJA (Sticky) --- */}
      <header className="sticky top-0 z-[50] w-full shadow-lg shadow-slate-200/50 bg-white transition-all">
        
        {/* 1. ZONA BLANCA: Logo y Fecha */}
        <div className="w-full bg-white border-b border-slate-100 relative z-30">
           <div className="mx-auto w-full max-w-7xl px-4">
             <BrandHeader />
           </div>
        </div>

        {/* 2. BARRA INFORMATIVA */}
        <div className="relative z-20">
          <DashboardMarquee />
        </div>

        {/* 3. NAVEGACIÓN ROJA */}
        <div className="relative z-10">
          <TopNav />
        </div>
        
      </header>

      {/* --- CONTENIDO DE LA PÁGINA --- */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-500">
        {children}
      </main>
      
      {/* ASISTENTE FLOTANTE */}
      <IAMotoMotoAssistant /> 

    </div>
  );
}





















