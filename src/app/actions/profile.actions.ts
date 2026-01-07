'use server'

const API_URL = process.env.NEXT_PUBLIC_API_FULL || "https://motostore-api.onrender.com/api/v1";

function cleanCedula(value: any) {
  if (!value) return null;
  const strValue = String(value).replace(/\D/g, ''); 
  return strValue ? parseInt(strValue, 10) : null;
}

// Actualización con "Lista Blanca" (Solo enviamos lo que el backend soporta)
export async function updateProfileServer(token: string, userId: string, data: any, sessionUser: any) {
  const url = `${API_URL}/users/${userId}`;
  
  console.log("🚀 Server Action (Safe Update) -> ID:", userId);

  try {
    // ESTRATEGIA: LISTA BLANCA (WHITELIST)
    // Solo construimos el objeto con los campos EXACTOS que el backend permite editar.
    // Ignoramos todo el resto de basura que pueda tener la sesión.

    // 1. Calculamos la Cédula limpia
    let finalCedula = null;
    if (data.cedula) {
        finalCedula = cleanCedula(data.cedula);
    } else if (sessionUser.cedula || sessionUser.dni) {
        finalCedula = cleanCedula(sessionUser.cedula || sessionUser.dni);
    }

    // 2. Construimos el Payload MANUALMENTE (Esto es lo más seguro)
    const payload: any = {
        // Usamos el dato nuevo (data) o el viejo (sessionUser) si no cambió
        name: data.name || sessionUser.name,
        email: data.email || sessionUser.email,
        // Algunos backends usan 'phone', otros 'telefono'. Enviamos 'phone' que es más estándar
        phone: data.phone || sessionUser.phone || sessionUser.telefono,
        // El rol no debería cambiar, pero si el backend lo exige, lo mandamos
        role: sessionUser.role || "CLIENT"
    };

    // Solo agregamos la cédula si existe y es válida
    if (finalCedula) {
        payload.cedula = finalCedula;
        // payload.dni = finalCedula; // Descomentar si tu backend usa 'dni' en vez de 'cedula'
    }

    // Agregamos username si existe (a veces es requerido)
    if (sessionUser.username) {
        payload.username = sessionUser.username;
    }

    console.log("📦 Payload Limpio:", JSON.stringify(payload));

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store' 
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error Backend:", errorText);

      try {
        const jsonError = JSON.parse(errorText);
        return { success: false, error: jsonError.detail || jsonError.message || `Error ${res.status}` };
      } catch {
        return { success: false, error: `El servidor rechazó los datos (${res.status}).` };
      }
    }

    const json = await res.json();
    return { success: true, data: json };
    
  } catch (error: any) {
    console.error("🔥 Error Critical:", error);
    return { success: false, error: error.message };
  }
}

export async function changePasswordServer(token: string, userId: string, data: any) {
  const url = `${API_URL}/users/${userId}/password`;
  try {
    const res = await fetch(url, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: `Error ${res.status}: ${txt.substring(0, 50)}` };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error de conexión." };
  }
}