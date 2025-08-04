'use client';

import { Animation } from "@/app/components/InputErrors";
import { BadgeItems } from "@/app/components/MyBadgets";
import { fetchCreateProduct, fetchUpdateProduct } from "@/app/lib/products.service";
import { RechargeSchema } from "@/app/utils/schemas";
import { input_tailwind, label_input } from "@/app/utils/tailwindStyles";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

const schema = RechargeSchema;

export default function Form({recharge}) {

  const [image, setImage] = useState(
    recharge && recharge.image 
    ? `https://${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}/${recharge.image}` 
    : '/assets/placeholder/no-image.png')

  const router = useRouter();
  const [pricesEntered, setPricesEntered] = useState(recharge && recharge.prices ? recharge.prices: []);
  const productPath = "recharge";

  const { 
    register,
    handleSubmit,
    setValue,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      provider: recharge ? recharge.provider : null,
      name: recharge ? recharge.name : "",
      description: recharge ? recharge.description : null,
      image: recharge ? recharge.image : "",
      prices: recharge ? recharge.prices : "",
    },
  resolver: yupResolver(schema)
  });

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  const onBlurPrice = (term) => {

    const data = term
      .trim().split(',')
      .map(value => value.trim())
      .filter((value, index, array )=> Number(value) && array.indexOf(value) === index);
    
      setPricesEntered(data);
      setValue('prices', data.join(','))
    console.log(recharge);
  }

  const onSubmit = handleSubmit( async (data) => {
    console.log("SUBMIT!");
    console.log(data);

    const name = data['name'];
    const description = data['description'];
    const provider = data['provider'];
    const prices = data['prices'].split(',').map(value => parseFloat(value));
    let image = recharge?.image ? recharge?.image : null;

    let body: any = { 
      name, 
      description, 
      provider,
      prices
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
    if (recharge) {
      response = await fetchUpdateProduct(recharge.id, JSON.stringify({...body, image}), productPath);
    } else {
      response = await fetchCreateProduct(JSON.stringify({...body, image}), productPath);
    }

    if (response.ok) {
      router.push('/dashboard/products/recharges/');
    } else {
      console.log('Ha ocurrido un error')
    }

  })

  return (
    <form
      onSubmit={e => e.preventDefault()}
      noValidate
      autoComplete="off"
      className="space-y-2 mb-4"
    >
      <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-2 md:py-6 px-4 md:px-8">
        <div className="flex gap-4 md:gap-20 flex-col md:flex-row">
          <div className="flex flex-col gap-2">
            <div>
              <label className={label_input} htmlFor="provider">Proveedor</label>
              <Animation errors={errors} field='provider' />
              <input {...register('provider')} id="provider" type='text' placeholder="Proveedor" className={`${input_tailwind} text-gray-900`}/>
            </div>
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
              <label className={label_input} htmlFor="prices">Precios [Escriba los precios separados por comas]</label>
              <Animation errors={errors} field='prices' />
              <textarea {...register('prices', {
                onBlur: (e) => onBlurPrice(e.target.value)
              })} id="prices"  placeholder="Precios" className={`${input_tailwind} text-gray-900`} />
              <div className="mt-2 p-2">
              <BadgeItems items={pricesEntered} />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            
            <div className="flex items-center justify-center">
              {image && <Image width={300} height={300} alt="preview image" src={image}/>} 
            </div>
            <input
              id="image"
              name="image"
              type="file"
              className="p-2 w-fit"
              {...register("image", {
                onChange: onImageChange
              })}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onSubmit} className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:from-orange-300 hover:to-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">{recharge ? 'Editar': 'Agregar'}</button>
          </div>
        </div>

      </div>
      <Toaster />
    </form>
  )
}