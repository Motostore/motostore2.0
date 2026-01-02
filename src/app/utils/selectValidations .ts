/*-------------------------------------------------------------------
|  🐼 Input Validators 
|
|  🐯 Purpose: THIS FILE CONTAINS ALL THE VALIDATORS OBJECTS
|
|  🐸 Returns:  -
*-------------------------------------------------------------------*/

// Estructura mínima para un componente de selección

export const role_validation = {
    name: 'role',
    label: 'Roles',
    id: 'role',
    title: 'Selecciona un rol',
    selected: "CLIENT",
    options: [
      {
        value: 'ADMIN',
        name: 'Administrador'
      },
      // Usamos RESELLER ya que es el que se usa en el mapeo de roles
      { 
        value: 'RESELLER', 
        name: 'Distribuidor / Reseller'
      }, 
      {
        value: 'CLIENT',
        name: 'Cliente'
      }
    ],
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  export const id_streaming_provider_validation = {

    selected: "1",
    name: 'idStreamingProvider',
    label: 'Proveedor',
    id: 'idStreamingProvider',
    title: 'Selecciona un proveedor',
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  export const country_validation = {
    name: 'country',
    label: 'Países',
    id: 'country',
    title: 'País',
    selected: "COUNTRY",
    options: [],
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  // 🔥 CORRECCIÓN CLAVE: El Label debe ser genérico (Subdivisión) 
  // para que la función getSubdivisionLabel lo sobrescriba dinámicamente.
  export const state_validation = {
    name: 'state',
    label: 'Subdivisión / Estado', 
    id: 'state',
    title: 'Subdivisión / Estado',
    selected: "STATE",
    options: [],
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }

  export const city_validation = {
    name: 'city',
    label: 'Ciudades',
    id: 'city',
    title: 'Ciudad',
    selected: "CITY",
    options: [],
    validation: {
      required: {
        value: true,
        message: 'requerido',
      },
    },
  }