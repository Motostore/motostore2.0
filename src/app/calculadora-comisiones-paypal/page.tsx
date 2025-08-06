'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const calculatorImage = '/calculadora-paypal.png';

export default function Page() {
  const [comisionPorcentaje, setComisionPorcentaje] = useState<number>(5.4);
  const [comisionFija, setComisionFija] = useState<number>(0.3);
  const [monto, setMonto] = useState<string>('');
  const [resultado, setResultado] = useState<string>('');
  const [modo, setModo] = useState<'bruto' | 'neto' | ''>('');

  const calcular = (modoCalculo: 'bruto' | 'neto') => {
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum)) {
      setResultado('');
      setModo('');
      return;
    }

    const porcentaje = comisionPorcentaje / 100;
    let resultadoNum = 0;

    if (modoCalculo === 'bruto') {
      resultadoNum = (montoNum + comisionFija) / (1 - porcentaje);
    } else {
      resultadoNum = montoNum * (1 - porcentaje) - comisionFija;
    }

    setResultado(resultadoNum.toFixed(2).replace('.', ','));
    setModo(modoCalculo);
  };

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setter(value === '' ? 0 : parseFloat(value.replace(',', '.')));
    };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4 py-16 md:py-32">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 md:p-10 flex flex-col items-center gap-6">

        <Image
          src={calculatorImage}
          alt="Calculadora PayPal"
          width={200}
          height={200}
          className="mb-4 md:w-[300px] md:h-[300px]"
        />

        <h1 className="text-center text-xl md:text-2xl font-semibold mb-4 md:mb-6">
          Calculadora de Comisiones PayPal
        </h1>

        <div className="flex flex-col md:flex-row gap-4 w-full justify-between">
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium">Comisión PayPal (%):</label>
            <input
              type="number"
              value={comisionPorcentaje}
              onChange={handleNumberChange(setComisionPorcentaje)}
              className="border border-red-500 focus:ring-red-500 focus:border-red-500 rounded px-4 py-3 text-lg w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium">Comisión Fija (USD):</label>
            <input
              type="number"
              value={comisionFija}
              onChange={handleNumberChange(setComisionFija)}
              className="border border-red-500 focus:ring-red-500 focus:border-red-500 rounded px-4 py-3 text-lg w-full"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="text-sm font-medium">Monto:</label>
          <input
            type="text"
            placeholder="Ej. 10,89"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="border border-red-500 focus:ring-red-500 focus:border-red-500 rounded px-4 py-3 text-lg w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => calcular('bruto')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded text-lg"
          >
            Monto a enviar (bruto)
          </button>
          <button
            onClick={() => calcular('neto')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded text-lg"
          >
            Monto a recibir (neto)
          </button>
        </div>

        {resultado && (
          <div className="mt-4 text-center">
            <p className="font-semibold text-xl text-gray-900">
              {modo === 'bruto' ? 'Debes enviar:' : 'Recibirás:'} ${resultado}
            </p>
          </div>
        )}

        {/* NUEVO BLOQUE DE TEXTO DESCRIPTIVO RESPONSIVO */}
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-4 rounded mt-6 text-sm leading-tight md:px-6 md:py-6 md:text-base md:leading-relaxed text-justify">
          <p className="font-semibold mb-2">¿Cómo usar esta calculadora?</p>
          <p>
            Usar esta calculadora es muy sencillo. Llena el cuadro de texto dependiendo si quieres saber el cálculo para enviar o recibir dinero.
          </p>
          <p className="mt-2">
            Los bloques solo podrán ser llenados con números. Si deseas agregar un decimal (por ejemplo 10.89) debes hacerlo colocando una coma de esta forma: <strong>10,89</strong>.
          </p>
          <p className="mt-2">
            Por defecto colocamos los valores estándar de las comisiones de PayPal que son <strong>5,4%</strong> + un fijo de <strong>0,3 USD</strong> por transacción(*). Revisa si tu país tiene una comisión distinta y colócala de forma manual en la parte de "Las Comisiones PayPal".
          </p>
          <p className="mt-3 font-semibold">¿Monto Bruto y Monto Neto?</p>
          <p>
            El monto <strong>bruto</strong> es el dinero enviado o recibido sin contar ningún tipo de comisión. En pocas palabras, es lo que el pagador envía desde su cuenta sin aplicar descuentos.
          </p>
          <p className="mt-1">
            <em>Ejemplo:</em> Si te envían <strong>10 USD brutos</strong>, te llegarán solamente <strong>9,16 USD netos</strong>.
          </p>
          <p className="mt-2">
            El monto <strong>neto</strong> es el dinero enviado descontado todo tipo de comisiones. Es decir, lo que llega a destino luego de todos los "recortes".
          </p>
          <p className="mt-1">
            <em>Ejemplo:</em> Si te envían <strong>10 USD netos</strong>, realmente el que paga te estará enviando <strong>10,89 USD brutos</strong>.
          </p>
          <p className="mt-3 italic text-[11px] text-gray-500 md:text-xs">
            *Importante: Esta calculadora no incluye ningún tipo de comisión relacionada a nuestro servicio. Es solo una herramienta de ayuda para el usuario que desea enviar o recibir dinero sin intermediarios a través del sitio web de PayPal.
          </p>
        </div>
        {/* FIN DEL BLOQUE RESPONSIVO */}
      </div>
    </div>
  );
}

























































































































