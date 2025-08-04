"use client";
import { PencilIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { fetchProfiles } from "@/app/lib/streaming-profile";
import { useEffect, useState } from "react";
import { StatusProfile } from "@/app/components/MyStatus";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import { ContentModal } from "@/app/lib/definitions";
import {
  ButtonCreate,
  ButtonDelete,
  ButtonEdit,
  ButtonView,
} from "@/app/components/MyButtons";
import ModalDelete from "@/app/components/ModalDelete";
import { fetchDeleteProduct } from "@/app/lib/products.service";

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const profilePath = "streaming/profile";
  const link = "/dashboard/products/accounts/profiles/";

  const [openModal, setOpenModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [profileSelected, setProfileSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState<ContentModal>();

  useEffect(() => {
    getProfiles();
  }, [query, currentPage]);

  async function getProfiles() {
    const response = await fetchProfiles(query, currentPage);
    setItems(response.content);
    setTotalPages(response.totalPages);
  }

  async function deleteItem(id) {
    const response = await fetchDeleteProduct(id, profilePath);
    if (response.ok) {
      setOpenModal(false);
      getProfiles();
    } else {
      console.log("Ha ocurrido un error.");
    }
  }

  const openModalTrigger = (data) => {
    setContent({
      header: "Eliminar ítem",
      body: `¿Estás seguro que quieres eliminar el perfil ${data.id}?`,
      target: data.id,
      loading: "Cargando información...",
    });
    setOpenModal(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4 gap-4">
        <Search placeholder="Buscar..." />
        <ButtonCreate link={`${link}create`} text="Agregar" iconSize="w-6" />
      </div>

      <div className="relative overflow-x-auto">
        <div className="md:hidden">
          {items.length > 0 ? (
            items?.map((item) => (
              <div
                key={item.id}
                className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="flex items-center">
                      <p className="m-0">
                        <strong>Proveedor:</strong>{" "}
                        {item?.streamingAccount?.streamingProvider?.name ||
                          "---"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <ButtonView iconSize="w-4" link={`${link}${item.id}`} />
                    <ButtonEdit
                      iconSize="w-4"
                      link={`${link}${item.id}/edit`}
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
                      <strong>Nro. cuenta: </strong>
                      {item?.streamingAccount?.id}
                    </p>
                    <p>
                      <strong>Usuario: </strong>
                      {item.profileUser}
                    </p>
                    <p>
                      <strong>Clave: </strong>
                      {item.profileKey}
                    </p>
                    <div className="flex justify-end mt-2">
                      <StatusProfile
                        status={item.status}
                        busy={item.busy}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay perfiles</p>
          )}
        </div>
        {items.length > 0 ? (
          <>
            <table className="w-full hidden md:table text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="w-8 px-6 py-3">
                    Id
                  </th>
                  <th scope="col" className="w-8 px-6 py-3">
                    Nro. cuenta
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Proveedor
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Clave
                  </th>
                  <th scope="col" className="w-8 px-6 py-3">
                    Estado
                  </th>
                  <th scope="col" className="w-10 px-6 py-3 text-end">
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
                    <td className="w-8 px-6 py-2">
                      {item?.streamingAccount?.id}
                    </td>
                    <td className="px-6 py-2">
                      {item?.principal && (
                        <span className="bg-orange-500 text-white font-bold px-2 py-1 mr-2 rounded-lg">
                          matriz
                        </span>
                      )}
                      {item?.streamingAccount?.streamingProvider?.name || "---"}
                    </td>
                    <td className="px-6 py-2">{item?.profileUser}</td>
                    <td className="px-6 py-2">{item?.profileKey}</td>
                    <td className="w-8 px-6 py-2">
                      <StatusProfile status={item.status} busy={item.busy} />
                    </td>
                    <td className=" px-6 py-2 flex gap-3 justify-end">
                      <div className="flex gap-2 justify-end">
                        <ButtonView iconSize="w-4" link={`${link}${item.id}`} />
                        <ButtonEdit
                          iconSize="w-4"
                          link={`${link}${item.id}/edit`}
                        />
                        <ButtonDelete
                          iconSize="w-4"
                          trigger={() => openModalTrigger(item)}
                        />
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
          <p>No hay perfiles creados</p>
        )}
      </div>
    </div>
  );
}
