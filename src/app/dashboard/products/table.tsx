"use client";

import { useEffect, useState } from "react";
import {
  ButtonCreate,
  ButtonDelete,
  ButtonEdit,
  ButtonView,
} from "@/app/components/MyButtons";
import ModalDelete from "@/app/components/ModalDelete";
import { ContentModal } from "@/app/lib/definitions";
import {
  fetchAllProviders,
  fetchDeleteProvider,
} from "@/app/lib/streaming-provider";
import { formatCurrency, pluralizeMonth } from "@/app/lib/utils";
import Image from "next/image";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import { StatusBase } from "@/app/components/MyStatus";

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const link = "/dashboard/products";
  const [openModal, setOpenModal] = useState(false);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState<ContentModal>();

  useEffect(() => {
    getItems();
  }, [query, currentPage]);

  async function getItems() {
    const response = await fetchAllProviders(query, currentPage);
    setItems(response.content);
    setTotalPages(response.totalPages);
  }

  async function deleteItem(id) {
    const response = await fetchDeleteProvider(id);
    if (response.ok) {
      setOpenModal(false);
      getItems();
    } else {
      console.log("Ha ocurrido un error.");
    }
  }

  const openModalTrigger = (data) => {
    setContent({
      header: "Eliminar ítem",
      body: `¿Estás seguro que quieres eliminar el proveedor ${data.name}?`,
      target: data.id,
      loading: "Cargando información...",
    });
    setOpenModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Search placeholder="Buscar..." />
        <ButtonCreate link={`${link}/create`} text="Agregar" iconSize="w-6" />
      </div>
      <div className="relative overflow-x-auto mt-4">
        <div className="md:hidden">
          {items.length > 0 ? (
            items?.map((item) => (
              <div
                key={item.id}
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
              >
                <div className="flex items-start justify-between border-b pb-2 gap-2">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>
                        <strong>Proveedor:</strong> {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ButtonView iconSize="w-4" link={`${link}/${item.id}`} />
                    <ButtonEdit
                      iconSize="w-4"
                      link={`${link}/${item.id}/edit`}
                    />
                    <ButtonDelete
                      iconSize="w-4"
                      trigger={() => openModalTrigger(item)}
                    />
                  </div>
                </div>
                <div className=" w-full pt-4">
                  <div>
                    <p>
                      <strong>Descripción: </strong>
                      {item.description}
                    </p>
                    <p>
                      <strong>Precio: </strong>
                      {formatCurrency(item.price)}
                    </p>
                    <p>
                      <strong>Duración: </strong>
                      {pluralizeMonth(item.duration)}
                    </p>
                    <div className="flex justify-end mt-2">
                      <StatusBase status={item.status} />
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
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Duración
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
                    <td className="px-6 py-2">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={"/assets/placeholder/no-image.png"}
                          width={40}
                          height={40}
                          alt="Imagen"
                        />
                        <span>{item?.name || "---"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      {formatCurrency(item?.price) || "---"}
                    </td>
                    <td className="px-6 py-2">
                      {pluralizeMonth(item?.duration) || "---"}
                    </td>
                    <td className="px-6 py-2 text-center">
                      <StatusBase status={item.status} />
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex gap-2 justify-end">
                        <ButtonView link={`${link}/${item.id}`} />
                        <ButtonEdit link={`${link}/${item.id}/edit`} />
                        <ButtonDelete trigger={() => openModalTrigger(item)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <ModalDelete
                content={content}
                action={deleteItem}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
            </table>
            <div className="mt-5 flex w-full justify-center">
              <Pagination totalPages={totalPages} />
            </div>
          </>
        ) : (
          <p>Aun no tienes cuentas</p>
        )}
      </div>
    </div>
  );
}
