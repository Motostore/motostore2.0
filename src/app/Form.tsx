"use client";

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Toaster, toast } from 'react-hot-toast'
import { PaperAirplaneIcon, CheckBadgeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

// Componentes y Utilidades
import { Input } from '@/app/components/Input' 
import {
  name_validation,
  desc_validation,
  email_validation,
  num_validation,
  password_validation,
} from '@/app/utils/inputValidations'

export const Form = () => {
  const methods = useForm()
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // 🔥 MEJORA: Estado de carga

  const handleFormSubmission = async (data: any) => {
    setIsLoading(true); // Bloqueamos botón
    
    // Simulamos espera de red (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Datos enviados:", data) 
    
    setSuccess(true)
    setIsLoading(false) // Desbloqueamos
    methods.reset()

    // Notificación
    toast.success('¡Formulario enviado correctamente!', {
      style: {
        borderRadius: '12px',
        background: '#0f172a', // Slate-900
        color: '#fff',
        fontWeight: '600',
        border: '1px solid #334155'
      },
      iconTheme: {
        primary: '#E33127', // Tu Rojo
        secondary: '#fff',
      },
      duration: 4000,
    })
    
    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <FormProvider {...methods}>
      
      {/* CONTENEDOR 'CLEAN CORP' */}
      <div className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Encabezado */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Completa tus <span className="text-[#E33127]">Datos</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Ingresa la información requerida a continuación para procesar tu solicitud.
          </p>
        </div>

        <form
          onSubmit={methods.handleSubmit(handleFormSubmission)}
          noValidate
          autoComplete="off"
          className="w-full"
        >
          {/* GRID DE INPUTS */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            
            <div className="space-y-1">
              <Input {...name_validation} />
            </div>
            
            <div className="space-y-1">
              <Input {...email_validation} />
            </div>
            
            <div className="space-y-1">
              <Input {...num_validation} />
            </div>
            
            <div className="space-y-1">
              <Input {...password_validation} />
            </div>
            
            {/* Textarea */}
            <div className="md:col-span-2 space-y-1">
               <Input {...desc_validation} className="h-32" /> 
            </div>
            
          </div>

          {/* MENSAJE DE ÉXITO EN PANTALLA */}
          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-4 animate-fade-in">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <CheckBadgeIcon className="w-6 h-6" />
              </div>
              <div>
                  <p className="font-bold text-green-800 text-sm uppercase tracking-wide">¡Procesado!</p>
                  <p className="text-green-700 text-xs font-medium">Tus datos han sido recibidos correctamente.</p>
              </div>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading} // 🔥 Deshabilitar si carga
              className={`
                group relative flex items-center gap-3 px-8 py-4 rounded-xl
                text-white font-black tracking-widest uppercase text-xs sm:text-sm
                shadow-lg shadow-red-500/20 transition-all duration-300 overflow-hidden
                ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-[#E33127] hover:shadow-xl hover:-translate-y-0.5'}
              `}
            >
              {isLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
              ) : (
                  <>
                    <span className="relative z-10">Enviar Información</span>
                    <PaperAirplaneIcon className="relative z-10 w-5 h-5 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </>
              )}
            </button>
          </div>

        </form>
      </div>
      <Toaster position="bottom-right" />
    </FormProvider>
  )
}