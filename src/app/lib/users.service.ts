import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

export async function fetchUsers(query, page) {
  const session = await getSession()

  const params = new URLSearchParams({
    'query': query,
    'page': (page - 1).toString(),
    'elements': ITEMS_PER_PAGE.toString()
  });
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users?${params}`, {
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
    throw new Error('Failed to fetch users.');
  }
}