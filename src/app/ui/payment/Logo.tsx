// src/app/ui/payment/logos.ts

export type Payment = {
  id?: number;
  name?: string;
  type: string;
  bankName?: string;
  // Permitimos otras propiedades para evitar errores de tipo estricto
  [key: string]: any;
};

export const paymentLogo = (method: Payment | null | undefined): string => {
  if (!method || !method.type) {
    return '/logos/_generic.svg'; // Ruta por defecto
  }

  const t = method.type.toUpperCase();

  // Ajusta estas rutas según donde tengas tus imágenes en la carpeta public
  if (t.includes('BINANCE')) return '/assets/logos/binance.png';
  if (t.includes('ZELLE')) return '/assets/logos/zelle.png';
  if (t.includes('ZINLI')) return '/assets/logos/zinli.png';
  if (t.includes('WALLY')) return '/assets/logos/wally.png';
  if (t.includes('MOBILE') || t.includes('PAGO_MOVIL')) return '/assets/logos/pago-movil.png';
  if (t.includes('BANK') || t.includes('TRANSFER')) return '/assets/logos/bank.png';

  // Logo genérico si no coincide con ninguno
  return '/logos/_generic.svg';
};
