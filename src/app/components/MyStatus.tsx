import { HiCheck, HiMinus, HiRefresh } from "react-icons/hi";

export function StatusBase({status}: {status: boolean}) {
  return (
    <>
    {
      status
      ?
      (
        <span
          className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span aria-hidden
              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
          <span className="relative">Activo</span>
        </span>
      )
      :
      (
        <span
          className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
          <span aria-hidden
              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
          <span className="relative">Inactivo</span>
        </span>
      )
    }
    </>
  );
}

export function StatusProfile({status, busy}: {status: boolean, busy: boolean}) {
  return (
    <>
    {
      status && !busy
      ?
      (
        <span
          className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span aria-hidden
              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
          <span className="relative">Disponible</span>
        </span>
      )
      : null
    }
    {
      status && busy
      ?
      (
        <span
          className="relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight">
          <span aria-hidden
              className="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
          <span className="relative">Ocupado</span>
        </span>
      )
      : null
    }
    {
      !status
      ?
      (
        <span
          className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
          <span aria-hidden
              className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
          <span className="relative">Inactivo</span>
        </span>
      )
      : null
    }
    
    </>
  );
}

export default function StatusTransaction({ status }: { status: string }) {
  return (
    <>
    {status.toLowerCase() === 'pending' ? (
      <button type="button" className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-yellow-900 bg-yellow-100 rounded-lg hover:bg-yellow-100 w-32">
      Procesando
          <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-yellow-900 bg-yellow-100 rounded-full">
          <HiRefresh />
          </span>
      </button>
      
    ) : null }
    {status.toLowerCase() === 'rejected' ? (
      <button type="button" className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-red-900 bg-red-200 rounded-lg hover:bg-red-200 w-32">
      Rechazado
        <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
        <HiMinus />
        </span>
    </button>
    ) : null }
    {status.toLowerCase() === 'processed' ? (
    <button 
      type="button" 
      className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-green-900 bg-green-200 rounded-lg hover:bg-green-200 w-32">
      Aprobado
        <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
        <HiCheck />
        </span>
    </button>
    ) : null }
    </>
  );
}