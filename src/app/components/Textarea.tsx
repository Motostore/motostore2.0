/*-------------------------------------------------------------------
|  🐼 React FC Textarea
|
|  🦝 Fixed for TypeScript Strict Mode & Correct HTML Tag
*-------------------------------------------------------------------*/

import cn from 'classnames'
import { findInputError, isFormInvalid } from '../utils'
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { MdError } from 'react-icons/md'
import { InputProps } from '../types/input-props.interface'

export const Textarea = ({ name, label, type, id, placeholder, validation, className }: InputProps) => {

  const {
    register,
    formState: { errors },
  } = useFormContext()

  // CORRECCIÓN 1: Fallback para name si es undefined
  const inputError = findInputError(errors, name || '')
  const isInvalid = isFormInvalid(inputError)

  const input_tailwind =
  'bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500'

  return (
    <div className={cn('flex flex-col w-full gap-2', className)}>
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold capitalize">
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {isInvalid && (
            <InputError
              // CORRECCIÓN 2: Manejo seguro de errores con optional chaining
              message={inputError.error?.message?.toString() || 'Error'}
              key={inputError.error?.message?.toString() || 'error-key'}
            />
          )}
        </AnimatePresence>
      </div>
        {/* CORRECCIÓN 3: Cambiado de <input> a <textarea> y añadida prop rows */}
        <textarea
          id={id}
          // type={type} // Textarea no lleva atributo type
          rows={4} // Altura por defecto
          className={cn(input_tailwind)}
          placeholder={placeholder}
          {...register(
            // CORRECCIÓN 4: name obligatorio
            name || '', 
            validation as RegisterOptions<FieldValues, string>
          )}
        />
    </div>
  )
}

// CORRECCIÓN 5: Tipado explícito de message
const InputError = ({ message }: { message: string }) => {
  return (
    <motion.p
      className="flex items-center gap-1 px-2 font-semibold text-red-500 bg-red-100 rounded-md"
      {...framer_error}
    >
      <MdError />
      {message}
    </motion.p>
  )
}

const framer_error = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
}