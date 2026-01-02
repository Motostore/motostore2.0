// utils/tailwind.styles.ts (O donde esté tu archivo)

// Color de marca de Moto Store: Rojo (#E33127)

export const input_tailwind = 
  'bg-white border border-slate-300 text-slate-800 text-sm rounded-xl ' + 
  'focus:ring-red-600/30 focus:border-[#E33127] block w-full p-3 ' + // Aplicamos el color de marca al focus
  'placeholder-slate-400 outline-none transition-all duration-300 ' +
  'shadow-sm hover:shadow-md'; // Añadimos una sombra sutil al pasar el ratón o enfocar

export const error_message = 
  'text-red-600 font-medium text-xs mt-1'; // Mensaje de error más específico y pequeño

export const label_input = 
  'text-sm font-bold text-slate-700 uppercase tracking-wider mb-1'; // Etiqueta más audaz y formal

export const hr_line = 
  'w-full h-px bg-slate-200 border-none mx-auto my-8'; // Línea divisoria más delgada y elegante (h-px)

// Opcional: Estilo de botón de acción (similar al que usamos en el formulario)
export const button_primary = 
  'flex justify-center items-center rounded-xl bg-[#E33127] text-white font-bold px-6 py-3 ' + 
  'shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all duration-200';