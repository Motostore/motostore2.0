'use client';

import { useSession } from "next-auth/react";
import GalleryBaseItem from "./GalleryBaseItem";

export default function GalleryBase({items, buttonText, className}) {

  const {data: session} = useSession();

  return (
    <div className={`grid grid-cols-1 px-4 py-2 md:px-6 ${className}`}>
    {
      items?.length > 0
      ?
      items?.filter((item) => (item.status && item.licenseQuantity > 0) || ["ADMIN", "SUPERUSER"].includes(session?.user.role))
        .map((item) => (
        <div key={item.id}>
          <GalleryBaseItem item={item} buttonText={buttonText} />
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