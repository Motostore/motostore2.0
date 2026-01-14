import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // CORRECCIÓN NEXT.JS 16: Agregamos 'await'
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) return NextResponse.json({ error: 'Token faltante' }, { status: 401 });

    const res = await fetch('https://motostore-api.onrender.com/api/v1/marketing/balance', {
      method: 'GET',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': authHeader 
      },
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ error: `Backend: ${res.status}` }, { status: res.status });

    const data = await res.json();
    return NextResponse.json({
        balance: data.balance ?? data.data?.balance ?? 0,
        currency: 'USD'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error Proxy Legion' }, { status: 500 });
  }
}