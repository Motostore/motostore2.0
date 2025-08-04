import { getSession } from "next-auth/react";

export async function fetchAllRecharges() {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}`
    }
  });

  if (response.ok) {
    const json = await response.json();
    return json;
  }
  return [];
}

export async function fetchCreateRecharge(body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}

export async function fetchUpdateRecharge(id, body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/recharge/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}