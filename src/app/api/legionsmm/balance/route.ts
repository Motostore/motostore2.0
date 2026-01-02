import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = 'https://legionsmm.com/api/v2';
// 👇 AQUI PONEMOS TU CLAVE DIRECTAMENTE PARA QUE FUNCIONE SI O SI
const API_KEY = '4c295b3e3283d7bc9fbd037e21cf1bfe'; 

export async function GET() {
    const formData = new URLSearchParams();
    formData.append('key', API_KEY);
    formData.append('action', 'balance');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)' 
            },
            body: formData,
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Error HTTP: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        
        if (data.error) {
             return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: 'Fallo de Conexión' }, { status: 500 });
    }
}
