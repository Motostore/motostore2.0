"use client";

// 1. Importamos el Modal original con un alias (nombre temporal)
import { Modal as FlowbiteModal } from "flowbite-react";
import ProfileData from "@/app/components/ProfileData";

// 2. Creamos una constante 'Modal' que sea de tipo 'any'.
// Esto hace que TypeScript ignore los errores de tipos dentro de <Modal>
const Modal = FlowbiteModal as any;

type User = any;

type Props = {
  user: User | null;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
};

export default function UserModal({ user, openModal, setOpenModal }: Props) {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} size="md">
      <Modal.Header>Datos del usuario</Modal.Header>
      <Modal.Body>
        {user ? (
          <ProfileData user={user} />
        ) : (
          <p className="text-sm text-slate-500">Sin datos de usuario.</p>
        )}
      </Modal.Body>
    </Modal>
  );
}