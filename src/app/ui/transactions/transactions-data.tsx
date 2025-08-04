'use client'
import { formatCurrency, setPad } from "@/app/lib/utils";

export default function TransactionData({ transaction }: { transaction: any }) {

  return (
    <section className="shadow-xl p-4 bg-white rounded-lg">
    {
      transaction 
      ?
      <>
        <h5 className="px-2 text-xl text-gray-800">Datos de la transacción</h5>
        <hr className="border-2 rounded-full mt-4 w-full mx-auto px-2" />
        <div className="relative overflow-x-auto text-sm">
          <div className="flex justify-between border-b px-2 py-4">
            <p className="font-bold text-gray-600 mb-0">Número de la transacción</p>
            <p className="mb-0 text-left w-32">{ setPad(transaction.id) }</p>
          </div>
          <div className="flex justify-between border-b px-2 py-4">
            <p className="font-bold text-gray-600 mb-0">Cliente</p>
            <p className="mb-0 text-left w-32">{ transaction.clientName }</p>
          </div>
          <div className="flex justify-between border-b px-2 py-4">
            <p className="font-bold text-gray-600 mb-0">Servicio</p>
            <p className="mb-0 text-left w-32">{ transaction.serviceName }</p>
          </div>
          <div className="flex justify-between border-b px-2 py-4">
            <p className="font-bold text-gray-600 mb-0">Método de pago</p>
            <p className="mb-0 text-left w-32">{ transaction.paymentName }</p>
          </div>
          <div className="flex justify-between border-b px-2 py-4">
            <p className="font-bold text-gray-600 mb-0">Monton</p>
            <p className="mb-0 text-left w-32">{ formatCurrency(transaction.amount) }</p>
          </div>
        </div>
      </>
      :
      (<p>Cargando...</p>)
    }
    </section>
  );
}
