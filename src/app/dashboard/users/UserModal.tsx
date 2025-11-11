"use client";

import { Modal } from "flowbite-react";
import ProfileData from "@/app/components/ProfileData";

type User = any; // Si tienes un tipo definido, reemplázalo aquí

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
