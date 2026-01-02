// src/app/utils/selectOptions.ts

/**
 * Define las opciones de roles para menús desplegables (selects) en formularios.
 * Los 'value' deben coincidir con las claves usadas en el Backend y NextAuth (en mayúsculas).
 */
export const roleOptions = [
    {
        value: '', 
        name: '— Seleccione un Rol —',
    },
    // ROLES DE ADMINISTRACIÓN Y VENTA MAYORISTA
    {
        value: 'SUPERUSER',
        name: 'Super Usuario (Desarrollador)'
    },
    {
        value: 'ADMIN',
        name: 'Administrador (Control Total)'
    },
    {
        value: 'DISTRIBUTOR',
        name: 'Distribuidor Principal' 
    },
    {
        value: 'RESELLER',
        name: 'Revendedor / Sub-Distribuidor' 
    },
    {
        value: 'SUBDISTRIBUTOR',
        name: 'Sub-Distribuidor' 
    },

    // ROLES DE VENTA MINORISTA (TAQUILLAS)
    {
        value: 'TAQUILLA',
        name: 'Taquilla (Punto de Venta Principal)'
    },
    {
        value: 'SUBTAQUILLA',
        name: 'Sub-Taquilla'
    },
    {
        value: 'SUSTAQUILLA', 
        name: 'Sust-Taquilla' // Mantengo el nombre que tienes en tu código para consistencia
    },

    // ROL DE USUARIO FINAL
    {
        value: 'CLIENT',
        name: 'Cliente (Usuario Final)'
    }
];