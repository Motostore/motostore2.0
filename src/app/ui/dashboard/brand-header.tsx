// src/app/ui/dashboard/brand-header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

/* --------- helpers --------- */
function fechaLargaES(d = new Date()) {
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function saludoSegunHora(h = new Date().getHours()) {
  if (h < 12) return "Buenos Días";
  if (h < 18) return "Buenas Tardes";
  return "Buenas Noches";
}

export default function BrandHeader() {
  const { data: session } = useSession();
  const u: any = session?.user;

  const username =
    u?.username ?? u?.name ?? u?.email?.split("@")[0] ?? "usuario";

  // Placeholders (si tienes datos reales, cámbialos aquí)
  const saldo = u?.balanceText ?? "—";
  const util = u?.utilityText ?? "—";

  const hoy = new Date();

  return (
    <header className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-3">
      {/* 3 columnas responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        {/* IZQUIERDA: logo + marca */}
        <div className="flex items-center gap-3 min-w-0">
          {/* círculo con borde rojo (más delgado) */}
          <div className="relative shrink-0 rounded-full bg-white border-[3px] md:border-[4px] border-[#E53935] h-12 w-12 md:h-16 md:w-16 overflow-hidden">
            <Image
              src="/motostore-logo.png"
              alt="Moto Store LLC"
              fill
              sizes="(max-width: 768px) 48px, 64px"
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-base md:text-lg whitespace-nowrap">
                Moto Store LLC
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-sm text-slate-600 truncate">
                Soluciones Digitales 24/7
              </span>
              {/* 🔵 Badge verificado eliminado */}
            </div>
          </div>
        </div>

        {/* CENTRO: saludo + fecha (solo md+) */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-slate-900">
            {saludoSegunHora(hoy.getHours())}
          </div>
          <div className="text-sm text-slate-600">{fechaLargaES(hoy)}</div>
        </div>

        {/* DERECHA: bienvenida + saldo/utilidades + acceso a perfil */}
        <div className="flex items-center justify-start md:justify-end gap-4 text-sm text-slate-600">
          <div className="whitespace-nowrap">
            Bienvenido, <b className="text-slate-800">{username}</b>
          </div>

          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden>💵</span>
            <span>
              <span className="text-slate-800">Saldo:</span>{" "}
              <span className="text-slate-700 font-medium">{saldo}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <span aria-hidden>🚀</span>
            <span>
              <span className="text-slate-800">Utilidades:</span>{" "}
              <span className="text-slate-700 font-medium">{util}</span>
            </span>
          </div>

          {/* icono/atajo a perfil */}
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
      </div>
    </header>
  );
}























