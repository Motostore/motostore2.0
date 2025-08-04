"use client";

import { useSession } from "next-auth/react";
import Search from "@/app/ui/search";
import { fetchDeleteProduct, fetchPagedProductsByType } from "@/app/lib/products.service";
import Pagination from "@/app/ui/pagination";
import ModalDelete from "@/app/components/ModalDelete";
import { ContentModal } from "@/app/lib/definitions";
import { ButtonCreate, ButtonDelete, ButtonEdit, ButtonView } from "@/app/components/MyButtons";
import { StatusBase } from "@/app/components/MyStatus";
import { useEffect, useState } from "react";

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  const accountPath = 'streaming/account'
  const link = '/dashboard/products/accounts';

  const [openModal, setOpenModal] = useState(false);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState<ContentModal>();

  useEffect(() => {
    getItems();
  }, [query, currentPage]);

  async function getItems() {
    const response = await fetchPagedProductsByType(query, currentPage, accountPath);
    setItems(response.content);
    setTotalPages(response.totalPages);
  }

  async function deleteItem(id) {
    const response = await fetchDeleteProduct(id, accountPath)
    if (response.ok) {
      setOpenModal(false);
      getItems();
    } else {
      console.log('Ha ocurrido un error.');
    }
  }

  const openModalTrigger = (data) => {
    setContent({
      header: "Eliminar ítem",
      body: `¿Estás seguro que quieres eliminar el ítem ${data.id}?`,
      target: data.id,
      loading: "Cargando información..."
    })
    setOpenModal(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Search placeholder="Buscar..." />
        <ButtonCreate link={`${link}/create`} text="Agregar" iconSize="w-6" />
      </div>
      <div className="relative overflow-x-auto">
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
                        <strong>Proveedor:</strong> {item.id} - {item.streamingProvider?.name}
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
                      <strong>Perfiles: </strong>
                      {/* {item.profiles.length} */}
                      TODO
                    </p>
                    <div className="flex justify-end mt-2">
                      <StatusBase status={item.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay cuentas</p>
          )}
        </div>
        {items.length > 0 ? (
          <>
          <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="w-8 px-6 py-3">
                  Id
                </th>
                <th scope="col" className="px-6 py-3">
                  Descripción
                </th>
                <th scope="col" className="px-6 py-3">
                  Proveedor
                </th>
                <th scope="col" className="w-8 px-6 py-3">
                  Perfiles
                </th>
                <th scope="col" className="w-16 px-6 py-3">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-end">
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
                  <th
                    scope="row"
                    className="w-8 px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {item.id}
                  </th>
                  <td className="px-6 py-2">{item.description || "---"}</td>
                  <td className="px-6 py-2">
                    {item.streamingProvider?.name}
                  </td>
                  <td className="w-8 px-6 py-2">
                    {/* {item.profiles.length} */}
                    TODO
                  </td>
                  <td className="w-16 px-6 py-2">
                    <StatusBase status={item.status} />
                  </td>
                  <td className="px-6 py-2 flex gap-3 justify-end">
                    <div className="flex gap-2 justify-end">
                      <ButtonView iconSize="w-4" link={`${link}/${item.id}`} />
                      <ButtonEdit iconSize="w-4" link={`${link}/${item.id}/edit`} />
                      <ButtonDelete iconSize="w-4" trigger={() => openModalTrigger(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <ModalDelete content={content} action={deleteItem} openModal={openModal} setOpenModal={setOpenModal} />
          </table>
          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
          </>
        ) : (
          <p>No hay cuentas creadas</p>
        )}
      </div>
      {/* <ModalAccount
        title={titleModal}
        account={accountSelected}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
      <ModalInfo
        title={titleModal}
        account={accountSelected}
        openModal={openRemoveModal}
        setOpenModal={setOpenRemoveModal}
      /> */}
    </div>
  );
}
