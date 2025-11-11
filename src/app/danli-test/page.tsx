// src/app/danli-test/page.tsx
"use client";
import { useState } from "react";

export default function DanliTestPage() {
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testSaldos() {
    setLoading(true);
    try {
      const r = await fetch("/api/danli/saldos", { cache: "no-store" });
      setOut(await r.json());
    } finally {
      setLoading(false);
    }
  }

  async function testRecarga() {
    setLoading(true);
    try {
      const r = await fetch("/api/danli/recarga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "movilnet",
          numero: "04161234567",
          monto: 10
        }),
      });
      setOut(await r.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Test Danli</h1>
      <div className="flex gap-2">
        <button onClick={testSaldos} className="rounded border px-3 py-1">
          Probar /api/danli/saldos
        </button>
        <button onClick={testRecarga} className="rounded border px-3 py-1">
          Probar /api/danli/recarga
        </button>
      </div>
      <pre className="bg-slate-50 border p-3 text-xs overflow-auto">
        {loading ? "Cargando…" : JSON.stringify(out, null, 2)}
      </pre>
    </div>
  );
}

