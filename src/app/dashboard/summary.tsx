'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type BalanceRes = { balance?: number } & Record<string, any>;
type UtilitiesRes = { utilities?: number } & Record<string, any>;

function money(n: number | undefined | null, currency = 'USD', locale = 'es-ES') {
  if (n === undefined || n === null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
  } catch {
    return `${n}`;
  }
}

/** 👉 Ajusta esta lista según cómo se llaman tus roles en el backend */
const ROLES_CON_ACCESO = [
  'SUPERUSER',
  'ADMIN',
  'DISTRIBUTOR',
  'SUBDISTRIBUTOR',
  'TAQUILLA',
  'SUBTAQUILLA',
  'SUSTAQUILLA',
];

export default function SummaryWidget() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [utilities, setUtilities] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = (session as any)?.user?.accessToken || (session as any)?.user?.token || null;
  const role = (session as any)?.user?.role || 'CLIENT';
  const puedeVer = useMemo(() => ROLES_CON_ACCESO.includes(role), [role]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (status === 'loading') return; // esperando sesión
      setLoading(true);
      setError(null);

      // Si no tiene permiso, no llamamos al backend
      if (!puedeVer) {
        setLoading(false);
        return;
      }
      // Si no hay token, mostramos aviso
      if (!token) {
        setError('No hay token de sesión. Vuelve a iniciar sesión.');
        setLoading(false);
        return;
      }

      try {
        const headers: HeadersInit = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'X-User-Role': String(role), // opcional: por si tu backend lo usa
        };

        const [bRes, uRes] = await Promise.all([
          fetch('/api/wallet/balance', { cache: 'no-store', headers }),
          fetch('/api/reports/utilities', { cache: 'no-store', headers }),
        ]);

        // 401/403 => sin permiso/token expirado
        if (!bRes.ok || !uRes.ok) {
          const code = !bRes.ok ? bRes.status : uRes.status;
          if (code === 401 || code === 403) {
            throw new Error('No autorizado para ver saldo/utilidades.');
          }
        }

        const bJson: BalanceRes = await bRes.json().catch(() => ({}));
        const uJson: UtilitiesRes = await uRes.json().catch(() => ({}));

        const b =
          (typeof bJson.balance === 'number' && bJson.balance) ??
          (typeof (bJson as any).amount === 'number' && (bJson as any).amount) ??
          (typeof (bJson as any).saldo === 'number' && (bJson as any).saldo) ??
          null;

        const u =
          (typeof uJson.utilities === 'number' && uJson.utilities) ??
          (typeof (uJson as any).profit === 'number' && (uJson as any).profit) ??
          (typeof (uJson as any).utilidades === 'number' && (uJson as any).utilidades) ??
          null;

        if (!alive) return;
        setBalance(b);
        setUtilities(u);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'No se pudo obtener el saldo/utilidades.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [status, token, role, puedeVer]);

  // UI
  return (
    <section className="section">
      <h2 className="section-title">Resumen</h2>

      {!puedeVer ? (
        <div className="glass-card p-4">
          <p className="text-sm text-slate-600">
            Tu rol (<span className="font-semibold">{role}</span>) no tiene acceso a Saldo ni
            Utilidades.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="text-sm text-slate-500">💰 Saldo</div>
              <div className="mt-1 text-2xl font-semibold">
                {loading ? 'Cargando…' : money(balance)}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-slate-500">🚀 Utilidades</div>
              <div className="mt-1 text-2xl font-semibold">
                {loading ? 'Cargando…' : money(utilities)}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}

