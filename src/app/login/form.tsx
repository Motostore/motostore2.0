'use client';
import { yupResolver } from "@hookform/resolvers/yup"
import toast, { Toaster } from 'react-hot-toast';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Animation } from "../components/InputErrors";
import { LoginSchema } from "../utils/schemas";
import Link from 'next/link';
import ResetPasswordModal from './ResetPasswordModal';

export default function Form() {

  const router = useRouter();
  const schema = LoginSchema;
  const [revealPassword, setRevealPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: "",
      password: ""
    },
    resolver: yupResolver(schema)
  });

  const input_tailwind = 'bg-white border border-gray-300 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500 outline-none'

  const onSubmit = handleSubmit( (data) => {
    const username = data['username']
    const password = data['password']
    signIn("credentials", {
      username,
      password,
      redirect: false
    })
    .then(({ok, error}) => {
      if (ok) {
        router.push("/dashboard");
        reset()
        toast.success('Has iniciado sesión correctamente.', {
          style: {
            backgroundColor: '#a6e5b6',
            width: '100%'
          }
        })
      } else {
        toast.error('ha ocurrido un error.', {
          style: {
            backgroundColor: '#fba6a9',
            width: '100%'
          }
        })
      }
    })
  })

  // Función para abrir el modal
  const handleOpenModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };


  return (
      <form
        onSubmit={e => e.preventDefault()}
        noValidate
        autoComplete="off"
        className="space-y-4 mb-4"
      >
        <div>
          <Animation errors={errors} field='username' />
          <input {...register('username')} placeholder="Usuario" type="text" className={`${input_tailwind} text-gray-900`}/>
        </div>
        <div className="relative">
          <Animation errors={errors} field='password' />
          <input {...register('password')} placeholder="Contraseña" type={revealPassword ? "text" : "password"} className={`${input_tailwind} text-gray-900`}/>
          <div className="absolute top-3 right-3" onClick={() => setRevealPassword(revealPassword => !revealPassword)}>
            {
              revealPassword
              ?
              <EyeIcon width={20} />
              :
              <EyeSlashIcon width={20} />
            }
          </div>
        </div>
      <div className="space-y-4">
        <button
          type="button"
          onClick={onSubmit}
          className="flex w-full justify-center rounded-lg bg-green-500 hover:bg-green-700 text-white px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm4 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
            </svg>
            Iniciar sesión
          </div>
        </button>

        <a href="#" onClick={handleOpenModal} className="flex w-full justify-center rounded-lg bg-red-500 hover:bg-red-700 text-white px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      
      <Toaster />
      {showModal && <ResetPasswordModal onClose={handleCloseModal} />}
    </form>
  )
}


