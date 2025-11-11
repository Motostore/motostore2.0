"use client";

import { Modal } from "flowbite-react";
import {
  WalletIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import BankTransfer from "../ui/payment/methods/bank-transfer";
import MobilePayment from "../ui/payment/methods/mobile-payment";
import ZinliPayment from "../ui/payment/methods/zinli-payment";
import ZellePayment from "../ui/payment/methods/zelle-payment";
import BinancePayment from "../ui/payment/methods/binance-payment";
import WallyPayment from "../ui/payment/methods/wally-payment";
import { PaymentMethodEnum } from "../lib/enums";

export default function PurchaseModal({ service, openModal, setOpenModal }) {
  // Empezar con un método válido
  const [method, setMethod] = useState(PaymentMethodEnum.BANK_TRANSFER);
  const [paymentData, setPaymentData] = useState();

  const paymentMethodComponents = {
    BANK_TRANSFER: (s) => (
      <BankTransfer service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    MOBILE_PAYMENT: (s) => (
      <MobilePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    ZINLI_PAYMENT: (s) => (
      <ZinliPayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    ZELLE_PAYMENT: (s) => (
      <ZellePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    BINANCE_PAYMENT: (s) => (
      <BinancePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    WALLY_PAYMENT: (s) => (
      <WallyPayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    DEFAULT: (s) => (
      <BankTransfer service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
  };

  return (
    <>
      <Modal show={openModal} size={"7xl"} onClose={() => setOpenModal(false)}>
        <Modal.Header className="text-gray-600">Contratar servicio</Modal.Header>
        <Modal.Body>
          <div>
            <h5 className="font-bold text-center text-xl text-gray-600 mb-6">
              Contratación del servicio {service?.name}, precio {service?.price}$
            </h5>
            <div>
              <div className="grid grid-cols-5 gap-6">
                <div className="flex flex-col gap-2">
                  <h5 className="font-bold text-lg text-gray-600 mb-2">Métodos de pago</h5>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.BANK_TRANSFER)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.BANK_TRANSFER ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <BanknotesIcon className="w-14" />
                      <span className="text-left">Transferencia bancaria</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.MOBILE_PAYMENT)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.MOBILE_PAYMENT ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <DevicePhoneMobileIcon className="w-10" />
                      <span className="text-left">Pago móvil</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.ZINLI_PAYMENT)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.ZINLI_PAYMENT ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <CurrencyDollarIcon className="w-10" />
                      <span className="text-left">Zinli</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.WALLY_PAYMENT)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.WALLY_PAYMENT ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <CurrencyDollarIcon className="w-10" />
                      <span className="text-left">Wally</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.ZELLE_PAYMENT)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.ZELLE_PAYMENT ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <CurrencyDollarIcon className="w-10" />
                      <span className="text-left">Zelle</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod(PaymentMethodEnum.BINANCE_PAYMENT)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.BINANCE_PAYMENT ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <CurrencyDollarIcon className="w-10" />
                      <span className="text-left">Binance</span>
                    </div>
                  </button>

                  {/* Billetera virtual apunta a transferencia por ahora */}
                  <button
                    onClick={() => setMethod(PaymentMethodEnum.BANK_TRANSFER)}
                    type="button"
                    className={`w-48 text-white font-bold ${
                      method === PaymentMethodEnum.BANK_TRANSFER ? "bg-green-600" : "bg-green-400"
                    } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                  >
                    <div className="flex gap-4 items-center">
                      <WalletIcon className="w-10" />
                      <span className="text-left">Billetera virtual</span>
                    </div>
                  </button>
                </div>

                {
                  (paymentMethodComponents[method] || paymentMethodComponents["DEFAULT"])(service)
                }
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
