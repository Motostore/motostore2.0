"use client";

import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import cn from "classnames";

// Definimos la interfaz directamente aquí para evitar conflictos de importación
interface InputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  validation?: object; // Reglas de RHF
  multiline?: boolean; // Para saber si renderizar <textarea>
  className?: string;
}

export const Input = ({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  validation = {},
  multiline = false,
  className = "",
}: InputProps) => {
  
  // 1. Obtenemos los métodos del contexto del formulario padre
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // 2. Buscamos errores específicos para este campo
  // Usamos una lógica segura para encontrar el error incluso si name es "user.name"
  const inputError = errors?.[name];
  const isInvalid = !!inputError;

  // 3. Definimos los estilos base (Moto Store Theme)
  const baseStyles = `
    w-full p-4 rounded-xl border-2 outline-none font-medium transition-all duration-200
    placeholder:text-slate-400
    disabled:bg-slate-100 disabled:text-slate-400
  `;

  // Estilos según el estado (Error vs Normal)
  const stateStyles = isInvalid
    ? "bg-white border-red-100 text-red-600 focus:border-red-500 focus:bg-red-50/10"
    : "bg-slate-50 border-slate-100 text-slate-700 focus:border-slate-900 focus:bg-white hover:border-slate-200";

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      
      {/* HEADER DEL INPUT: Label + Mensaje de Error */}
      <div className="flex justify-between items-center min-h-[24px]">
        <label 
          htmlFor={id} 
          className="text-xs font-black uppercase tracking-wider text-slate-500"
        >
          {label}
        </label>
        
        <AnimatePresence mode="wait" initial={false}>
          {isInvalid && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-md"
            >
              <ExclamationCircleIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {inputError?.message?.toString()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDERIZADO CONDICIONAL: Textarea o Input */}
      {multiline ? (
        <textarea
          id={id}
          placeholder={placeholder}
          className={cn(baseStyles, stateStyles, "resize-none h-32")}
          // 🔥 AQUÍ OCURRE LA MAGIA: spread de register conecta todo con RHF
          {...register(name, validation)} 
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(baseStyles, stateStyles)}
          {...register(name, validation)}
        />
      )}
    </div>
  );
};