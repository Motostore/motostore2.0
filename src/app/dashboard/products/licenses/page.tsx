import { currentDate } from "@/app/common"; // Asegúrate de que sea importada correctamente
import HeaderProfile from "@/app/ui/dashboard/header-profile"; // ¡IMPORTADO!
import Table from "./table"; // ¡IMPORTADO! (Asumiendo que 'table.tsx' está en la misma carpeta)

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  // Define hr_line aquí, o asegúrate de que esté importada si viene de otro archivo.
  const hr_line = 'w-full h-1 bg-gray-200 mx-auto my-5'; 

  return (
    <div>
      <div className="flex md:flex-row flex-col items-center justify-between md:items-start">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-2xl dark:text-white order-2 md:order-1">
          Licencias
        </h1>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
          <HeaderProfile /> {/* Este componente ahora está importado */}
        </div>
      </div>
      <hr className={hr_line} />
      {/* Si quieres mostrar la fecha en esta página, invoca currentDate() */}
      <div className="text-sm text-gray-500 mt-2">{currentDate()}</div>
      <Table query={query} currentPage={currentPage} /> {/* Este componente ahora está importado */}
    </div>
  );
}

