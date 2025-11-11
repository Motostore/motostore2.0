import { useEffect } from "react";
import BinanceForm from "../forms/BinanceForm";

export default function BinancePayment({ service, setPaymentData, setOpenModal }) {
  const payload = {
    transaction: "Binance",
    binancePay: "207609666",
  };

  useEffect(() => {
    setPaymentData(payload);
  }, []);

  return (
    <>
      <div className="col-span-2 flex flex-col justify-between border-r-2 border-gray-300 pr-6">
        <div>
          <h5 className="font-bold text-lg text-gray-600 mb-2">Pago mediante Binance</h5>
          <div>
            <p className="flex py-2 border-b-2 border-gray-700">
              <strong className="w-36 inline-block">Binance Pay:</strong>
              {payload.binancePay}
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
        <BinanceForm amount={service?.price} paymentData={payload} setOpenModal={setOpenModal} />
      </div>
    </>
  );
}
