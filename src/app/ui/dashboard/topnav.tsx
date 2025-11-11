// src/app/ui/dashboard/topnav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

/* ---------- Helpers ---------- */
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
type DropItem = { label: string; href: string };

/* ---------- Inline icons ---------- */
const iconCls = "h-4 w-4";
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 3 3 10v9a2 2 0 0 0 2 2h5v-6h4v6h5a2 2 0 0 0 2-2v-9l-9-7z" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 2 3 7l9 5 9-5-9-5Zm-9 7v8l9 5V14L3 9Zm20 0-9 5v8l9-5V9Z" />
    </svg>
  );
}
function IconBars() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M3 6h18v2H3zM3 11h14v2H3zM3 16h10v2H3z" />
    </svg>
  );
}
function IconMoney() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M3 6h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v8h18V8H3zm9 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM6 10h2v4H6v-4zm10 0h2v4h-2v-4z" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm9 4a7.7 7.7 0 0 0-.08-1l2-1.55-1.5-2.6-2.4.73a7.9 7.9 0 0 0-1.74-1l-.36-2.47h-3l-.36 2.47a7.9 7.9 0 0 0-1.74 1l-2.4-.73-1.5 2.6L3.08 11A7.7 7.7 0 0 0 3 12c0 .34.03.67.08 1l-2 1.55 1.5 2.6 2.4-.73a7.9 7.9 0 0 0 1.74 1l.36 2.47h3l.36-2.47a7.9 7.9 0 0 0 1.74-1l2.4.73 1.5-2.6L20.92 13c.05-.33.08-.66.08-1z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 2c-3 0-9 1.5-9 4.5V21h14v-1.5C21 15.5 17 14 16 14zM8 14c-2.67 0-8 1.34-8 4v2h5v-1.5c0-1.07.56-2.03 1.5-2.87C7 15.02 7.47 14.53 8 14z" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
    </svg>
  );
}
function IconNoEntry() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2zm5 11H7v-2h10z" />
    </svg>
  );
}

/* ---------- Dropdown ---------- */
function Dropdown({
  label,
  icon,
  items,
  isActive,
}: {
  label: string;
  icon?: React.ReactNode;
  items: DropItem[];
  isActive?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("click", onClickAway);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("click", onClickAway);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
          "hover:bg-white/10 transition",
          isActive && "bg-white/15"
        )}
      >
        {icon ? <span className="text-white">{icon}</span> : null}
        <span>{label}</span>
        <span className="ml-1" aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg p-1 z-50"
        >
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Link y Botón ---------- */
function NavLink({
  href,
  children,
  active,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
        "hover:bg-white/10 transition",
        active && "bg-white/15"
      )}
    >
      {icon ? <span className="text-white">{icon}</span> : null}
      {children}
    </Link>
  );
}

function NavButton({
  onClick,
  children,
  icon,
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition"
      type="button"
    >
      {icon ? <span className="text-white">{icon}</span> : null}
      {children}
    </button>
  );
}

/* ---------- Top Navigation ---------- */
export default function TopNav() {
  const pathname = usePathname();
  const is = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  // SUBMENÚS
  const productsItems: DropItem[] = [
    { label: "Panel de productos", href: "/dashboard/products" },
    { label: "Recargas", href: "/dashboard/products/recharges/create" },
    { label: "Licencias", href: "/dashboard/products/licenses" },
    { label: "Cuentas / Perfiles", href: "/dashboard/products/accounts" },
    { label: "Marketing", href: "/dashboard/products/marketing" },
    { label: "Categorías", href: "/dashboard/products/categories" },
    { label: "Nuevo producto", href: "/dashboard/products/new" },
  ];

  const reportesItems: DropItem[] = [
    { label: "General", href: "/dashboard/reports/general" },
    { label: "Movimientos", href: "/dashboard/reports/movimiento" },
    { label: "Utilidades", href: "/dashboard/reports/utilidades" },
  ];

  const comprasItems: DropItem[] = [
    { label: "Reportar pago", href: "/dashboard/purchases/report-payment" },
    { label: "Mis compras", href: "/dashboard/purchases/mine" },
    { label: "Retirar dinero", href: "/dashboard/wallet/withdraw" },
    { label: "Métodos de pago", href: "/dashboard/payments/methods" },
    { label: "Compras de usuarios", href: "/dashboard/purchases/users" },
  ];

  const perfilItems: DropItem[] = [
    { label: "Datos de cuenta", href: "/dashboard/settings?tab=account#datos" },
    { label: "Cambio de clave", href: "/dashboard/settings?tab=account#clave" },
    { label: "Teléfono SMS/WhatsApp", href: "/dashboard/settings?tab=account#telefono" },
    { label: "Comisiones", href: "/dashboard/settings?tab=account#comisiones" },
  ];

  const usuariosItems: DropItem[] = [
    { label: "Crear cuenta", href: "/dashboard/users/create" },
    { label: "Lista de usuarios", href: "/dashboard/users/list" },
    { label: "URL de registro", href: "/dashboard/users/register-url" },
    { label: "Barra informativa", href: "/dashboard/users/announcement-bar" },
    { label: "Transacciones de usuarios", href: "/dashboard/users/transactions" },
  ];

  return (
    <header className="bg-brand-600 text-white sticky top-0 z-40 shadow">
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex items-center h-12">
          <nav className="flex items-center gap-1.5">
            <NavLink href="/" active={is("/")} icon={<IconHome />}>
              INICIO
            </NavLink>

            <Dropdown
              label="PRODUCTOS"
              icon={<IconBox />}
              items={productsItems}
              isActive={pathname.startsWith("/dashboard/products")}
            />

            <Dropdown
              label="REPORTES"
              icon={<IconBars />}
              items={reportesItems}
              isActive={pathname.startsWith("/dashboard/reports")}
            />

            <Dropdown
              label="COMPRAS"
              icon={<IconMoney />}
              items={comprasItems}
              isActive={
                pathname.startsWith("/dashboard/purchases") ||
                pathname.startsWith("/dashboard/wallet") ||
                pathname.startsWith("/dashboard/payments")
              }
            />

            <Dropdown
              label="PERFIL"
              icon={<IconGear />}
              items={perfilItems}
              isActive={pathname.startsWith("/dashboard/settings")}
            />

            <Dropdown
              label="USUARIOS"
              icon={<IconUsers />}
              items={usuariosItems}
              isActive={pathname.startsWith("/dashboard/users")}
            />

            <NavLink
              href="/dashboard/help"
              active={is("/dashboard/help")}
              icon={<IconInfo />}
            >
              AYUDA
            </NavLink>

            <NavButton onClick={() => signOut()} icon={<IconNoEntry />}>
              SALIR
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
}



             




























