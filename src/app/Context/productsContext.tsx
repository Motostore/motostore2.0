'use client';
import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchProfiles } from "../lib/streaming-profile";
import { fetchProvidersForTransaction } from "../lib/streaming-provider";

export const ProductContext = createContext(null);

export const ProductProvider = ({children}) => {

  const {data: session} = useSession();

  const [providers, setProviders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [profiles, setProfiles] = useState([]);

  
  const trackSession = session;

  useEffect(() => {
    getProviders();
  }, [trackSession]);

  async function getProviders() {
      const result = await fetchProvidersForTransaction();
      setProviders(result);
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      setProviders(json);
    }
  }

  async function fetchAccounts() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.token}`
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