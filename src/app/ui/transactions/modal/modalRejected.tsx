"use client";

import { Button, Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import { ProductContext } from "@/app/Context/productsContext";
import { useContext } from "react";
import VerifyForm from "../forms/verify-form";
import { TransactionEnum } from "@/app/lib/enums";

// CORRECCIÓN 1: Casteamos Modal a 'any' para evitar conflictos de tipos con .Header/.Body
const ModalAny = Modal as any;

// CORRECCIÓN 2: Definimos los tipos de las props como 'any'
export default function ModalRejected({
  openModal,
  setOpenModal,
  transaction,
}: {
  openModal: any,
  setOpenModal: any,
  transaction: any
}) {
  return (
    <>
      <ModalAny show={openModal} onClose={() => setOpenModal(false)}>
        <ModalAny.Header>Rechazar solicitud</ModalAny.Header>
        <ModalAny.Body>
          {transaction ? (
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                ¿Estás seguro que quieres rechazar la solicitud{" "}
                <strong>{transaction.id}</strong>, del cliente{" "}
                <strong>{transaction.clientName}</strong>?
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Cargando información...
              </p>
            </div>
          )}
        </ModalAny.Body>
        <ModalAny.Footer className="flex flex-col md:flex-row justify-between gap-2">
          {transaction ? (
            <VerifyForm
              transactionStatus={TransactionEnum.REJECTED}
              clientId={transaction.clientId}
              transactionId={transaction.id}
              setOpenModal={setOpenModal}
            />
          ) : null}
        </ModalAny.Footer>
      </ModalAny>
    </>
  );
}
