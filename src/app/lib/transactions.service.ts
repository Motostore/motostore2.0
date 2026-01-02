import { FetchError, TransactionVerify, ZinliTransaction } from "./definitions";
import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

// Tipo auxiliar para asegurar que TypeScript reconozca el token en la sesión
type SessionWithToken = {
  user: {
    token?: string;
  }
} | null;

export async function fetchTransaction(body: ZinliTransaction) {
  try {
    const session = await getSession() as SessionWithToken;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token || ''}`
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    }
    
    return [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transaction.');
  }
  }

// CORRECCIÓN: Agregados tipos para query (string) y page (number)
export async function fetchTransactionManager(query: string, page: number) {
  try {
    const session = await getSession() as SessionWithToken;
    
    const params = new URLSearchParams({
      'query': query || '',
      'page': (page - 1).toString(),
      'elements': ITEMS_PER_PAGE.toString()
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/transaction/manager?${params}`, {
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
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transaction.');
  }
}

export async function fetchTransactionClient() {
  try {
    const session = await getSession() as SessionWithToken;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/transaction/client`, {
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
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transaction.');
  }
}

// CORRECCIÓN: Agregado tipo para id
export async function fetchTransactionById(id: string | number) {
  try {
    const session = await getSession() as SessionWithToken;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/transaction/manager/${id}`, {
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
    
    return null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transaction.');
  }
}

export async function fetchVerifyTransaction(id: number, body: TransactionVerify) {
  try {
    const session = await getSession() as SessionWithToken;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/transaction/verify/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token || ''}`
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    }
    const jsonError = await response.json();
    const error : FetchError = {
      error: true,
      message: jsonError.access_denied_reason
    }
    return error;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}