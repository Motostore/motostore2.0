"use client";

import Image from "next/image";
import Link from "next/link";
// IMPORTANTE: Comentamos el ítem complejo para aislar el error de los Pagos
// import GalleryStreamingItem from "./GalleryStreamingItem"; 

interface GalleryHomeProps {
  items: any[];
  buttonText?: string;
}

export default function GalleryHome({ items, buttonText }: GalleryHomeProps) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {hasItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition bg-white">
                {/* Renderizado SIMPLE y SEGURO (sin dependencias externas) */}
                <div className="relative h-40 w-full mb-2 bg-gray-50 flex items-center justify-center rounded">
                   {item.image ? (
                      <Image 
                        src={`https://${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}/${item.image}`}
                        alt={item.name || "Producto"}
                        width={150}
                        height={150}
                        className="object-contain max-h-full"
                      />
                   ) : <span className="text-xs text-gray-400">Sin Imagen</span>}
                </div>
                
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 h-10">{item.name}</h3>
                <p className="text-red-600 font-bold mt-1 text-lg">${item.price}</p>
                
                <button className="mt-3 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800 transition">
                    VER DETALLES
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 px-6 py-10 text-center text-sm text-gray-600">
            No hay servicios creados todavía.
          </div>
        )}
      </div>
    </section>
  );
}




