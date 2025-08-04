"use client";

import { UserIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  {
    name: 'Perfil',
    href: '/dashboard/profile',
    enableFor: ["ALL"]
  },
  {
    name: 'Mis cuentas',
    href: '/dashboard/accounts',
    enableFor: ["CLIENT"]
  },
  {
    name: 'Mis licencias',
    href: '/dashboard/licenses',
    enableFor: ["CLIENT"]
  },
  {
    name: 'Compras',
    href: '/dashboard/purchases',
    enableFor: ["ALL"]
  },
  {
    name: 'Notificaciones',
    href: '/dashboard/notifications',
    enableFor: ["ALL"]
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
]

export default function AvatarDropdown({ user }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {}, []);

  return (
    <div className="relative">
      <div className="relative cursor-pointer" onClick={() => setOpen(!open)}>
        <UserIcon className="w-6 h-8 mb-[2px]" />
      </div>
      <div
        className={clsx(
          "absolute overflow-auto right-0 w-48 max-h-96 bg-white border-2 rounded-lg shadow z-10",
          {
            hidden: open === false,
            block: open === true,
          }
        )}
      >
        <div className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b-2">
          <div className="font-medium truncate">Bienvenido, {user.name}</div>
          <div className="font-medium truncate"></div>
        </div>
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200 border-b-2"
          aria-labelledby="avatarButton"
        >
          {
          links.map((link, index) => {
            return (
              (link.enableFor.includes(user.role) || link.enableFor.includes("ALL")) &&
            <Link
            key={index}
              href={link.href}
              className={"block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}
            >
              <p>{link.name}</p>
            </Link>)
          })
          }
        </ul>
        <div className="py-1">
          <a
            href="#"
            onClick={() => signOut({ callbackUrl: '/', redirect:true })}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
          >
            Cerrar sesión
          </a>
        </div>
      </div>
    </div>
  );
}
