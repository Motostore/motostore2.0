import { currentDate } from "@/app/common";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import NotificationsTable from "@/app/ui/notifications/table";


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
    const totalPages = 3;

    return (
    <main>
        <section className="flex md:flex-row flex-col justify-between items-start md:items-end">
            <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white">Notificaciones</h1>
            <div className="flex items-start md:items-end flex-col mt-4 md:mt-0">
                <HeaderProfile />
            </div>
        </section>
        <hr className='w-full h-1 bg-gray-400 border-none mx-auto my-5' />
        <section>
            <NotificationsTable query={query} currentPage={currentPage}/>
        </section>
    </main>
    );
}