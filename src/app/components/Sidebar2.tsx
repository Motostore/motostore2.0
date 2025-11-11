'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { label: string; href: string };

const ITEMS: Item[] = [
  { label: 'Inicio', href: '/' },                     // ← antes decía "Web" y/o iba a /dashboard
  { label: 'Productos', href: '/dashboard/products' },
  { label: 'Transacciones', href: '/dashboard/transactions' },
  { label: 'Configuración', href: '/dashboard/settings' },
];

export default function Sidebar2() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 p-4">
      <div className="mb-4 text-lg font-semibold">Motostore</div>
      <nav className="space-y-2">
        {ITEMS.map((it) => {
          const active =
            pathname === it.href || (pathname?.startsWith(it.href) ?? false);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                'block rounded-md px-3 py-2 text-sm',
                active
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'hover:bg-gray-50 text-gray-700',
              ].join(' ')}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



