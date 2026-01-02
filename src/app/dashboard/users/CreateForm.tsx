'use client';

import { UserContext } from "@/app/Context/usersContext";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { RegisterDashboardSchema } from "@/app/utils/schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import toast, { Toaster } from "react-hot-toast";
import { Animation } from "@/app/components/InputErrors";
import { LocationSelectContext } from "@/app/Context/locationSelectContext";
import { roleOptions } from "@/app/utils/selectOptions";
import { input_tailwind } from "@/app/utils/tailwindStyles";

const schema = RegisterDashboardSchema;

// Props tipadas con any para evitar bloqueos
export default function CreateForm({setOpenModal, user, textButton}: {setOpenModal: any, user?: any, textButton: any}) {

  // Estados como any
  const [country, setCountry] = useState<any>();
  const [state, setState] = useState<any>();
  const [city, setCity] = useState<any>();
  const [role, setRole] = useState<any>();
  const {data: session} = useSession();

  // 💎 Casteamos el contexto a 'any'
  const { 
    countries, 
    states, 
    getStates,
    cities,
    getCities,
  } = useContext(LocationSelectContext) as any;

  // 💎 Preventivo: Casteamos también este contexto
  const { getUsers } = useContext(UserContext) as any;

  useEffect(()=> {
    if(user) {
      onUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { 
    register,
    handleSubmit,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      username: user ? user.username: "",
      role: user ? user.role : "",
      name:  user ? user.name: "",
      identificationCard:  user ? user.identificationCard: "",
      phone:  user ? user.phone: "",
      email:  user ? user.email: "",
      country:  user ? user.country: "",
      state: "",
      city: ""
    },
    resolver: yupResolver(schema)
  });

  function onCountryChange(e: any) {
    const countrySelected = e.target.value;
    setCountry(countrySelected)
    getStates(countrySelected)
  }

  function onStateChange(e: any) {
    const stateSelected = e.target.value;
    setState(stateSelected)
    getCities(stateSelected)
  }

  async function onUser() {
      setCountry(user?.country || null)
      await getStates(user?.country)
      setState(user?.state || null)
      await getCities(user?.state)
      setCity(user?.city || null)
      setRole(user?.role || null)
  }

  const onSubmit = handleSubmit( async (data) => {
    const username = data['username']
    const email = data['email']
    const name = data['name']
    const identificationCard = data['identificationCard']
    const phone = data['phone']
    const country = data['country']
    const city = data['city']
    const state = data['state']
    const role = data['role']
    const password = '123456'

    let body: any = { 
      username, 
      password, 
      email, 
      name, 
      identificationCard, 
      phone, 
      role,
      country,
      state,
      city 
    }

    let httpMethod = 'POST';
    if (user) {
      httpMethod = 'PUT'
      body = {...body, id: user.id}
    }

    // 💎 FIX: Acceso seguro al token con 'any'
    const token = (session?.user as any)?.token;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/users`, {
      method: httpMethod,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      getUsers();
      toast.success('Usuario registrado exitosamente.', {
        style: {
          backgroundColor: '#a6e5b6',
          width: '100%'
        }
      })
      setOpenModal(false)
    } else {
      toast.error('ha ocurrido un error.', {
        style: {
          backgroundColor: '#fba6a9',
          width: '100%'
        }
      })
    }
  });

  return (
    <form
        onSubmit={e => e.preventDefault()}
        noValidate
        autoComplete="off"
        className="space-y-4 mb-4"
      >
        <div>
          <Animation errors={errors} field='username' />
          <input {...register('username')} type='text' placeholder="Usuario" className={`${input_tailwind} text-gray-900`}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Animation errors={errors} field='name' />
            <input {...register('name')} type='text' placeholder="Nombre" className={`${input_tailwind} text-gray-900`} />
          </div>
          <div>
            <Animation errors={errors} field='identificationCard' />
            <input {...register('identificationCard')} placeholder="Cédula" className={`${input_tailwind} text-gray-900`} />
          </div>
          <div>
            <Animation errors={errors} field='phone' />
            <input {...register('phone')} type='text' placeholder="Teléfono" className={`${input_tailwind} text-gray-900`} />
          </div>
          <div>
            <Animation errors={errors} field='email' />
            <input {...register('email')} type='text' placeholder="Correo electrónico" className={`${input_tailwind} text-gray-900`} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col w-full gap-2">
            <Animation errors={errors} field='country' />
            <select {...register('country', { onChange: (e) => onCountryChange(e) })} value={country ?? 'DISABLED'} className={`${input_tailwind} text-gray-500`}>
              <option value={'DISABLED'} disabled>País</option>
              {
                countries && countries.map((option: any) => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col w-full gap-2">
            <Animation errors={errors} field='state' />
            <select {...register('state', { onChange: (e) => onStateChange(e) })} value={state ?? 'DISABLED'} className={`${input_tailwind} text-gray-500`}>
              <option value={'DISABLED'} disabled>Estado</option>
              {
                states && states.map((option: any) => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col w-full gap-2">
            <Animation errors={errors} field='city' />
            <select {...register('city', { onChange: (e) => setCity(e.target.value) })} value={city ?? 'DISABLED'} className={`${input_tailwind} text-gray-500`}>
              <option value={'DISABLED'} disabled>Ciudad</option>
              {
                cities && cities.map((option: any) => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
        </div>
        
        {/* 💎 FIX CRÍTICO: Usamos 'as any' para evitar el error de 'string | undefined' */}
        {
          ["ADMIN", "SUPERUSER"].includes((session?.user as any)?.role) && (
          <div className="flex flex-col w-full gap-2">
            <Animation errors={errors} field='role' />
            <select {...register('role', { onChange: (e) => setRole(e.target.value) })}  value={role ?? 'DISABLED'}className={`${input_tailwind} text-gray-500`}>
              <option value={'DISABLED'} disabled>Rol</option>
              {
                roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
          )
        }
        <div className="flex justify-between gap-4">
          <button type="button" onClick={onSubmit} className="flex w-full justify-center rounded-md bg-gradient-to-r from-orange-500 to-orange-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-orange-300 hover:to-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">{textButton}</button>
          <button type="button" onClick={() => setOpenModal(false)} className="flex w-full justify-center rounded-md bg-gradient-to-r from-red-500 to-red-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-red-300 hover:to-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Cancelar</button>
        </div>
        <Toaster />
      </form>
  )
}