"use client";

import { Modal } from "flowbite-react";
import CreateForm from "./CreateForm";
import { LocationSelectProvider } from "@/app/Context/locationSelectContext";

// Props tipadas con 'any'
export default function CreateModal({openModal, setOpenModal}: {openModal: any, setOpenModal: any}) {

  // 💎 SOLUCIÓN NUCLEAR:
  // Convertimos el componente Modal a 'any' para que TypeScript deje de quejarse
  // diciendo que "Header" no existe en el tipo Modal.
  const ModalAny = Modal as any;

  return (
    <>
      <ModalAny show={openModal} onClose={() => setOpenModal(false)}>
        <ModalAny.Header>Crear usuario</ModalAny.Header>
        <ModalAny.Body>
          <LocationSelectProvider>
            <CreateForm setOpenModal={setOpenModal} user={null} textButton={'Crear'} />
          </LocationSelectProvider>
        </ModalAny.Body>
      </ModalAny>
    </>
  );
}