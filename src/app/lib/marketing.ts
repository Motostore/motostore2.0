import { getSession } from "next-auth/react";

export async function fetchAllMarketing() {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing`, {
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

export async function fetchCreateMarketing(body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}

export async function fetchUpdateMarketing(id, body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/marketing/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}