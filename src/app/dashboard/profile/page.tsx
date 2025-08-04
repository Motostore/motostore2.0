import { currentDate } from "@/app/common";
import ProfilePage from "@/app/components/ProfilePage";
import HeaderProfile from "@/app/ui/dashboard/header-profile";

export default function Page() {
    return (
    <div>
        <div className="flex md:flex-row flex-col justify-between items-start md:items-end">
            <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white">Perfil</h1>
            <div className="flex items-start md:items-end flex-col mt-4 md:mt-0">
                <HeaderProfile />

            </div>
        </div>
        <hr className='w-full h-1 bg-gray-400 border-none mx-auto my-5' />
        <ProfilePage />
    </div>
    );
}