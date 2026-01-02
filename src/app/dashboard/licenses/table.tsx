"use client";

import { useEffect, useState } from "react";
import SensitiveData from "@/app/ui/common/sensitive-data";
import { formatDateToLocal, remainingTime } from "@/app/lib/utils";
import { fetchClientLicenses } from "@/app/lib/licences.service";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // 💎 SOLUCIÓN: Tipamos el estado como <any[]> para evitar el error 'never'
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage]);

  async function getItems() {
    try {
        const response = await fetchClientLicenses(query, currentPage);
        // Protección extra por si response.content viene undefined
        setItems(Array.isArray(response?.content) ? response.content : []);
        setTotalPages(response?.totalPages || 0);
    } catch (error) {
        console.error("Error fetching licenses:", error);
        setItems([]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Search placeholder="Buscar..." />
      </div>
      <div className="relative overflow-x-auto">
        {/* VISTA MOVIL */}
        <div className="md:hidden">
          {items && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id || Math.random()} // Fallback key por seguridad
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
              >
                <div className="flex items-start justify-between border-b pb-2 gap-2">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>
                        <strong>Proveedor:</strong> {item?.provider || "---"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className=" w-full pt-4">
                  <div>
                    <p>
                      <strong>Descripción: </strong>
                      {item.description}
                    </p>
                    <p>
                      <strong>Usuario: </strong>
                      {items && item.user ? (
                        <SensitiveData data={item?.user} />
                      ) : null}
                    </p>
                    <p>
                      <strong>Clave: </strong>
                      {items && item.key ? (
                        <SensitiveData data={item?.key} />
                      ) : null}
                    </p>
                    <p>
                      <strong>Fecha de vencimiento: </strong>
                      {formatDateToLocal(item.dueDate)}
                    </p>
                    <p>
                      <strong>Tiempo restante: </strong>
                      {remainingTime(item.dueDate)}
                    </p>
                    <div className="flex justify-end mt-2">
                      {!item.status ? (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg focus:ring-4 focus:outline-none">
                          Inactivo
                        </label>
                      ) : null}
                      {item.busy ? (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-green-400 rounded-lg focus:ring-4 focus:outline-none">
                          Activo
                        </label>
                      ) : (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg focus:ring-4 focus:outline-none">
                          Finalizado
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay Licencias</p>
          )}
        </div>

        {/* VISTA DE ESCRITORIO */}
        {items && items.length > 0 ? (
          <>
            <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Licencia
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Clave
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vencimiento
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Restante
                  </th>
                  <th scope="col" className="w-8 px-6 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id || Math.random()}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">{item?.provider || "---"}</td>
                    <td className="px-6 py-4">
                      {items && item.user ? (
                        <SensitiveData data={item?.user} />
                      ) : '---'}
                    </td>
                    <td className="px-6 py-4">
                      {items && item.key ? (
                        <SensitiveData data={item?.key} />
                      ) : '---'}
                    </td>
                    <td className="px-6 py-4">
                      {formatDateToLocal(item.dueDate) || '---'}
                    </td>
                    <td className="px-6 py-4">{remainingTime(item.dueDate)}</td>
                    <td className="w-8 px-6 py-4">
                      {!item.status ? (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg focus:ring-4 focus:outline-none">
                          Inactivo
                        </label>
                      ) : null}
                      {item.busy ? (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-green-400 rounded-lg focus:ring-4 focus:outline-none">
                          Activo
                        </label>
                      ) : (
                        <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg focus:ring-4 focus:outline-none">
                          Finalizado
                        </label>
                      )}
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
          <p>No hay Licencias</p>
        )}
      </div>
    </div>
  );
}
