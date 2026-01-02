// src/app/components/GalleryBaseItem.tsx (CÓDIGO CORREGIDO Y COMPLETO)
'use client';

import React, { useState } from "react";
import PurchaseModal from "./PurchaseModal"; 
import { formatCurrency } from "@/app/lib/utils"; // 🛑 CORRECCIÓN: IMPORTAR LA UTILIDAD

// Asumiendo que Product o el tipo correcto se define en otro lugar
interface GalleryBaseItemProps {
    item: any; 
    buttonText: string;
}

export default function GalleryBaseItem({ item, buttonText }: GalleryBaseItemProps) {
    const [openModal, setOpenModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null); 
    
    const handlePurchaseClick = () => {
        setOpenModal(true);
    };

    const imageUrl = item.image || '/images/default_product.png'; 
    const priceText = item.price ? formatCurrency(item.price) : 'Precio variable'; 

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            {/* ... Resto del JSX ... */}

            <PurchaseModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                service={item as any} 
                setPaymentData={setPaymentData as any} 
            />
        </div>
    );
}