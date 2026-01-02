"use client";

import { UserIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Enlaces del menú (Configuración visible para TODOS)
const links = [
  {
    name: "Perfil",
    href: "/dashboard/profile",
    enableFor: ["ALL"],
  },
  {
    name: "Mis cuentas",
    href: "/dashboard/accounts",
    enableFor: ["CLIENTE"],
  },
  {
    name: "Mis licencias",
    href: "/dashboard/licenses",
    enableFor: ["CLIENTE"],
  },
  {
    name: "Compras",
    href: "/dashboard/purchases",
    enableFor: ["ALL"],
  },
  {
    name: "Notificaciones",
    href: "/dashboard/notifications",
    enableFor: ["ALL"],
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    enableFor: ["ALL"], // 👈 ahora siempre aparece
  },
];

export default function AvatarDropdown({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  // Cierra al hacer click fuera (opcional)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el?.closest?.("#avatar-menu-root")) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const role: string = String(user?.role ?? "").toUpperCase();

  const canSee = (enables: string[]) =>
    enables.includes("ALL") || enables.includes(role);

  return (
    <div className="relative" id="avatar-menu-root">
      <button
        type="button"
        className="relative cursor-pointer inline-flex items-center"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserIcon className="w-6 h-8 mb-[2px]" />
      </button>

      <div
        className={clsx(
          "absolute overflow-auto right-0 w-48 max-h-96 bg-white border-2 rounded-lg shadow z-10",
          { hidden: !open, block: open }
        )}
        role="menu"
      >
        <div className="px-4 py-3 text-sm text-gray-900 border-b-2">
          <div className="font-medium truncate">
            Bienvenido, {user?.name ?? user?.username ?? "usuario"}
          </div>
        </div>

        <ul className="py-2 text-sm text-gray-700 border-b-2">
          {links.map((link, i) =>
            canSee(link.enableFor) ? (
              <li key={i}>
                <Link
                  href={link.href}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ) : null
          )}
        </ul>

        <div className="py-1">
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}


