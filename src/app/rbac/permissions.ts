// src/app/rbac/permissions.ts
import { normalizeRole, type Role } from "../lib/roles";

export type Action =
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:read:any"
  | "roles:assign"
  | "products:read"
  | "products:write"
  | "services:read"
  | "services:write"
  | "payments:methods:write"
  | "payments:verify"
  // 🔥 NUEVO PERMISO AGREGADO PARA QUE NO FALLE EL BUILD
  | "payments:approve"
  | "transactions:read:self"
  | "transactions:read:any"
  | "wallet:topup:self"
  | "wallet:topup:any";

export const ROLE_PERMISSIONS: Record<Role, readonly Action[] | readonly ["*"]> = {
  // 🔒 SUPERUSER todo
  SUPERUSER: ["*"],

  // 🔒 ADMIN SIN escritura en productos ni métodos de pago
  ADMIN: [
    "users:create","users:update","users:delete","users:read:any",
    "roles:assign",
    "products:read",
    "services:read","services:write",
    "payments:verify",
    "payments:approve", // ← Permiso agregado al Admin
    "transactions:read:any",
    "wallet:topup:any",
  ],

  // Roles operativos (Definidos en roles.ts)
  RESELLER:      ["products:read","services:read","transactions:read:self","wallet:topup:self"],
  DISTRIBUTOR:   ["products:read","services:read","transactions:read:self","wallet:topup:self"],
  TAQUILLA:      ["products:read","services:read","transactions:read:self","wallet:topup:self"],
  CLIENT:        ["products:read","services:read","transactions:read:self","wallet:topup:self"],
};

export function can(roleLike: unknown, action: Action): boolean {
  const role = normalizeRole(roleLike);
  const perms = ROLE_PERMISSIONS[role];
  return (perms as any[]).includes("*") || (perms as Action[]).includes(action);
}
