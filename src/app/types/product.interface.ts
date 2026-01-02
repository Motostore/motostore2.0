// ARCHIVO DE INTERFAZ DE PRODUCTOS (CÓDIGO CORREGIDO)

export interface Product {
  id: string;
  name: string;
  
  // ✅ CORRECCIÓN 1: La imagen no es obligatoria para todos los productos
  image?: string; 
  
  price: number;
  status: boolean;
  
  // ✅ CORRECCIÓN 2: Estos campos solo aplican a ciertos tipos (ej: Streaming/Licencias), 
  // por lo tanto, deben ser opcionales para evitar errores en Recargas/Marketing.
  duration?: number;
  accounts?: number;
  profiles?: number;
  
  // Añadir la descripción que usan muchos productos
  description?: string;
  
  // Si tienes campos específicos de Licencias o Streaming, también deben ser opcionales:
  // provider?: string; 
  // busy?: boolean; 
  // ...otros campos... 
}