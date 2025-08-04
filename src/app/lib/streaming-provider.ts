import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

export async function fetchProvidersForTransaction() {
  try {
    const session = await getSession()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/available`, {
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
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }
}

export async function fetchAllProviders(query, page) {
  const session = await getSession()
  const params = new URLSearchParams({
    'query': query,
    'page': (page - 1).toString(),
    'elements': ITEMS_PER_PAGE.toString()
  });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming?${params}`, {
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
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }
}

export async function fetchCreateProvider(body) {
  try {
    const session = await getSession();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}` 
      },
      body
    })
    
    return response;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }
}

export async function fetchUpdateProvider(id, body) {
  const session = await getSession();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}` 
      },
      body
    })
    
    return response;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }
}

export async function fetchDeleteProvider(id) {
  try {
    const session = await getSession();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/${id}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}` 
      }
    })
    return response;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }
}