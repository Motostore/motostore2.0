'use client';

import { useState } from 'react';

export default function CalculadoraPaypal() {
  const [commissionPercent, setCommissionPercent] = useState(5.4);
  const [fixedFee, setFixedFee] = useState(0.3);
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');

  const calculateNet = () => {
    const gross = parseFloat(amount);
    if (isNaN(gross)) return;

    const net = gross - (gross * (commissionPercent / 100)) - fixedFee;
    setResult(`Recibirás: $${net.toFixed(2)} USD`);
  };

  const calculateGross = () => {
    const net = parseFloat(amount);
    if (isNaN(net)) return;

    const gross = (net + fixedFee) / (1 - commissionPercent / 100);
    setResult(`Debes enviar: $${gross.toFixed(2)} USD`);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 space-y-6">

      {/* Imagen calculadora principal */}
      <h1 className="text-2xl font-bold text-center text-yellow-800 mb-4">
        Calculadora de Comisiones PayPal Actualizada 2025
      </h1>
      <img
        src="/paypal-calculator.png"
        alt="Calculadora PayPal"
        className="w-32 h-32"
      />

      {/* Inputs de comisión */}
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Comisión PayPal (%):</label>
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(parseFloat(e.target.value))}
            className="border px-3 py-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Comisión Fija (USD):</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(parseFloat(e.target.value))}
            className="border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Input del monto */}
      <div className="flex flex-col items-center">
        <label className="text-sm font-medium mb-1">Monto:</label>
        <input
          type="text"
          placeholder="Ej. 10,89"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-3 py-2 rounded w-64 mb-2"
        />
        <div className="flex space-x-2">
          <button
            onClick={calculateGross}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Monto a enviar (bruto)
          </button>
          <button
            onClick={calculateNet}
            className="bg-gray-200 text-black px-4 py-2 rounded"
          >
            Monto a recibir (neto)
          </button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="text-lg font-semibold text-green-700">{result}</div>
      )}

      {/* Texto explicativo */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-6 py-4 rounded-md w-full max-w-xl text-sm">
        <p className="font-semibold mb-2">¿Cómo usar esta calculadora?</p>
        <p className="mb-2">
          Ingresa el monto que deseas recibir o enviar a través de PayPal y automáticamente obtendrás el monto real después de aplicar las comisiones estándar de PayPal.
        </p>
        <p className="mb-2">
          Esta herramienta está actualizada al año 2025 y tiene en cuenta las comisiones promedio de PayPal para transacciones personales y comerciales.
        </p>
        <p className="text-xs italic">
          *Nota: Las tarifas pueden variar según tu país o tipo de cuenta. Esta calculadora es únicamente orientativa.
        </p>
      </div>
    </div>
  );
}


































