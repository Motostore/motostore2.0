import { useEffect } from "react";
import WallyForm from "../forms/WallyForm";

// CORRECCIÓN: Agregamos los tipos ': any' para que pase el build
export default function WallyPayment({ 
  service, 
  setPaymentData, 
  setOpenModal 
}: { 
  service: any, 
  setPaymentData: any, 
  setOpenModal: any 
}) {
  const payload = {
    transaction: "Wally",
    wallyNumber: "+584124901442",
  };

  useEffect(() => {
    setPaymentData(payload);
  }, []);

  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">Pago mediante Wally</h5>
          <div>
            <p className="flex flex-col py-2 border-b-2 border-gray-700">
              <strong className="inline-block">Número telefónico:</strong>
              {payload.wallyNumber}
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
        <WallyForm amount={service?.price} paymentData={payload} setOpenModal={setOpenModal} />
      </div>
    </>
  );
}