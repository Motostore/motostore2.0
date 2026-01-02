// src/app/api/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PATCH_CITIES } from '../_data/locations';

function countryNameFromCode(code: string) {
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

async function getUTToken() {
  const base = process.env.NEXT_PUBLIC_APICOUNTRY_URL || '';
  const email = process.env.NEXT_PUBLIC_APICOUNTRY_EMAIL || '';
  const apiToken = process.env.NEXT_PUBLIC_APICOUNTRY_TOKEN || '';
  if (!base.includes('universal-tutorial') || !email || !apiToken) return null;

  const r = await fetch(`${base}/getaccesstoken`, {
    headers: { 'api-token': apiToken, 'user-email': email },
    cache: 'no-store',
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.auth_token ?? null;
}

async function fetchCitiesFromUT(stateName: string) {
  const base = process.env.NEXT_PUBLIC_APICOUNTRY_URL || 'https://www.universal-tutorial.com/api';
  const token = await getUTToken();
  if (!token) return null;

  const r = await fetch(`${base}/cities/${encodeURIComponent(stateName)}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!r.ok) return null;
  return await r.json().catch(() => null);
}

async function fetchCitiesFromCountriesNow(countryName: string, stateName: string) {
  const r = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: countryName, state: stateName }),
    cache: 'no-store',
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  const arr = j?.data ?? [];
  return Array.isArray(arr) ? arr.map((name: string) => ({ city_name: name, name })) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country');
  const countryCode  = searchParams.get('countryCode');
  const stateName    = searchParams.get('stateName'); // viene del Context
  const countryName  = countryParam || (countryCode ? countryNameFromCode(countryCode) : null);
  const iso2         = (countryCode || '').toUpperCase();

  if (!countryName) return NextResponse.json({ error: "Falta 'country' o 'countryCode'." }, { status: 400 });
  if (!stateName)   return NextResponse.json({ error: "Falta 'stateName'." }, { status: 400 });

  // 1) Universal Tutorial
  const ut = await fetchCitiesFromUT(stateName);
  // 2) CountriesNow
  const cn = await fetchCitiesFromCountriesNow(countryName, stateName);

  const baseList: any[] = (Array.isArray(ut) && ut.length ? ut : [])
    .concat(Array.isArray(cn) && cn.length ? cn : []);

  // 3) Merge con parches locales
  const extras = (PATCH_CITIES[iso2] && PATCH_CITIES[iso2][stateName]) || [];
  for (const extra of extras) {
    if (!baseList.some((c) =>
      (c?.city_name || c?.name || '').toLowerCase().trim() === extra.toLowerCase().trim()
    )) {
      baseList.push({ city_name: extra, name: extra });
    }
  }

  // dedupe + orden
  const dedup = Array.from(
    new Map(
      baseList.map((c) => {
        const n = String(c?.city_name || c?.name || '')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase().trim();
        const name = c?.city_name || c?.name || '';
        return [n, { city_name: name, name }];
      })
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  if (!dedup.length) {
    return NextResponse.json({ error: 'No hay datos de ciudades.' }, { status: 502 });
  }

  return NextResponse.json(dedup, { status: 200 });
}




