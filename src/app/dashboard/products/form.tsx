'use client';

import { ProductContext } from "@/app/Context/productsContext";
import { Animation } from "@/app/components/InputErrors";
import { fetchCreateProvider, fetchUpdateProvider } from "@/app/lib/streaming-provider";
import { CreateProviderSchema } from "@/app/utils/schemas";
import { input_tailwind, label_input } from "@/app/utils/tailwindStyles";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

const schema = CreateProviderSchema;

export default function Form({provider}) {

  const router = useRouter();
  const [image, setImage] = useState(
    provider && provider.image 
    ? `https://${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}/${provider.image}` 
  : '/assets/placeholder/no-image.png');



  const { 
    register,
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: provider ? provider?.name : "",
      description: provider ? provider?.description : "",
      duration: provider ? provider?.duration : 1,
      price: provider ? provider?.price : 0,
      image: ""
    },
    resolver: yupResolver(schema)
  });
  

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  const onSubmit = handleSubmit( async (data) => {

    const name = data['name']
    const description = data['description']
    const duration = data['duration']
    const price = data['price']
    let image = provider?.image ? provider?.image : null;

    let body: any = { 
      name, 
      description, 
      duration,
      price
    }

    let httpMethod = 'POST';
    if (provider) {
      httpMethod = 'PUT'
      body = {...body, id: provider.id}
    }

    if( data["image"].length > 0) {
      const file = data["image"][0]
      const formData = new FormData();
      formData.append("file", file);
  
      const upload = await fetch('/api/upload', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
  
      if (upload.ok) {
        const { url, fields } = await upload.json()

        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append('file', file)
        const uploadResponse = await fetch(url, {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          image = fields.key
          console.log('Upload successful!')
        } else {
          console.log('Upload failed.')
        }
      }
    }

    let response;
    if (provider) {
      response = await fetchUpdateProvider(provider.id, JSON.stringify({...body, image}));
    } else {
      response = await fetchCreateProvider(JSON.stringify({...body, image}));
    }

    if (response.ok) {
      router.push('/dashboard/products/');
    } else {
      console.log('Ha ocurrido un error')
    }

    // const response = await fetchCreateProvider(httpMethod, JSON.stringify({...body, image}));

  })
  return (
    <form
      onSubmit={e => e.preventDefault()}
      noValidate
      autoComplete="off"
      className="space-y-2 mb-4"
    >
      <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-6 px-4 md:px-8">
        <div className="flex gap-4 md:gap-20 flex-col md:flex-row">
          <div className="flex flex-col gap-2">
            <div>
              <label className={label_input} htmlFor="name">Nombre</label>
              <Animation errors={errors} field='name' />
              <input {...register('name')} id="name" type='text' placeholder="Nombre" className={`${input_tailwind} text-gray-900`}/>
            </div>
            <div>
              <label className={label_input} htmlFor="description">Descripción</label>
              <Animation errors={errors} field='description' />
              <textarea {...register('description')} id="description" placeholder="Descripción" className={`${input_tailwind} text-gray-900`} />
            </div>
            <div>
              <label className={label_input} htmlFor="duration">Duración en meses</label>
              <Animation errors={errors} field='duration' />
              <input {...register('duration')} id="duration" type='text' placeholder="Duración" className={`${input_tailwind} text-gray-900`} />
            </div>
            <div>
              <label className={label_input} htmlFor="price">Precio</label>
              <Animation errors={errors} field='price' />
              <input {...register('price')} id="price" placeholder="Precio" className={`${input_tailwind} text-gray-900`} />
            </div>
          </div>
          <div className={'flex flex-col items-center w-full gap-2'}>
            <div className="flex items-center justify-center">
              {image && <Image width={300} height={300} alt="preview image" src={image}/>} 
            </div>
            <input
              id="image"
              name="image"
              type="file"
              className="w-full py-2 px-4"
              {...register("image", {
                onChange: onImageChange
              })}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-end gap-4">
            {/* <button type="button" onClick={onSubmit} className="flex w-full justify-center rounded-md bg-gradient-to-r from-orange-500 to-orange-300 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-orange-300 hover:to-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">{provider ? 'Editar': 'Agregar'}</button> */}
            <button type="button" onClick={onSubmit} className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-orange-300 hover:to-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">{provider ? 'Editar': 'Agregar'}</button>
          </div>
        </div>
      </div>
      <Toaster />
    </form>
  )
}