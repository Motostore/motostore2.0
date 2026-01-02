// src/app/calculadorapaypal/CalculatorClient.tsx (CÓDIGO COMPLETO - NIVEL ULTRA PREMIUM)

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Cog6ToothIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const calculatorImage = '/motostore-logo.png'; 
const DEFAULT_COMISION_PERCENTAGE = 5.4;
const DEFAULT_COMISION_FIJA = 0.3;

export default function CalculatorClient() {
  const [monto, setMonto] = useState<string>(''); 
  const [comisionPorcentaje, setComisionPorcentaje] = useState<string>(DEFAULT_COMISION_PERCENTAGE.toString());
  const [comisionFija, setComisionFija] = useState<string>(DEFAULT_COMISION_FIJA.toString());
  const [resultado, setResultado] = useState<string>('');
  const [modo, setModo] = useState<'bruto' | 'neto' | ''>('');
  const [showConfig, setShowConfig] = useState(false); 

  const handleConfigChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/,/g, '.');
      if (!isNaN(Number(val)) || val === '') setter(val);
  };

  const calcular = useCallback((modoCalculo: 'bruto' | 'neto') => {
      const raw = monto.replace(/,/g, '.').trim();
      const montoNum = Number(raw);
      const p = Number(comisionPorcentaje) || 0;
      const f = Number(comisionFija) || 0;

      if (!raw || isNaN(montoNum) || montoNum <= 0) {
        setResultado('');
        setModo('');
        return;
      }

      const porcentaje = p / 100;
      let res = 0;

      if (modoCalculo === 'bruto') {
        res = (montoNum + f) / (1 - porcentaje);
      } else {
        res = montoNum * (1 - porcentaje) - f;
      }
      
      if (res < 0) res = 0;
      setResultado(res.toFixed(2).replace('.', ',')); 
      setModo(modoCalculo);
  }, [monto, comisionPorcentaje, comisionFija]);
  
  const inputBase = "w-full bg-gray-50 border border-gray-200 text-slate-900 text-center font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E33127]/20 focus:border-[#E33127] transition-all";

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* 1. ENCABEZADO VISUAL */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-20 h-20 mb-4 transition-transform hover:scale-110 duration-300">
          <Image
            src={calculatorImage}
            alt="Logo Calculadora"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* PREGUNTA EN ULTRA NEGRITA (SOLICITADO) */}
        <h2 className="text-xl font-black text-slate-600 tracking-tight">
          ¿Cuánto deseas procesar?
        </h2>
      </div>

      {/* 2. INPUT GIGANTE (MONTO) */}
      <div className="relative w-full max-w-xs mb-8 group">
        
        {/* ICONO $ - VERDE AL HACER CLICK */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
          <CurrencyDollarIcon className="w-8 h-8" />
        </div>
        
        {/* INPUT - BORDE VERDE AL HACER CLICK Y LETRA ULTRA NEGRITA */}
        <input
          type="text"
          placeholder="0,00"
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/,/g, '.'))} 
          className="w-full text-5xl md:text-6xl font-black text-slate-900 text-center bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-4 placeholder:text-slate-200 transition-colors"
        />
      </div>

      {/* 3. BOTONES DE ACCIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        <button
          onClick={() => calcular('bruto')}
          className="group relative overflow-hidden bg-[#E33127] hover:bg-[#c92a21] text-white py-4 px-6 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-bold opacity-90 uppercase tracking-wide mb-1">Necesito recibir</span>
            <span className="text-xl font-black">Calcular Bruto</span>
          </div>
        </button>

        <button
          onClick={() => calcular('neto')}
          className="group relative overflow-hidden bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
           <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-bold opacity-90 uppercase tracking-wide mb-1">Voy a enviar</span>
            <span className="text-xl font-black">Calcular Neto</span>
          </div>
        </button>
      </div>

      {/* 4. RESULTADO (SIEMPRE VERDE ESMERALDA) */}
      {resultado && (
        <div className="w-full p-8 rounded-3xl border mb-8 animate-in fade-in zoom-in duration-300 bg-emerald-50 border-emerald-100">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest mb-2 text-emerald-600">
              {modo === 'bruto' ? 'Para recibir eso, envía:' : 'Recibirás exactamente:'}
            </p>
            <div className="flex justify-center items-baseline gap-1">
               <span className="text-5xl md:text-6xl font-black tracking-tight tabular-nums text-emerald-600">
                 ${resultado}
               </span>
               <span className="text-xl font-bold text-slate-400">USD</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIGURACIÓN */}
      <div className="w-full">
        <button 
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 mb-4 mx-auto transition-colors font-bold"
        >
            <Cog6ToothIcon className="w-4 h-4" />
            {showConfig ? 'Ocultar tarifas' : 'Editar tarifas de PayPal'}
        </button>

        {showConfig && (
            <div className="flex gap-4 bg-gray-50 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1 text-center">% Comisión</label>
                    <input 
                        type="text" 
                        value={comisionPorcentaje}
                        onChange={handleConfigChange(setComisionPorcentaje)}
                        className={`${inputBase} py-2 font-black`} 
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1 text-center">Fijo ($)</label>
                    <input 
                        type="text" 
                        value={comisionFija}
                        onChange={handleConfigChange(setComisionFija)}
                        className={`${inputBase} py-2 font-black`} 
                    />
                </div>
            </div>
        )}
      </div>

      {/* 6. INFO PIE DE PÁGINA (ULTRA NEGRITA) */}
      <p className="mt-8 text-xs text-center text-slate-500 font-black">
         Cálculo basado en tarifa estándar ({comisionPorcentaje}% + ${comisionFija}).
      </p>

    </div>
  );
}






