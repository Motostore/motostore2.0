// src/app/utils/selectValidations.ts

export const country_validation = {
  name: 'country',
  label: 'País',
  type: 'text',
  id: 'country',
  placeholder: 'Selecciona un país',
  validation: {
    required: {
      value: true,
      message: 'Requerido',
    },
  },
}

export const state_validation = {
  name: 'state',
  label: 'Estado',
  type: 'text',
  id: 'state',
  placeholder: 'Selecciona un estado',
  validation: {
    required: {
      value: true,
      message: 'Requerido',
    },
  },
}

export const city_validation = {
  name: 'city',
  label: 'Ciudad',
  type: 'text',
  id: 'city',
  placeholder: 'Selecciona una ciudad',
  validation: {
    required: {
      value: true,
      message: 'Requerido',
    },
  },
}