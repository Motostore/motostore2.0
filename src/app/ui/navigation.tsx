'use client';

import { usePathname } from 'next/navigation';
import NavLinks from './nav-links';
import { Navbar } from 'flowbite-react';

export default function Navigation() {
  const pathname = usePathname();

  // Oculta el navbar público en el backend (/admin y subrutas)
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Navbar fluid className="shadow-lg">
      <Navbar.Toggle className="text-gray-500 justify-center" />
      <Navbar.Collapse className="m-auto">
        <NavLinks />
      </Navbar.Collapse>
    </Navbar>
  );
}

