// src/app/components/GalleryBase.tsx (CÓDIGO FINAL Y CORREGIDO - SINCRONIZACIÓN DE TIPOS)

'use client';

import { useSession } from "next-auth/react";
import GalleryBaseItem from "./GalleryBaseItem";
import React from "react"; 
import { normalizeRole } from "../lib/roles"; 

// ⭐ FIX PRO: 1. Definición de la interfaz de props SINCRONIZADA con GalleryBaseItem
interface GalleryBaseProps {
    items: {
      id: string | number;
      status: boolean;
      licenseQuantity: number;
      // ⭐ FIX CRÍTICO: Agregamos las propiedades faltantes para GalleryBaseItem
      image: string; // Esperado por GalleryBaseItem
      name: string;  // Esperado por GalleryBaseItem
      price?: number;
      duration?: number;
    }[]; 
    buttonText: string;
    className?: string; // className es opcional
}

// ⭐ FIX PRO: 2. Aplicamos la interfaz al componente
export default function GalleryBase({items, buttonText, className}: GalleryBaseProps) {

  const {data: session} = useSession();

  // 💡 Nivel PRO: Normalizamos el rol de la sesión para la verificación de permisos
  const userRole = normalizeRole(session?.user?.role);
  
  // 💡 Nivel PRO: Roles elevados que ignoran la cantidad de licencias
  const ELEVATED_ROLES = ["ADMIN", "SUPERUSER"];
  const canSeeAll = ELEVATED_ROLES.includes(userRole);
  
  // Condicional de CSS base
  const finalClassName = `grid grid-cols-1 px-4 py-2 md:px-6 ${className || ''}`;

  return (
    <div className={finalClassName}>
    {
      // ⭐ FIX PRO: Verificamos si items existe y tiene longitud (fail-safe)
      items && items.length > 0
      ?
      items
        // 💡 Nivel PRO: Filtramos por estatus (status=true Y quantity > 0) O por rol elevado
        .filter((item) => (item.status && item.licenseQuantity > 0) || canSeeAll)
        .map((item) => (
        // Utilizamos item.id como key.
        <div key={item.id}>
          {/* Aquí el tipo de 'item' ahora es compatible con GalleryBaseItem */}
          <GalleryBaseItem item={item} buttonText={buttonText} />
        </div>
      ))
      :
      // Mensaje si no hay items
      <div className="text-center py-10 text-slate-500 font-medium">
          No hay servicios creados
      </div>
    }
    </div>
  )
}