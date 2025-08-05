'use client';

import { 
  DocumentDuplicateIcon, 
  HomeIcon, // El ícono de Home que usabas para 'Tablero'
  UsersIcon, 
  GlobeAltIcon, 
  BuildingLibraryIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import clsx from 'clsx';
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ButtonDropdown } from "@/app/components/MyButtons";


const links = [
  {
    name: 'Quiénes somos',
    href: '/QuienesSomos',
    icon: UsersIcon, 
    enableFor: ["ADMIN", "RESELLER", "SUPERUSER", "CLIENT", "ALL"] 
  },
  {
    name: 'Usuarios',
    href: '/dashboard/users',
    icon: UsersIcon,
    enableFor: ["ADMIN", "RESELLER"]
  },
  {
    name: 'Transacciones',
    href: '/dashboard/transactions',
    icon: BuildingLibraryIcon,
    enableFor: ["RESELLER", "ADMIN", "SUPERUSER"]
  },
  {
    name: 'Reportes',
    href: '/dashboard/reports',
    icon: DocumentDuplicateIcon,
    enableFor: ["ADMIN", "RESELLER"]
  },
];

const productOptions = [
  {
    name: 'Recargas',
    href: '/dashboard/products/recharges',
    enableFor: ["ADMIN", "SUPERUSER"]
  },

  {
    name: 'Marketing',
    href: '/dashboard/products/marketing',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
]

const streamingOptions = [
  {
    name: 'Gestión de proveedores',
    href: '/dashboard/products',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
  {
    name: 'Gestión de cuentas',
    href: '/dashboard/products/accounts',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
  {
    name: 'Gestión de perfiles',
    href: '/dashboard/products/accounts/profiles',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
]
const licenseOptions = [
  {
    name: 'Gestión de licencias',
    href: '/dashboard/products/licenses/manage',
    enableFor: ["ADMIN", "SUPERUSER"]
  },
]

export default function NavLinksDashboard() {
  const pathname = usePathname();
  const {data: session} = useSession();

  return (
    <>
    {/* Enlace a la Web principal */}
    <Link
      href={'/'}
      className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-gray-500 text-sm font-bold hover:bg-gray-300  md:flex-none md:justify-start md:p-2 md:px-3 bg-white",
        {
          'bg-gray-200 text-gray-500': pathname === '/',
        },
      )}
    >
      <GlobeAltIcon className="w-6" />
      <p className="hidden md:block">{'Web'}</p>
    </Link>
    {/* ¡¡¡AQUÍ HEMOS ELIMINADO O MODIFICADO EL ENLACE "Tablero" / "Dashboard"!!! */}
    {/* Si quieres que NO APAREZCA, simplemente se quita el bloque <Link> de 'Tablero'. */}
    {/* Si quieres que diga otra cosa, cambias el texto dentro del <p>. */}
    {/* Por ejemplo, si quieres que diga 'Inicio del Panel': */}
    {/*
    <Link
      href={'/dashboard'}
      className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-gray-500 text-sm font-bold hover:bg-gray-300  md:flex-none md:justify-start md:p-2 md:px-3 bg-white",
        {
          'bg-gray-200 text-gray-500': pathname === '/dashboard', // Nota: cambié a '/dashboard' para ser exacto con la ruta
        },
      )}
    >
      <HomeIcon className="w-6" />
      <p className="hidden md:block">{'Inicio del Panel'}</p> // Texto cambiado
    </Link>
    */}

    {/* Dropdown de Productos (solo si el rol lo permite) */}
    {
      session?.user?.role && ['ADMIN' , 'SUPERUSER'].includes(session.user.role) 
      ?
      <ButtonDropdown responsive="hidden md:block" mainLink={'/dashboard/products'} title={'Productos'} titleIcon={Squares2X2Icon} options={productOptions}>
        <>
        <ButtonDropdown mainLink={'/dashboard/products'} title={'Streaming'} options={streamingOptions}>
          <></>
        </ButtonDropdown>
        <ButtonDropdown mainLink={'/dashboard/products/licenses'} title={'Licencias'} options={licenseOptions}>
          <></>
        </ButtonDropdown>
        </>
      </ButtonDropdown>
      : null
    }

    {/* Renderizado de enlaces generales (incluye 'Quiénes somos' y otros) */}
    {links.map((link) => {
      const LinkIcon = link.icon;
      const userRole = session?.user?.role;
      
      return (
        (userRole && link.enableFor.includes(userRole) || link.enableFor.includes("ALL")) &&
        <Link
          key={link.name}
          href={link.href}
          className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-gray-500 text-sm font-bold hover:bg-gray-300  md:flex-none md:justify-start md:p-2 md:px-3 bg-white",
            {
              'bg-gray-200 text-gray-500': pathname === link.href,
            },
          )}
        >
          {LinkIcon && <LinkIcon className="w-6" />}
          <p className="hidden md:block">{link.name}</p>
        </Link>
      );
    })}
    </>
  );
}