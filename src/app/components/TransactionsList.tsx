'use client';

import { useEffect, useState } from "react";
import { fetchTransactionClient, fetchTransactionManager } from "../lib/transactions.service";
import { formatCurrency, formatDateToLocal, setPad } from "../lib/utils";
import { ServiceEnum } from "../lib/enums";
import TransactionStatus from "../ui/transactions/status";
import { useSession } from "next-auth/react";
import { can } from "../rbac/permissions";

export default function TransactionsList({ query }: { query: string }) {
  const { data: session } = useSession();

  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, query]);

  async function getTransactions() {
    try {
      setError(null);
      setTransactions(null);

      // Mantenemos la corrección anterior (sin argumentos en fetchTransactionClient)
      const response = can(session?.user?.role, "transactions:read:any")
        ? await fetchTransactionManager(query, 1)
        : await fetchTransactionClient();

      setTransactions(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error cargando transacciones:", err);
      setError("No pudimos cargar tus transacciones. Intenta de nuevo.");
      setTransactions([]); 
    }
  }

  return (
    <dl className="w-full text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      {transactions === null && !error ? (
        <p>Cargando transacciones…</p>
      ) : error ? (
        <p>{error}</p>
      ) : (transactions?.length || 0) > 0 ? ( // 👈 CORRECCIÓN 1: '?.length || 0' para seguridad total
        transactions!.map((t) => (           // 👈 CORRECCIÓN 2: '!' para asegurar que no es nulo
          <div key={t.id} className="flex flex-col p-2.5 w-full">
            <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
              <div className="flex justify-between items-center gap-1 md:gap-4 flex-col md:flex-row mb-2 md:mb-0">
                <div className="flex gap-1 md:gap-2 items-center flex-col md:flex-row">
                  <TransactionStatus status={t.status} />
                  <span className="text-sm">Nro. Control: {setPad(t.id)}</span>
                </div>
                <span className="text-sm text-end">{formatDateToLocal(t.date)}</span>
              </div>
            </dt>
            <TransactionServiceType transaction={t} />
            {t.message && t.message !== "" ? (
              <dd className="text-md text-gray-900 bg-yellow-100 px-2 py-1 rounded-sm">
                <strong>Motivo:</strong> {t.message}
              </dd>
            ) : null}
          </div>
        ))
      ) : (
        <p>No hay transacciones</p>
      )}
    </dl>
  );
}

function TransactionServiceType({ transaction }: { transaction: any }) {
  return (
    <>
      {transaction.serviceType.toLowerCase() === ServiceEnum.STREAMING.toLowerCase() && (
        <>
          <dd className="text-md text-gray-700">
            Solicitud de cuenta de streaming <strong>{transaction.serviceName}</strong>
          </dd>
          <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
        </>
      )}
      {transaction.serviceType.toLowerCase() === ServiceEnum.LICENSES.toLowerCase() && (
        <>
          <dd className="text-md text-gray-700">
            Solicitud de licencia <strong>{transaction.serviceName}</strong>
          </dd>
          <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
        </>
      )}
      {transaction.serviceType.toLowerCase() === ServiceEnum.RECHARGES.toLowerCase() && (
        <>
          <dd className="text-md text-gray-700">
            Solicitud de recarga <strong>{transaction.serviceName}</strong>
          </dd>
          <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
        </>
      )}
      {transaction.serviceType.toLowerCase() === ServiceEnum.MARKETING.toLowerCase() && (
        <>
          <dd className="text-md text-gray-700">
            Solicitud de paquete de marketing <strong>{transaction.serviceName}</strong>
          </dd>
          <dd className="text-md text-gray-700">Costo: {formatCurrency(transaction.amount)}</dd>
        </>
      )}
    </>
  );
}


