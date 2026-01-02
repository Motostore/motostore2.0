"use client";

import { useEffect, useState } from "react";
import { fetchClientProfiles } from "@/app/lib/streaming-profile";
import SensitiveData from "@/app/ui/common/sensitive-data";
import { formatDateToLocal, remainingTime } from "@/app/lib/utils";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";

type StreamingProfile = {
  id: number | string;
  provider?: string;
  description?: string;
  user?: string;
  key?: string;
  dueDate?: string;
  status?: boolean; // activo / inactivo
  busy?: boolean;   // ocupado / finalizado
};

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [items, setItems] = useState<StreamingProfile[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // OPTIMIZACIÓN: Función dentro del useEffect para evitar problemas de dependencias en React 19/Next 16
  useEffect(() => {
    async function getItems() {
      try {
        // Nota: Si fetchClientProfiles es un Server Action, funciona directo.
        const response: any = await fetchClientProfiles();

        const safeContent: StreamingProfile[] = Array.isArray(response?.content)
          ? response.content
          : [];

        // Aquí podrías filtrar 'safeContent' usando 'query' si el backend no lo hace
        setItems(safeContent);
        setTotalPages(Number(response?.totalPages ?? 0));
      } catch (err) {
        console.error("Error cargando perfiles de streaming:", err);
        setItems([]);
        setTotalPages(0);
      }
    }

    getItems();
  }, [query, currentPage]); // Se ejecuta automáticamente cuando cambian estos valores

  function renderStatus(item: StreamingProfile) {
    if (!item.status) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-center text-white bg-red-400 rounded-lg">
          Inactivo
        </span>
      );
    }

    if (item.busy) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-center text-white bg-green-500 rounded-lg">
          Activo
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-center text-white bg-orange-500 rounded-lg">
        Finalizado
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Search placeholder="Buscar perfil de streaming..." />
      </div>

      <div className="relative overflow-x-auto">
        {/* --- Versión Móvil --- */}
        <div className="md:hidden">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
              >
                <div className="flex items-start justify-between border-b pb-2 gap-2">
                  <div>
                    <p className="mb-1 text-sm text-gray-800">
                      <strong className="font-semibold">Proveedor: </strong>
                      {item?.provider || "---"}
                    </p>
                    <p className="mb-1 text-sm text-gray-600">
                      <strong className="font-semibold">Descripción: </strong>
                      {item.description || "---"}
                    </p>
                  </div>
                </div>

                <div className="w-full pt-4 space-y-2 text-sm">
                  <p>
                    <strong className="font-semibold">Usuario: </strong>
                    {item.user ? <SensitiveData data={item.user} /> : "---"}
                  </p>
                  <p>
                    <strong className="font-semibold">Clave: </strong>
                    {item.key ? <SensitiveData data={item.key} /> : "---"}
                  </p>
                  <p>
                    <strong className="font-semibold">Vencimiento: </strong>
                    {item.dueDate ? formatDateToLocal(item.dueDate) : "---"}
                  </p>
                  <p>
                    <strong className="font-semibold">Restante: </strong>
                    {item.dueDate ? remainingTime(item.dueDate) : "---"}
                  </p>

                  <div className="flex justify-end mt-2">
                    {renderStatus(item)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No tienes perfiles de streaming asignados todavía.</p>
          )}
        </div>

        {/* --- Versión Desktop --- */}
        <div className="hidden md:block">
          {items.length > 0 ? (
            <>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Cuenta / Proveedor</th>
                    <th scope="col" className="px-6 py-3">Usuario</th>
                    <th scope="col" className="px-6 py-3">Clave</th>
                    <th scope="col" className="px-6 py-3">Vencimiento</th>
                    <th scope="col" className="px-6 py-3">Restante</th>
                    <th scope="col" className="w-24 px-6 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item?.provider || "---"}
                      </td>
                      <td className="px-6 py-4">
                        {item.user ? <SensitiveData data={item.user} /> : "---"}
                      </td>
                      <td className="px-6 py-4">
                        {item.key ? <SensitiveData data={item.key} /> : "---"}
                      </td>
                      <td className="px-6 py-4">
                        {item.dueDate ? formatDateToLocal(item.dueDate) : "---"}
                      </td>
                      <td className="px-6 py-4">
                        {item.dueDate ? remainingTime(item.dueDate) : "---"}
                      </td>
                      <td className="w-24 px-6 py-4 text-center">{renderStatus(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-gray-500 text-base">
              Aún no tienes perfiles de streaming configurados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
