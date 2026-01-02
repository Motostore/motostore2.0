// src/app/api/countries/route.ts
import { NextResponse } from "next/server";

/**
 * Usa REST Countries (sin token) para devolver TODOS los países.
 * Docs: https://restcountries.com/
 */

export async function GET() {
  try {
    // name, cca2 (ISO2) y traducción al español si está
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,translations",
      { cache: "no-store" } // evita cache mientras pruebas
    );

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Fallo al pedir países a restcountries",
          status: res.status,
          statusText: res.statusText,
          body: raw?.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Normalizamos al formato que espera tu UI
    const normalized = (Array.isArray(data) ? data : []).map((c: any) => {
      const es = c?.translations?.spa?.common; // nombre en español si existe
      const name = es || c?.name?.common || "";
      const code = c?.cca2 || name;
      return { country_name: String(name), country_code: String(code) };
    })
    // quitamos los que no tengan nombre
    .filter((x: any) => x.country_name);

    // Orden alfabético por nombre (español si lo hay)
    normalized.sort((a: any, b: any) =>
      a.country_name.localeCompare(b.country_name, "es", { sensitivity: "base" })
    );

    return NextResponse.json(normalized, {
      // cachea 1 hora en prod; quita no-store arriba si ya está estable
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Excepción inesperada", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}

