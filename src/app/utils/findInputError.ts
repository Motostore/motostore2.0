/*-------------------------------------------------------------------
|  🐼 Function findInputError
|
|  🐯 Purpose: GIVEN AN ERRORS OBJECT AND AN INPUT NAME, THIS FUNCTION
|              FILTERS THE ERRORS OBJECT AND RETURN THE ERROR OF THE 
|              GIVEN INPUT.
|
|  🐸 Returns:  OBJECT
*-------------------------------------------------------------------*/

import { InputError } from "../types/input-error.interface"; //

// Se utiliza 'any' en errors porque el objeto de errores de react-hook-form es dinámico.
export function findInputError(errors: any, name: string): InputError {
  
    // 🚨 LÓGICA ULTRA PREMIUM:
    // 1. Acceso Directo: Intenta acceder al error usando el nombre del campo directamente. 
    //    Esto es lo más rápido y común con React Hook Form.
    const directError = errors[name];
    
    if (directError) {
        // Mapea la respuesta directa al formato de la interfaz InputError
        return { error: directError } as InputError;
    }

    // 2. Fallback (Si el error está anidado o no coincide exactamente)
    const filteredKey = Object.keys(errors).find(key => key.includes(name));

    if (filteredKey) {
        return { error: errors[filteredKey] } as InputError;
    }

    // 3. Si no hay error, devuelve un objeto vacío (que cumple con la interfaz)
    return {} as InputError;
}