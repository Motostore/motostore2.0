"use client";

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Toaster, toast } from 'react-hot-toast'
import { PaperAirplaneIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'

// Importamos el Input usando el alias @
import { Input } from '@/app/components/Input' 

// CORRECCIÓN FINAL AQUÍ:
// Usamos '@/app/utils/...' para que Next.js encuentre el archivo sin importar dónde esté este componente.
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

  const handleFormSubmission = (data: any) => {
    // 1. Simulación de envío exitoso
    console.log(data) 
    
    // 2. Éxito visual
    setSuccess(true)
    methods.reset()

    // 3. Notificación Toast Premium
    toast.success('¡Formulario enviado correctamente!', {
      style: {
        borderRadius: '12px',
        background: '#1e293b', // Slate-800 elegante
        color: '#fff',
        fontWeight: '600',
      },
      iconTheme: {
        primary: '#E33127', // Rojo Marca
        secondary: '#fff',
      },
      duration: 4000,
    })
    
    // Resetear estado de éxito después de unos segundos
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <FormProvider {...methods}>
      
      {/* CONTENEDOR 'GLASS' PREMIUM */}
      <div className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        {/* Encabezado del Formulario */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Completa tus Datos
          </h2>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Ingresa la información requerida a continuación.
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
            
            {/* Textarea ocupando todo el ancho */}
            <div className="md:col-span-2 space-y-1">
               <Input {...desc_validation} className="h-32" /> 
            </div>
            
          </div>

          {/* MENSAJE DE ÉXITO */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-pulse">
              <CheckBadgeIcon className="w-6 h-6 text-green-600" />
              <p className="font-bold text-green-700 text-sm">
                Datos procesados exitosamente.
              </p>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button
              type="submit"
              className="
                group relative
                flex items-center gap-3 
                px-8 py-4 rounded-xl
                bg-gradient-to-r from-[#E33127] to-[#C52B22] 
                hover:from-[#C52B22] hover:to-[#A9221A] 
                text-white font-black tracking-widest uppercase text-xs sm:text-sm
                shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-300 overflow-hidden
              "
            >
              <span className="relative z-10">Enviar Información</span>
              <PaperAirplaneIcon className="relative z-10 w-5 h-5 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-white/20 transition-transform duration-700 ease-in-out -skew-x-12"></div>
            </button>
          </div>

        </form>
      </div>
      
      {/* Toast Notification Container */}
      <Toaster position="bottom-right" />
    </FormProvider>
  )
}