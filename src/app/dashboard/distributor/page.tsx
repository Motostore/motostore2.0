// src/app/dashboard/distributor/page.tsx

export default function DistributorPage() {
  return (
    <main className="min-h-screen px-6 py-8 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Panel de control
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Panel Distribuidor
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Aquí podrás gestionar taquillas y clientes de tu red.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Resumen de tu red
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Más adelante aquí conectaremos los datos reales de tu backend
              (número de taquillas, clientes, ventas, etc.).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Acciones rápidas
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Crear nueva taquilla</li>
              <li>• Registrar cliente nuevo</li>
              <li>• Ver movimientos recientes</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
