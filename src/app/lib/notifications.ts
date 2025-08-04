import { getSession } from "next-auth/react";

export async function fetchNotifications() {
  const session = await getSession();
  if(session) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/notification`, {
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
  }
  return [];
}

export async function fetchAllNotifications() {
  const session = await getSession();
  if(session) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/notification/all`, {
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
  }
  return [];
}

export async function markAsRead(id: number) {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/notification/done/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}`
    }
  });

  if (response.ok) {
    return true;
  }
  return false;
}