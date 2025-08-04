
export const name_validation = {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    id: 'name',
    placeholder: 'Proveedor',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

export const price_validation = {
    name: 'price',
    label: 'Precio',
    type: 'number',
    id: 'price',
    placeholder: 'Precio',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  export const description_validation = {
    name: 'description',
    label: 'Descripción',
    type: 'text',
    id: 'description',
    placeholder: 'Descripción',
    validation: {},
  }

  export const image_validation = {
    name: 'image',
    label: 'Imagen',
    type: 'file',
    id: 'image',
    placeholder: 'Imagen',
    validation: {},
  }
  