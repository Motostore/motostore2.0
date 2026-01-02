/*-------------------------------------------------------------------
|  🐼 Function isFormInvalid
|
|  🐯 Purpose: CHECKS IF FORM IS VALID OR NOT
|
|  🐸 Returns:  BOOLEAN
*-------------------------------------------------------------------*/

// CORRECCIÓN: Tipamos 'err' como 'any' para evitar error de compilación
export const isFormInvalid = (err: any) => {
    // 🔥 LÓGICA ULTRA PREMIUM: Devuelve directamente si el objeto tiene claves.
    // Si la longitud es > 0, devuelve TRUE (inválido).
    
    // Agregamos una pequeña seguridad por si err llega nulo
    if (!err) return false;

    return Object.keys(err).length > 0
}