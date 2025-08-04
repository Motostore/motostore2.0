
"use client";

import { Modal } from "flowbite-react";
import CreateForm from "./CreateForm";
import { LocationSelectProvider } from "@/app/Context/locationSelectContext";

export default function CreateModal({openModal, setOpenModal}) {

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Crear usuario</Modal.Header>
        <Modal.Body>
          <LocationSelectProvider>
            <CreateForm setOpenModal={setOpenModal} user={null} textButton={'Crear'} />
          </LocationSelectProvider>
        </Modal.Body>
      </Modal>
    </>
  );
}
