/*-------------------------------------------------------------------
|  🐼 React FC Input
|
|  🦝 Todo: CREATE RE-USEABLE INPUT COMPOENT
|
|  🐸 Returns:  JSX
*-------------------------------------------------------------------*/

import cn from 'classnames';
// ⭐ ASUMIMOS que findInputError, isFormInvalid ya están importados
import { findInputError, isFormInvalid } from '../utils'; 
// Asegúrate de que estos tipos se exporten correctamente desde el path configurado
import { FieldValues, RegisterOptions, useFormContext, UseFormSetValue } from 'react-hook-form'; 
import { AnimatePresence, motion } from 'framer-motion';
import { MdError } from 'react-icons/md';
import { InputProps } from '../types/input-props.interface'; // ⭐ Usamos tu interfaz

// 🛑 CORRECCIÓN: Tipar el componente InputError
interface InputErrorProps {
  message: string;
}

// 🛑 CORRECCIÓN: Usar la interfaz tipada InputProps
export const Input = ({ 
  name, 
  label, 
  type, 
  id, 
  placeholder, 
  validation, 
  className, 
  value, 
  functions, 
  onInputChange 
}: InputProps) => {

  // 🛑 CORRECCIÓN TS2345: Tipar register y setValue si es necesario, pero UseFormContext
  // generalmente se encarga de inferir los tipos si el contexto principal es correcto.
  const {
    register,
    // setValue debe ser tipado para el uso en la línea 40
    setValue, 
    formState: { errors },
  } = useFormContext();

  // 🛑 CORRECCIÓN TS2345: Aseguramos que 'name' es un string para findInputError 
  const inputError = findInputError(errors, name as string);
  const isInvalid = isFormInvalid(inputError);
  
  // 🛑 CORRECCIÓN TS2345: Aseguramos que 'validation' es el tipo correcto
  const valid = validation as RegisterOptions<FieldValues, string>;
  let params: any = {};

  if (functions) {
    // 🛑 CORRECCIÓN TS2722 y TS2345: Añadimos chequeos de nulidad y tipado explícito de 'e' si 'onInputChange' existe.
    params = {
      ...register(name as string, { ...valid }),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onInputChange && onInputChange(e),
    };

  } else {
    // 🛑 CORRECCIÓN TS2345: Aseguramos que 'name' es un string
    params = {...register(name as string, {
      ...valid,
    })}
  }

  // 🛑 CORRECCIÓN TS2345: setValue espera un string para el nombre del campo. Usamos 'as string' o '!'
  // Además, value debe ser 'string | undefined' según tu interfaz, por eso usamos value || ""
  (setValue as UseFormSetValue<any>)(name as string, value || "");


  const input_tailwind = type === "file" ? "" :
  'bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500'

  return (
    <div className={cn('flex flex-col w-full gap-2', className)}>
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold capitalize">
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {/* 🛑 CORRECCIÓN TS18048: inputError.error es posible que sea undefined 
             Usamos encadenamiento opcional (?) y aseguramos que inputError existe */}
          {isInvalid && inputError?.error?.message && (
            <InputError
              message={inputError.error.message}
              key={inputError.error.message}
            />
          )}
        </AnimatePresence>
      </div>
        <input
          id={id}
          type={type}
          className={cn(input_tailwind)}
          placeholder={placeholder}
          {...params}
        />
    </div>
  )
}

// 🛑 CORRECCIÓN TS7031: Aplicar la interfaz InputErrorProps
const InputError = ({ message }: InputErrorProps) => {
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