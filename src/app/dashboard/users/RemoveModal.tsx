
"use client";

import { UserContext } from "@/app/Context/usersContext";
import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useContext } from "react";

export default function RemoveModal({user, openModal, setOpenModal}) {

  const { getUsers } = useContext(UserContext);
  const {data: session} = useSession();
  
  async function removeUser(user) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users/${user?.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });

    if (response.ok) {
      getUsers();
      setOpenModal(false)
    }
  }

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Eliminar usuario</Modal.Header>
        <Modal.Body>
            {
              user ? 
              (
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    ¿Estás seguro que quieres eliminar el usuario <strong>{user.username}</strong>?
                  </p>
                </div>
              )
              : 
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Cargando información...
                </p>
              </div>
            }
        </Modal.Body>
        <Modal.Footer className="justify-end">
          <Button className="bg-red-400 hover:bg-red-500 enabled:hover:bg-red-500" onClick={() => removeUser(user)}>Eliminar</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
