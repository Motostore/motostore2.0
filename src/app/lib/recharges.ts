import { getSession } from "next-auth/react";

// Tipo auxiliar para asegurar que TypeScript reconozca el token
type SessionWithToken = {
  user: {
    token?: string;
  }
} | null;

export async function fetchAllRecharges() {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge`, {
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

// CORRECCIÓN: Tipo explícito ': any' para body
export async function fetchCreateRecharge(body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos que se envíe como string JSON
  })
  
  return response;
}

// CORRECCIÓN: Tipos explícitos para id y body
export async function fetchUpdateRecharge(id: string | number, body: any) {
  const session = await getSession() as SessionWithToken;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token || ''}` 
    },
    body: JSON.stringify(body) // Aseguramos que se envíe como string JSON
  })
  
  return response;
}