// src/app/dashboard/ticket/page.tsx

export default function TicketPage() {
  return (
    <main className="min-h-screen px-6 py-8 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Panel de control
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Panel Taquilla
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Espacio para registrar ventas, movimientos y crear clientes.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Próximos pasos
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Cuando tu API esté lista, aquí podrás:
          </p>
          <ul className="mt-2 list-disc pl-4 text-xs text-slate-300">
            <li>Registrar ventas o recargas</li>
            <li>Crear nuevos clientes</li>
            <li>Ver el historial de movimientos</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
