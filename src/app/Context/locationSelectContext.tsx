'use client';
import { createContext, useEffect, useState } from "react";
import originalFetch from 'isomorphic-fetch';
import fetchBuilder from 'fetch-retry-ts';

const options = {
  retries: 3,
  retryDelay: 1000
};

const fetch = fetchBuilder(originalFetch, options);

export const LocationSelectContext = createContext(null);

export const LocationSelectProvider = ({children}) => {

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true)
  
  // Función para obtener el token de autenticación
  async function fetchLocationsAuth() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APICOUNTRY_URL}/getaccesstoken`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-token': process.env.NEXT_PUBLIC_APICOUNTRY_TOKEN,
        'user-email': process.env.NEXT_PUBLIC_APICOUNTRY_EMAIL,
      }
    });

    if (response.ok) {
      const json = await response.json();
      localStorage.setItem("country_token", json.auth_token);
      return json.auth_token;
    } else {
      console.log("Error al obtener el token de autenticación.");
      return null;
    }
  }

  // Función para obtener los países
  async function fetchCountries(token) {
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APICOUNTRY_URL}/countries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const json = await response.json();
          setCountries(json.map((item) => {return {value: item.country_name, name: item.country_name}}));
        } else {
          console.error("Error al obtener la lista de países.");
        }
      } catch (error) {
        console.error("Error en la solicitud de países:", error);
      } finally {
        setLoadingLocations(false);
      }
    } else {
      console.log("Falta el token para obtener los países.");
      setLoadingLocations(false);
    }
  }

  // Carga inicial al montar el componente
  useEffect(() => {
    async function initializeLocations() {
      const token = await fetchLocationsAuth();
      if (token) {
        await fetchCountries(token);
      } else {
        setLoadingLocations(false);
      }
    }
    initializeLocations();
  }, []);

  async function getStates(country) {
    if (localStorage.getItem('country_token')) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APICOUNTRY_URL}/states/${country}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('country_token')}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setStates(json.map((item) => {return {value: item.state_name, name: item.state_name}}));
      } else {
        console.error("Error al obtener la lista de estados.");
      }
    } else {
      console.log("Falta el token para obtener los estados!");
    }
  }

  async function getCities(state) {
    if (localStorage.getItem('country_token')) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APICOUNTRY_URL}/cities/${state}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('country_token')}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setCities(json.map((item) => {return {value: item.city_name, name: item.city_name}}));
      } else {
        console.error("Error al obtener la lista de ciudades.");
      }
    } else {
      console.log("Falta el token para obtener las ciudades!");
    }
  }

  return (
    <LocationSelectContext.Provider
      value={{
        countries,
        states,
        cities,
        getStates,
        getCities,
        loadingLocations,
      }}>
      {children}
    </LocationSelectContext.Provider>
  );
}