import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from "next-auth/react";
import { fetchProvidersForTransaction } from './streaming-provider';


/*
    Productos:
    Licencias: license
    Recargas: recharge
    Marketing: marketing
*/

const ITEMS_PER_PAGE = 10;

export async function fetchProductsByType( productPath) {
  const session = await getSession()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}`, {
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
export async function fetchPagedProductsByType(query, page, productPath) {
  const session = await getSession()

  const params = new URLSearchParams({
    'query': query,
    'page': (page - 1).toString(),
    'elements': ITEMS_PER_PAGE.toString()
  });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}?${params}`, {
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

export async function fetchProductById(id, productPath) {
  const session = await getSession()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });
  
    return response;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch streamings data.');
  }

}

export async function fetchCreateProduct(body, productPath) {
  const session = await getSession();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}`, {
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

export async function fetchUpdateProduct(id, body, productPath) {
  const session = await getSession();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}/${id}`, {
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

export async function fetchDeleteProduct(id, productPath) {
  const session = await getSession();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/${productPath}/${id}`, {
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

export async function fetchAllProducts() {
  noStore();
  try {
    const data = await Promise.all([
      fetchProvidersForTransaction(),
      fetchProductsByType('recharge'),
      fetchProductsByType('license/provider/available'),
      fetchProductsByType('marketing'),
    ]);

    const streamings = data[0] ?? [];
    const recharges = data[1] ?? [];
    const licenses = data[2] ?? [];
    const marketing = data[3] ?? [];
    
    return {
      streamings,
      recharges,
      licenses,
      marketing
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products data.');
  }
}