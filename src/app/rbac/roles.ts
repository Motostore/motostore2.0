export const ROLE_ORDER = [
  'SUPERUSER',
  'ADMIN',
  'DISTRIBUTOR',
  'SUBDISTRIBUTOR',
  'TAQUILLA',
  'CLIENT',
] as const;

export type RoleCode = typeof ROLE_ORDER[number];

export const rankOf = (r?: string) =>
  r ? ROLE_ORDER.indexOf(r.toUpperCase() as RoleCode) : Number.MAX_SAFE_INTEGER;

export const higherThan = (actor?: string, target?: string) =>
  rankOf(actor) < rankOf(target);

export function allowedRolesToCreate(actor?: string): RoleCode[] {
  const my = rankOf(actor);
  return ROLE_ORDER.filter((r) => rankOf(r) > my);
}
