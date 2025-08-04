
"use client";

import { UserContext } from "@/app/Context/usersContext";
import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useContext } from "react";

export default function UpgradeModal({user, openModal, setOpenModal}) {

  const { getUsers } = useContext(UserContext);
  const {data: session} = useSession();
  
  async function upgradeUser(user) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users/upgrade/${user?.id}`, {
      method: 'PUT',
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
        <Modal.Header>Ascender usuario</Modal.Header>
        <Modal.Body>
            {
              user ? 
              (
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    ¿Estás seguro que quieres ascender al usuario <strong>{user.username}</strong> a Distribuidor?
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
          <Button className="bg-orange-500 hover:bg-orange-500 enabled:hover:bg-orange-600" onClick={() => upgradeUser(user)}>Ascender</Button>
          <Button color="red" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
