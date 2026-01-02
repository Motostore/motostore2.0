"use client";

import { UserContext } from "@/app/Context/usersContext";
import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useContext } from "react";

// 💎 FIX 1: Tipamos props con 'any'
export default function UpgradeModal({user, openModal, setOpenModal}: {user: any, openModal: any, setOpenModal: any}) {

  // 💎 FIX 2: Casteo de contexto y truco para Modal
  const { getUsers } = useContext(UserContext) as any;
  const {data: session} = useSession();
  const ModalAny = Modal as any;
  
  // 💎 FIX 3: Tipamos parámetro user
  async function upgradeUser(user: any) {
    // 💎 FIX 4: Acceso seguro al token
    const token = (session?.user as any)?.token;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users/upgrade/${user?.id}`, {
      method: 'PUT',
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
        <ModalAny.Header>Ascender usuario</ModalAny.Header>
        <ModalAny.Body>
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
        </ModalAny.Body>
        <ModalAny.Footer className="justify-end">
          <Button className="bg-orange-500 hover:bg-orange-500 enabled:hover:bg-orange-600" onClick={() => upgradeUser(user)}>Ascender</Button>
          <Button color="red" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </ModalAny.Footer>
      </ModalAny>
    </>
  );
}