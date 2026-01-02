'use client';

import { useState, useEffect } from 'react';

// API base URL
const API = (process.env.NEXT_PUBLIC_API_FULL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

// Define el tipo BalanceDTO
type BalanceDTO = {
  balance: number;
  currency?: string; 
};

// 1. DEFINIR LAS PROPS QUE VIENEN DEL PADRE (PurchaseModal)
interface WalletPaymentProps {
  service: any; // Puedes cambiar 'any' por el tipo real de tu servicio si lo tienes
  setPaymentData: (data: any) => void;
  setOpenModal: (isOpen: boolean) => void;
}

// 2. RECIBIR LAS PROPS EN LA FUNCIÓN
export default function WalletPayment({ service, setPaymentData, setOpenModal }: WalletPaymentProps) {
  const [balance, setBalance] = useState<BalanceDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar saldo de la billetera
  useEffect(() => {
    const loadBalance = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API}/wallet/balance?userId=1`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('No se pudo obtener el saldo de tu billetera.');
        }

        const json = (await res.json()) as BalanceDTO;
        setBalance(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al cargar el saldo de la billetera.');
        }
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, []);

  const currency = balance?.currency || 'USD';
  const saldo = balance ? `${balance.balance.toFixed(2)} ${currency}` : '—';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-lg text-gray-700">Pago con Billetera</h3>
      
      {/* Mostrar información del servicio a pagar (opcional, usando la prop service) */}
      <div className="text-sm text-gray-500">
        Vas a pagar: <span className="font-bold">{service?.price ?? 0}$</span>
      </div>

      <div className="p-4 bg-gray-50 border rounded-lg">
        <h4 className="font-semibold text-gray-600 mb-2">Saldo disponible:</h4>
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <p className="text-2xl font-bold text-green-600">{saldo}</p>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Aquí podrías agregar el botón de "Pagar" usando setPaymentData para completar la compra */}
    </div>
  );
}






