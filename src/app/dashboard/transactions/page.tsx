// src/app/dashboard/transactions/page.tsx

import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { hr_line } from "@/app/utils/tailwindStyles";
import Table from "./table";
import React from 'react'; // Importa React para usar React.use()

// Define el tipo de los parámetros de búsqueda como una Promesa
interface PageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}

// Convierte el componente en una función asíncrona y usa `await`
export default async function Page({ searchParams }: PageProps) {
  // Resuelve la promesa de searchParams antes de acceder a sus propiedades
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const query = resolvedSearchParams.query || "";
  const currentPage = Number(resolvedSearchParams.page) || 1;

  return (
    <div>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-end">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white order-2 md:order-1">
          Transacciones
        </h1>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className={hr_line} />
      <Table query={query} currentPage={currentPage} />
    </div>
  );
}
