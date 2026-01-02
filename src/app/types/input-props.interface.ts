export interface InputProps {
    name?: string;
    label?: string;
    type?: string;
    id?: string;
    functions?: boolean;
    placeholder?: string;
    validation?: InputPropValidation;
    className?: string;
    value?: string;
    // CORRECCIÓN: Agregado ': any' al parámetro 'e'
    onInputChange?(e: any): void;
  }

interface InputPropValidation {
    required?: InputPropRequired;
    maxlength?: InputPropMaxlength;
}

interface InputPropRequired {
    value?: boolean;
    message?: string;
}

interface InputPropMaxlength {
    value?: number;
    message?: string;
}