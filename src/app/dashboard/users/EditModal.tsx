"use client";
import { Modal } from "flowbite-react";
import CreateForm from "./CreateForm";
import { LocationSelectProvider } from "@/app/Context/locationSelectContext";

// 💎 FIX 1: Tipamos las props con 'any'
export default function EditModal({openModal, setOpenModal, user}: {openModal: any, setOpenModal: any, user: any}) {

  // 💎 FIX 2: Truco para evitar error de tipos en Modal.Header/Body
  const ModalAny = Modal as any;

  return (
    <>
      <ModalAny show={openModal} onClose={() => setOpenModal(false)}>
        <ModalAny.Header>Editar usuario</ModalAny.Header>
        <ModalAny.Body>
          <LocationSelectProvider>
            <CreateForm setOpenModal={setOpenModal} user={user} textButton={'Editar'} />
          </LocationSelectProvider>
        </ModalAny.Body>
      </ModalAny>
    </>
  );
}