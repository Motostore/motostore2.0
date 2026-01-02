// src/app/dashboard/reseller/page.tsx

export default function ResellerPage() {
  return (
    <main className="min-h-screen px-6 py-8 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Panel de control
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Panel Reseller
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Desde aquí podrás gestionar taquillas y clientes asignados a tu cuenta.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Tus taquillas
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Más adelante, este panel listará todas las taquillas que dependen de ti.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Clientes
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Aquí podrás ver y administrar tus clientes (activación, bloqueo, etc.).
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
