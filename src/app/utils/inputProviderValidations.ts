/*-------------------------------------------------------------------
|  🐼 Input Validators (Provider/Product Specific)
|
|  🐯 Purpose: THIS FILE CONTAINS VALIDATION OBJECTS FOR PRODUCT 
|              OR PROVIDER CREATION FORMS.
|
|  🐸 Returns:  -
*-------------------------------------------------------------------*/

export const name_validation = {
    name: 'name',
    label: 'Nombre del Ítem / Proveedor',
    type: 'text',
    id: 'name',
    placeholder: 'Ej: Licencia VPN / Cuenta Netflix',
    validation: {
      required: {
        value: true,
        message: 'El nombre es requerido.',
      },
      minLength: {
        value: 3,
        message: 'Mínimo 3 caracteres.',
      },
    },
  }

export const price_validation = {
    name: 'price',
    label: 'Precio de Venta',
    type: 'number',
    id: 'price',
    placeholder: '0.00',
    validation: {
      required: {
        value: true,
        message: 'El precio es requerido.',
      },
      // 🔥 REGLAS CRÍTICAS DE PRECIO (Requieren YUP)
      typeError: {
        message: 'Debe ser un valor numérico.',
      },
      moreThan: {
        value: 0,
        message: 'El precio debe ser mayor a cero.',
      }
    },
  }

  export const description_validation = {
    name: 'description',
    label: 'Descripción Detallada',
    type: 'text',
    id: 'description',
    placeholder: 'Descripción breve del producto o servicio...',
    validation: {
      // Dejamos la descripción como opcional (sin 'required'), pero limitamos la longitud.
      maxLength: {
        value: 300,
        message: 'Máximo 300 caracteres.',
      },
    },
  }

  export const image_validation = {
    name: 'image',
    label: 'Imagen (Opcional)',
    type: 'file',
    id: 'image',
    placeholder: 'Selecciona una imagen de producto',
    // La validación real de archivo (tamaño, tipo) se haría en el esquema YUP.
    validation: {}, 
  }
  