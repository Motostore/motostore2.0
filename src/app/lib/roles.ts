// src/app/lib/roles.ts (CÓDIGO FINAL CORREGIDO)

/**
 * ============================================================
 * ROLES EXACTOS SEGÚN TU ESPECIFICACIÓN
 * ------------------------------------------------------------
 * - Superuser: control total
 * - Admin: control (debajo de Superuser)
 * - Distribuidor: puede crear Distribuidor, Taquilla, Cliente (en su rama)
 * - Reseller:    solo puede crear Taquilla, Cliente (en su rama)
 * - Taquilla:    puede crear Cliente
 * - Cliente:     sin permisos de gestión
 *
 * Adicional: "Cliente cuando se registra en la página pasa directo a administrador"
 * → Configurable abajo en SELF_SIGNUP (dueño y redirect post-registro).
 * ============================================================
 */

/** Define aquí cada rol canónico, su etiqueta y a quién puede gestionar/crear */
export const ROLE_DEF = {
  SUPERUSER: {
    label: "Superuser → control total",
    home: "/dashboard/super",
    manages: ["ADMIN", "DISTRIBUTOR", "RESELLER", "TAQUILLA", "CLIENT"],
  },
  ADMIN: {
    label: "Admin → control (debajo de Superuser)",
    home: "/dashboard/admin",
    // Admin gestiona todo lo operativo excepto crear Admin/Superuser
    manages: ["DISTRIBUTOR", "RESELLER", "TAQUILLA", "CLIENT"],
  },
  DISTRIBUTOR: {
    label: "Distribuidor (puede crear Distribuidor, Taquilla y Cliente en su rol)",
    home: "/dashboard/distributor",
    manages: ["DISTRIBUTOR", "TAQUILLA", "CLIENT"],
  },
  RESELLER: {
    label: "Reseller (solo puede crear Taquilla y Cliente en su rol)",
    home: "/dashboard/reseller",
    manages: ["TAQUILLA", "CLIENT"],
  },
  TAQUILLA: {
    label: "Taquilla (puede crear Cliente)",
    home: "/dashboard/ticket",
    manages: ["CLIENT"],
  },
  CLIENT: {
    label: "Cliente",
    home: "/dashboard/client-info",
    manages: [],
  },
} as const;

/** Comportamiento en auto-registro (signup público) del Cliente */
export const SELF_SIGNUP = {
  /** Rol asignado al usuario que se auto-registra */
  defaultRole: "CLIENT" as const,
  /**
   * Rol “dueño/admin” al que se le asigna/deriva el nuevo cliente,
   * por tu requerimiento: “pasa directo a administrador”.
   * Úsalo para ownership/assignments y/o notificaciones.
   */
  ownerRole: "ADMIN" as const,
  /** Redirección post-registro (opcional) */
  redirectHome: "/dashboard/admin",
};

/* ============================================================
 * A PARTIR DE AQUÍ: UTILIDADES (no necesitas tocarlas)
 * ============================================================
 */

export type Role = keyof typeof ROLE_DEF;
export const ROLES = Object.keys(ROLE_DEF) as Role[];

/** Roles que tienen acceso a funciones de billetera o gestión de saldo */
export const ALLOWED_WALLET_ROLES: Role[] = [
  "SUPERUSER", 
  "ADMIN", 
  "DISTRIBUTOR"
];

/** Si llega un rol desconocido, caemos a CLIENT (si existe) */
export const DEFAULT_ROLE: Role = ("CLIENT" in ROLE_DEF ? "CLIENT" : ROLES[0]) as Role;

/** Alias / legados → canónico (ajusta si necesitas más) */
const ROLE_ALIASES: Record<string, Role> = {
  SUPERUSER: "SUPERUSER",
  ROLE_SUPERUSER: "SUPERUSER",

  ADMIN: "ADMIN",
  ROLE_ADMIN: "ADMIN",

  DISTRIBUTOR: "DISTRIBUTOR",
  DISTRIBUIDOR: "DISTRIBUTOR",
  ROLE_DISTRIBUTOR: "DISTRIBUTOR",

  RESELLER: "RESELLER",
  ROLE_RESELLER: "RESELLER",

  TAQUILLA: "TAQUILLA",
  ROLE_TAQUILLA: "TAQUILLA",

  CLIENT: "CLIENT",
  CLIENTE: "CLIENT",
  ROLE_CLIENT: "CLIENT",
};

