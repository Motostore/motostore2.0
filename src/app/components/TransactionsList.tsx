'use client'

import { useEffect, useState } from "react";
import { fetchTransactionClient } from "../lib/transactions.service";
import { formatCurrency, formatDateToLocal, setPad } from "../lib/utils";
import { ServiceEnum } from "../lib/enums";
import TransactionStatus from "../ui/transactions/status";


export default function TransactionsList() {

const [transactions, setTransactions] = useState([]);


  useEffect(() => {
    getTransactions();
  }, []);
  
  async function getTransactions() {
    const response = await fetchTransactionClient();
    setTransactions(response)
  }

    const date = "22-03-2024 7:25 PM"

    return (
    <dl className="w-full text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
    {

        transactions.length > 0
        ?
        transactions.map((t) => (
            <div key={t.id} className="flex flex-col p-2.5 w-full">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                    <div className="flex justify-between items-center gap-1 md:gap-4 flex-col md:flex-row mb-2 md:mb-0">
                        <div className="flex gap-1 md:gap-2 items-center flex-col md:flex-row">
                            <TransactionStatus status={t.status} />
                            <span className="text-sm">
                            Nro. Control: { setPad(t.id) }
                            </span>
                        </div>
                        <span className="text-sm text-end">
                            { formatDateToLocal(t.date) }
                        </span>

                    </div>
                </dt>
                <TransactionServiceType transaction={t} />
                {
                  t.message && t.message !== ''
                  ?
                  <dd className="text-md text-gray-900 bg-yellow-100 px-2 py-1 rounded-sm"><strong>Motivo:</strong> {t.message}</dd>
                  : null
                }
            </div>
        ))
        :
        <p>No hay transacciones</p>
    }
    </dl>
  );
}

function TransactionServiceType({ transaction }: { transaction: any }) {
  return (
    <>
    {
    transaction.serviceType.toLowerCase() === ServiceEnum.STREAMING.toLowerCase() ? (
      <>
      <dd className="text-md text-gray-700">Solicitud de cuenta de streaming <strong>{transaction.serviceName}</strong></dd>
      {/* <dd className="text-md text-gray-700">Número: 123123</dd> */}
      {/* <dd className="text-md text-gray-700">Tipo de Linea: prepago</dd> */}
      {/* <dd className="text-md text-gray-700">Estatus: Suspendida por falta de saldo</dd> */}
      {/* <dd className="text-md text-gray-700">Fecha Corte: 16-03-2024</dd> */}
      <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
      </>
    )
    : null
    }
    {
    transaction.serviceType.toLowerCase() === ServiceEnum.LICENSES.toLowerCase() ? (
      <>
      <dd className="text-md text-gray-700">Solicitud de licencia <strong>{transaction.serviceName}</strong></dd>
      {/* <dd className="text-md text-gray-700">Número: 123123</dd> */}
      {/* <dd className="text-md text-gray-700">Tipo de Linea: prepago</dd> */}
      {/* <dd className="text-md text-gray-700">Estatus: Suspendida por falta de saldo</dd> */}
      {/* <dd className="text-md text-gray-700">Fecha Corte: 16-03-2024</dd> */}
      <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
      </>
    )
    : null
    }
    {
    transaction.serviceType.toLowerCase() === ServiceEnum.RECHARGES.toLowerCase() ? (
      <>
      <dd className="text-md text-gray-700">Solicitud de recarga <strong>{transaction.serviceName}</strong></dd>
      {/* <dd className="text-md text-gray-700">Número: 123123</dd> */}
      {/* <dd className="text-md text-gray-700">Tipo de Linea: prepago</dd> */}
      {/* <dd className="text-md text-gray-700">Estatus: Suspendida por falta de saldo</dd> */}
      {/* <dd className="text-md text-gray-700">Fecha Corte: 16-03-2024</dd> */}
      <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
      </>
    )
    : null
    }
    {
    transaction.serviceType.toLowerCase() === ServiceEnum.MARKETING.toLowerCase() ? (
      <>
      <dd className="text-md text-gray-700">Solicitud de paquete de marketing <strong>{transaction.serviceName}</strong></dd>
      {/* <dd className="text-md text-gray-700">Número: 123123</dd> */}
      {/* <dd className="text-md text-gray-700">Tipo de Linea: prepago</dd> */}
      {/* <dd className="text-md text-gray-700">Estatus: Suspendida por falta de saldo</dd> */}
      {/* <dd className="text-md text-gray-700">Fecha Corte: 16-03-2024</dd> */}
      <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
      </>
    )
    : null
    }
    </>
  )}