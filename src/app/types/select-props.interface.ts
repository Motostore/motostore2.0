export interface SelectProps {
    name?: string;
    label?: string;
    id?: string;
    validation?: InputPropValidation;
    className?: string;
    options?: InputPropRoles[];
    title?: string;
    selected?: string;
    // CORRECCIÓN: Definimos el tipo explícitamente como 'any' o función
    onSelectChange?: any;
    value?: string;
  }

interface InputPropValidation {
    required?: InputPropRequired;
}

interface InputPropRequired {
    value?: boolean;
    message?: string;
}

interface InputPropRoles {
    id?: number;
    value?: string;
    name?: string;
}