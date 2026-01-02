'use client';

import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import originalFetch from 'isomorphic-fetch';
import fetchBuilder from 'fetch-retry-ts';

// Configuración de reintento para fetch (ayuda si el backend parpadea)
const options = { retries: 3, retryDelay: 1000 };
const fetch = fetchBuilder(originalFetch, options);

// ---------- Tipos ----------
interface Option {
  value: string;
  name: string;
}

interface LocationSelectContextType {
  countries: Option[];
  states: Option[];
  cities: Option[];
  getStates: (countryCode: string) => void;
  getCities: (stateValue: string) => void;
  loadingLocations: boolean;
}

export const LocationSelectContext = createContext<LocationSelectContextType | undefined>(
  undefined
);

// ---------- Helper: parseo seguro ----------
async function safeJson<T = unknown>(
  response: Response
): Promise<{ data: T | null; raw: string }> {
  try {
    const raw = await response.text();
    if (!raw) return { data: null, raw: '' };
    return { data: JSON.parse(raw) as T, raw };
  } catch {
    return { data: null, raw: '' };
  }
}

type LocationSelectProviderProps = {
  children: ReactNode;
};

export function LocationSelectProvider({ children }: LocationSelectProviderProps) {
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Refs para valores internos que no necesitan re-renderizar la UI
  const currentCountryCodeRef = useRef<string>('');
  const hasStatesRef = useRef<boolean>(true);
  const lastCountryWithStatesRef = useRef<string | null>(null);

  // ---------- 1. Fetch Countries ----------
  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(
          `DEBUG_LOC: Error al cargar países (${response.status}). Verifica tu Backend.`
        );
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
          const code = (
            item?.country_code ??
            item?.cca2 ??
            item?.iso2 ??
            item?.isoCode ??
            name
          )
            ?.toString?.()
            ?.toUpperCase?.() ?? '';

          if (!name || !code) return null;
          return { value: code, name: String(name) };
        })
        .filter(Boolean) as Option[];

      setCountries(mapped);
    } catch (err) {
      console.error('DEBUG_LOC: Error crítico en fetchCountries:', err);
      setCountries([]);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  // ---------- 2. Cargar ciudades por país (Helper estable) ----------
  const loadCitiesByCountry = useCallback(async (countryCode: string) => {
    try {
      const response = await fetch(
        `/api/cities-by-country?countryCode=${encodeURIComponent(countryCode)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
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

      const deduped = Array.from(new Map(mapped.map(o => [o.name, o])).values()).sort(
        (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );

      setCities(deduped);
    } catch (err) {
      console.error('DEBUG_LOC: Error ciudades por país:', err);
      setCities([]);
    }
  }, []);

  // ---------- 3. Get States ----------
  const getStates = useCallback(
    async (countryCode: string) => {
      const iso2 = String(countryCode).toUpperCase();

      // Evitar recargas innecesarias para el mismo país con estados ya cargados
      if (lastCountryWithStatesRef.current === iso2 && hasStatesRef.current) {
        return;
      }

      currentCountryCodeRef.current = iso2;
      setLoadingLocations(true);
      setStates([]);
      setCities([]);

      try {
        const response = await fetch(
          `/api/states?countryCode=${encodeURIComponent(iso2)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          // Si la API de estados falla, asumimos que no se puede usar este endpoint,
          // pero NO marcamos hasStatesRef en false porque no sabemos si hay o no.
          console.error('DEBUG_LOC: Error HTTP en /api/states:', response.status);
          return;
        }

        const { data: json } = await safeJson<any>(response);
        const list = Array.isArray(json) ? json : [];

        const mapped: Option[] = list
          .map((item: any) => {
            const name = item?.state_name ?? item?.name ?? '';
            const code = (
              item?.state_code ??
              item?.iso2 ??
              item?.code ??
              ''
            )
              ?.toString?.()
              ?.toUpperCase?.() ?? '';

            if (!name) return null;
            return { value: String(code || name), name: String(name) };
          })
          .filter(Boolean) as Option[];

        setStates(mapped);
        hasStatesRef.current = mapped.length > 0;

        if (hasStatesRef.current) {
          lastCountryWithStatesRef.current = iso2;
        } else {
          lastCountryWithStatesRef.current = null;
          // País sin estados → cargamos ciudades directo por país
          await loadCitiesByCountry(iso2);
        }
      } catch (err) {
        console.error('DEBUG_LOC: Error states:', err);
        setStates([]);
      } finally {
        setLoadingLocations(false);
      }
    },
    [loadCitiesByCountry]
  );

  // ---------- 4. Get Cities ----------
  const getCities = useCallback(
    async (stateValue: string) => {
      const countryCode = currentCountryCodeRef.current;
      if (!countryCode) return;

      setLoadingLocations(true);

      // País sin estados → volver a cargar ciudades por país
      if (!hasStatesRef.current) {
        await loadCitiesByCountry(countryCode);
        setLoadingLocations(false);
        return;
      }

      const st = states.find(s => s.value === stateValue);
      const stateName = st?.name || stateValue;

      try {
        const url = `/api/cities?countryCode=${encodeURIComponent(
          countryCode
        )}&stateCode=${encodeURIComponent(
          String(stateValue)
        )}&stateName=${encodeURIComponent(String(stateName))}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) {
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

        const deduped = Array.from(new Map(mapped.map(o => [o.name, o])).values()).sort(
          (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        setCities(deduped);
      } catch (err) {
        console.error('DEBUG_LOC: Error cities:', err);
        setCities([]);
      } finally {
        setLoadingLocations(false);
      }
    },
    [states, loadCitiesByCountry]
  );

  // ---------- Inicialización ----------
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // ---------- MEMOIZACIÓN DEL VALOR ----------
  const contextValue = useMemo(
    () => ({
      countries,
      states,
      cities,
      getStates,
      getCities,
      loadingLocations,
    }),
    [countries, states, cities, getStates, getCities, loadingLocations]
  );

  return (
    <LocationSelectContext.Provider value={contextValue}>
      {children}
    </LocationSelectContext.Provider>
  );
}

export default LocationSelectProvider;










