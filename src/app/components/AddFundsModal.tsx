'use client';

import { useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_FULL?.replace(/\/+$/, '') ||
  'http://localhost:8080/api/v1';

async function tryPostJson(
  intents: { url: string; body: any }[],
  headers: HeadersInit
): Promise<{ ok: boolean; status: number; text?: string }> {
  for (const it of intents) {
    try {
      const r = await fetch(it.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(it.body),
      });
      if (r.ok) {
        const text = await r.text().catch(() => '');
        return { ok: true, status: r.status, text };
      }
    } catch (e) {
      // probar siguiente
    }
  }
  return { ok: false, status: 0 };
}

export default function AddFundsModal({
  userId,
  token,
  onClose,
  onSuccess,
}: {
  userId: string;
  token?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const value = Number(amount);
    if (!userId) {
      setErr('Falta el ID de billetera.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setErr('Ingresa un monto válido.');
      return;
    }

    setLoading(true);

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const intents = [
      // forma A: body {userId, amount}
      { url: `${API_BASE}/wallet/add-funds`, body: { userId, amount: value } },
      // forma B: /wallet/{id}/add-funds con body {amount}
      {
        url: `${API_BASE}/wallet/${encodeURIComponent(userId)}/add-funds`,
        body: { amount: value },
      },
      // forma C: /wallet/deposit con body {userId, amount}
      { url: `${API_BASE}/wallet/deposit`, body: { userId, amount: value } },
    ];

    const res = await tryPostJson(intents, headers);

    if (!res.ok) {
      setErr(
        'No se pudo recargar. Verifica endpoint/permiso/token (revisa la consola).'
      );
      console.error('[Wallet] FALLO add-funds', { intents, res });
      setLoading(false);
      return;
    }

    setMsg(res.text || 'Recarga exitosa.');
    onSuccess();
    setLoading(false);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-[92vw] max-w-md rounded-2xl border bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold mb-3">Recargar billetera</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="text-sm text-gray-600">
            <div>
              <strong>ID billetera:</strong> <code>{userId || '(sin ID)'}</code>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Monto (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-gray-700">{msg}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 text-white px-4 py-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Procesando…' : 'Recargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

