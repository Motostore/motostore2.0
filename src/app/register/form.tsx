'use client';
import 'react-loading-skeleton/dist/skeleton.css';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState, useEffect } from "react";
import Skeleton from 'react-loading-skeleton';
import { AuthResponse } from "../types/auth-response.interface";
import { signIn } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LocationSelectContext } from '../Context/locationSelectContext';
import { RegisterSchema } from "@/app/utils/schemas";
import { Animation } from '../components/InputErrors';
import { input_tailwind } from '../utils/tailwindStyles';
import * as Yup from 'yup';
import { useRouter } from "next/navigation";


// Regex para validar email
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Esquema de validación con Yup
const schema = Yup.object({
  username: Yup.string().required("El nombre de usuario es obligatorio."),
  name: Yup.string().required("El nombre es obligatorio."),
  lastName: Yup.string().required("El apellido es obligatorio."),
  identificationCard: Yup.string().required("La cédula es obligatoria."),
  phone: Yup.string().required("El teléfono es obligatorio."),
  email: Yup.string().matches(emailRegex, "Correo electrónico no válido").required("Correo electrónico es obligatorio."),
  country: Yup.string().required("El país es obligatorio."),
  state: Yup.string().required("El estado es obligatorio."),
  city: Yup.string().required("La ciudad es obligatoria."),
  referredCode: Yup.string().notRequired(),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .matches(/\d/, "La contraseña debe contener al menos un número.")
    .required("La contraseña es obligatoria."),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password'), null], "Las contraseñas no coinciden")
    .required("La confirmación de contraseña es obligatoria.")
});

