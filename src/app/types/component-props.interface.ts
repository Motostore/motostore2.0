// src/app/types/component-props.interface.ts
import { Dispatch, SetStateAction, ReactNode } from 'react';
import { Product } from '@/app/types/product.interface'; 

// Interfaz para el modal de compra (PurchaseModal)
export interface PurchaseModalProps {
    service?: Product | null; 
    openModal: boolean; 
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    setPaymentData: Dispatch<SetStateAction<any>>;
}

// Interfaz para ModalDelete
export interface ModalDeleteProps {
    content: ReactNode;
    action: () => Promise<void> | void; // Acción sin argumentos
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
}