// src/app/utils/getAdminLabels.ts (CÓDIGO FINAL Y CORREGIDO - SINTAXIS ESTABLE DEFINITIVA)

/**
 * Devuelve etiquetas para:
 * - level1: nombre de la 1ª subdivisión (Estado / Provincia / Departamento / Condado / Región / Prefectura...)
 * - level2: nombre de la 2ª subdivisión (Municipio / Ciudad / Comuna / Cantón / Distrito / Condado...)
 *
 * Entrada recomendada: código ISO2 del país (CO, MX, VE, US, ES, BR, AR, CL, PE, ...).
 * Si envías nombre de país, también intentará resolverlo.
 */

export type AdminLabels = { level1: string; level2: string };

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

// Mapeo por ISO2 (mayúsculas) → [level1, level2]
const MAP: Record<string, [string, string]> = {
  // América Latina
  AR: ["Provincia", "Municipio"],
  BO: ["Departamento", "Municipio"],
  BR: ["Estado", "Municipio"],
  CL: ["Región", "Comuna"],
  CO: ["Departamento", "Municipio"],
  CR: ["Provincia", "Cantón"],
  CU: ["Provincia", "Municipio"],
  DO: ["Provincia", "Municipio"],
  EC: ["Provincia", "Cantón"],
  SV: ["Departamento", "Municipio"],
  GT: ["Departamento", "Municipio"],
  HN: ["Departamento", "Municipio"],
  MX: ["Estado", "Municipio"],
  NI: ["Departamento", "Municipio"],
  PA: ["Provincia", "Distrito"],
  PY: ["Departamento", "Distrito"],
  PE: ["Departamento", "Provincia"], // (tercer nivel real: Distrito)
  UY: ["Departamento", "Municipio"],
  VE: ["Estado", "Municipio"],

  // Norteamérica
  US: ["Estado", "Condado/Ciudad"],
  CA: ["Provincia/Territorio", "Ciudad"],

  // Europa
  ES: ["Provincia", "Municipio"], // (nivel superior real: C. Autónoma)
  PT: ["Distrito", "Municipio"],
  FR: ["Departamento", "Comuna"], // (nivel superior real: Región)
  DE: ["Estado federado", "Ciudad/Distrito"],
  IT: ["Región", "Provincia/Comune"],
  GB: ["Condado", "Ciudad/Distrito"],
  IE: ["Condado", "Ciudad"],
  NL: ["Provincia", "Municipio"],
  BE: ["Provincia", "Municipio"],
  PL: ["Voivodato", "Condado/Municipio"],
  SE: ["Condado", "Municipio"],
  NO: ["Condado", "Municipio"],
  DK: ["Región", "Municipio"],
  FI: ["Región", "Municipio"],
  CH: ["Cantón", "Comuna"],
  AT: ["Estado federado", "Distrito/Municipio"],
  CZ: ["Región", "Distrito/Municipio"],
  GR: ["Periferia", "Municipio"],
  RO: ["Condado", "Municipio"],

  // África (generalizado)
  ZA: ["Provincia", "Municipio"],
  MA: ["Región", "Provincia/Prefectura"],
  EG: ["Gobernación", "Ciudad/Distrito"],
  NG: ["Estado", "Área LG (Municipio)"],

  // Asia / Oceanía (generalizado)
  CN: ["Provincia", "Ciudad"],
  JP: ["Prefectura", "Ciudad"],
  KR: ["Provincia", "Ciudad/Condado"],
  IN: ["Estado/UT", "Distrito"],
  ID: ["Provincia", "Regencia/Ciudad"],
  PH: ["Provincia", "Ciudad/Municipio"],
  TH: ["Provincia", "Distrito"],
  VN: ["Provincia", "Ciudad/Distrito"],
  AU: ["Estado/Territorio", "Ciudad"],
  NZ: ["Región", "Distrito/Ciudad"],
};

// Fallback por nombre (para cuando recibas nombre en vez de ISO2)
const NAME_TO_ISO2: Record<string, string> = {
  ARGENTINA: "AR",
  BOLIVIA: "BO",
  BRASIL: "BR",
  CHILE: "CL",
  COLOMBIA: "CO",
  "COSTA RICA": "CR",
  CUBA: "CU",
  "REPÚBLICA DOMINICANA": "DO",
  ECUADOR: "EC",
  "EL SALVADOR": "SV",
  GUATEMALA: "GT",
  HONDURAS: "HN",
  MEXICO: "MX",
  MÉXICO: "MX",
  NICARAGUA: "NI",
  PANAMA: "PA",
  PANAMÁ: "PA",
  PARAGUAY: "PY",
  PERU: "PE",
  PERÚ: "PE",
  URUGUAY: "UY",
  VENEZUELA: "VE",
  "ESTADOS UNIDOS": "US",
  "REINO UNIDO": "GB",
  ESPAÑA: "ES",
  PORTUGAL: "PT",
  FRANCIA: "FR",
  ALEMANIA: "DE",
  ITALIA: "IT",
  // Esta entrada de Holanda/Países Bajos es donde reside el conflicto:
  "PAÍSES BAJOS": "NL",  // Asegúrate de que esté entre comillas.
  HOLANDA: "NL",
  BÉLGICA: "BE",
  BELGICA: "BE",
  POLONIA: "PL",
  SUECIA: "SE",
  NORUEGA: "NO",
  DINAMARCA: "DK",
  FINLANDIA: "FI",
  SUIZA: "CH",
  AUSTRIA: "AT",
  "REPÚBLICA CHECA": "CZ",
  GRECIA: "GR",
  RUMANIA: "RO",
  MARRUECOS: "MA",
  EGIPTO: "EG",
  NIGERIA: "NG",
  CHINA: "CN",
  JAPÓN: "JP",
  JAPON: "JP",
  COREA: "KR",
  INDIA: "IN",
  INDONESIA: "ID",
  FILIPINAS: "PH",
  TAILANDIA: "TH",
  VIETNAM: "VN",
  AUSTRALIA: "AU",
  "NUEVA ZELANDA": "NZ",
};

export function getAdminLabels(countryCodeOrName?: string | null): AdminLabels {
  const DEFAULT: AdminLabels = { level1: "Estado", level2: "Ciudad" };
  if (!countryCodeOrName) return DEFAULT;

  const raw = normalize(countryCodeOrName);
  // Si llega ISO2
  if (raw.length === 2 && MAP[raw]) {
    const [l1, l2] = MAP[raw];
    return { level1: l1, level2: l2 };
  }

  // Si llega nombre
  const iso = NAME_TO_ISO2[raw] || "";
  if (iso && MAP[iso]) {
    const [l1, l2] = MAP[iso];
    return { level1: l1, level2: l2 };
  }

  return DEFAULT;
}

