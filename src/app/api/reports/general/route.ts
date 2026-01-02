import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  const accessToken = (session as any)?.accessToken || (session?.user as any)?.token;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_FULL || "").replace(/\/+$/, "");
  if (!base) {
    return NextResponse.json({ detail: "Falta NEXT_PUBLIC_API_BASE_URL" }, { status: 500 });
  }

  const res = await fetch(`${base}/reports/general`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
