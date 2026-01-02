"use client";

import { Modal } from "flowbite-react";
import {
  WalletIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

import BankTransfer from "../ui/payment/methods/bank-transfer";
import MobilePayment from "../ui/payment/methods/mobile-payment";
import ZinliPayment from "../ui/payment/methods/zinli-payment";
import ZellePayment from "../ui/payment/methods/zelle-payment";
import BinancePayment from "../ui/payment/methods/binance-payment";
import WallyPayment from "../ui/payment/methods/wally-payment";
import WalletPayment from "../ui/payment/methods/wallet-payment";

import { PaymentMethodEnum } from "../lib/enums";
import { PurchaseModalProps } from "../types/component-props.interface";

export default function PurchaseModal({
  service,
  openModal,
  setOpenModal
}: PurchaseModalProps) {
  const [method, setMethod] = useState(PaymentMethodEnum.BANK_TRANSFER);
  const [paymentData, setPaymentData] = useState<any>();

  // SOLUCIÓN: Creamos una referencia al Modal con tipo 'any' para evitar el error de TS
  const ModalComponent = Modal as any;

  const paymentMethodComponents: Record<string, (s: any) => React.JSX.Element> = {
    BANK_TRANSFER: (s: any) => (
      <BankTransfer service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    MOBILE_PAYMENT: (s: any) => (
      <MobilePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    ZINLI_PAYMENT: (s: any) => (
      <ZinliPayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    ZELLE_PAYMENT: (s: any) => (
      <ZellePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    BINANCE_PAYMENT: (s: any) => (
      <BinancePayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    WALLY_PAYMENT: (s: any) => (
      <WallyPayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    WALLET_PAYMENT: (s: any) => (
      <WalletPayment service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
    DEFAULT: (s: any) => (
      <BankTransfer service={s} setPaymentData={setPaymentData} setOpenModal={setOpenModal} />
    ),
  };

  return (
    // Usamos ModalComponent en lugar de Modal
    <ModalComponent show={openModal} size={"7xl"} onClose={() => setOpenModal(false)}>
      <ModalComponent.Header className="text-gray-600">Contratar servicio</ModalComponent.Header>
      <ModalComponent.Body>
        <div>
          <h5 className="font-bold text-center text-xl text-gray-600 mb-6">
            Contratación del servicio {service?.name}, precio {service?.price}$
          </h5>
          <div>
            <div className="grid grid-cols-5 gap-6">
              {/* Columna izquierda: botones de métodos */}
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

                <button
                  onClick={() => setMethod(PaymentMethodEnum.WALLET_PAYMENT)}
                  type="button"
                  className={`w-48 text-white font-bold ${
                    method === PaymentMethodEnum.WALLET_PAYMENT ? "bg-green-600" : "bg-green-400"
                  } hover:bg-green-600 px-4 py-1 rounded-lg cursor-pointer`}
                >
                  <div className="flex gap-4 items-center">
                    <WalletIcon className="w-10" />
                    <span className="text-left">Billetera virtual</span>
                  </div>
                </button>
              </div>

              {/* Columna derecha: contenido del método seleccionado */}
              {(paymentMethodComponents[method] || paymentMethodComponents["DEFAULT"])(service)}
            </div>
          </div>
        </div>
      </ModalComponent.Body>
    </ModalComponent>
  );
}


