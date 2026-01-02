// src/app/components/FileInput.tsx (CÓDIGO FINAL Y CORREGIDO - FIX DE DUPLICACIÓN)

import { useFormContext } from 'react-hook-form'
import { useState } from 'react'
import Image from 'next/image'
import React from 'react' // Aseguramos la importación de React

export const FileInput = ({provider, file}: {provider?: any, file?: string}) => {

  const {
    register,
  } = useFormContext()

  // Nota: El estado inicial fue corregido en pasos anteriores para manejar nulls
  const [image, setImage] = useState(file ? file : null)

  // FIX PRO: Tipado explícito de evento (Corregido en el paso anterior)
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  return (
    <div className={'flex flex-col w-full gap-2'}>
      <input
        id="image"
        // 🛑 FIX CRÍTICO: Eliminamos la propiedad name="image" explícita,
        // ya que register("image") la provee.
        type="file"
        className="p-2"
        // Pasamos onImageChange al evento onChange del input (por RHF)
        {...register("image", {
          onChange: onImageChange // Este callback manejará la vista previa (setImage)
        })}
      />
      <div className="flex items-center justify-center">
        {image && <Image width={300} height={300} alt="preview image" src={image}/>} 
      </div>
    </div>
  )
}