
import { useFormContext } from 'react-hook-form'
import { useState } from 'react'
import Image from 'next/image'

export const FileInput = ({provider, file}: {provider?: any, file?: string}) => {

  const {
    register,
  } = useFormContext()

  const [image, setImage] = useState(file ? file : null)

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  return (
    <div className={'flex flex-col w-full gap-2'}>
      <input
        id="image"
        name="image"
        type="file"
        className="p-2"
        onChange={onImageChange}
        {...register("image", {
          onChange: onImageChange
        })}
      />
      <div className="flex items-center justify-center">
        {image && <Image width={300} height={300} alt="preview image" src={image}/>} 
      </div>
    </div>
  )
}