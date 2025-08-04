import { useEffect } from "react"
import ZelleForm from "../forms/ZelleForm"

export default function ZellePayment({service, setPaymentData, setOpenModal}) {

  const payload = {
    transaction: 'Zelle',
    zelleName: "William Amaro",
    zelleEmail: "Amaromelendezw@gmail.com"
  }

  useEffect(() => {
    setPaymentData(payload)
  }, [])

  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">
              Pago mediante Zelle
          </h5>
          <div>
            <p className="flex flex-col py-2 border-b-2 border-gray-700">
              <strong className="inline-block">Nombre:</strong>
              {payload.zelleName}
            </p>
            <p className="flex flex-col py-2 border-b-2 border-gray-700">
              <strong className="inline-block">Correo electrónico:</strong>
              {payload.zelleEmail}
            </p>
            <div className="flex justify-end mt-6">
              <p className="flex py-2 border-b-2 border-gray-700">
                <strong className="w-36 inline-block">Monto:</strong>
                {service?.price}$
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <h5 className="font-bold text-lg text-gray-600 mb-2">Datos de la transacción</h5>
        <ZelleForm amount={service?.price} paymentData={payload} setOpenModal={setOpenModal} />
      </div>
    </>
  )
};