'use client';

import { ProductContext } from "@/app/Context/productsContext";
import { Animation } from "@/app/components/InputErrors";
import { fetchCreateProduct, fetchProductsByType, fetchUpdateProduct } from "@/app/lib/products.service";
import { input_tailwind, label_input } from "@/app/utils/tailwindStyles";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";


export default function Form({account}) {

  const router = useRouter();
  const accountPath = "streaming/account";
  const providerPath = "streaming";
  const redirectPath = "/dashboard/products/accounts"

  const requiredField = {
    value: true,
    message: 'Campo requerido',
  }

  const { 
    register,
    handleSubmit,
    setValue,
    formState: { errors } 
  } = useForm();

  const {data: session} = useSession();
  const [providers, setProviders] = useState([]);
  // const [profiles, setProfiles] = useState(account?.profiles.length || 1);
  // TODO
  const [profiles, setProfiles] = useState(account?.stock || 1);


  const options = [...providers]
    .filter((item) => item.status === true)
    .map((item) => { return {value: item.id, name: item.name}});

  useEffect(() => {
    getProviders()
  }, [])
  async function getProviders() {
    const result = await fetchProductsByType(providerPath);
    setProviders(result.content);
    
  }

  const onSubmit = handleSubmit( async (data) => {
      const description = data['description']
      const stock = data['stock']
      const idStreamingProvider = parseInt(data['idStreamingProvider'])
      const backendProfiles = [];

      backendProfiles.push({
        "profileUser": data["profileUser"],
        "profileKey": data["profileKey"],
        "principal": true,
        "id": data["profileId"]
      })

      Array.from(Array((profiles - 1)), (e, i) => {
        backendProfiles.push({
          "profileUser": data[`profileUser${i}`],
          "profileKey": data[`profileKey${i}`],
          "id": data[`profileId${i}`]
        })
      });

    let body: any = { 
      description, 
      stock,
      idStreamingProvider,
      profiles: backendProfiles
    }

    // if (account) {
    //   httpMethod = 'PUT'
    //   body = {...body, id: account.id}
    // }

    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_FULL}/streaming/account`, {
    //   method: httpMethod,
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${session?.user.token}` 
    //   },
    //   body: JSON.stringify(body),
    // })

    let httpMethod = "POST";
    let response;

    if (account) {
      httpMethod = "PUT";
      body = { ...body, id: account.id };
      response = await fetchUpdateProduct(account.id, JSON.stringify(body), accountPath);
    } else {
      response = await fetchCreateProduct(JSON.stringify(body), accountPath);
    }

    if (response.ok) {
      router.push(redirectPath);
    } else {
      console.log('Ha ocurrido un error')
    }

  })
  function getChange(e) {
    const value = e.target.value;
    if (value > 0) {
      setProfiles(parseInt(e.target.value));
    } else {
      setProfiles(1)
      setValue('stock', 1)
      toast.error('Selecciona al menos 1 perfil.', {
        style: {
          backgroundColor: '#fba6a9',
          width: '100%'
        }
      })
    }
  }

  const principal = null; //TODO account?.profiles.filter((item) => item.principal)[0];
  const children = null; //TODO account?.profiles.filter((item) => !item.principal);

  if (principal != null) {
    setValue('profileId', principal.profileId)
    setValue('profileUser', principal.profileUser)
    setValue('profileKey', principal.profileKey)
  }

  if (children != null && children.length > 0) {
    children.map((child, i) => {
      setValue(`profileId${i}`, child.profileId)
      setValue(`profileUser${i}`, child.profileUser)
      setValue(`profileKey${i}`, child.profileKey)
    })
  }
  if (account) {
    setValue('idStreamingProvider', account?.idStreamingProvider)
    setValue('description', account?.description)
    // setValue('stock', account?.profiles.length)

    //TODO
    setValue('stock', account?.stock)

  }

  return (
      <form
        onSubmit={e => e.preventDefault()}
        noValidate
        autoComplete="off"
        className="space-y-2 mb-4"
      >
        <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-6 px-8">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col w-full gap-1">
            <label className={label_input} htmlFor="idStreamingProvider">Proveedor</label>
            <Animation errors={errors} field='idStreamingProvider' />
            <select {
              ...register('idStreamingProvider', 
              { required: requiredField })}
              id="idStreamingProvider"
              className={`${input_tailwind} text-gray-500`}>
              <option value={'DISABLED'} disabled>Proveedor</option>
              {
                options.map((option) => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
          <div>
            <label className={label_input} htmlFor="description">Descripción</label>
            <Animation errors={errors} field='description' />
            <input {...register('description')} id="description" type='text' placeholder="Descripción" className={`${input_tailwind} text-gray-900`} />
          </div>
          <div>
            <label className={label_input} htmlFor="stock">Cantidad de perfiles</label>
            <Animation errors={errors} field='stock' />
            <input {
              ...register('stock', 
              {
                required: requiredField,
                min: {
                  value: 1,
                  message: 'Selecciona al menos 1 perfil'
                },
                onChange: (e) => getChange(e)
              })} id="stock" type='number' placeholder="Perfiles" className={`${input_tailwind} text-gray-900`} />
          </div>
        </div>
        <hr />
        <div>
          <div className="flex justify-between items-center">
            <div className="flex justify-start gap-1">
              <h5 className="text-gray-700 font-bold">Perfiles</h5>
              <span className="text-xs px-2 py-1 text-white bg-orange-500 font-bold rounded-lg">{profiles} máximo</span>
            </div>
          </div>
          <div>
            <div className="border flex justify-between gap-2 pb-2 px-3 mt-2 rounded-lg">
              <div>
                <label className={label_input} htmlFor="profileUser">Usuario</label>
                <Animation errors={errors} field='profileUser' />
                <input {...register('profileUser', { required: requiredField })}
                  id="profileUser" type='text' placeholder="Usuario" className={`${input_tailwind} text-gray-900`} />
              </div>
              <div>
                <label className={label_input} htmlFor="profileKey">Contraseña</label>
                <Animation errors={errors} field='profileKey' />
                <input {...register('profileKey', { required: requiredField })} 
                  id="profileKey" type='text' placeholder="Clave" className={`${input_tailwind} text-gray-900`} />
              </div>
            </div>
            <input {...register('profileId')} type='hidden' />
          </div>
          {
            (children?.length > 0)
            ?
            (
              children.map((child, i) => (

                  <div key={`profileSection_${i}`}  className="border flex justify-between gap-2 pb-2 px-3 mt-2 rounded-lg">
                    <div>
                      <label className={label_input} htmlFor={`profileUser${i}`}>Usuario</label>
                      <Animation errors={errors} field={`profileUser${i}`} />
                      <input {...register(`profileUser${i}`, { required: requiredField })} 
                      id={`profileUser${i}`} type='text' placeholder="Usuario" className={`${input_tailwind} text-gray-900`} />
                    </div>
                    <div>
                    <label className={label_input} htmlFor={`profileKey${i}`}>Contraseña</label>
                      <Animation errors={errors} field={`profileKey${i}`} />
                      <input {...register(`profileKey${i}`, { required: requiredField })}
                      id={`profileKey${i}`} type='text' placeholder="Clave" className={`${input_tailwind} text-gray-900`} />
                    </div>
                  </div>
                ))
            )
            :
              Array.from(Array(profiles - 1), (e, i) => (
                <div key={`profileSection_${i}`}  className="border flex justify-between gap-2 pb-2 px-3 mt-2 rounded-lg">
                  <div>
                    <label className={label_input} htmlFor={`profileUser${i}`}>Usuario</label>
                    <Animation errors={errors} field={`profileUser${i}`} />
                    <input {...register(`profileUser${i}`, { required: requiredField })} 
                    type='text' placeholder="Usuario" className={`${input_tailwind} text-gray-900`} />
                  </div>
                  <div>
                    <label className={label_input} htmlFor={`profileKey${i}`}>Contraseña</label>
                    <Animation errors={errors} field={`profileKey${i}`} />
                    <input {...register(`profileKey${i}`, { required: requiredField })}
                    id={`profileKey${i}`} type='text' placeholder="Clave" className={`${input_tailwind} text-gray-900`} />
                  </div>
                </div>
                )
            )
          }
        </div>

        <div className="flex justify-end gap-4 mt-4">
        <button
            type="button"
            onClick={onSubmit}
            className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            {account ? "Editar" : "Agregar"}
          </button>
        </div>
        </div>
        <Toaster containerStyle={{
            position: 'absolute',
          }} 
        />
      </form>
  )
}