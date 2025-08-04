
'use client';

import { useContext, useEffect, useState } from "react";
import { Select } from "./Select";
import { city_validation, country_validation, state_validation } from "../utils/selectValidations ";
import { LocationSelectContext } from "../Context/locationSelectContext";

export default function SelectLocation({user}) {

  const [token, setToken] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState();
  const [state, setState] = useState(user?.state || null);
  const [city, setCity] = useState(user?.city || null);
  const API_COUNTRY = process.env.NEXT_PUBLIC_APICOUNTRY_URL;

  useEffect(() => {
    fetchCountriesAuth();
  }, []);

  async function onCountryChange(e) {
    const countrySelected = e.target.value;
    setCountry(countrySelected)
    fetchStates(countrySelected)
  }
  
  async function onStateChange(e) {
    const stateSelected = e.target.value;
    setState(stateSelected)
    fetchCities(stateSelected)
    
  }

  async function onCityChange(e) {
    const citySelected = e.target.value;
    setState(citySelected)
    
  }

  async function fetchCountriesAuth() {
    const response = await fetch(`${API_COUNTRY}/getaccesstoken`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-token': process.env.NEXT_PUBLIC_APICOUNTRY_TOKEN,
        'user-email': process.env.NEXT_PUBLIC_APICOUNTRY_EMAIL,
      }
    });

    if (response.ok) {
      const json = await response.json();
      setToken(json.auth_token)
      localStorage.setItem("country_token", json.auth_token);
      await fetchCountries(json.auth_token)
      if(user){
        setCountry(user?.country || null)
        await fetchStates(user?.country)
        setState(user?.state || null)
        await fetchCities(user?.state)
        setCity(user?.city || null)
      }
      setState(user?.state || null)
      setCity(user?.city || null)
    }
  }

  async function fetchCountries(token) {
    if (localStorage.getItem('country_token')) {
      const response = await fetch(`${API_COUNTRY}/countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setCountries(json.map((item) => {return {value: item.country_name, name: item.country_name}}))
      }
    } else {
      console.log("Falta el token!")
    }
  }
  async function fetchStates(country: string) {
    if (localStorage.getItem('country_token')) {
      const response = await fetch(`${API_COUNTRY}/states/${country}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('country_token')}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setStates(json.map((item) => {return {value: item.state_name, name: item.state_name}}))
      }
    } else {
      console.log("Falta el token!")
    }
  }
  async function fetchCities(state: string) {
    if (localStorage.getItem('country_token')) {
      const response = await fetch(`${API_COUNTRY}/cities/${state}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('country_token')}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setCities(json.map((item) => {return {value: item.city_name, name: item.city_name}}))
      }
    } else {
      console.log("Falta el token!")
    }
  }


  return (
    <div className="grid grid-cols-3 gap-4">
      {
      countries && countries.length > 0 && <Select 
      {...country_validation} 
      options={countries} 
      label=""
      value={country}
      onSelectChange={(e) => onCountryChange(e)} />
      }
      {
      states && countries.length > 0 && <Select 
      {...state_validation} 
      options={states} 
      label=""
      value={state}
      onSelectChange={(e) => onStateChange(e)} />
      }
      {
      cities && countries.length > 0 && <Select 
      {...city_validation} 
      options={cities}
      label=""
      value={city} />
      }
      
    </div>
  );1
}
