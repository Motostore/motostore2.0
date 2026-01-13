import Table from "./table";
// Borramos la importación de HeaderProfile porque ya no lo usamos

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div>
      {/* Header simplificado: Solo el Título */}
      <div className="flex flex-row justify-between items-end mb-4">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white">
          Mis licencias
        </h1>
      </div>
      
      <hr className="w-full h-1 bg-gray-400 border-none mx-auto my-5" />
      
      <Table query={query} currentPage={currentPage} />
    </div>
  );
}
