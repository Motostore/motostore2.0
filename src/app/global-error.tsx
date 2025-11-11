'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-2">Error global</h1>
        <p className="text-sm text-slate-700 mb-3">
          {error?.message || 'Error desconocido'}
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-500 mb-4">digest: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="rounded bg-emerald-600 text-white px-3 py-2 text-sm"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
