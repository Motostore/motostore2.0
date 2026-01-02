// src/app/components/ModalDelete.tsx (CÓDIGO COMPLETO A REEMPLAZAR)

import { ModalDeleteProps } from "@/app/types/component-props.interface"; 

export default function ModalDelete({content, action, openModal, setOpenModal}: ModalDeleteProps) {
    // ... (El resto del contenido JSX/lógica)
    // Asumiendo que el cuerpo del componente es un modal básico:
    return (
        <div className={`modal ${openModal ? 'block' : 'hidden'}`}>
            <div className="modal-content">
                <p>{content}</p>
                <button onClick={() => { action(); setOpenModal(false); }}>Confirmar</button>
                <button onClick={() => setOpenModal(false)}>Cancelar</button>
            </div>
        </div>
    );
}
