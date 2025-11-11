"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import Table from "./table";
import { UserProvider } from "@/app/Context/usersContext";

function UsersContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <h1 className="text-2xl md:text-3xl font-bold leading-none tracking-tight text-[var(--brand)]">
          Usuarios
        </h1>
        <HeaderProfile />
      </div>

      <hr className="my-5 h-px w-full bg-gray-200" />

      <UserProvider>
        <Table query={query} currentPage={currentPage} />
      </UserProvider>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Cargando usuarios…</div>}>
      <UsersContent />
    </Suspense>
  );
}

