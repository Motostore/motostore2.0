// src/app/ui/dashboard/header-profile.tsx (CORREGIDO)
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import HeaderSummary from "../header-summary";

// 💡 Definición de interfaz para el usuario de NextAuth.
interface CustomUser {
  username?: string;
  name?: string;
  email?: string;
  // Añadir cualquier otro campo que se adjunte al objeto de sesión (ej. role, token)
}

export default function HeaderProfile() {
  const { data: session, status } = useSession();
  
  // 💡 Eliminamos 'any' y tipamos con la interfaz CustomUser.
  const u: CustomUser | undefined = session?.user as CustomUser | undefined;

  if (status !== "authenticated" || !u) {
    return null;
  }

  const username =
    u?.username ?? u?.name ?? u?.email?.split("@")[0] ?? "usuario";

  return (
    <div className="flex items-center gap-4 text-sm text-slate-600 shrink-0">
      {/* Bienvenida */}
      <span>
        Bienvenido,{" "}
        <b className="text-slate-800">
          {username}
        </b>
      </span>

      {/* 💵 Saldo + 🚀 Utilidades (mismo componente que el resto) */}
      <HeaderSummary />

      {/* Icono de perfil */}
      <Link
        href="/dashboard/settings?tab=account#datos"
        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 transition"
        title="Abrir Perfil"
        aria-label="Abrir Perfil"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
        </svg>
      </Link>
    </div>
  );
}
































