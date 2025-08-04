import { useEffect } from "react"
import TransferForm from "../forms/TransferForm"

export default function BankTransfer({service, setPaymentData, setOpenModal}) {

  const payload = {
    transaction: 'Transferencia bancaria',
    bankName: "Banesco Banco Universal",
    accountType: "Cuenta Corriente (VES)",
    accountNumber: "0134-0408-91-4081050840",
    clientDni: "V-20920554",
    clientName: "CHRYSTIAN GERMAIN TOVAR TOVAR",
  }
  
  useEffect(() => {
    setPaymentData(payload[0])
  }, [])
  
  console.log(payload)  
  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
        <h5 className="font-bold text-lg text-gray-600 mb-2">
            Pago mediante transferencia bancaria
        </h5>
          <div>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Banco:</strong>
              {payload.bankName}
            </p>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Tipo de cuenta:</strong>
              {payload.accountType}
            </p>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Cuenta:</strong>
              {payload.accountNumber}
            </p>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Cédula:</strong>
              {payload.clientDni}
            </p>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Nombre:</strong>
              {payload.clientName}
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
        <TransferForm amount={service?.price} paymentData={payload} setOpenModal={setOpenModal} />
      </div>
    </>
  )
};