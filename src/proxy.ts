// src/proxy.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORRECCIÓN 1: Convertimos la función principal en 'async'
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard/admin")) {
    // CORRECCIÓN 2: Agregamos 'await' para esperar la respuesta de la sesión
    // CORRECCIÓN 3: Tipamos como 'any' para evitar errores de tipo en .role
    const session: any = await getSession(req);
    
    if (!session || session.role !== "SUPERUSER") {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

// Obtén la sesión del usuario
async function getSession(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    return res.ok ? await res.json() : null;
  } catch (error) {
    // Si falla el fetch, retornamos null para evitar crash
    return null;
  }
}

export const config = {
  matcher: ["/dashboard/admin/:path*"],
};








