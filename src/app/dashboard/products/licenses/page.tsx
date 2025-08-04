import { currentDate } from "@/app/common";  // Asegúrate de que sea importada correctamente

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

  return (
    <div>
      <div className="flex md:flex-row flex-col items-center justify-between md:items-start">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-2xl dark:text-white order-2 md:order-1">
          Licencias
        </h1>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className={hr_line} />
      {/* Si quieres mostrar la fecha en esta página, invoca currentDate() */}
      <div className="text-sm text-gray-500 mt-2">{currentDate()}</div>
      <Table query={query} currentPage={currentPage} />
    </div>
  );
}

