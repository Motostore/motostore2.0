"use client";

import { UserContext } from "@/app/Context/usersContext";
import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useContext } from "react";

// 💎 FIX 1: Tipamos las props con 'any'
export default function RemoveModal({user, openModal, setOpenModal}: {user: any, openModal: any, setOpenModal: any}) {

  // 💎 FIX 2: Casteo de contexto para evitar undefined
  const { getUsers } = useContext(UserContext) as any;
  const {data: session} = useSession();
  
  // 💎 FIX 3: Truco para evitar error de tipos en Modal de Flowbite
  const ModalAny = Modal as any;
  
  // 💎 FIX 4: Tipamos el argumento user
  async function removeUser(user: any) {
    // Acceso seguro al token
    const token = (session?.user as any)?.token;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users/${user?.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      getUsers();
      setOpenModal(false)
    }
  }

  return (
    <>
      <ModalAny show={openModal} onClose={() => setOpenModal(false)}>
        <ModalAny.Header>Eliminar usuario</ModalAny.Header>
        <ModalAny.Body>
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
        </ModalAny.Body>
        <ModalAny.Footer className="justify-end">
          <Button className="bg-red-400 hover:bg-red-500 enabled:hover:bg-red-500" onClick={() => removeUser(user)}>Eliminar</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </ModalAny.Footer>
      </ModalAny>
    </>
  );
}