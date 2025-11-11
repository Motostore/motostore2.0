// src/app/utils/getSubdivisionLabel.ts

/**
 * Devuelve la etiqueta para la segunda división administrativa
 * según el país seleccionado.
 *
 * - "Departamento": CO, BO, PY, UY, PE
 * - "Condado": GB (Reino Unido), IE (Irlanda)
 * - En el resto: "Estado"
 *
 * Acepta código ISO2 (p.ej. "CO") o nombre del país ("Colombia").
 */

export type SubdivisionLabel = "Departamento" | "Estado" | "Condado";

/** Quita tildes y normaliza para comparar nombres. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toUpperCase()
    .trim();
}

// Países que usan "Departamento"
const DEPARTAMENTO_SET = new Set<string>([
  "CO", "COLOMBIA",
  "BO", "BOLIVIA",
  "PY", "PARAGUAY",
  "UY", "URUGUAY",
  "PE", "PERU", "PERÚ",
]);

// Países que usan "Condado"
const CONDADO_SET = new Set<string>([
  "GB", "UK", "UNITED KINGDOM", "REINO UNIDO",
  "IE", "IRELAND", "IRLANDA",
]);

/**
 * Obtiene la etiqueta de subdivisión según país (ISO2 o nombre).
 */
export function getSubdivisionLabel(country: string | null | undefined): SubdivisionLabel {
  if (!country) return "Estado";

  const norm = normalize(country);

  if (DEPARTAMENTO_SET.has(norm)) return "Departamento";
  if (CONDADO_SET.has(norm)) return "Condado";

  // Por defecto en el resto del mundo
  return "Estado";
}

