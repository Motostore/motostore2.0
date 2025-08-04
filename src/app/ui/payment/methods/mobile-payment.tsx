import { useEffect, useState } from "react"
import MobileForm from "../forms/MobileForm";

export default function MobilePayment({service, setPaymentData, setOpenModal}) {

  const mercantil = {
    transaction: 'Pago móvil',
    bankName: "Mercantil",
    clientDni: "20920554",
    clientPhone: "04245689041",
  }

  const banesco = {
    transaction: 'Pago móvil',
    bankName: "Banesco (0134)",
    clientDni: "20920554",
    clientPhone: "04124901442",
  }

  const [payload, setPayload] = useState(mercantil);

  useEffect(() => {
    setPaymentData(payload)
  }, [])

  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">
              Pago mediante pago móvil
          </h5>
          <div className="flex flex-col items-center justify-center p-2 border-2 border-green-300 rounded-lg">
            <h5 className="mb-2 text-gray-700 font-bold">Bancos disponibles</h5>
            <div className="flex gap-4">
              <button onClick={() => setPayload(mercantil)} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-800 text-white font-bold">Mercantil</button>
              <button onClick={() => setPayload(banesco)} className="py-2 px-4 rounded-lg bg-green-400 hover:bg-green-600 text-white font-bold">Banesco</button>
            </div>
          </div>
        <div>
          <p className="flex py-2 border-b-2 border-gray-700">
            <strong className="w-36 inline-block">Banco:</strong>
            {payload.bankName}
          </p>
          <p className="flex py-2 border-b-2 border-gray-700">
            <strong className="w-36 inline-block">Cédula:</strong>
            {payload.clientDni}
          </p>
          <p className="flex py-2 border-b-2 border-gray-700">
            <strong className="w-36 inline-block">Teléfono:</strong>
            {payload.clientPhone}
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
        <MobileForm amount={service?.price} paymentData={payload} setOpenModal={setOpenModal} />
      </div>
    </>
  )
};