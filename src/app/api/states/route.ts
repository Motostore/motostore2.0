// src/app/api/states/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PATCH_STATES } from '../_data/locations';

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

async function fetchStatesFromUT(countryName: string) {
  const base = process.env.NEXT_PUBLIC_APICOUNTRY_URL || 'https://www.universal-tutorial.com/api';
  const token = await getUTToken();
  if (!token) return null;

  const r = await fetch(`${base}/states/${encodeURIComponent(countryName)}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!r.ok) return null;
  return await r.json().catch(() => null);
}

async function fetchStatesFromCountriesNow(countryName: string) {
  const r = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: countryName }),
    cache: 'no-store',
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  const states = j?.data?.states ?? j?.data?.[0]?.states ?? [];
  return states.map((s: any) => ({
    state_name: s?.name ?? s,
    name: s?.name ?? s,
    state_code: s?.state_code ?? s?.code ?? undefined,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country');
  const countryCode  = searchParams.get('countryCode');
  const countryName  = countryParam || (countryCode ? countryNameFromCode(countryCode) : null);
  const iso2 = (countryCode || '').toUpperCase();

  if (!countryName) {
    return NextResponse.json({ error: "Falta 'country' o 'countryCode'." }, { status: 400 });
  }

  // 1) Universal Tutorial
  const ut = await fetchStatesFromUT(countryName);
  // 2) CountriesNow
  const cn = await fetchStatesFromCountriesNow(countryName);

  // normaliza a array de {name, state_name, state_code}
  const baseList: any[] = (Array.isArray(ut) && ut.length ? ut : [])
    .concat(Array.isArray(cn) && cn.length ? cn : []);

  // 3) Merge con parches locales
  const extras = PATCH_STATES[iso2] || [];
  for (const extra of extras) {
    if (!baseList.some(s =>
      (s?.state_name || s?.name || '').toLowerCase().trim() === extra.toLowerCase().trim()
    )) {
      baseList.push({ state_name: extra, name: extra, state_code: undefined });
    }
  }

  // dedupe + orden alfabético
  const dedup = Array.from(
    new Map(
      baseList.map((s) => {
        const n = String(s?.state_name || s?.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        return [n, { state_name: s?.state_name || s?.name, name: s?.state_name || s?.name, state_code: s?.state_code }];
      })
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  if (!dedup.length) {
    return NextResponse.json({ error: 'No hay datos de estados.' }, { status: 502 });
  }

  return NextResponse.json(dedup, { status: 200 });
}





