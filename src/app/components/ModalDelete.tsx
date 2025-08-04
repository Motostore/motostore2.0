
"use client";

import { fetchDeleteProduct } from "@/app/lib/products.service";
import { Button, Modal } from "flowbite-react";

export default function ModalDelete({content, action, openModal, setOpenModal}) {
  

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>{content?.header}</Modal.Header>
        <Modal.Body>
            {
              content?.target ? 
              (
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {content.body}
                  </p>
                </div>
              )
              : 
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {content?.loading}
                </p>
              </div>
            }
        </Modal.Body>
        <Modal.Footer className="justify-end">
          <Button className="bg-red-400 hover:bg-red-500 enabled:hover:bg-red-500" onClick={() => action(content?.target)}>Eliminar</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
