
"use client";

import ProfileData from "@/app/components/ProfileData";
import { Button, Modal } from "flowbite-react";
import { useState } from "react";

export default function UserModal({user, openModal, setOpenModal}) {

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Datos del usuario</Modal.Header>
        <Modal.Body>
            <ProfileData user={user} />
        </Modal.Body>
      </Modal>
    </>
  );
}
