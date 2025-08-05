'use client';

import { 
  DocumentDuplicateIcon, 
  HomeIcon,
  UsersIcon, // Asegúrate de que este sea el ícono correcto que quieres usar (UserGroupIcon o UsersIcon)
  GlobeAltIcon, 
  BuildingLibraryIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import clsx from 'clsx';
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// Definir los enlaces de navegación
const links = [
  {
    key: 'home',
    name: 'Inicio',
    href: '/',
    icon: HomeIcon,
  },
  {
    key: 'about',
    name: 'Quiénes somos',
    href: '/QuienesSomos',
    icon: UsersIcon, // Si en tu screenshot aparece UserGroupIcon, asegúrate de importarlo. Aquí uso UsersIcon como en tu código previo.
  }, // <--- ¡Asegúrate de que esta coma esté presente!
  {
    key: 'help',
    name: 'Cómo funciona',
    href: '/ayuda',
    icon: QuestionMarkCircleIcon,
  },
  {
    key: 'calculadora-paypal',
    name: 'Calculadora PayPal',
    href: '/calculadora-comisiones-paypal',
    icon: CalculatorIcon,
  },
  {
    key: 'register',
    name: 'Registro',
    href: '/register',
    icon: UserPlusIcon,
  },
  {
    key: 'login',
    name: 'Acceso',
    href: '/login',
    icon: ArrowRightOnRectangleIcon,
  },
];

const productOptions = [
  { name: 'Recargas', href: '/dashboard/products/recharges', enableFor: ["ADMIN", "SUPERUSER"] },
  { name: 'Marketing', href: '/dashboard/products/marketing', enableFor: ["ADMIN", "SUPERUSER"] },
];

const streamingOptions = [
  { name: 'Gestión de proveedores', href: '/dashboard/products', enableFor: ["ADMIN", "SUPERUSER"] },
  { name: 'Gestión de cuentas', href: '/dashboard/products/accounts', enableFor: ["ADMIN", "SUPERUSER"] },
  { name: 'Gestión de perfiles', href: '/dashboard/products/accounts/profiles', enableFor: ["ADMIN", "SUPERUSER"] },
];

const licenseOptions = [
  { name: 'Gestión de licencias', href: '/dashboard/products/licenses/manage', enableFor: ["ADMIN", "SUPERUSER"] },
];

export default function NavLinks() {
  const { data: session } = useSession();
  const pathname = usePathname();

  let menuLinks = [...links];
  if (session?.user) {
    menuLinks = [
      menuLinks.find(link => link.key === 'home'),
      menuLinks.find(link => link.key === 'about'),
      menuLinks.find(link => link.key === 'help'),
      menuLinks.find(link => link.key === 'calculadora-paypal'),
      {
        key: 'dashboard',
        name: 'Tablero',
        href: '/dashboard',
        icon: HomeIcon,
      },
      {
        key: 'logout',
        name: 'Salir',
        href: '#',
        icon: ArrowRightOnRectangleIcon,
        action: () => signOut({ callbackUrl: '/', redirect: true }),
      }
    ].filter(Boolean);
  }

  return (
    <>
      {menuLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

        return (
          <a
            key={link.key}
            href={link.href}
            onClick={link.action ? link.action : undefined}
            className={clsx(
              "flex h-[48px] items-center text-gray-500 font-bold justify-center gap-2 rounded-md p-3 text-sm hover:bg-gray-500 md:hover:bg-gray-500 md:hover:text-white md:flex-none md:justify-start md:p-2 md:px-3",
              {
                'bg-gray-500 text-white': isActive,
                'text-orange-500': !isActive,
              }
            )}
          >
            {Icon && <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-orange-500")} />}
            <span className="md:block">{link.name}</span>
          </a>
        );
      })}
    </>
  );
}



















