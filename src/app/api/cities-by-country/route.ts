// src/app/api/cities-by-country/route.ts
import { NextResponse } from "next/server";
import { City } from "country-state-city";

/**
 * GET /api/cities-by-country?countryCode=CO
 * Devuelve [{ city_name }]
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const countryCode = (searchParams.get("countryCode") || "").toUpperCase();

  if (!countryCode) {
    return NextResponse.json({ error: "Falta countryCode" }, { status: 400 });
  }

  try {
    const cities = City.getCitiesOfCountry(countryCode) || [];
    const normalized = cities
      .map((c) => ({ city_name: c.name }))
      .filter((c) => c.city_name);

    return NextResponse.json(normalized);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Excepción inesperada", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
