/*-------------------------------------------------------------------
|  🐼 Input Validators 
|
|  🐯 Purpose: THIS FILE CONTAINS ALL THE VALIDATORS OBJECTS
|
|  🐸 Returns:  -
*-------------------------------------------------------------------*/

export const username_validation = {
    name: 'username',
    label: 'username',
    type: 'text',
    id: 'username',
    placeholder: 'Usuario',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      minLength: {
        value: 3,
        message: 'Mínimo 3 caracteres',
      },
    },
  }

export const name_validation = {
    name: 'name',
    label: 'name',
    type: 'text',
    id: 'name',
    placeholder: 'Nombre y apellido',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      minLength: {
        value: 3,
        message: 'Mínimo 3 caracteres',
      },
    },
  }

  export const identification_card_validation = {
    name: 'identificationCard',
    label: 'identificationCard',
    type: 'text',
    id: 'identificationCard',
    placeholder: 'Cédula',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      maxLength: {
        value: 10,
        message: 'Máximo 10 caracteres',
      },
      minLength: {
        value: 5,
        message: 'Mínimo 5 caracteres',
      },
    },
  }

  export const phone_validation = {
    name: 'phone',
    label: 'phone',
    type: 'text',
    id: 'phone',
    placeholder: 'Número de teléfono',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      minLength: {
        value: 11,
        message: 'Mínimo 11 caracteres',
      },
    },
  }
  
  export const desc_validation = {
    name: 'description',
    label: 'description',
    id: 'description',
    placeholder: 'Descripción ...',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      maxLength: {
        value: 200,
        message: '200 characters max',
      },
    },
  }
  
//   export const password_validation = {
//     name: 'password',
//     label: 'password',
//     type: 'password',
//     id: 'password',
//     placeholder: 'type password ...',
//     validation: {
//       required: {
//         value: true,
//         message: 'requerido',
//       },
//       minLength: {
//         value: 6,
//         message: 'min 6 characters',
//       },
//     },
//   }
  
  export const num_validation = {
    name: 'num',
    label: 'number',
    type: 'number',
    id: 'num',
    placeholder: 'write a random number',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  export const password_validation = {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    id: 'password',
    placeholder: 'Contraseña',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres',
      },
    },
  }

  export const confirm_password_validation = {
    name: 'confirmPassword',
    label: 'Confirma tu contraseña',
    type: 'password',
    id: 'confirmPassword',
    placeholder: 'Confirma tu contraseña',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres',
      },
    },
  }
  
  export const email_validation = {
    name: 'email',
    label: 'Correo',
    type: 'email',
    id: 'email',
    placeholder: 'Correo',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
      pattern: {
        value:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message: 'Ingresa un correo válido',
      },
    },
  }