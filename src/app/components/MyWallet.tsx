'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

type Status = 'idle' | 'loading' | 'ok';

const MIN_TOPUP = Number(process.env.NEXT_PUBLIC_WALLET_MIN_TOPUP ?? '1');

export default function Wallet() {
  const { data: session } = useSession();
  const user: any = session?.user ?? {};

  const token: string | null =
    (user?.token as string) ??
    (user?.accessToken as string) ??
    (user?.access_token as string) ??
    ((session as any)?.accessToken as string) ??
    null;

  const envUserId = process.env.NEXT_PUBLIC_WALLET_STATIC_USERID ?? '';

  function pickBestUserId(u: any): string | number | null {
    const cand = [u?.id, u?.userId, u?.uid, u?._id, u?.uuid];
    for (const c of cand) {
      if (c != null && /^\d+$/.test(String(c))) return c;
    }
    return u?.id ?? u?.userId ?? u?.username ?? null;
  }

  const effectiveUserId: string | number | null =
    envUserId ? envUserId : pickBestUserId(user);

  const base = (process.env.NEXT_PUBLIC_API_FULL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');
  const customUrl = process.env.NEXT_PUBLIC_WALLET_URL ?? '';
  const sendCookies = (process.env.NEXT_PUBLIC_WALLET_SEND_COOKIES ?? '1') === '1';

  const [status, setStatus] = useState<Status>('idle');
  const [amount, setAmount] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ---------- URLs que vamos a probar ----------
  const urlsToTry = useMemo(() => {
    const uid = effectiveUserId != null ? encodeURIComponent(String(effectiveUserId)) : '';

    // Si tienes un URL custom en env
    if (customUrl) {
      if (uid) {
        const path = customUrl.includes('{userId}')
          ? customUrl.replace('{userId}', uid)
          : customUrl.includes('?')
          ? `${customUrl}&userId=${uid}`
          : `${customUrl}/${uid}`;
        return [`${base}${path.startsWith('/') ? '' : '/'}${path}`];
      }
      return [`${base}${customUrl.startsWith('/') ? '' : '/'}${customUrl}`];
    }

    // Sin userId → endpoints tipo "me"
    if (!uid) {
      return [
        `${base}/wallet/balance`,
        `${base}/wallet/me/balance`,
        `${base}/wallet/balance/me`,
      ];
    }

    // Con userId → con id y también /wallet/balance
    return [
      `${base}/wallet/balance/${uid}`,
      `${base}/wallet/${uid}/balance`,
      `${base}/wallet/balance?userId=${uid}`,
      `${base}/wallet/balance`,
    ];
  }, [base, customUrl, effectiveUserId]);

  // ---------- parseo de respuesta ----------
  const parseBalancePayload = (raw: string) => {
    let value: number | null = null;
    let profitValue: number | null = null;

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      value = Number(raw);
    } else {
      try {
        const j = JSON.parse(raw);
        value =
          j?.balance ??
          j?.saldo ??
          j?.amount ??
          j?.monto ??
          (j?.data &&
            (j.data.balance ??
              j.data.saldo ??
              j.data.amount ??
              j.data.monto)) ??
          (typeof j === 'number' ? j : null);

        profitValue =
          j?.profit ??
          j?.profits ??
          j?.utilities ??
          j?.utilidad ??
          j?.utilidades ??
          j?.earnings ??
          j?.ganancias ??
          j?.profitUsd ??
          j?.utilitiesUsd ??
          (j?.data &&
            (j.data.profit ??
              j.data.profits ??
              j.data.utilities ??
              j.data.utilidad ??
              j.data.utilidades ??
              j.data.earnings ??
              j.data.ganancias)) ??
          null;
      } catch (err) {
        console.warn('Wallet: respuesta no es JSON válido, raw =', raw);
      }
    }
    return { value, profitValue };
  };

  // ---------- fetch genérico con/sin token ----------
  async function fetchWithOptionalToken(url: string) {
    for (const tryToken of [true, false]) {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (tryToken && token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const r = await fetch(url, {
          headers,
          cache: 'no-store',
          credentials: sendCookies ? 'include' : undefined,
        });

        if (!r.ok) {
          console.warn('Wallet: HTTP error', r.status, r.statusText, 'en', url);
          continue;
        }

        const raw = (await r.text()).trim();
        const { value, profitValue } = parseBalancePayload(raw);

        if (typeof value === 'number' && !Number.isNaN(value)) {
          setAmount(value);
          setProfit(
            typeof profitValue === 'number' && !Number.isNaN(profitValue)
              ? profitValue
              : 0
          );
          setStatus('ok');
          return true;
        }
      } catch (err) {
        console.warn('Wallet: error de red en', url, err);
      }

      if (!tryToken) break;
    }
    return false;
  }

  // ---------- carga de saldo ----------
  async function fetchBalance() {
    setStatus('loading');

    let success = false;
    for (const url of urlsToTry) {
      const ok = await fetchWithOptionalToken(url);
      if (ok) {
        success = true;
        break;
      }
    }

    if (!success) {
      console.warn('Wallet: ninguna URL funcionó, usando saldo 0 por defecto.');
      // Dejamos amount/profit en 0, pero marcamos como "ok" para que NO salga "—"
      setAmount(0);
      setProfit(0);
      setStatus('ok');
    }
  }

  // ---------- topup mínimo ----------
  async function topUpMin() {
    if (!effectiveUserId) return;
    setTopupLoading(true);

    const intents = [
      { url: `${base}/wallet/add-funds`, body: { userId: effectiveUserId, amount: MIN_TOPUP } },
      { url: `${base}/wallet/${encodeURIComponent(String(effectiveUserId))}/add-funds`, body: { amount: MIN_TOPUP } },
      { url: `${base}/wallet/deposit`, body: { userId: effectiveUserId, amount: MIN_TOPUP } },
    ];

    for (const it of intents) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const r = await fetch(it.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(it.body),
          cache: 'no-store',
          credentials: sendCookies ? 'include' : undefined,
        });
        if (!r.ok) continue;
        await fetchBalance();
        setMenuOpen(false);
        break;
      } catch (err) {
        console.warn('Wallet: error al recargar mínimos', err);
      }
    }

    setTopupLoading(false);
  }

  // ---------- cerrar menú al hacer click fuera / ESC ----------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  // ---------- disparar carga ----------
  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId, customUrl, sendCookies, token]);

  const formatUSD = (n: number | null | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number.isFinite(Number(n)) ? Number(n) : 0
    );

  const saldoLabel =
    status === 'loading'
      ? 'Cargando…'
      : formatUSD(amount);

  const utilidadesLabel =
    status === 'loading'
      ? '—'
      : formatUSD(profit);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="inline-flex flex-col items-start gap-0.5 p-0 text-left"
      >
        <div className="flex items-center gap-1 text-sm">
          <CurrencyDollarIcon
            className="relative -top-[1px] h-3.5 w-3.5 text-emerald-600/80"
            aria-hidden="true"
          />
          <span className="text-gray-600">Saldo:</span>
          <span className="text-gray-900">{saldoLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 leading-none">
          <ArrowTrendingUpIcon
            className="relative -top-[1px] h-3 w-3"
            aria-hidden="true"
          />
          <span>Utilidades:</span>
          <span className="text-gray-800">{utilidadesLabel}</span>
        </div>
      </button>

      <div
        className={[
          'absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white/95 backdrop-blur p-1.5 shadow-sm',
          menuOpen ? 'block' : 'hidden',
        ].join(' ')}
      >
        <button
          onClick={topUpMin}
          disabled={topupLoading || status === 'loading'}
          className="w-full rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-gray-100 disabled:opacity-50"
        >
          {topupLoading ? 'Procesando…' : `Recargar mín. (${MIN_TOPUP})`}
        </button>
        <button
          onClick={fetchBalance}
          disabled={status === 'loading'}
          className="mt-0.5 w-full rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-gray-100 disabled:opacity-50"
        >
          Actualizar saldo
        </button>
      </div>
    </div>
  );
}




















