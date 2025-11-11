export const ROLE_TEXT: Record<string, string> = {
  SUPERUSER: 'Superusuario',
  ADMIN: 'Administrador',
  DISTRIBUTOR: 'Distribuidor',
  SUBDISTRIBUTOR: 'Subdistribuidor',
  BOX_OFFICE: 'Taquilla',
  CLIENT: 'Cliente',
};

export function getRoleLabel(code?: string) {
  const key = String(code || '').toUpperCase();
  return ROLE_TEXT[key] ?? code ?? '';
}

export const ROLE_ORDER: string[] = [
  'SUPERUSER',
  'ADMIN',
  'DISTRIBUTOR',
  'SUBDISTRIBUTOR',
  'BOX_OFFICE',
  'CLIENT',
];
