// src/app/api/coverage/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryCode = (searchParams.get('countryCode') || '').toUpperCase();
  if (!countryCode) return NextResponse.json({ error: "Falta 'countryCode'." }, { status: 400 });

  // usa tus propias rutas, así diagnosticas exactamente lo que ve el front
  const statesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/states?countryCode=${countryCode}`, { cache: 'no-store' });
  const states = statesRes.ok ? await statesRes.json() : [];

  const sample = states.slice(0, 5); // muestra 5 estados para no tardar
  const citiesByState: Record<string, number> = {};
  for (const st of sample) {
    const name = st?.name || st?.state_name;
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/cities?countryCode=${countryCode}&stateName=${encodeURIComponent(name)}`, { cache: 'no-store' });
    const arr = r.ok ? await r.json() : [];
    citiesByState[name] = Array.isArray(arr) ? arr.length : 0;
  }

  return NextResponse.json({
    countryCode,
    statesCount: states.length,
    sampleStatesCities: citiesByState
  });
}
