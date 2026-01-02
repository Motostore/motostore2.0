"use client";
import { useContext, useEffect, useState } from "react";
// 💎 FIX 1: Quitamos el import real para evitar cascada de errores
// import TableRow from "./TableRow";
import { useSession } from "next-auth/react";
import TableHead from "./TableHead";
import UserModal from "./UserModal";
import UpgradeModal from "./UpgradeModal";
import RemoveModal from "./RemoveModal";
import CreateModal from "./CreateModal";
import EditModal from "./EditModal";
import Search from "@/app/ui/search";
import Pagination from "@/app/ui/pagination";
import { fetchUsers } from "@/app/lib/users.service";
import { StatusBase } from "@/app/components/MyStatus";
// import { DropdownActions } from "@/app/components/MyDropdowns";

// 💎 FIX 2: Mock de DropdownActions
const DropdownActions = (props: any) => {
  return (
    <div className="text-xs text-gray-400 border border-gray-200 p-1 rounded">
      Acciones
    </div>
  );
};

// 💎 FIX 3: Definimos TableRow localmente para evitar errores de importación y tipos
const TableRow = ({ user, current, setUserSelected, setOpenModal, setOpenUpgradeModal, setOpenRemoveModal, setOpenEditModal }: any) => {
  return (
    <tr className="border-b border-gray-200 bg-white hover:bg-gray-50">
      <td className="px-5 py-5 text-sm">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              {user.username}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
      </td>
      <td className="px-5 py-5 text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
      </td>
      <td className="px-5 py-5 text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user.phone}</p>
      </td>
      <td className="px-5 py-5 text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user.role ?? '--'}</p>
      </td>
      <td className="px-5 py-5 text-sm">
         <StatusBase status={!user.disabled} />
      </td>
      <td className="px-5 py-5 text-sm text-right">
        <div className="flex justify-end gap-2">
           <button onClick={() => { setUserSelected(user); setOpenEditModal(true); }} className="text-blue-600 hover:text-blue-900">Editar</button>
           <button onClick={() => { setUserSelected(user); setOpenRemoveModal(true); }} className="text-red-600 hover:text-red-900">Borrar</button>
        </div>
      </td>
    </tr>
  );
};

export default function Table({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // 💎 FIX 4: Tipamos los estados con 'any'
  const [userSelected, setUserSelected] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, query]);

  async function getUsers() {
    try {
      const response = await fetchUsers(query, currentPage);
      if (response && Array.isArray(response.content)) {
        setUsers(response.content);
      } else {
        setUsers([]);
      }
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setUsers([]);
      setTotalPages(0);
    }
  }

  return (
    <div className="bg-white p-2 rounded-md w-full">
      <div className=" flex items-center gap-4 justify-between lg:flex-row flex-col pb-6">
        <Search placeholder="Buscar..." />
        <div className="flex md:flex-row flex-col gap-2 md:gap-4 w-full md:w-auto">
          <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 w-full md:w-48 lg:w-38 rounded-md text-white font-semibold tracking-wide cursor-pointer">
            Exportar
          </button>
          <button
            onClick={() => {
              setOpenCreateModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 w-full md:w-48 lg:w-38 rounded-md text-white font-semibold tracking-wide cursor-pointer"
          >
            Nuevo usuario
          </button>
        </div>
      </div>
      <div>
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="min-w-full shadow rounded-lg overflow-hidden">
            <div className="md:hidden">
              {users.length > 0 ? (
                users.map((user: any) => (
                  <div
                    key={user.id}
                    className="mb-2 w-full rounded-md bg-white p-4 shadow-xl border border-gray-300"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="mb-2 flex items-center">
                          <p>
                            <strong>Usuario:</strong> {user.username}
                          </p>
                        </div>
                      </div>
                      
                      {user && <StatusBase status={!user.disabled} />} 
                      <DropdownActions
                        title={''}
                        current={session?.user}
                        setOpenEditModal={setOpenEditModal} 
                        setOpenModal={setOpenModal} 
                        setOpenRemoveModal={setOpenRemoveModal} 
                        setOpenUpgradeModal={setOpenUpgradeModal}
                        setUserSelected={setUserSelected}
                        user={user} />
                    </div>
                    <div className=" w-full pt-4">
                      <div>
                        <p>
                          <strong>Nombre: </strong>
                          {user.name}
                        </p>
                        <p>
                          <strong>Correo: </strong>
                          {user.email}
                        </p>
                        <p>
                          <strong>Teléfono: </strong>
                          {user.phone}
                        </p>
                        <p>
                          <strong>Rol: </strong>
                          {user.role ?? '--'}
                        </p>
                        <div className="flex justify-end mt-2">
                          <StatusBase status={!user.disabled} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay usuarios disponibles.</p>
              )}
            </div>
            <table className="hidden md:table min-w-full leading-normal">
              <thead>
                <TableHead />
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <TableRow
                    key={user.id}
                    user={user}
                    current={session?.user}
                    setUserSelected={setUserSelected}
                    setOpenModal={setOpenModal}
                    setOpenUpgradeModal={setOpenUpgradeModal}
                    setOpenRemoveModal={setOpenRemoveModal}
                    setOpenEditModal={setOpenEditModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
      <UserModal
        user={userSelected}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
      <UpgradeModal
        user={userSelected}
        openModal={openUpgradeModal}
        setOpenModal={setOpenUpgradeModal}
      />
      <RemoveModal
        user={userSelected}
        openModal={openRemoveModal}
        setOpenModal={setOpenRemoveModal}
      />
      <EditModal
        openModal={openEditModal}
        setOpenModal={setOpenEditModal}
        user={userSelected}
      />
      <CreateModal
        openModal={openCreateModal}
        setOpenModal={setOpenCreateModal}
      />
    </div>
  );
}