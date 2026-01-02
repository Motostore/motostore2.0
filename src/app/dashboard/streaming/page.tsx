"use client";

import { useEffect, useState, Suspense } from "react";
import { fetchClientProfiles } from "@/app/lib/streaming-profile";
import SensitiveData from "@/app/ui/common/sensitive-data";
import { formatDateToLocal, remainingTime } from "@/app/lib/utils";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";

type StreamingProfile = {
  id: number | string;
  provider?: string | null;
  description?: string | null;
  user?: string | null;
  key?: string | null;
  dueDate: string;
  status?: boolean;
  busy?: boolean;
};

type FetchResponse = {
  content: StreamingProfile[];
  totalPages: number;
};

// 1. Mover toda la lógica de la página a este componente interno
function StreamingContent() {
  const [items, setItems] = useState<StreamingProfile[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    void getItems();
  }, []);

  async function getItems() {
    try {
      const response: FetchResponse = await fetchClientProfiles();
      setItems(response?.content ?? []);
      setTotalPages(response?.totalPages ?? 0);
    } catch (e) {
      console.error("fetchClientProfiles error:", e);
      setItems([]);
      setTotalPages(0);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
      {/* Título y buscador */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Streaming
          </h1>
          <p className="text-sm text-slate-600">
            Aquí ves las cuentas de streaming asignadas a tus servicios.
          </p>
        </div>
        <div className="w-full md:w-64">
          {/* El componente Search usa useSearchParams, por eso necesitamos Suspense */}
          <Search placeholder="Buscar..." />
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {/* Versión móvil (cards) */}
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
                        <strong>Proveedor:</strong>{" "}
                        {item?.provider || "---"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full pt-4">
                  <p>
                    <strong>Descripción: </strong>
                    {item.description || "---"}
                  </p>
                  <p>
                    <strong>Usuario: </strong>
                    {item.user ? (
                      <SensitiveData data={item.user} />
                    ) : (
                      "---"
                    )}
                  </p>
                  <p>
                    <strong>Clave: </strong>
                    {item.key ? (
                      <SensitiveData data={item.key} />
                    ) : (
                      "---"
                    )}
                  </p>
                  <p>
                    <strong>Fecha de vencimiento: </strong>
                    {formatDateToLocal(item.dueDate)}
                  </p>
                  <p>
                    <strong>Tiempo restante: </strong>
                    {remainingTime(item.dueDate)}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    {!item.status && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-red-400 rounded-lg">
                        Inactivo
                      </span>
                    )}
                    {item.busy ? (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-green-400 rounded-lg">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-red-400 rounded-lg">
                        Finalizado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">Aún no tienes cuentas.</p>
          )}
        </div>

        {/* Versión escritorio (tabla) */}
        {items.length > 0 ? (
          <>
            <table className="hidden w-full text-sm text-left text-gray-500 md:table">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Cuenta
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
                    key={item.id}
                    className="bg-white border-b"
                  >
                    <td className="px-6 py-4">
                      {item?.provider || "---"}
                    </td>
                    <td className="px-6 py-4">
                      {item.user ? (
                        <SensitiveData data={item.user} />
                      ) : (
                        "---"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.key ? (
                        <SensitiveData data={item.key} />
                      ) : (
                        "---"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {formatDateToLocal(item.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      {remainingTime(item.dueDate)}
                    </td>
                    <td className="w-8 px-6 py-4 space-x-1">
                      {!item.status && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-red-400 rounded-lg">
                          Inactivo
                        </span>
                      )}
                      {item.busy ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-green-400 rounded-lg">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-red-400 rounded-lg">
                          Finalizado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="mt-5 flex w-full justify-center">
              <Pagination totalPages={totalPages} />
            </div>
          </>
        ) : (
          <div className="hidden md:block rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-10 text-center text-sm text-gray-600">
            Aún no tienes cuentas de streaming.
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Exportar por defecto el componente envuelto en Suspense
export default function StreamingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando Streaming...</div>}>
      <StreamingContent />
    </Suspense>
  );
}
