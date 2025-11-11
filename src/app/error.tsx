'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">Se produjo un error en la UI</h1>
      <p className="text-sm text-slate-700 mb-3">
        {error?.message || 'Error desconocido'}
      </p>
      {error?.digest && (
        <p className="text-xs text-slate-500 mb-4">digest: {error.digest}</p>
      )}
      {error?.stack && (
        <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto max-h-64 mb-4">
          {error.stack}
        </pre>
      )}
      <button
        onClick={() => reset()}
        className="rounded bg-emerald-600 text-white px-3 py-2 text-sm"
      >
        Reintentar
      </button>
    </div>
  );
}

