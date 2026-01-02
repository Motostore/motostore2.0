import { getSession } from "next-auth/react";

// Definimos el tipo para evitar errores con session.user.token
type SessionWithToken = {
  user: {
    token?: string;
  }
} | null;

export async function fetchAllMarketing() {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing`, {
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

// CORRECCIÓN: Agregado tipo ': any' a body
export async function fetchCreateMarketing(body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos que se envíe como string JSON
  })
  
  return response;
}

// CORRECCIÓN: Agregado tipo a 'id' y 'body'
export async function fetchUpdateMarketing(id: string | number, body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos que se envíe como string JSON
  })
  
  return response;
}