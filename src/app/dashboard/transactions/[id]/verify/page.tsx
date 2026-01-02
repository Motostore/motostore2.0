'use client';

import { fetchTransactionById } from "@/app/lib/transactions.service";
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import ClientData from "@/app/ui/transactions/client-data";
import PaymentData from "@/app/ui/transactions/payment-data";
import TransactionData from "@/app/ui/transactions/transactions-data";
import { HiCheck, HiMinus } from "react-icons/hi";
import { useEffect, useState } from "react";
import { TransactionEnum } from "@/app/lib/enums";
import ModalRejected from "@/app/ui/transactions/modal/modalRejected";
import ModalProcessed from "@/app/ui/transactions/modal/modalProcessed ";
import HeaderProfile from "@/app/ui/dashboard/header-profile";

export default function Page({ params }: { params: { id: string } }) {
  
  const id = params.id;

  // 💎 FIX 1: Usamos <any> para evitar conflictos de tipos con null
  const [transaction, setTransaction] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openProcessedModal, setOpenProcessedModal] = useState(false);

  useEffect(() => {
    getTransaction(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 💎 FIX 2: Tipamos el argumento 'id' como 'any'
  async function getTransaction(id: any) {
    try {
      const response = await fetchTransactionById(id);
      if (response) {
        setTransaction(response);
        
        // 💎 FIX 3: Protección para JSON.parse
        if (response.verification) {
            try {
                const parsed = typeof response.verification === 'string'
                    ? JSON.parse(response.verification)
                    : response.verification;
                setVerification(parsed);
            } catch (e) {
                console.error("Error parsing verification JSON", e);
                setVerification(null);
            }
        }
      }
    } catch (error) {
      console.error("Error fetching transaction", error);
    }
  }

  return (
    <main>
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Transacciones', href: '/dashboard/transactions' },
              {
                label: 'Verificar transacción',
                href: `/dashboard/transactions/${id}/verify`,
                active: true,
              },
            ]}
          />
          <div className="flex items-start md:items-end flex-col mt-4 md:mt-0">
              <HeaderProfile />
          </div>
      </div>
      <hr className='w-full h-1 bg-gray-200 mx-auto my-5' />
      
      {
        transaction 
        ? 
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <TransactionData transaction={transaction} />
              {/* Protección extra por si paymentId no existe */}
              {transaction.paymentId && <PaymentData id={transaction.paymentId} />}
              <ClientData paymentId={transaction.paymentId} verification={verification} />
            
          </div>
          {
            transaction.status === TransactionEnum.PENDING
            ?
            <div className="mt-4 flex flex-col md:flex-row justify-end gap-4">
              <button
              onClick={() => {
                setOpenRejectModal(true)
              }}  
              className="text-lg bg-red-400 hover:bg-red-500 text-white px-4 py-3 rounded-lg w-full md:w-48 flex gap-2 justify-center items-center">
                <span>
                Rechazar
                </span>
                <HiMinus />
              </button>
              <button 
              onClick={() => {
                setOpenProcessedModal(true)
              }}  
              className="text-lg bg-green-400 hover:bg-green-500 text-white px-4 py-3 rounded-lg w-full md:w-48 flex gap-2 justify-center items-center">
                <span>
                  Aprobar
                </span>
                <HiCheck />
              </button>
            </div>
            :
            null
          }
          {
            transaction.status === TransactionEnum.REJECTED
            ? <div className="w-full p-4 text-center">
              <span className="text-xl text-red-600 font-bold">Solicitud rechazada</span>
            </div>
            : null
          }
          {
            transaction.status === TransactionEnum.PROCESSED
            ? <div className="w-full p-4 text-center">
              <span className="text-xl text-green-600 font-bold">Solicitud aprobada</span>
            </div>
            : null
          }
        </>
        :
        null
      }
      <ModalRejected openModal={openRejectModal} setOpenModal={setOpenRejectModal} transaction={transaction} />
      <ModalProcessed openModal={openProcessedModal} setOpenModal={setOpenProcessedModal} transaction={transaction} />
    </main>
  )
}