export default function RegisterForm() {
  const [country, setCountry] = useState();
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const [revealPassword, setRevealPassword] = useState(false);
  const [revealPassword2, setRevealPassword2] = useState(false);
  const router = useRouter();


  const {
    countries,
    states,
    getStates,
    cities,
    getCities,
    loadingLocations,
  } = useContext(LocationSelectContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      name: "",
      lastName: "",
      identificationCard: "",
      phone: "",
      email: "",
      country: "",
      state: "",
      city: "",
      referredCode: "",
      password: "",
      passwordConfirm: "",
    },
    resolver: yupResolver(schema),
  });
  
  // Cargar estados cuando se cambia el país
  useEffect(() => {
    if (country) {
      getStates(country);
    }
  }, [country]);

  // Cargar ciudades cuando se cambia el estado
  useEffect(() => {
    if (state) {
      getCities(state);
    }
  }, [state]);

  function onCountryChange(e) {
    const countrySelected = e.target.value;
    setCountry(countrySelected);
  }

  function onStateChange(e) {
    const stateSelected = e.target.value;
    setState(stateSelected);
  }

  function onCityChange(e) {
    const citySelected = e.target.value;
    setCity(citySelected);
  }

  const handleCancel = () => {
    // Redirige al usuario a la página de inicio de sesión o a la página principal
    router.push('/login');
  };

  const onSubmit = handleSubmit(async (data) => {
    // Verificar que el país, estado y ciudad estén seleccionados
    if (!data.country || !data.state || !data.city) {
      toast.error('Por favor, selecciona país, estado y ciudad.', {
        style: {
          backgroundColor: '#fba6a9',
          width: '100%',
        },
      });
      return; // No enviar el formulario si faltan estos datos
    }

    const username = data['username'];
    const password = data['password'];
    const email = data['email'];
    const name = data['name'];
    const lastName = data['lastName'];
    const identificationCard = data['identificationCard'];
    const phone = data['phone'];
    const country = data['country'];
    const city = data['city'];
    const state = data['state'];
    const referredCode = data['referredCode'];

    const body = {
      username,
      password,
      email,
      name,
      lastName,
      identificationCard,
      phone,
      country,
      state,
      city,
      referredCode,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}${process.env.NEXT_PUBLIC_API_AUTH}/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const resp = await response.json() as AuthResponse;
    if (!resp.error) {
      await signIn("credentials", {
        username,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
      toast.success('¡Registro exitoso!', {
        style: {
          backgroundColor: '#a6e5b6',
          width: '100%',
        },
      });
    } else {
      toast.error('Ha ocurrido un error.', {
        style: {
          backgroundColor: '#fba6a9',
          width: '100%',
        },
      });
    }
  });

  // Mostrar Skeleton mientras se cargan las ubicaciones
  return loadingLocations ? (
    <div className="space-y-4 mb-4">
      <Skeleton className="h-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </div>
  ) : (
    <form onSubmit={onSubmit} noValidate autoComplete="off" className="space-y-4 mb-4">
      <div>
        <Animation errors={errors} field="username" />
        <input {...register('username')} type="text" placeholder="Usuario" className={`${input_tailwind} text-gray-900`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Animation errors={errors} field="name" />
          <input {...register('name')} type="text" placeholder="Nombre" className={`${input_tailwind} text-gray-900`} />
        </div>
        <div>
          <Animation errors={errors} field="lastName" />
          <input {...register('lastName')} type="text" placeholder="Apellido" className={`${input_tailwind} text-gray-900`} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Animation errors={errors} field="identificationCard" />
          <input {...register('identificationCard')} placeholder="Cédula" className={`${input_tailwind} text-gray-900`} />
        </div>
        <div>
          <Animation errors={errors} field="phone" />
          <input {...register('phone')} type="text" placeholder="Teléfono" className={`${input_tailwind} text-gray-900`} />
        </div>
      </div>
      <div>
        <Animation errors={errors} field="email" />
        <input {...register('email')} type="text" placeholder="Correo Electrónico" className={`${input_tailwind} text-gray-900`} />
      </div>
      <div>
        <Animation errors={errors} field="referredCode" />
        <input {...register('referredCode')} type="text" placeholder="Código Referido (opcional)" className={`${input_tailwind} text-gray-900`} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col w-full gap-2">
          <Animation errors={errors} field="country" />
          <select
            {...register('country', { onChange: onCountryChange })}
            value={country ?? 'DISABLED'}
            className={`${input_tailwind} text-gray-500`}
          >
            <option value="DISABLED" disabled>
              País
            </option>
            {countries.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full gap-2">
          <Animation errors={errors} field="state" />
          <select
            {...register('state', { onChange: onStateChange })}
            value={state ?? 'DISABLED'}
            className={`${input_tailwind} text-gray-500`}
          >
            <option value="DISABLED" disabled>
              Estado
            </option>
            {states.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full gap-2">
          <Animation errors={errors} field="city" />
          <select
            {...register('city', { onChange: onCityChange })}
            value={city ?? 'DISABLED'}
            className={`${input_tailwind} text-gray-500`}
          >
            <option value="DISABLED" disabled>
              Ciudad
            </option>
            {cities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Animation errors={errors} field="password" />
          <div className="relative">
            <input
              {...register('password')}
              type={revealPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className={`${input_tailwind} text-gray-900`}
            />
            <div
              className="absolute top-3 right-3"
              onClick={() => setRevealPassword((revealPassword) => !revealPassword)}
            >
              {revealPassword ? <EyeIcon width={20} /> : <EyeSlashIcon width={20} />}
            </div>
          </div>
        </div>
        <div>
          <Animation errors={errors} field="passwordConfirm" />
          <div className="relative">
            <input
              {...register('passwordConfirm')}
              type={revealPassword2 ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              className={input_tailwind}
            />
            <div
              className="absolute top-3 right-3"
              onClick={() => setRevealPassword2((revealPassword2) => !revealPassword2)}
            >
              {revealPassword2 ? <EyeIcon width={20} /> : <EyeSlashIcon width={20} />}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-4 mt-6">
        <button
          type="submit"
          className="flex-1 justify-center rounded-md bg-green-500 hover:bg-green-700 text-white px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            Registrar
          </div>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 justify-center rounded-md bg-red-500 hover:bg-red-700 text-white px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
            Cancelar
          </div>
        </button>
      </div>
      <Toaster />
    </form>
  );
}




