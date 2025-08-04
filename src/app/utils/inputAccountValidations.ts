
export const description_validation = {
    name: 'description',
    label: 'Descripción',
    type: 'text',
    id: 'description',
    placeholder: 'Descripción',
    validation: {},
  }

  export const stock_validation = {
    name: 'stock',
    label: 'Perfiles',
    type: 'number',
    id: 'stock',
    placeholder: 'Perfiles',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      maxLength: {
        value: 2,
        message: 'Máximo 2 caracteres',
      },
    },
  }

  export const streaming_user_validation = {
    name: 'streamingUser',
    label: 'Usuario',
    type: 'text',
    id: 'streamingUser',
    placeholder: 'Usuario',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      }
    },
  }

  export const streaming_key_validation = {
    name: 'streamingKey',
    label: 'Clave',
    type: 'text',
    id: 'streamingKey',
    placeholder: 'Clave',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      }
    },
  }

  export const streaming_id_validation = {
    name: 'streamingId',
    label: 'Id',
    type: 'hidden',
    id: 'streamingId',
  }