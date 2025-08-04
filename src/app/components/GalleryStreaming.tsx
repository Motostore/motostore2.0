'use client'
import { useSession } from "next-auth/react";
import GalleryItem from "./GalleryStreamingItem";

export default function GalleryStreaming({items, buttonText, className}: { items: any, buttonText: string, className: string }) {

  // const itemsValid = items?.filter((item) => item.status)
  const {data: session} = useSession();

  return (
    <div className={`grid grid-cols-1 ${className} px-4 py-2 md:px-6`}>
    {
      items?.length > 0
      ?
      items?.filter((item) => (item.status && item.profiles > 0 && item.accounts > 0) || ["ADMIN", "SUPERUSER"].includes(session?.user.role))
        .map((item) => (
        <div key={item.id}>
          <GalleryItem item={item} buttonText={buttonText} />
        </div>
      ))
      :
      <div>
          No hay servicios creados
      </div>
    }
    </div>
  )
}