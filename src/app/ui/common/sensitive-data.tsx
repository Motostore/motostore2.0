'use client';
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SensitiveData({data}) {

    const [show, setShow] = useState(false);

    const hideData = (data) =>  "*".repeat(data.length);

    return (
        <>
        {
            show 
            ?
            <span className="flex gap-4 items-center w-full">
                {data}
                <EyeIcon className="w-6 text-blue-500" title="Ver" onClick={() => setShow(!show)} />
            </span>
            : 
            <span className="flex gap-4 items-center w-full">
                {hideData(data)}
                <EyeSlashIcon className="w-6 text-blue-500" title="Ver" onClick={() => setShow(!show)} />
            </span>
        }
        </>
    )
}