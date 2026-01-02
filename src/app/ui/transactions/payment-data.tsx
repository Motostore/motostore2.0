'use client'

import { PaymentMethodEnum } from "@/app/lib/enums";
import { fetchPaymentMethodById } from "@/app/lib/payment-methods";
import { useEffect, useState } from "react";
import BankTransferData from "./payment/data/bank-transfer-data";
import ZinliData from "./payment/data/zinli-data";
import MobileData from "./payment/data/mobile-data";
import ZelleData from "./payment/data/zelle-data";
import BinanceData from "./payment/data/binance-data";
import WallyData from "./payment/data/wally-data";

export default function PaymentData({ id }: { id: string }) {

  // CORRECCIÓN 1: Tipamos el estado como 'any' para evitar errores al leer propiedades
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    getPayment(id)
  }, [])

  // CORRECCIÓN 2: Tipamos el parámetro id como 'any'
  async function getPayment(id: any) {
    const response = await fetchPaymentMethodById(id);
    setPayment(response)
  }

  return (
    <section className="shadow-xl p-4 bg-white rounded-lg">
      {
        payment 
        ?
        <>
        <h5 className="px-2 text-xl text-gray-800">Datos del método de pago</h5>
        <hr className="border-2 rounded-full mt-4 w-full mx-auto px-2" />
        <div className="relative overflow-x-auto text-sm">
          {
            payment ?
            <div className="flex justify-between border-b px-2 py-4">
              <p className="font-bold text-gray-600 mb-0 ">Método de pago</p>
              <p className="mb-0">{ payment.name }</p>
            </div>
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.BANK_TRANSFER
            ? <BankTransferData payment={payment} />
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.ZINLI_PAYMENT
            ? <ZinliData payment={payment} />
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.MOBILE_PAYMENT
            ? <MobileData payment={payment} />
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.ZELLE_PAYMENT
            ? <ZelleData payment={payment} />
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.BINANCE_PAYMENT
            ? <BinanceData payment={payment} />
            : null
          }
          {
            payment && payment.type === PaymentMethodEnum.WALLY_PAYMENT
            ? <WallyData payment={payment} />
            : null
          }
        </div>
        </>
        :
        (<p>Cargando...</p>)
      }
      </section>
  );
}








