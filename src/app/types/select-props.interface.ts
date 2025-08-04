export interface SelectProps {
    name?: string;
    label?: string;
    id?: string;
    validation?: InputPropValidation;
    className?: string;
    options?: InputPropRoles[];
    title?: string;
    selected?: string;
    onSelectChange?;
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