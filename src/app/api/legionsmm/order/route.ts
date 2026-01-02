// src/app/api/legionsmm/order/route.ts
import { NextResponse } from 'next/server';

/**
 * Endpoint de Next.js para enviar una nueva orden de marketing al proveedor Legion SMM.
 * Método: POST
 * URL de acceso: /api/legionsmm/order
 */

// Usamos variables privadas (no empiezan con NEXT_PUBLIC)
const API_URL = process.env.LEGION_SMM_API_URL;
const API_KEY = process.env.LEGION_SMM_API_KEY;

export async function POST(request: Request) {
    // 1. Verificación de Seguridad y Configuración
    if (!API_URL || !API_KEY) {
        return NextResponse.json(
            { error: "Missing Legion SMM API configuration. Check .env.local file." },
            { status: 500 }
        );
    }
    
    // 2. Obtener datos del pedido desde el frontend (tu componente form.tsx)
    let orderData: any;
    try {
        orderData = await request.json();
    } catch (e) {
        return NextResponse.json(
            { error: "Invalid JSON format in request body." },
            { status: 400 }
        );
    }

    // 3. Construcción del Payload para Legion SMM
    // Agregamos la clave y la acción 'add' (que es la función 'order' del PHP)
    const payload = new URLSearchParams({
        key: API_KEY,
        action: 'add',
        ...orderData // Esto incluirá service, link, quantity, etc.
    });
    
    try {
        // 4. Llamada al proveedor externo (POST con cuerpo x-www-form-urlencoded)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                // El proveedor espera la data como un formulario
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'MotoStoreLLC-API-Client'
            },
            body: payload.toString(),
            cache: 'no-store',
        });

        // 5. Manejo de Errores del Proveedor
        const data = await response.json();

        if (response.ok && data.order) {
            // Éxito: El proveedor devolvió un ID de orden.
            // data = { "order": 12345 }
            return NextResponse.json(data);
        } else {
            // Error en la API (ej: { "error": "Incorrect link" })
            console.error('Legion SMM Order Error:', data);
            return NextResponse.json(
                { error: data.error || 'Failed to place order with Legion SMM.' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Network or Processing Error placing Legion SMM order:', error);
        return NextResponse.json(
            { error: 'Failed to connect or process the order request to Legion SMM.' },
            { status: 500 }
        );
    }
}