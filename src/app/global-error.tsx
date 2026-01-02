// src/app/global-error.tsx (EDICIÓN FINAL: ULTRA PREMIUM ERROR PAGE)

'use client';

// Asegúrate de importar la fuente si quieres que se vea igual (opcional aquí)
// import { Inter } from "next/font/google"; 
// const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-slate-900 antialiased h-screen w-screen overflow-hidden font-sans">
        
        {/* 1. CONTENEDOR CENTRADO */}
        <main className="relative flex h-full w-full flex-col items-center justify-center p-4">
          
          {/* 2. DECORACIÓN DE FONDO (Destello Rojo Marca) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>

          {/* 3. TARJETA DE ERROR (Estilo Cristal) */}
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl shadow-slate-200/50 p-8 sm:p-10 text-center animate-in fade-in zoom-in duration-500">
            
            {/* ICONO DE ALERTA ANIMADO */}
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-[#E33127]">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-10 h-10 animate-bounce"
                >
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* TÍTULO IMPACTANTE */}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              Nuestro sistema ha detectado un problema inesperado. No te preocupes, ya estamos notificados.
            </p>

            {/* DETALLES TÉCNICOS (Discretos) */}
            <div className="bg-slate-50 rounded-xl p-3 mb-8 border border-slate-100 text-left overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Detalle del Error:
                </p>
                <code className="block text-xs text-red-500 font-mono break-all">
                    {error.message || 'Error desconocido'}
                </code>
                {error.digest && (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Digest: {error.digest}
                    </p>
                )}
            </div>

            {/* BOTÓN DE REINICIO (Gradiente Rojo) */}
            <button
              onClick={() => reset()}
              className="
                w-full rounded-xl py-3.5
                bg-gradient-to-r from-[#E33127] to-[#C52B22] 
                hover:from-[#C52B22] hover:to-[#A9221A] 
                text-white text-sm font-black tracking-widest uppercase
                shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-300
              "
            >
              Intentar de nuevo
            </button>

          </div>

          {/* FOOTER PEQUEÑO */}
          <p className="absolute bottom-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Moto Store LLC System
          </p>

        </main>
      </body>
    </html>
  );
}
