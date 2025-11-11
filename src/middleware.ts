// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ONLY_SUPERUSER = [
  "/dashboard/admin/products",
  "/dashboard/admin/payments",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!ONLY_SUPERUSER.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookie = req.headers.get("cookie") ?? "";
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const r = await fetch(`${base}/api/auth/session`, {
      headers: { cookie },
      cache: "no-store",
    });

    const session = r.ok ? await r.json() : null;
    const role = String(session?.user?.role || "").toUpperCase();

    if (role !== "SUPERUSER") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard"; // o "/login"
      return NextResponse.redirect(url);
    }
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protegemos estos paths
export const config = {
  matcher: [
    "/dashboard/admin/products/:path*",
    "/dashboard/admin/payments/:path*",
  ],
};






