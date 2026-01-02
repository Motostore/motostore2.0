import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// Configuración de GCS con Credenciales Privadas
// ----------------------------------------------------
const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID;
const GCS_CLIENT_EMAIL = process.env.GCS_CLIENT_EMAIL;
const GCS_PRIVATE_KEY = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'); 
const GCS_BUCKET_NAME = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;

let storage: Storage | null = null;

if (GCS_PROJECT_ID && GCS_CLIENT_EMAIL && GCS_PRIVATE_KEY && GCS_BUCKET_NAME) {
    try {
        storage = new Storage({
            projectId: GCS_PROJECT_ID,
            credentials: {
                client_email: GCS_CLIENT_EMAIL,
                private_key: GCS_PRIVATE_KEY,
            },
        });
    } catch (e) {
        console.error("GCS Initialization Failed:", e);
        storage = null;
    }
}

// ----------------------------------------------------
// API Route para la subida de archivos
// ----------------------------------------------------
// CORRECCIÓN CRÍTICA: Cambiamos 'edge' por 'nodejs'
export const runtime = 'nodejs';  

export async function POST(request: Request) {
    if (!storage || !GCS_BUCKET_NAME) {
        return NextResponse.json(
            { error: "GCS service not configured properly in environment variables." },
            { status: 500 }
        );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file found in the request." }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `marketing/${uuidv4()}.${fileExtension}`;

    try {
        const bucket = storage.bucket(GCS_BUCKET_NAME);
        const fileRef = bucket.file(fileName);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
                cacheControl: 'public, max-age=31536000',
            },
        });

        const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;

        return NextResponse.json({ 
            message: "File uploaded successfully",
            url: publicUrl,
            filename: fileName 
        });

    } catch (error) {
        console.error("GCS Upload Error:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: "Failed to upload file to GCS.", detail: error.message },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: "Unknown error occurred during file upload." },
                { status: 500 }
            );
        }
    }
}


