// src/app/Context/locationSelectContext.tsx
'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import originalFetch from 'isomorphic-fetch';
import fetchBuilder from 'fetch-retry-ts';

const options = { retries: 3, retryDelay: 1000 };
const fetch = fetchBuilder(originalFetch, options);

// ---------- Tipos ----------
interface Option {
  value: string; // país: ISO2 (CO), estado: code o nombre, ciudad: nombre
  name: string;
}

interface LocationSelectContextType {
  countries: Option[];
  states: Option[];
  cities: Option[];
  getStates: (countryCode: string) => void; // ISO2 del país
  getCities: (stateValue: string) => void;  // code o nombre
  loadingLocations: boolean;
}

export const LocationSelectContext = createContext<LocationSelectContextType | undefined>(undefined);

// ---------- Helper: parseo seguro ----------
async function safeJson<T = any>(response: Response): Promise<{ data: T | null; raw: string }> {
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const preview = await response.clone().text();
    console.warn('DEBUG_LOC: content-type no JSON. Status:', response.status);
    console.warn('DEBUG_LOC: preview (600):', preview.slice(0, 600));
  }
  const raw = await response.text();
  if (!raw) return { data: null, raw: '' };
  try {
    return { data: JSON.parse(raw) as T, raw };
  } catch {
    console.error('DEBUG_LOC: Cuerpo no-JSON (600):', raw.slice(0, 600));
    return { data: null, raw };
  }
}

