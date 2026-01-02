// src/app/components/GalleryStreamingItem.tsx
'use client';

import React, { useState } from "react";
import { Product } from "@/app/types/product.interface"; 
import PurchaseModal from "./PurchaseModal"; 
// ... (otras importaciones)

interface GalleryStreamingItemProps {
    item: Product; 
    buttonText: string;
}

export default function GalleryStreamingItem({ item, buttonText }: GalleryStreamingItemProps) {
    const [selected, setSelected] = useState<Product | null>(null); 
    const [openModal, setOpenModal] = useState(false);
    // 🛑 CORRECCIÓN: Añadir setPaymentData (aunque no se use en este archivo, el modal lo exige)
    const [paymentData, setPaymentData] = useState(null); 


    // ... (Tu lógica de componente y renderizado)

    return (
        <div>
            {/* ... Tu JSX de renderizado ... */}
            
            <PurchaseModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                service={selected ?? undefined}
                // 🛑 CORRECCIÓN: Pasar el setPaymentData requerido
                setPaymentData={setPaymentData as any} 
            />
        </div>
    );
}