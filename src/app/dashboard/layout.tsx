import TopNav from "../ui/dashboard/topnav"; 
import BrandHeader from "../ui/dashboard/brand-header";
import DashboardMarquee from "../ui/dashboard/dashboard-marquee"; // (Antes NoticeChips)
import IAMotoMotoAssistant from "../ui/dashboard/IAMotoMotoAssistant"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* --- CABECERA FIJA (Sticky) --- */}
      {/* Usamos flex-col para apilar: Blanco -> Marquee -> Rojo */}
      <header className="sticky top-0 z-50 w-full shadow-lg shadow-slate-200/50 bg-white transition-all flex flex-col">
        
        {/* 1. BRAND HEADER (Logo y Saldo) */}
        {/* 🔥 FIX: Quitamos los DIVs envolventes. BrandHeader ya maneja su propio ancho y fondo. */}
        <div className="relative z-30"> 
          <BrandHeader />
        </div>

        {/* 2. BARRA INFORMATIVA (Marquee) */}
        {/* 🔥 FIX: DashboardMarquee (NoticeChips) también maneja su propio ancho */}
        <div className="relative z-20">
          <DashboardMarquee />
        </div>

        {/* 3. NAVEGACIÓN ROJA */}
        {/* 🔥 FIX: TopNav maneja su propio degradado rojo y ancho */}
        <div className="relative z-10">
          <TopNav />
        </div>
        
      </header>

      {/* --- CONTENIDO DE LA PÁGINA --- */}
      {/* Aquí sí definimos el ancho máximo para el cuerpo de la página */}
      {/* Usamos 'px-4 sm:px-6 lg:px-8' para coincidir EXACTAMENTE con los headers */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>
      
      {/* ASISTENTE FLOTANTE */}
      <IAMotoMotoAssistant /> 

    </div>
  );
}





















