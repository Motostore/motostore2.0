// src/app/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
// 🚀 FIX: Importamos el tipo 'Session' para sobreescribir la ambigüedad
import { Session } from "next-auth"; 


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = (await getServerSession(req, res, authOptions as any)) as (Session & { user: { accessToken?: string, token?: string } } | null);
    
    // 🚀 FIX PRO: Mantenemos la validación estricta, pero ahora con el tipo corregido
    if (!session || !session.user) {
        return res.status(401).json({ error: "No autorizado. Sesión o usuario no encontrado." });
    }

    // Ahora TypeScript no se quejará de session.user:
    const accessToken =
      (session.user as any)?.accessToken ||
      (session.user as any)?.token ||
      null;

    if (!accessToken) {
        return res.status(401).json({ error: "No se pudo obtener el Access Token de la sesión." });
    }

    // ... (El resto del código de la API permanece igual) ...
    const base = process.env.API_BASE || "http://localhost:8080/api/v1";
    // ... (Lógica de fetch y retorno) ...
  } catch (err: any) {
    return res.status(500).json({ error: "Fallo inesperado", detail: String(err) });
  }
}
