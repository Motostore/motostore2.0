'use client';

import { useEffect, useState } from "react";
import { fetchDeleteProduct, fetchPagedProductsByType, fetchProductsByType } from "@/app/lib/products.service";
import { formatCurrency, pluralizeMonth } from "@/app/lib/utils";
import ModalDelete from "../../../components/ModalDelete";
import { ContentModal } from "@/app/lib/definitions";
import { ButtonCreate, ButtonDelete, ButtonEdit, ButtonView } from "@/app/components/MyButtons";
import { BadgeStatus } from "@/app/components/MyBadgets";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import { StatusBase } from "@/app/components/MyStatus";


export default function Table(
  {
    query,
    currentPage,
  }: {
    query: string;
    currentPage: number;
  }
) {
  const productPath = 'license/provider'
  const link = '/dashboard/products/licenses';

  const [openModal, setOpenModal] = useState(false);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState<ContentModal>();

  useEffect(() => {
    getItems();
  }, [currentPage, query]);

  async function getItems() {
    const response = await fetchPagedProductsByType(query, currentPage, productPath);
    setItems(response.content);
    setTotalPages(response.totalPages);
  }

  async function deleteItem(id) {
    const response = await fetchDeleteProduct(id, productPath)
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
      body: `¿Estás seguro que quieres eliminar el ítem ${data.name}?`,
      target: data.id,
      loading: "Cargando información..."
    })
    setOpenModal(true);
  }

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
                        <strong>Licencia:</strong> {item.name}
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
                      { formatCurrency(item.price)}
                    </p>
                    <p>
                      <strong>Duración: </strong>
                      { pluralizeMonth(item.duration)}
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
      {
      items.length > 0 
      ?
      <>
        <table className="hidden md:table w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3">
                Precio
              </th>
              <th scope="col" className="px-6 py-3">
                Duración
              </th>
              <th scope="col" className="px-6 py-3">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 flex justify-end">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
          {
            items.map((item) => (
            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4">
              {item?.name || '---'}
              
              </td>
              <td className="px-6 py-4">
              {item?.description || '---'}
              </td>
              <td className="px-6 py-4">
              {formatCurrency(item?.price) || '---'}
              </td>
              <td className="px-6 py-4">
              {pluralizeMonth(item?.duration) || '---'}
              </td>
              <td className="px-6 py-4">
              <StatusBase status={item.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  <ButtonView link={`${link}/${item.id}`} />
                  <ButtonEdit link={`${link}/${item.id}/edit`} />
                  <ButtonDelete trigger={() => openModalTrigger(item)} />
                </div>
              </td>
            </tr>
            ))
          }
          </tbody>
          <ModalDelete content={content} action={deleteItem} openModal={openModal} setOpenModal={setOpenModal} />
        </table>
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </>
      :
      <p>Aun no tienes licencias</p>
      }
      </div>
    </div>
  );
}