// src/app/rbac/IfCan.tsx
'use client';

import { useSession } from "next-auth/react";
import { can, type Action } from "./permissions"; // Asegúrate de que permissions.ts esté en la misma carpeta

type IfCanProps = {
  action: Action;
  children: React.ReactNode;
};

export default function IfCan({ action, children }: IfCanProps) {
  const { data: session, status } = useSession();

  // Mientras carga, no mostramos nada (o podrías mostrar un skeleton)
  if (status === "loading") return null;

  // Obtenemos el rol del usuario (o "CLIENT" por defecto)
  const userRole = session?.user?.role || "CLIENT";

  // Verificamos si el rol tiene permiso para la acción
  if (can(userRole, action)) {
    return <>{children}</>;
  }

  // Si no tiene permiso, no renderizamos nada
  return null;
}