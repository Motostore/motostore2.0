import HeaderProfile from "@/app/ui/dashboard/header-profile";
import Table from "./table";

// En Next.js 16, definimos searchParams como una Promesa
interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function Page(props: PageProps) {
  // PASO CRÍTICO PARA NEXT.JS 16:
  // Debemos usar 'await' antes de acceder a los datos de la URL.
  const searchParams = await props.searchParams;

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-center">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white order-2 md:order-1">
          Mis cuentas
        </h1>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className="w-full h-1 bg-gray-400 border-none mx-auto my-5" />
      <Table query={query} currentPage={currentPage} />
    </div>
  );
}
