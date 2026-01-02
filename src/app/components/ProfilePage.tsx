// src/app/components/ProfilePage.tsx (Reemplazo COMPLETO)
import React, { useContext } from "react";
import { ProfileContext } from "@/app/Context/profileContext"; 
// ... otras importaciones

export default function ProfilePage() {
    const ctx = useContext(ProfileContext);
    
    // 🛑 CORRECCIÓN: Usa el encadenamiento opcional para leer la propiedad 'option'
    const option = ctx?.option; 

    // ... Resto del JSX
    return (
        <main>{/* ... */}</main>
    )
}