export default function Loading() {
  return (
    <div className="flex w-full h-full min-h-[400px] items-center justify-center p-4">
      <div 
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"
        aria-label="Cargando..."
      />
    </div>
  );
}