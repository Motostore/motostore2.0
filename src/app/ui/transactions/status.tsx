import { HiCheck, HiMinus, HiRefresh } from "react-icons/hi";

export default function TransactionStatus({ status }: { status: string }) {
  return (
    <>
    {status.toLowerCase() === 'pending' ? (
      <button type="button" className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-yellow-500 rounded-lg hover:bg-yellow-800 w-32">
      Procesando
          <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
          <HiRefresh />
          </span>
      </button>
      
    ) : null }
    {status.toLowerCase() === 'rejected' ? (
      <button type="button" className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 w-32">
      Rechazado
        <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
        <HiMinus />
        </span>
    </button>
    ) : null }
    {status.toLowerCase() === 'processed' ? (
    <button 
      type="button" 
      className="inline-flex justify-center gap-1 items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 w-32">
      Aprobado
        <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
        <HiCheck />
        </span>
    </button>
    ) : null }
    </>
  );
}