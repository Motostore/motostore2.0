// src/app/components/GalleryStreaming.tsx

'use client'

import { useSession } from "next-auth/react";
import GalleryItem from "./GalleryStreamingItem";
import { Product } from "@/app/types/product.interface"; // Ajusta la ruta si es necesario
import { normalizeRole } from "@/app/lib/roles"; 

interface GalleryStreamingProps {
    items: Product[];       
    buttonText: string;
    className: string;
}

export default function GalleryStreaming({items, buttonText, className}: GalleryStreamingProps) {

  const {data: session} = useSession();

  const userRole = normalizeRole(session?.user?.role);
  const ELEVATED_ROLES = ["ADMIN", "SUPERUSER"];
  const canSeeAll = ELEVATED_ROLES.includes(userRole);

  return (
    <div className={`grid grid-cols-1 ${className} px-4 py-2 md:px-6`}>
    {
      items?.length > 0
      ?
      items
        .filter((item: Product) => (
            (item.status && item.profiles && item.profiles > 0 && item.accounts && item.accounts > 0) 
            || canSeeAll 
        ))
        .map((item: Product) => (
            <div key={item.id}> 
                <GalleryItem item={item} buttonText={buttonText} />
            </div>
        ))
      :
      <div className="text-center py-10 text-slate-500 font-medium">
          No hay servicios creados
      </div>
    }
    </div>
  )
}