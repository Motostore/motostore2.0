// src/app/dashboard/transactions/table.tsx
"use client";

import { useEffect, useState } from "react";
import { ButtonView } from "@/app/components/MyButtons";
import { ContentModal } from "@/app/lib/definitions";
import { formatDateToLocal, setPad } from "@/app/lib/utils";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import StatusTransaction from "@/app/components/MyStatus";
import { fetchTransactionManager } from "@/app/lib/transactions.service";

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const link = "/dashboard/transactions";
  const [openModal, setOpenModal] = useState(false);
  const [items, setItems] = useState<any[]>([]); 
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState<ContentModal>();

  useEffect(() => {
    getItems();
  }, [query, currentPage]);

  async function getItems() {
    try {
      const response = await fetchTransactionManager(query, currentPage);
      
      // ✅ Solución: Valida que la respuesta y la propiedad 'content' existan.
      if (response && response.content) {
        setItems(response.content);
        setTotalPages(response.totalPages);
      } else {
        // En caso de que la respuesta no sea válida, asegúrate de que 'items' sea un array vacío.
        setItems([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      // En caso de error de la API, reinicia el estado para evitar fallos.
      setItems([]); 
      setTotalPages(0);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Search placeholder="Buscar..." />
      </div>
      <div className="relative overflow-x-auto mt-4">
        <div className="md:hidden">
          {items.length > 0 ? (
            items.map((item) => ( 
              <div
                key={item.id}
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
              >
                <div className="flex items-start justify-between border-b pb-2 gap-2">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>
                        <strong># Transacción:</strong> {setPad(item.id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ButtonView iconSize="w-4" link={`${link}/${item.id}`} />
                  </div>
                </div>
                <div className=" w-full pt-4">
                  <div>
                    <p>
                      <strong>Servicio: </strong>
                      {item.serviceName}
                    </p>
                    <p>
                      <strong>Método de pago: </strong>
                      {item.paymentName}
                    </p>
                    <p>
                      <strong>Fecha: </strong>
                      {formatDateToLocal(item.date)}
                    </p>
                    <div className="flex justify-end mt-2">
                      <StatusTransaction status={item.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay Transacciones</p>
          )}
        </div>
        {items.length > 0 ? (
          <>
            <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-2">
                    # Transacción
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Servicio
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Método de pago
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-2 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-2 flex justify-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-2">{setPad(item.id)}</td>
                    <td className="px-6 py-2">{item.clientName}</td>
                    <td className="px-6 py-2">{item.serviceName}</td>
                    <td className="px-6 py-2">{item.paymentName}</td>
                    <td className="px-6 py-2">
                      {formatDateToLocal(item.date)}
                    </td>
                    <td className="px-6 py-2 text-center">
                      <StatusTransaction status={item.status} />
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex gap-2 justify-end">
                        <ButtonView link={`${link}/${item.id}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 flex w-full justify-center">
              <Pagination totalPages={totalPages} />
            </div>
          </>
        ) : (
          <p>Aun no tienes transacciones</p>
        )}
      </div>
    </div>
  );
}
