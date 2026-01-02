import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// TU BACKEND REAL (Donde se guardan los datos)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_FULL || "http://localhost:8080/api/v1"; 

// 1. POST: Recibe productos nuevos (Manuales o de Sincronización)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'superuser') {
    return NextResponse.json({ message: 'Acceso denegado.' }, { status: 403 });
  }

  try {
    const productData = await req.json();
    const token = (session.user as any)?.token;

    // Reenvía los datos a tu Backend/Base de Datos
    const response = await fetch(`${BACKEND_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      console.error("Error Backend:", await response.text());
      return NextResponse.json({ message: 'Error guardando en BD' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'Error servidor interno' }, { status: 500 });
  }
}

// 2. GET: Para que el catálogo muestre la lista
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const token = (session?.user as any)?.token;
    
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.toString();

        // Pide la lista a tu Backend
        const response = await fetch(`${BACKEND_URL}/products?${query}`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            cache: 'no-store'
        });
        
        if (!response.ok) return NextResponse.json([], { status: response.status });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}