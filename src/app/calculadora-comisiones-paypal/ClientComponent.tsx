'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ClientComponent() {
  const [comisionPorcentaje, setComisionPorcentaje] = useState(5.4);
  const [comisionFija, setComisionFija] = useState(0.3);
  const [monto, setMonto] = useState('');
  const [resultado, setResultado] = useState('');
  const [modo, setModo] = useState('');

  const calcular = (modo: 'bruto' | 'neto') => {
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum)) return;

    const porcentaje = comisionPorcentaje / 100;
    let resultadoNum = 0;

    if (modo === 'bruto') {
      resultadoNum = (montoNum + comisionFija) / (1 - porcentaje);
    } else {
      resultadoNum = montoNum * (1 - porcentaje) - comisionFija;
    }

    setResultado(resultadoNum.toFixed(2));
    setModo(modo);
  };

  const calculatorImage = '/calculadora-paypal.png';

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4">
      <Image src={calculatorImage} alt="Calculadora PayPal" width={120} height={120} />

      {/* ... resto del código ... */}
    </div>
  );
}




