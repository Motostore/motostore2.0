import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

// Definimos una interfaz básica para la sesión para evitar errores de tipo en session.user.token
type SessionWithToken = {
  user: {
    token?: string;
    email?: string;
    image?: string;
    name?: string;
  }
} | null;

export async function fetchAllLicenses() {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}`
    }
  });

  if (response.ok) {
    const json = await response.json();
    return json;
  }
  return [];
}

// CORRECCIÓN: Agregamos el tipo ': any' al parámetro body
export async function fetchCreateLicense(body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos que el body se envíe como string JSON si es un objeto
  })
  
  return response;
}

// CORRECCIÓN: Agregamos tipos a 'id' y 'body'
export async function fetchUpdateLicense(id: string | number, body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos formato JSON
  })
  
  return response;
}

// CORRECCIÓN: Agregamos tipos a 'query' (string) y 'page' (number)
export async function fetchClientLicenses(query: string, page: number) {
  const session = await getSession() as SessionWithToken;
  const params = new URLSearchParams({
    'query': query || '',
    'page': (page - 1).toString(),
    'elements': ITEMS_PER_PAGE.toString()
  });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license/client?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token || ''}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json)
      return json;
    }
    return [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch licenses.');
  }
}