/** Normaliza cualquier entrada a un Role válido */
export function normalizeRole(input: unknown): Role {
  const raw = String(input ?? "").trim().toUpperCase();
  const v = raw.startsWith("ROLE_") ? raw.slice(5) : raw;
  if (v in ROLE_DEF) return v as Role;
  if (ROLE_ALIASES[raw]) return ROLE_ALIASES[raw];
  if (ROLE_ALIASES[v]) return ROLE_ALIASES[v];
  return DEFAULT_ROLE;
}

/** Label amigable para UI */
export const roleLabel: Record<Role, string> = ROLES.reduce((acc, r) => {
  acc[r] = ROLE_DEF[r].label || r;
  return acc;
}, {} as Record<Role, string>);

/** Rutas de inicio por rol */
export const HOME_BY_ROLE: Record<Role, string> = ROLES.reduce((acc, r) => {
  acc[r] = ROLE_DEF[r].home || "/";
  return acc;
}, {} as Record<Role, string>);

export function homeByRole(r: unknown): string {
  return HOME_BY_ROLE[normalizeRole(r)];
}

/** Árbol directo desde "manages" */
const ROLE_TREE: Record<Role, Role[]> = ROLES.reduce((acc, r) => {
  // CORRECCIÓN AQUÍ: Casteamos a 'readonly string[]' para evitar error de predicado estricto
  const mg = ((ROLE_DEF[r].manages || []) as readonly string[]).filter((x): x is Role => ROLES.includes(x as Role));
  acc[r] = mg;
  return acc;
}, {} as Record<Role, Role[]>);

/** Prioridad (más arriba, más permisos). Ajusta orden en ROLES si quieres cambiar jerarquía. */
export const rolePriority: Record<Role, number> = ROLES.reduce((acc, r, i) => {
  acc[r] = (ROLES.length - i) * 10;
  return acc;
}, {} as Record<Role, number>);

/** ¿actor puede gestionar al target?
 * - true si target === actor
 * - true si target está en la clausura transitiva de "manages" del actor
 */
export function canManageRole(actor: unknown, target: unknown): boolean {
  const a = normalizeRole(actor);
  const t = normalizeRole(target);
  if (a === t) return true;

  const seen = new Set<Role>();
  const stack = [...(ROLE_TREE[a] || [])];

  while (stack.length) {
    const r = stack.pop()!;
    if (seen.has(r)) continue;
    if (r === t) return true;
    seen.add(r);
    (ROLE_TREE[r] || []).forEach((child) => {
      if (!seen.has(child)) stack.push(child);
    });
  }
  return false;
}

/** ¿actor tiene al menos el mismo nivel que "min"? */
export function atLeastRole(actor: unknown, min: Role): boolean {
  const a = normalizeRole(actor);
  return rolePriority[a] >= rolePriority[min];
}

/** ¿input ∈ allowed? (con normalización) */
export function isOneOf(input: unknown, allowed: Role[]): boolean {
  return allowed.includes(normalizeRole(input));
}

/** Para el UI: qué roles puede crear el actor (ordenados por prioridad desc) */
export function creatableRolesFor(actor: unknown, { includeSelf = false } = {}): Role[] {
  const a = normalizeRole(actor);
  const out = new Set<Role>();
  const stack = [...(ROLE_TREE[a] || [])];

  while (stack.length) {
    const r = stack.pop()!;
    if (out.has(r)) continue;
    out.add(r);
    (ROLE_TREE[r] || []).forEach((child) => {
      if (!out.has(child)) stack.push(child);
    });
  }

  if (!includeSelf) out.delete(a);
  return [...out].sort((r1, r2) => rolePriority[r2] - rolePriority[r1]);
}

/** Helper rápido para checks elevados (Superuser/Admin) */
export function isElevated(r: unknown): boolean {
  const v = normalizeRole(r);
  return v === "SUPERUSER" || v === "ADMIN";
}









