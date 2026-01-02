// src/app/common.ts (EDICIÓN FINAL: CÓDIGO LIMPIO Y EFICIENTE)

/**
 * Retorna el saludo del día basado en la hora local (0-23h).
 * Optimizado: Sin procesamiento de strings innecesario.
 */
export const partsOfTheDay = (name: string = "") => {
  const hour = new Date().getHours();
  
  // Asignamos directamente el string formateado (Title Case) para ahorrar CPU
  let greeting = "Buenas Noches"; // Por defecto cubre de 20:00 a 04:59

  if (hour >= 5 && hour < 12) {
    greeting = "Buenos Días";
  } else if (hour >= 12 && hour < 20) {
    greeting = "Buenas Tardes";
  }

  return name ? `${greeting}, ${name}` : greeting; 
};

/**
 * Retorna la fecha actual con formato completo en español.
 * Ejemplo: "Lunes, 8 de diciembre de 2025"
 */
export const currentDate = () => {
  const dateString = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // JavaScript retorna los días en minúscula ("lunes"), aquí lo capitalizamos.
  return dateString.charAt(0).toUpperCase() + dateString.slice(1);
};



































































