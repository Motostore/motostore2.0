
"use client";

import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { ProductContext } from "@/app/Context/productsContext";
import { useContext } from "react";
import VerifyForm from "../forms/verify-form";
import { TransactionEnum } from "@/app/lib/enums";

export default function ModalProcessed({openModal, setOpenModal, transaction}) {

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Rechazar solicitud</Modal.Header>
        <Modal.Body>
            {
              transaction ? 
              (
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    ¿Estás seguro que quieres aprobar la solicitud <strong>{transaction.id}, del cliente {transaction.clientName}</strong>?
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
        <Modal.Footer className="flex flex-col md:flex-row justify-between gap-2">
          {
            transaction ? <VerifyForm transactionStatus={TransactionEnum.PROCESSED} clientId={transaction.clientId} transactionId={transaction.id} setOpenModal={setOpenModal} />
            :null
          }
        </Modal.Footer>
      </Modal>
    </>
  );
}
