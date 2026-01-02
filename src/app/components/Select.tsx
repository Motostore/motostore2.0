/*-------------------------------------------------------------------
|  🐼 React FC Input
|
|  🦝 Todo: CREATE RE-USEABLE INPUT COMPOENT
|
|  🐸 Returns:  JSX
*-------------------------------------------------------------------*/

import cn from 'classnames'
import { findInputError, isFormInvalid } from '../utils'
import { useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { MdError } from 'react-icons/md'
import { SelectProps } from '../types/select-props.interface'

export const Select = ({ title, name, label, id, validation, className, options, onSelectChange, value }: SelectProps) => {

  const {
    register, setValue,
    formState: { errors },
  } = useFormContext()

  const inputError = findInputError(errors, name || '')
  const isInvalid = isFormInvalid(inputError)

  setValue(name || '', value || 'DISABLED')

  const input_tailwind =
  'bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500'

  return (
    <div className={cn('flex flex-col w-full gap-2', className)}>
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold capitalize">
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {isInvalid && (
            <InputError
              // 👇 SOLUCIÓN FINAL: Agregamos '?' después de 'error'
              // inputError.error?.message
              message={inputError.error?.message?.toString() || 'Error de validación'}
              key={inputError.error?.message?.toString() || 'error-key'}
            />
          )}
        </AnimatePresence>
      </div>
      <select 
        id={name} 
        className={cn(input_tailwind)}
        {...register(
          name || 'select-default', 
          {
            required: {
              value: true,
              message: 'requerido',
            },
            onChange: onSelectChange,
          }
        )}
        >
        <option value={'DISABLED'} disabled>{title}</option>
        {
          options?.map((option) =>(
            <option key={option.value} value={option.value}>{option.name}</option>
          ))
        }
      </select>
    </div>
  )
}

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