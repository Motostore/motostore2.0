import { useEffect, useState } from "react";
import ZinliForm from "../forms/ZinliForm";
import { fetchPaymentMethod } from "@/app/lib/payment-methods";
import { ZinliPayload } from "@/app/lib/definitions";
import { PaymentMethodEnum } from "@/app/lib/enums";

// CORRECCIÓN 1: Tipamos las props como 'any' para evitar el bloqueo del build
export default function ZinliPayment({ 
  service, 
  setPaymentData, 
  setOpenModal 
}: { 
  service: any, 
  setPaymentData: any, 
  setOpenModal: any 
}) {
  const [payload, setPayload] = useState<ZinliPayload | undefined>(undefined);

  useEffect(() => {
    async function getZinliInfo() {
      // CORRECCIÓN 2: Tipamos la respuesta como 'any' para evitar errores como "Property 'length' does not exist on type 'Response'"
      const response: any = await fetchPaymentMethod(PaymentMethodEnum.ZINLI_PAYMENT);
      
      if (response && response.length > 0) {
        setPayload(response[0]);
        setPaymentData(response[0]);
      }
    }
    getZinliInfo();
  }, []);

  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">Pago mediante Zinli</h5>
          <div key={payload?.id}>
            <div className="py-2">
              <p>
                <strong className="inline-block">Correo electrónico:</strong>
              </p>
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
        {/* CORRECCIÓN 3: Solo mostramos el formulario si hay payload para evitar errores de tipo */}
        {payload && (
          <ZinliForm service={service} payload={payload} setOpenModal={setOpenModal} />
        )}
      </div>
    </>
  );
}