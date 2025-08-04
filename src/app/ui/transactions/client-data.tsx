'use client'

import { PaymentMethodEnum } from "@/app/lib/enums";
import { fetchPaymentMethodById } from "@/app/lib/payment-methods";
import { useEffect, useState } from "react";
import ZinliVerify from "./payment/verification/zinly-verify";

export default function ClientData({ paymentId, verification }: { paymentId: any, verification: any }) {

  const [payment, setPayment] = useState(null);

  useEffect(() => {
    getPayment(paymentId)
  }, [])

  async function getPayment(id) {
    const response = await fetchPaymentMethodById(id);
    setPayment(response)
  }

  return (
    <section className="shadow-xl p-4 bg-white rounded-lg">
      {
        payment 
        ?
        <>
        <h5 className="px-2 text-xl text-gray-800">Datos del cliente</h5>
        <hr className="border-2 rounded-full mt-4 w-full mx-auto px-2" />
        <div className="relative overflow-x-auto">
              {/* {
                payment && payment.type === PaymentMethodEnum.BANK_TRANSFER
                ? <BankTransferVerify payment={payment} />
                : null
              } */}
              {
                payment && payment.type === PaymentMethodEnum.ZINLI_PAYMENT
                ? <ZinliVerify verification={verification} />
                : null
              }
              {/* {
                payment && payment.type === PaymentMethodEnum.MOBILE_PAYMENT
                ? <MobileVerify payment={payment} />
                : null
              }
              {
                payment && payment.type === PaymentMethodEnum.ZELLE_PAYMENT
                ? <ZelleVerify payment={payment} />
                : null
              }
              {
                payment && payment.type === PaymentMethodEnum.BINANCE_PAYMENT
                ? <BinanceVerify payment={payment} />
                : null
              }
              {
                payment && payment.type === PaymentMethodEnum.WALLY_PAYMENT
                ? <WallyVerify payment={payment} />
                : null
              } */}
        </div>
        </>
        :
        (<p>Cargando...</p>)
      }
      </section>
  );
}








