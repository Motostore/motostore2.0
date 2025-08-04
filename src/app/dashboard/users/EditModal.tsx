
"use client";
import { Modal } from "flowbite-react";
import CreateForm from "./CreateForm";
import { LocationSelectProvider } from "@/app/Context/locationSelectContext";

export default function EditModal({openModal, setOpenModal, user}) {

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Editar usuario</Modal.Header>
        <Modal.Body>
          <LocationSelectProvider>
            <CreateForm setOpenModal={setOpenModal} user={user} textButton={'Editar'} />
          </LocationSelectProvider>
        </Modal.Body>
      </Modal>
    </>
  );
}
