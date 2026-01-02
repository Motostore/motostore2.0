// src/app/types/input-props.interface.ts

export interface InputProps {
  label?: string;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  value?: string | number;
  
  // CORRECCIÓN: Se agrega ': any' para que TypeScript no bloquee el build
  onInputChange?(e: any): void;
  
  // Propiedades opcionales extra para evitar conflictos
  defaultValue?: string | number;
  disabled?: boolean;
  [key: string]: any; // Permite cualquier otra propiedad extra
}

export interface InputPropValidation {
  required?: {
    value: boolean;
    message: string;
  } | string;
  pattern?: {
    value: RegExp;
    message: string;
  };
  min?: {
    value: number | string;
    message: string;
  };
  max?: {
    value: number | string;
    message: string;
  };
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
}
