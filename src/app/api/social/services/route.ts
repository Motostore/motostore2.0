import { NextResponse } from 'next/server';

/**
 * Endpoint de Next.js para obtener la lista de servicios.
 * URL de acceso: /api/legionsmm/services
 */

export async function GET() {
    // 1. Usamos los nombres que configuraste en Vercel
    // (Si en Vercel pusiste LEGION_SMM_..., cámbialo aquí, pero por defecto usamos este estándar)
    const API_URL = process.env.LEGION_API_URL || process.env.LEGION_SMM_API_URL;
    const API_KEY = process.env.LEGION_API_KEY || process.env.LEGION_SMM_API_KEY;

    // 2. Verificación de Seguridad
    if (!API_URL || !API_KEY) {
        console.error("❌ Faltan las variables de entorno LEGION en Vercel.");
        return NextResponse.json(
            { error: "Error de configuración en el servidor (Missing API KEY)." },
            { status: 500 }
        );
    }
    
    try {
        // 3. Preparar datos para Legion (Usar POST es el estándar SMM)
        const formData = new URLSearchParams();
        formData.append('key', API_KEY);
        formData.append('action', 'services');

        // 4. Llamada al proveedor (Legion)
        const response = await fetch(API_URL, {
            method: 'POST', // ⚠️ IMPORTANTE: Legion usa POST, no GET
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'MotoStore-Client/1.0'
            },
            body: formData,
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Legion respondió con error: ${response.status}`);
        }

        const data = await response.json();

        // 5. Devolver al Frontend
        return NextResponse.json(data);

    } catch (error) {
        console.error('🔥 Error conectando con Legion:', error);
        return NextResponse.json(
            { error: 'Fallo al conectar con el proveedor de servicios.' },
            { status: 500 }
        );
    }
}