import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchCreateProduct } from '@/app/lib/products.service';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'superuser') {
    return NextResponse.json({ message: 'Acceso denegado.' }, { status: 403 });
  }

  try {
    const { productPath, ...productData } = await req.json();
    const token = session.user.token;

    const response = await fetchCreateProduct(productData, productPath, token);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}