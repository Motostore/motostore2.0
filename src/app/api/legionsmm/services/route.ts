// src/app/api/legionsmm/services/route.ts
import { NextResponse } from 'next/server';

/**
 * Endpoint de Next.js para obtener la lista de servicios disponibles de Legion SMM.
 * Actúa como un proxy seguro para ocultar LEGION_SMM_API_KEY.
 * URL de acceso: /api/legionsmm/services
 */

// Usamos variables privadas (que NO empiezan con NEXT_PUBLIC)
const API_URL = process.env.LEGION_SMM_API_URL;
const API_KEY = process.env.LEGION_SMM_API_KEY;

export async function GET() {
    // 1. Verificación de Seguridad
    if (!API_URL || !API_KEY) {
        return NextResponse.json(
            { error: "Missing Legion SMM API configuration. Check .env.local file." },
            { status: 500 }
        );
    }
    
    // 2. Construcción del Payload
    // Usamos el mismo formato GET que el SDK de PHP (action=services)
    const params = new URLSearchParams({
        key: API_KEY,
        action: 'services',
    });
    
    try {
        // 3. Llamada al proveedor externo
        const response = await fetch(`${API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Es buena práctica usar un User-Agent en llamadas de API de servidor a servidor
                'User-Agent': 'MotoStoreLLC-API-Client'
            },
            // Deshabilitar caché para obtener siempre los datos frescos del proveedor
            cache: 'no-store',
        });

        // 4. Manejo de Errores del Proveedor
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Legion SMM API Error:', response.status, errorText);
            return NextResponse.json(
                { error: `Legion SMM API returned status ${response.status}.` },
                { status: response.status }
            );
        }

        // 5. Devolver los servicios al frontend
        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Network or Processing Error fetching Legion SMM services:', error);
        return NextResponse.json(
            { error: 'Failed to connect to Legion SMM API.' },
            { status: 500 }
        );
    }
}