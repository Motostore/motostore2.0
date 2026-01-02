"use client";

import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { ProductContext } from "@/app/Context/productsContext";
import { useContext } from "react";
import VerifyForm from "../forms/verify-form";
import { TransactionEnum } from "@/app/lib/enums";

// CORRECCIÓN: Casteamos Modal a 'any' para que TypeScript no se queje 
// de que le faltan las propiedades .Header, .Body y .Footer
const ModalAny = Modal as any;

export default function ModalProcessed({
  openModal, 
  setOpenModal, 
  transaction
}: {
  openModal: any,
  setOpenModal: any,
  transaction: any
}) {

  return (
    <>
      <ModalAny show={openModal} onClose={() => setOpenModal(false)}>
        <ModalAny.Header>Aprobar solicitud</ModalAny.Header> {/* Corregí el título también, decía Rechazar */}
        <ModalAny.Body>
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
        </ModalAny.Body>
        <ModalAny.Footer className="flex flex-col md:flex-row justify-between gap-2">
          {
            transaction ? <VerifyForm transactionStatus={TransactionEnum.PROCESSED} clientId={transaction.clientId} transactionId={transaction.id} setOpenModal={setOpenModal} />
            :null
          }
        </ModalAny.Footer>
      </ModalAny>
    </>
  );
}
