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
    onInputChange?(e): void;
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