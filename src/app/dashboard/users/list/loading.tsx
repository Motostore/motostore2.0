// src/app/dashboard/loading.tsx (Estilo Premium - Corazón de Marca)
export default function Loading() {
  return (
    <div className="flex w-full h-full min-h-[400px] items-center justify-center p-8 bg-slate-50">
      
      {/* Contenedor del Spinner */}
      <div className="flex flex-col items-center">
        
        {/* Spinner del Corazón (Lateheart) - Más moderno y visual */}
        <div className="relative w-12 h-12">
          <div 
            className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#E33127] animate-spin"
            aria-label="Cargando contenido..."
          />
          {/* Un punto en el centro como corazón de la marca */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-[#E33127] rounded-full shadow-md animate-pulse duration-1000" />
        </div>

        {/* Mensaje de Carga */}
        <p className="mt-6 text-sm font-semibold text-slate-500 animate-in fade-in duration-1000">
          Cargando datos...
        </p>
      </div>
    </div>
  );
}