// src/app/ui/dashboard/sidenav.tsx
'use client';

import Image from 'next/image';
import NavLinksDashboard from './nav-links-dashboard';

export default function SideNav() {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="relative h-6 w-6 overflow-hidden rounded">
            <Image src="/brand.svg" alt="Motostore" fill sizes="24px" className="object-contain" />
          </div>
          <span className="font-semibold">Motostore</span>
        </div>

        <nav className="sidebar-nav">
          <NavLinksDashboard />
        </nav>
      </div>
    </aside>
  );
}







