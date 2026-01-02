/*-------------------------------------------------------------------
|  🐼 Input Validators (Streaming/Accounts Specific)
|
|  🐯 Purpose: THIS FILE CONTAINS VALIDATION OBJECTS FOR MANAGING
|              STREAMING ACCOUNTS, KEYS, AND PROFILES.
|
|  🐸 Returns:  -
*-------------------------------------------------------------------*/

export const description_validation = {
    name: 'description',
    label: 'Descripción de la Cuenta',
    type: 'text',
    id: 'description',
    placeholder: 'Notas o descripción de la cuenta de streaming...',
    validation: {
        // La descripción es opcional, pero limitamos la longitud
        maxLength: {
            value: 300,
            message: 'Máximo 300 caracteres.',
        },
    },
  }

  export const stock_validation = {
    name: 'stock',
    label: 'Perfiles Disponibles',
    type: 'number',
    id: 'stock',
    placeholder: 'Ej: 5',
    validation: {
      required: {
        value: true,
        message: 'El número de perfiles disponibles es requerido.',
      },
      // 🔥 REGLAS CRÍTICAS DE STOCK (Requieren YUP)
      typeError: {
        message: 'Debe ser un número entero válido.',
      },
      moreThan: {
        value: 0,
        message: 'Debe haber al menos 1 perfil disponible.',
      },
      maxLength: {
        value: 2,
        message: 'Máximo 2 dígitos (stock de 99).', // Ajustamos el mensaje para claridad
      },
    },
  }

  export const streaming_user_validation = {
    name: 'streamingUser',
    label: 'Usuario de la Cuenta Principal',
    type: 'text',
    id: 'streamingUser',
    placeholder: 'Ej: correo@cuenta-principal.com (o usuario)',
    validation: {
      required: {
        value: true,
        message: 'El usuario principal de la cuenta es requerido.',
      }
    },
  }

  export const streaming_key_validation = {
    name: 'streamingKey',
    label: 'Contraseña de la Cuenta Principal',
    type: 'text', // Se usa text para poder ver la clave al editar, pero se puede cambiar a password
    id: 'streamingKey',
    placeholder: 'Clave de acceso de la cuenta',
    validation: {
      required: {
        value: true,
        message: 'La clave de la cuenta principal es requerida.',
      },
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres.',
      }
    },
  }

  // Este es un campo oculto, solo necesita el ID y el nombre
  export const streaming_id_validation = {
    name: 'streamingId',
    label: 'ID de Streaming (Oculto)',
    type: 'hidden',
    id: 'streamingId',
  }