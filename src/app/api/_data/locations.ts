// src/app/api/_data/locations.ts
// Parches locales para cubrir huecos de proveedores externos.
// Puedes ampliar estos arreglos cuando detectes faltantes.

// Estados extra por país (ISO2)
export const PATCH_STATES: Record<string, string[]> = {
  // Venezuela
  VE: [
    // deja vacío si no quieres forzar estados; lo usual es que CountriesNow ya los traiga
    // Ejemplo de cómo agregar si faltara alguno:
    // 'Distrito Capital','Lara','Portuguesa'
  ],
  // Colombia, México, etc. solo si detectas faltantes
  // CO: ['Antioquia', 'Cundinamarca'],
  // MX: ['Ciudad de México'],
};

// Municipios/ciudades extra por país y estado (clave = nombre del estado)
export const PATCH_CITIES: Record<string, Record<string, string[]>> = {
  VE: {
    // Ejemplo: Portuguesa (varios municipios)
    Portuguesa: [
      'Acarigua','Araure','Guanare','Villa Bruzual','Ospino','Papelón','Biscucuy',
      'Guanarito','Agua Blanca','San Rafael de Onoto','Santa Rosalía','Turén','Sucre','Esteller'
    ],
    Lara: [
      'Barquisimeto','Cabudare','Carora','El Tocuyo','Quíbor','Duaca','Sarare','Siquisique'
    ],
    'Distrito Capital': ['Caracas'],
  },
  CO: {
    Antioquia: ['Medellín','Bello','Envigado','Itagüí','Rionegro','Apartadó','Turbo'],
  },
  // Agrega más países/estados según necesites
};
