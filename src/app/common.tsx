// src/app/common.ts

/**
 * 1. SALUDO (partsOfTheDay)
 * Retorna el saludo basado en la hora local del negocio (Colombia/USA/Venezuela).
 */
export const partsOfTheDay = (name: string = "") => {
  // Usamos hora de Colombia/USA (GMT-5) como referencia central
  const localTime = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
  const hour = new Date(localTime).getHours();
  
  let greeting = "Buenas Noches"; 

  if (hour >= 5 && hour < 12) {
    greeting = "Buenos Días";
  } else if (hour >= 12 && hour < 19) { 
    greeting = "Buenas Tardes";
  }

  return name ? `${greeting}, ${name}` : greeting; 
};

/**
 * 2. FECHA (currentDate) -> ¡ESTA ES LA QUE TE FALTABA!
 * Retorna la fecha actual formateada. Ejemplo: "Viernes, 30 de enero de 2026"
 */
export const currentDate = () => {
  const dateString = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota' 
  });
  
  // Capitalizamos la primera letra (ej: "viernes" -> "Viernes")
  return dateString.charAt(0).toUpperCase() + dateString.slice(1);
};



































































