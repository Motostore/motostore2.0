import SideNav from '@/app/ui/dashboard/sidenav';
import { ProfileProvider } from '../Context/profileContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-200">
        {/* Barra lateral de navegación */}
        <div className="w-full flex-none md:w-72">
          <SideNav />
        </div>
        
        <div className="flex-grow py-4 px-2 md:overflow-y-auto md:py-4">
          <div className="flex min-h-full flex-col p-2 md:p-6 text-gray-500 bg-white rounded-md">
            {children}
          </div>
        </div>
      </div>
    </ProfileProvider>
  );
}
