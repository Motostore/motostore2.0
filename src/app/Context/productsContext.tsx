'use client';

import { createContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
// import { fetchProfiles } from "../lib/streaming-profile"; // Lo mantengo comentado como en tu original
import { fetchProvidersForTransaction } from "../lib/streaming-provider";

// 💎 CORRECCIÓN 1: Inicializamos el contexto con 'any' para evitar conflictos de tipado estricto
export const ProductContext = createContext<any>(null);

// 💎 CORRECCIÓN 2: Definimos el tipo para las props (children)
interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {

  const { data: session } = useSession();

  // 💎 CORRECCIÓN 3: Tipamos los estados como array de any (<any[]>)
  // Si no haces esto, TypeScript pensará que siempre deben estar vacíos.
  const [providers, setProviders] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const trackSession = session;

  useEffect(() => {
    getProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSession]);

  async function getProviders() {
      const result = await fetchProvidersForTransaction();
      // Aseguramos que sea un array
      setProviders(Array.isArray(result) ? result : []);
  }

  function getAccounts() {
    if (trackSession) {
      fetchAccounts()
    }
  }

  // async function getProfiles() {
  //   const result = await fetchProfiles();
  //   setProfiles(result);
  // }

  async function fetchProviders() {
    // Protección por si no hay sesión
    if (!session?.user?.token) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      setProviders(json);
    }
  }

  async function fetchAccounts() {
    // Protección por si no hay sesión
    if (!session?.user?.token) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      setAccounts(json);
    }
  }

  return (
    <ProductContext.Provider
      value={{
        providers,
        setProviders,
        getProviders,
        accounts,
        setAccounts,
        getAccounts,
        profiles,
        setProfiles
      }}>
      {children}
    </ProductContext.Provider>
  );
}