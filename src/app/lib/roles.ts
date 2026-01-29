// src/app/lib/roles.ts

/**
 * ============================================================
 * CONFIGURACIÓN MAESTRA DE ROLES - MOTO STORE LLC
 * ============================================================
 * Jerarquía completa y lógica de permisos recursivos.
 */

export const ROLE_DEF = {
  SUPERUSER: {
    label: "Superuser (Control Total)",
    home: "/dashboard/super",
    manages: ["ADMIN", "DISTRIBUTOR", "RESELLER", "TAQUILLA", "CLIENT"],
  },
  ADMIN: {
    label: "Administrador",
    home: "/dashboard/admin",
    // Admin gestiona todo lo operativo excepto crear Admin/Superuser
    manages: ["DISTRIBUTOR", "RESELLER", "TAQUILLA", "CLIENT"],
  },
  DISTRIBUTOR: {
    label: "Distribuidor",
    home: "/dashboard/distributor",
    // Puede crear Distribuidores debajo de él, Taquillas y Clientes
    manages: ["DISTRIBUTOR", "TAQUILLA", "CLIENT"],
  },
  RESELLER: {
    label: "Reseller / Revendedor",
    home: "/dashboard/reseller",
    manages: ["TAQUILLA", "CLIENT"],
  },
  TAQUILLA: {
    label: "Taquilla",
    home: "/dashboard/ticket",
    manages: ["CLIENT"],
  },
  CLIENT: {
    label: "Cliente",
    home: "/dashboard/client-info",
    manages: [],
  },
  // Rol de fallback para errores o usuarios sin asignar
  GUEST: {
    label: "Invitado",
    home: "/",
    manages: [],
  }
} as const;

/** * Configuración para el auto-registro (Signup público)
 * "Cliente cuando se registra en la página pasa directo a administrador"
 */
export const SELF_SIGNUP = {
  defaultRole: "CLIENT" as const,
  ownerRole: "ADMIN" as const, // A quién se le asigna el nuevo cliente
  redirectHome: "/dashboard/admin",
};

/* ============================================================
 * UTILIDADES DE TIPADO Y LÓGICA (No tocar)
 * ============================================================
 */

export type Role = keyof typeof ROLE_DEF;
export const ROLES = Object.keys(ROLE_DEF) as Role[];

export const ALLOWED_WALLET_ROLES: Role[] = ["SUPERUSER", "ADMIN", "DISTRIBUTOR"];

// Si llega un rol desconocido, usamos este:
export const DEFAULT_ROLE: Role = "GUEST"; 

const ROLE_ALIASES: Record<string, Role> = {
  SUPERUSER: "SUPERUSER", SUPER: "SUPERUSER", ROOT: "SUPERUSER",
  ADMIN: "ADMIN", ADMINISTRATOR: "ADMIN",
  DISTRIBUTOR: "DISTRIBUTOR", DISTRIBUIDOR: "DISTRIBUTOR",
  RESELLER: "RESELLER", REVENDEDOR: "RESELLER",
  TAQUILLA: "TAQUILLA", TICKET: "TAQUILLA",
  CLIENT: "CLIENT", CLIENTE: "CLIENT", USER: "CLIENT", USUARIO: "CLIENT",
  GUEST: "GUEST", INVITADO: "GUEST"
};

/** Normaliza cualquier entrada a un Role válido */
export function normalizeRole(input: unknown): Role {
  const raw = String(input ?? "").trim().toUpperCase();
  const v = raw.startsWith("ROLE_") ? raw.slice(5) : raw;
  
  // 1. Verificación directa
  if (v in ROLE_DEF) return v as Role;
  // 2. Verificación por alias
  if (ROLE_ALIASES[v]) return ROLE_ALIASES[v];
  
  return DEFAULT_ROLE;
}

/** Label amigable para UI */
export const roleLabel: Record<Role, string> = ROLES.reduce((acc, r) => {
  acc[r] = ROLE_DEF[r].label;
  return acc;
}, {} as Record<Role, string>);

/** Rutas de inicio por rol */
export const HOME_BY_ROLE: Record<Role, string> = ROLES.reduce((acc, r) => {
  acc[r] = ROLE_DEF[r].home;
  return acc;
}, {} as Record<Role, string>);

export function homeByRole(r: unknown): string {
  return HOME_BY_ROLE[normalizeRole(r)];
}

/** * Árbol de permisos directo.
 * TypeScript Fix: Aseguramos que 'manages' sea tratado como array de strings
 */
const ROLE_TREE: Record<Role, Role[]> = ROLES.reduce((acc, r) => {
  const definition = ROLE_DEF[r] as { manages: readonly string[] };
  const managesList = definition.manages || [];
  
  // Filtramos solo los que son Roles válidos
  const validChildren = managesList.filter((x): x is Role => ROLES.includes(x as Role));
  
  acc[r] = validChildren;
  return acc;
}, {} as Record<Role, Role[]>);

/** Prioridad numérica (Más alto = más poder) */
export const rolePriority: Record<Role, number> = ROLES.reduce((acc, r, i) => {
  // Asignamos prioridad basada en el orden del objeto ROLE_DEF (de arriba a abajo)
  // Superuser tendrá la prioridad más alta
  const index = ROLES.indexOf(r); 
  acc[r] = (ROLES.length - index) * 10;
  return acc;
}, {} as Record<Role, number>);

/** * LÓGICA RECURSIVA: ¿Puede 'actor' gestionar a 'target'?
 * Revisa no solo los hijos directos, sino los nietos, bisnietos, etc.
 */
export function canManageRole(actor: unknown, target: unknown): boolean {
  const a = normalizeRole(actor);
  const t = normalizeRole(target);
  
  if (a === t) return true; // Se gestiona a sí mismo
  if (a === 'SUPERUSER') return true; // Dios gestiona todo

  const seen = new Set<Role>();
  const stack = [...(ROLE_TREE[a] || [])];

  while (stack.length) {
    const r = stack.pop()!;
    if (seen.has(r)) continue;
    if (r === t) return true; // ¡Encontrado!
    
    seen.add(r);
    // Agregamos los hijos de este rol al stack para seguir buscando
    (ROLE_TREE[r] || []).forEach((child) => {
      if (!seen.has(child)) stack.push(child);
    });
  }
  return false;
}

/** ¿Tiene 'actor' mayor o igual rango que 'min'? */
export function atLeastRole(actor: unknown, min: Role): boolean {
  const a = normalizeRole(actor);
  return rolePriority[a] >= rolePriority[min];
}

/** * Para el UI: ¿Qué roles puede CREAR este usuario en un dropdown?
 * Devuelve la lista ordenada por prioridad.
 */
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
  
  // Devolvemos array ordenado por importancia
  return [...out].sort((r1, r2) => rolePriority[r2] - rolePriority[r1]);
}

/** Helpers rápidos */
export function isElevated(r: unknown): boolean {
  const v = normalizeRole(r);
  return v === "SUPERUSER" || v === "ADMIN";
}

export function isAdmin(r: unknown): boolean {
    return isElevated(r);
}








