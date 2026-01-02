// src/app/utils/getSubdivisionLabel.ts (Versión Alternativa con Mapa Único)

export type SubdivisionLabel = "Departamento" | "Estado" | "Condado";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .toUpperCase()
    .trim();
}

// Mapa de país/código -> Etiqueta de subdivisión
const SUBDIVISION_MAP = new Map<string, SubdivisionLabel>([
  // Departamento
  ["CO", "Departamento"], ["COLOMBIA", "Departamento"],
  ["BO", "Departamento"], ["BOLIVIA", "Departamento"],
  ["PY", "Departamento"], ["PARAGUAY", "Departamento"],
  ["UY", "Departamento"], ["URUGUAY", "Departamento"],
  ["PE", "Departamento"], ["PERU", "Departamento"], ["PERÚ", "Departamento"],
  
  // Condado
  ["GB", "Condado"], ["UK", "Condado"], ["UNITED KINGDOM", "Condado"], ["REINO UNIDO", "Condado"],
  ["IE", "Condado"], ["IRELAND", "Condado"], ["IRLANDA", "Condado"],
]);


export function getSubdivisionLabel(country: string | null | undefined): SubdivisionLabel {
  if (!country) return "Estado";

  const norm = normalize(country);

  // Busca en el mapa. Si lo encuentra, devuelve la etiqueta; si no, devuelve "Estado".
  return SUBDIVISION_MAP.get(norm) ?? "Estado";
}