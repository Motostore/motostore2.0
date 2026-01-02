export interface InputError {
    error?: InputErrorError;
  }

interface InputErrorError {
    message?: string;
    ref?: any;
    type?: string;
  }