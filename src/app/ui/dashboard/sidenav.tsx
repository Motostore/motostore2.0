'use client';
import Link from 'next/link';
import MotostoreLogo from '../motostore-logo';
import NavLinksDashboard from './nav-links-dashboard';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex items-center justify-center rounded-md bg-white p-4"
        href="/"
      >
        <div className="text-black flex flex-col items-center"> {/* CAMBIADO: text-black y flex-col para alinear logo y texto */}
          <MotostoreLogo className="w-8 h-8 mb-2" /> {/* Agregué clases para el tamaño del logo y un pequeño margen */}
          {/* ¡¡¡AÑADIDO EL TEXTO DEL ENCABEZADO AQUÍ!!! */}
          <h1 className="text-xl font-bold text-gray-800 text-center">
            Moto Store LLC
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Soluciones Digitales 24/7
          </p>
        </div>
      </Link>
      <div className="flex grow flex-row overflow-x-scroll md:overflow-x-hidden justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1 bg-gray-200">
        <NavLinksDashboard />
        <div className="hidden h-auto w-full grow rounded-md bg-white md:block"></div>
        {/* Agregado un botón de Cerrar sesión por si lo necesitas, ya que la función logout existe */}
        <button
          onClick={logout}
          className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 mt-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          <div className="hidden md:block">Cerrar sesión</div>
        </button>
      </div>
    </div>
  );
}
