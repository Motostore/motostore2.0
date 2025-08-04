import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

export async function fetchProfiles(query, page) {
  try {
    const session = await getSession()

    const params = new URLSearchParams({
      'query': query,
      'page': (page - 1).toString(),
      'elements': ITEMS_PER_PAGE.toString()
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/profile?${params}`, {
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
    throw new Error('Failed to fetch profile.');
  }
}

export async function fetchClientProfiles() {
  try {
    const session = await getSession()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/profile/client`, {
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
    throw new Error('Failed to fetch profile.');
  }
}

export async function fetchRemoveProfile(id) {

  try {

    const session = await getSession()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/profile/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });
  
    return response;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch profile.');
  }
}

export async function fetchHardRemoveProfile(id) {

  try {
    const session = await getSession()
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/profile/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });
  
    return response;
    
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch profile.');
  }
}