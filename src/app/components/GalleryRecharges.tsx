// src/app/components/GalleryRecharges.tsx (CÓDIGO FINAL Y CORREGIDO - Nivel PRO)

'use client';

import { useSession } from "next-auth/react";
import GalleryRechargesItem from "./GalleryRechargesItem";
import React from "react"; 
// Importamos normalizeRole para asegurar que la verificación es segura
import { normalizeRole } from "../lib/roles"; 

// ⭐ FIX PRO: Definición de interfaz de props para evitar el error 'implicit any'
interface GalleryRechargesProps {
    // Definimos el tipo de items. Debe incluir las propiedades usadas en el filtro y las pasadas al Item
    items: {
      id: string | number;
      status: boolean; // Usado en el filtro
      // Propiedades mínimas que el Item probablemente necesita (añade más si GalleryRechargesItem las usa)
      name?: string; 
      price?: number;
      // Añade más propiedades que tu componente GalleryRechargesItem necesite...
    }[]; 
    buttonText: string;
    className?: string; // className es opcional
}

export default function GalleryRecharges({items, buttonText, className}: GalleryRechargesProps) {

  const {data: session} = useSession();

  // 💡 Nivel PRO: Normalizamos el rol de la sesión para la verificación de permisos
  const userRole = normalizeRole(session?.user?.role);
  
  // 💡 Nivel PRO: Roles elevados que ignoran el estatus del item (para edición/visualización)
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
        // 💡 Nivel PRO: Filtramos por estatus (status=true) O por rol elevado
        .filter((item) => item.status || canSeeAll)
        .map((item) => (
        // Utilizamos item.id como key.
        <div key={item.id}>
          <GalleryRechargesItem item={item} buttonText={buttonText} />
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