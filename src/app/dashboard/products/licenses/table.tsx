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
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  // 1. Añadimos estado de carga interno
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage]);

  async function getItems() {
    setIsLoading(true); // Empieza a cargar
    try {
      const response = await fetchClientLicenses(query, currentPage);
      setItems(Array.isArray(response?.content) ? response.content : []);
      setTotalPages(response?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      setItems([]);
    } finally {
      setIsLoading(false); // Termina de cargar (sea éxito o error)
    }
  }

  // Componente interno para las etiquetas de estado (evita lógica duplicada)
  const StatusBadge = ({ item }: { item: any }) => {
    if (!item.status) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg">
          Inactivo
        </span>
      );
    }
    if (item.busy) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-green-400 rounded-lg">
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-gray-400 rounded-lg">
        Finalizado
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Search placeholder="Buscar..." />
      </div>

      {/* 2. Mostramos spinner mientras carga los datos internamente */}
      {isLoading ? (
        <div className="flex w-full h-40 items-center justify-center">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          {/* VISTA MOVIL */}
          <div className="md:hidden">
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <div
                  // 3. Usamos index como fallback en lugar de random
                  key={item.id || index} 
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
                  <div className="w-full pt-4">
                    <div>
                      <p>
                        <strong>Descripción: </strong> {item.description}
                      </p>
                      <div className="py-1">
                        <strong>Usuario: </strong>
                        {item.user ? <SensitiveData data={item.user} /> : "---"}
                      </div>
                      <div className="py-1">
                        <strong>Clave: </strong>
                        {item.key ? <SensitiveData data={item.key} /> : "---"}
                      </div>
                      <p>
                        <strong>Vencimiento: </strong>
                        {formatDateToLocal(item.dueDate)}
                      </p>
                      <p>
                        <strong>Tiempo restante: </strong>
                        {remainingTime(item.dueDate)}
                      </p>
                      <div className="flex justify-end mt-2">
                        <StatusBadge item={item} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No hay Licencias encontradas.</div>
            )}
          </div>

          {/* VISTA DE ESCRITORIO */}
          {items && items.length > 0 ? (
            <>
              <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Licencia</th>
                    <th scope="col" className="px-6 py-3">Usuario</th>
                    <th scope="col" className="px-6 py-3">Clave</th>
                    <th scope="col" className="px-6 py-3">Vencimiento</th>
                    <th scope="col" className="px-6 py-3">Restante</th>
                    <th scope="col" className="w-8 px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <td className="px-6 py-4">{item?.provider || "---"}</td>
                      <td className="px-6 py-4">
                        {item.user ? <SensitiveData data={item.user} /> : '---'}
                      </td>
                      <td className="px-6 py-4">
                        {item.key ? <SensitiveData data={item.key} /> : '---'}
                      </td>
                      <td className="px-6 py-4">
                        {formatDateToLocal(item.dueDate) || '---'}
                      </td>
                      <td className="px-6 py-4">{remainingTime(item.dueDate)}</td>
                      <td className="w-8 px-6 py-4">
                        <StatusBadge item={item} />
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
             <div className="hidden md:block p-10 text-center text-gray-500">
                No hay Licencias encontradas para esta búsqueda.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
