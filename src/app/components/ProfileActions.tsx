// src/app/components/ProfileActions.tsx (Reemplazo COMPLETO)
import React, { useContext, Dispatch, SetStateAction } from "react";
import { ProfileContext, ProfileContextType } from "@/app/Context/profileContext"; 

// Asume que ProfileContextType está definido en el archivo de contexto
// interface ProfileContextType { option: any; setOption: any; }

export default function ProfileActions() {
    // 🛑 CORRECCIÓN: Verifica el contexto antes de desestructurar
    const context = useContext(ProfileContext); 
    
    // Proporcionar valores predeterminados para evitar TS2339 si context es null
    const { option, setOption } = context || { 
        option: 'DEFAULT', 
        setOption: (() => {}) as Dispatch<SetStateAction<any>> 
    };

    // ... Resto del JSX (No proporcionado, pero aquí iría)
    return (
        <div>{/* ... */}</div>
    )
}