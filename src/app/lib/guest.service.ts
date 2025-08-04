
export async function fetchGuestProducts() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/guest/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    if (response.ok) {
      const json = await response.json();
      return json;
    }
    return [];
  }