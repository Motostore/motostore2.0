// src/pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ya lo tienes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // token desde tu sesión de NextAuth
    const session = await getServerSession(req, res, authOptions as any);
    const accessToken =
      (session?.user as any)?.accessToken ||
      (session?.user as any)?.token ||
      null;

    if (!accessToken) return res.status(401).json({ error: "No hay sesión" });

    const base = process.env.API_BASE || "http://localhost:8080/api/v1";
    const authPrefix = process.env.API_AUTH || "/auth";

    // Probar varios endpoints comunes del backend
    const candidates = [
      `${base}/users`,
      `${base}${authPrefix}/users`,
      `${base}/admin/users`,
      `${base}${authPrefix}/admin/users`,
    ];

    let lastStatus = 0;
    let lastData: any = null;

    for (const url of candidates) {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const text = await r.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text; }

      if (r.ok) {
        return res.status(200).json(data);
      } else {
        lastStatus = r.status;
        lastData = { url, status: r.status, data };
        // si es 404, probamos el siguiente; otros códigos también los probamos por si acaso
      }
    }

    // si ninguno funcionó
    return res.status(lastStatus || 404).json({
      error: "Ningún endpoint de usuarios respondió OK",
      tried: candidates,
      last: lastData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Fallo inesperado", detail: String(err) });
  }
}
