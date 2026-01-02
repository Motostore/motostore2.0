// src/app/ui/dashboard/announcement-bar.tsx
"use client";

import { useEffect, useState } from "react";

const DEFAULT_MSG =
  "🚀 Muy pronto: ¡Bienvenido a Moto Store LLC 2.0! Renovamos nuestra plataforma.";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState<string>(
    process.env.NEXT_PUBLIC_ANNOUNCEMENT ?? DEFAULT_MSG
  );

  useEffect(() => {
    try {
      const hidden = localStorage.getItem("ms_announcement_hidden");
      const saved = localStorage.getItem("ms_announcement_msg");
      if (hidden === "1") setOpen(false);
      if (saved && saved.trim()) setMsg(saved);
    } catch {}
  }, []);

  if (!open || !msg) return null;

  return (
    <div className="bg-amber-50 text-amber-800 border-y border-amber-200">
      <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-1.5 text-sm flex items-center justify-between gap-3">
        <div className="truncate">{msg}</div>
        <button
          onClick={() => {
            setOpen(false);
            try { localStorage.setItem("ms_announcement_hidden", "1"); } catch {}
          }}
          className="text-amber-700 hover:text-amber-900 text-xs"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

