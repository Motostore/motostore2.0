import { useEffect, useState } from "react"
import ZinliForm from "../forms/ZinliForm"
import { fetchPaymentMethod } from "@/app/lib/payment-methods"
import { ZinliPayload } from "@/app/lib/definitions";
import { PaymentMethodEnum } from "@/app/lib/enums";

export default function ZinliPayment({service, setPaymentData, setOpenModal}) {

  // const payload = {
  //   transaction: 'Zinli',
  //   zinliEmail: "chrystiantovar20@gmail.com"
  // }

  const [payload, setPayload] = useState<ZinliPayload>();

  useEffect(() => {
    async function getZinliInfo() {
      const response = await fetchPaymentMethod(PaymentMethodEnum.ZINLI_PAYMENT);
      if (response  && response.length > 0) {
        setPayload(response[0])
        setPaymentData(response[0])
      }
    }
    getZinliInfo()
  }, [])
  
  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">
              Pago mediante Zinli
          </h5>
          <div key={payload?.id}>
            <div className=" py-2">
              <p><strong className=" inline-block">Correo electrónico:</strong></p>
              <p>{payload?.ownerEmail}</p>
            </div>
            <div className="flex justify-end mt-6">
              <p className="flex py-2 border-b-2 border-gray-300">
                <strong className="w-36 inline-block">Monto:</strong>
                {service?.price}$
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <h5 className="font-bold text-lg text-gray-600 mb-2">Datos de la transacción</h5>
        <ZinliForm service={service} payload={payload} setOpenModal={setOpenModal}/>
      </div>
    </>
  )
};