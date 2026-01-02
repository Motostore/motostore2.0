// src/app/lib/gcs.ts (EDICIÓN FINAL: ULTRA PREMIUM & SECURE)

// 🛡️ 1. SEGURIDAD TOTAL: 'server-only'
// Esto asegura que si importas este archivo en un componente 'use client' por error,
// la compilación fallará para proteger tus secretos.
import 'server-only';

import { Storage } from '@google-cloud/storage';

// 🛡️ 2. VALIDACIÓN DE ENTORNO (Fail Fast)
// Verificamos que las credenciales existan antes de intentar conectar.
const projectId = process.env.GCS_PROJECT_ID;
const clientEmail = process.env.GCS_CLIENT_EMAIL;
const privateKey = process.env.GCS_PRIVATE_KEY;
const bucketName = process.env.GCS_BUCKET_NAME || 'moto-store-llc.appspot.com';

if (!projectId || !clientEmail || !privateKey) {
  // Si falta algo, lanzamos un error descriptivo en la consola del servidor
  throw new Error(
    '🔴 Error Crítico en GCS: Faltan las credenciales de Google Cloud (GCS_PROJECT_ID, GCS_CLIENT_EMAIL o GCS_PRIVATE_KEY) en el archivo .env'
  );
}

// 🚀 3. INICIALIZACIÓN DEL CLIENTE
const storage = new Storage({
  projectId,
  credentials: {
    client_email: clientEmail,
    // Fix vital para Vercel: Reemplaza los saltos de línea escapados
    private_key: privateKey.replace(/\\n/g, '\n'),
  },
});

// Exportamos la referencia al bucket lista para usar
export const bucket = storage.bucket(bucketName);