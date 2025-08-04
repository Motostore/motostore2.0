// common.tsx
export const partsOfTheDay = (name: string = "") => {
  const date = new Date();
  const hour = date.getHours();
  let message = "Buenos dias"; 

  if (hour >= 12 && hour < 19) {
    message = "Buenas tardes"; 
  } else if (hour >= 19) {
    message = "Buenas noches"; 
  }

  const words = message.toLowerCase().split(' ');
  const capitalizedMessage = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return capitalizedMessage + name; 
};

export const currentDate = () => {
  const date = new Date();
  // Obtén las partes individualmente, incluyendo el año
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const day = date.toLocaleDateString('es-ES', { day: 'numeric' });
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const year = date.getFullYear(); // Obtiene el año completo (ej. 2025)

  // Capitaliza la primera letra de cada parte si es necesario
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  // Construye la cadena final con el año
  return `${capitalizedWeekday}, ${day} de ${capitalizedMonth} de ${year}`;
};




































































