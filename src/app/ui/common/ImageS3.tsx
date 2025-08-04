import { existS3Object } from "@/app/lib/s3";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageS3({objectKey, objectName, width=150, height=150, placeholder = '/assets/streaming/default.png'}) {

  const [image, setImage] = useState(false)

  useEffect(() => {
    existImage(objectKey)
  }, [objectKey])

  async function existImage(objectKey) {
    const result = await existS3Object(objectKey)
    setImage(result)
  }

  return (
    <Image
      src={
        image
        ?
        `https://${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}/${image}`
        :
        placeholder
      }
      width={width}
      height={height}
      alt={objectName}
      className="mx-auto"
    />
  )
}