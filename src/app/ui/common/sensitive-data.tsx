'use client';
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// CORRECCIÓN: Definimos explícitamente el tipo de las props
export default function SensitiveData({ data }: { data: any }) {

    const [show, setShow] = useState(false);

    // CORRECCIÓN: Tipamos el argumento y aseguramos que tenga length para evitar crasheos
    const hideData = (text: any) =>  "*".repeat(text?.length || 8);

    return (
        <>
        {
            show 
            ?
            <span className="flex gap-4 items-center w-full">
                {data}
                {/* Agregamos cursor-pointer para mejorar la UX */}
                <EyeIcon className="w-6 text-blue-500 cursor-pointer" title="Ver" onClick={() => setShow(!show)} />
            </span>
            : 
            <span className="flex gap-4 items-center w-full">
                {hideData(data)}
                <EyeSlashIcon className="w-6 text-blue-500 cursor-pointer" title="Ver" onClick={() => setShow(!show)} />
            </span>
        }
        </>
    )
}