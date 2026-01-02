/*-------------------------------------------------------------------
|  🐼 Input Validators 
|
|  🐯 Purpose: THIS FILE CONTAINS ALL THE VALIDATORS OBJECTS
|              FOR INPUT CONFIGURATION (LABEL, TYPE, VALIDATION RULES).
|
|  🐸 Returns:  -
*-------------------------------------------------------------------*/

// --- 1. USUARIO Y NOMBRE ---

export const username_validation = {
    name: 'username',
    label: 'Nombre de Usuario',
    type: 'text',
    id: 'username',
    placeholder: 'Ej: MotoStoreUser',
    validation: {
      required: {
        value: true,
        message: 'El nombre de usuario es requerido.',
      },
      minLength: {
        value: 3,
        message: 'Mínimo 3 caracteres.',
      },
    },
  }

export const name_validation = {
    name: 'name',
    label: 'Nombre Completo',
    type: 'text',
    id: 'name',
    placeholder: 'Ej: Juan Pérez',
    validation: {
      required: {
        value: true,
        message: 'El nombre completo es requerido.',
      },
      minLength: {
        value: 3,
        message: 'Mínimo 3 caracteres.',
      },
    },
  }

// --- 2. IDENTIFICACIÓN Y CONTACTO ---

export const identification_card_validation = {
    name: 'identificationCard',
    label: 'Cédula / RIF',
    type: 'text',
    id: 'identificationCard',
    placeholder: 'Ej: V-12345678',
    validation: {
      required: {
        value: true,
        message: 'La cédula o RIF es requerido.',
      },
      maxLength: {
        value: 10,
        message: 'Máximo 10 caracteres.',
      },
      minLength: {
        value: 5,
        message: 'Mínimo 5 caracteres.',
      },
    },
  }

  export const phone_validation = {
    name: 'phone',
    label: 'Número de Teléfono',
    type: 'text',
    id: 'phone',
    placeholder: 'Ej: 04121234567 (11 dígitos)',
    validation: {
      required: {
        value: true,
        message: 'El número de teléfono es requerido.',
      },
      minLength: {
        value: 11,
        message: 'Mínimo 11 caracteres (incluyendo código de área).',
      },
    },
  }
  
  export const email_validation = {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    id: 'email',
    placeholder: 'Ej: correo@ejemplo.com',
    validation: {
      required: {
        value: true,
        message: 'El correo electrónico es requerido.',
      },
      pattern: {
        value:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message: 'Ingresa un correo electrónico válido.',
      },
    },
  }

// --- 3. CONTRASEÑAS ---

export const password_validation = {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    id: 'password',
    placeholder: 'Escribe tu contraseña',
    validation: {
      required: {
        value: true,
        message: 'La contraseña es requerida.',
      },
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres.',
      },
    },
  }

export const confirm_password_validation = {
    name: 'confirmPassword',
    label: 'Confirmar Contraseña',
    type: 'password',
    id: 'confirmPassword',
    placeholder: 'Repite la contraseña',
    validation: {
      required: {
        value: true,
        message: 'La confirmación de contraseña es requerida.',
      },
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres.',
      },
      // NOTA: La validación "oneOf" (coincidencia) debe ir en el esquema YUP.
    },
  }

// --- 4. CAMPOS DIVERSOS ---

export const desc_validation = {
    name: 'description',
    label: 'Descripción del Ítem',
    id: 'description',
    placeholder: 'Descripción detallada...',
    validation: {
      required: {
        value: true,
        message: 'La descripción es requerida.',
      },
      maxLength: {
        value: 200,
        message: 'Máximo 200 caracteres.',
      },
    },
  }
  
export const num_validation = {
    name: 'num',
    label: 'Número/Cantidad',
    type: 'number',
    id: 'num',
    placeholder: 'Escribe un número',
    validation: {
      required: {
        value: true,
        message: 'El valor numérico es requerido.',
      },
    },
  }