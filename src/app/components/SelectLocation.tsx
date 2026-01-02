'use client';

import { useEffect, useState } from "react";
import { Select } from "./Select";
import { city_validation, country_validation, state_validation } from "../utils/selectValidations";

type SelectLocationProps = {
  user: {
    country?: string;
    state?: string;
    city?: string;
  };
};

export default function SelectLocation({ user }: SelectLocationProps) {

  const [token, setToken] = useState<string | null>(null);
  
  // Estados tipados correctamente para evitar conflictos null/undefined
  const [countries, setCountries] = useState<{ value: string; name: string }[]>([]);
  const [states, setStates] = useState<{ value: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; name: string }[]>([]);
  
  const [country, setCountry] = useState<string | undefined>(user?.country);
  const [state, setState] = useState<string | undefined>(user?.state);
  const [city, setCity] = useState<string | undefined>(user?.city);
  
  const API_COUNTRY = process.env.NEXT_PUBLIC_APICOUNTRY_URL;

  useEffect(() => {
    fetchCountriesAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const countrySelected = e.target.value;
    setCountry(countrySelected);
    fetchStates(countrySelected);
    setState(undefined);
    setCity(undefined);
    setStates([]);
    setCities([]);
  }

  async function onStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stateSelected = e.target.value;
    setState(stateSelected);
    fetchCities(stateSelected);
    setCity(undefined);
    setCities([]);
  }

  async function onCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const citySelected = e.target.value;
    setCity(citySelected);
  }

  async function fetchCountriesAuth() {
    const response = await fetch(`${API_COUNTRY}/getaccesstoken`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-token': process.env.NEXT_PUBLIC_APICOUNTRY_TOKEN!,
        'user-email': process.env.NEXT_PUBLIC_APICOUNTRY_EMAIL!,
      }
    });

    if (response.ok) {
      const json = await response.json();
      setToken(json.auth_token);
      localStorage.setItem("country_token", json.auth_token);
      await fetchCountries(json.auth_token);
      
      if (user) {
        setCountry(user?.country);
        if (user?.country) await fetchStates(user.country);
        
        setState(user?.state);
        if (user?.state) await fetchCities(user.state);
        
        setCity(user?.city);
      }
    }
  }

  async function fetchCountries(token: string) {
    const storedToken = localStorage.getItem('country_token');
    const tokenToUse = token || storedToken;

    if (tokenToUse) {
      const response = await fetch(`${API_COUNTRY}/countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        }
      });

      if (response.ok) {
        const json = await response.json();
        setCountries(json.map((item: { country_name: string }) => {
          return { value: item.country_name, name: item.country_name };
        }));
      }
    }
  }

  async function fetchStates(countryName: string) {
    const storedToken = localStorage.getItem('country_token');
    if (storedToken) {
      const response = await fetch(`${API_COUNTRY}/states/${countryName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const json = await response.json();
        setStates(json.map((item: { state_name: string }) => {
          return { value: item.state_name, name: item.state_name };
        }));
      }
    }
  }

  async function fetchCities(stateName: string) {
    const storedToken = localStorage.getItem('country_token');
    if (storedToken) {
      const response = await fetch(`${API_COUNTRY}/cities/${stateName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const json = await response.json();
        setCities(json.map((item: { city_name: string }) => {
          return { value: item.city_name, name: item.city_name };
        }));
      }
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {countries && countries.length > 0 && (
        <Select
          {...country_validation}
          options={countries}
          label="Country"
          value={country}
          // 🔥 SOLUCIÓN AQUÍ: Tipado explícito del evento 'e'
          onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCountryChange(e)}
        />
      )}
      {states && states.length > 0 && (
        <Select
          {...state_validation}
          options={states}
          label="State"
          value={state}
          // 🔥 SOLUCIÓN AQUÍ TAMBIÉN
          onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStateChange(e)}
        />
      )}
      {cities && cities.length > 0 && (
        <Select
          {...city_validation}
          options={cities}
          label="City"
          value={city}
          // 🔥 Y SOLUCIÓN AQUÍ TAMBIÉN
          onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCityChange(e)}
        />
      )}
    </div>
  );
}
