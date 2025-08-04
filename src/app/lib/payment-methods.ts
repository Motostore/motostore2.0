import { getSession } from "next-auth/react";

export async function fetchPaymentMethod(type: string) {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/payment/method/type/${type}`, {
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

export async function fetchPaymentMethodById(id: number) {
  const session = await getSession()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/payment/method/${id}`, {
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
  return null;
}