export function LocationSelectProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // País actual (ISO2) y flag si el país TIENE estados
  const currentCountryCodeRef = useRef<string>('');
  const hasStatesRef = useRef<boolean>(true);

  // ---------- Countries ----------
  async function fetchCountries() {
    try {
      const response = await fetch('/api/countries', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        const { raw } = await safeJson(response);
        console.error('DEBUG_LOC: Error /api/countries:', response.status, response.statusText, raw ?? '');
        setCountries([]);
        return;
      }
      const { data: json } = await safeJson<any>(response);
      if (!json || !Array.isArray(json)) {
        setCountries([]);
        return;
      }
      const mapped: Option[] = json
        .map((item: any) => {
          const name = item?.country_name ?? item?.name ?? String(item ?? '');
          const code = (item?.country_code ?? item?.cca2 ?? item?.iso2 ?? item?.isoCode ?? name)?.toUpperCase?.() ?? '';
          if (!name || !code) return null;
          return { value: code, name: String(name) };
        })
        .filter(Boolean) as Option[];
      setCountries(mapped);
    } catch (err) {
      console.error('DEBUG_LOC: Error /api/countries:', err);
      setCountries([]);
    } finally {
      setLoadingLocations(false);
    }
  }

  // ---------- Ciudades por país (para países SIN estados) ----------
  async function loadCitiesByCountry(countryCode: string) {
    try {
      const response = await fetch(`/api/cities-by-country?countryCode=${encodeURIComponent(countryCode)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        const { raw } = await safeJson(response);
        console.error('DEBUG_LOC: Error /api/cities-by-country:', response.status, response.statusText, raw ?? '');
        setCities([]);
        return;
      }
      const { data: json } = await safeJson<any>(response);
      const list = Array.isArray(json) ? json : [];
      const mapped: Option[] = list
        .map((item: any) => {
          const name = item?.city_name ?? item?.name ?? '';
          if (!name) return null;
          return { value: String(name), name: String(name) };
        })
        .filter(Boolean) as Option[];
      setCities(mapped);
      console.log('DEBUG_LOC: Ciudades (por país) establecidas. Total:', mapped.length);
    } catch (err) {
      console.error('DEBUG_LOC: Error ciudades por país:', err);
      setCities([]);
    }
  }

  // ---------- States ----------
  async function getStates(countryCode: string) {
    const iso2 = String(countryCode).toUpperCase();
    currentCountryCodeRef.current = iso2;

    setLoadingLocations(true);
    setStates([]);
    setCities([]); // al cambiar país, vaciamos ciudades

    try {
      const response = await fetch(`/api/states?countryCode=${encodeURIComponent(iso2)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        const { raw } = await safeJson(response);
        console.error('DEBUG_LOC: Error /api/states:', response.status, response.statusText, raw ?? '');
        // ⚠️ Importante: en caso de ERROR **no** asumimos que el país es “sin estados”.
        // Dejamos hasStates=true y ciudades vacías para que el usuario no vea ciudades por país.
        hasStatesRef.current = true;
        setCities([]);
        return;
      }

      const { data: json } = await safeJson<any>(response);
      const list = Array.isArray(json) ? json : [];

      const mapped: Option[] = list
        .map((item: any) => {
          const name = item?.state_name ?? item?.name ?? '';
          const code = (item?.state_code ?? item?.iso2 ?? item?.code ?? '')?.toUpperCase?.() ?? '';
          if (!name) return null;
          const value = code || name; // fallback al nombre si no hay código
          return { value: String(value), name: String(name) };
        })
        .filter(Boolean) as Option[];

      setStates(mapped);
      hasStatesRef.current = mapped.length > 0;

      // País sin estados -> ahora sí cargamos ciudades por país
      if (!hasStatesRef.current) {
        await loadCitiesByCountry(iso2);
      } else {
        // País con estados -> esperamos a que el usuario elija el estado
        setCities([]);
      }
      console.log('DEBUG_LOC: Estados establecidos:', mapped.length, 'hasStates=', hasStatesRef.current);
    } catch (err) {
      console.error('DEBUG_LOC: Error en estados:', err);
      setStates([]);
      // Igual que arriba: en error NO llenamos ciudades por país
      hasStatesRef.current = true;
      setCities([]);
    } finally {
      setLoadingLocations(false);
    }
  }

  // ---------- Cities ----------
  async function getCities(stateValue: string) {
    const countryCode = currentCountryCodeRef.current;
    if (!countryCode) {
      console.error('DEBUG_LOC: No hay countryCode. Llama primero a getStates(code).');
      setCities([]);
      return;
    }

    setLoadingLocations(true);

    // País sin estados -> ciudades por país
    if (!hasStatesRef.current) {
      await loadCitiesByCountry(countryCode);
      setLoadingLocations(false);
      return;
    }

    // País con estados -> pedimos por stateCode y stateName
    const st = states.find((s) => s.value === stateValue);
    const stateName = st?.name || stateValue;

    const url =
      `/api/cities?countryCode=${encodeURIComponent(countryCode)}` +
      `&stateCode=${encodeURIComponent(String(stateValue))}` +
      `&stateName=${encodeURIComponent(String(stateName))}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        const { raw } = await safeJson(response);
        console.error('DEBUG_LOC: Error /api/cities:', response.status, response.statusText, raw ?? '');
        setCities([]);
        return;
      }

      const { data: json } = await safeJson<any>(response);
      const list = Array.isArray(json) ? json : [];

      const mapped: Option[] = list
        .map((item: any) => {
          const name = item?.city_name ?? item?.name ?? '';
          if (!name) return null;
          return { value: String(name), name: String(name) };
        })
        .filter(Boolean) as Option[];

      // Quita duplicados y ordena
      const deduped = Array.from(
        new Map(
          mapped.map(o => [
            (o.value || o.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(),
            o
          ])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

      setCities(deduped);
      console.log('DEBUG_LOC: Ciudades establecidas. Total:', deduped.length);
    } catch (err) {
      console.error('DEBUG_LOC: Error en ciudades:', err);
      setCities([]);
    } finally {
      setLoadingLocations(false);
    }
  }

  // ---------- Inicialización ----------
  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: LocationSelectContextType = {
    countries,
    states,
    cities,
    getStates,
    getCities,
    loadingLocations,
  };

  return (
    <LocationSelectContext.Provider value={contextValue}>
      {children}
    </LocationSelectContext.Provider>
  );
}

export default LocationSelectProvider;









