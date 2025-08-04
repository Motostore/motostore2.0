"use client";
import { useContext, useEffect, useState } from "react";
import TableRow from "./TableRow";
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
import { DropdownActions } from "@/app/components/MyDropdowns";

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
  const [userSelected, setUserSelected] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, [currentPage, query]);

  async function getUsers() {
    const response = await fetchUsers(query, currentPage);
    setUsers(response.content);
    setTotalPages(response.totalPages);
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
                users?.map((user) => (
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
                      {/* <StatusBase status={!user.disabled} /> */}
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
                        <div className="flex justify-end mt-2">
                          <StatusBase status={!user.disabled} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay Transacciones</p>
              )}
            </div>
            <table className="hidden md:table min-w-full leading-normal">
              <thead>
                <TableHead />
              </thead>
              <tbody>
                {users.map((user) => (
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
