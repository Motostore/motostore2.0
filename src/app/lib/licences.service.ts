import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

export async function fetchAllLicenses() {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license`, {
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

export async function fetchCreateLicense(body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}

export async function fetchUpdateLicense(id, body) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user.token}` 
    },
    body
  })
  
  return response;
}

export async function fetchClientLicenses(query, page) {
  const session = await getSession();
  const params = new URLSearchParams({
    'query': query,
    'page': (page - 1).toString(),
    'elements': ITEMS_PER_PAGE.toString()
  });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/license/client?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
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