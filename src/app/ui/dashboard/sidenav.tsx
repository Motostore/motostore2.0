'use client';
import Link from 'next/link';
import MotostoreLogo from '../motostore-logo';
import NavLinksDashboard from './nav-links-dashboard';
import { useRouter } from 'next/navigation';

export default function SideNav() {

  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex items-center justify-center rounded-md bg-white p-4"
        href="/"
      >
        <div className="text-white">
          <MotostoreLogo />
        </div>
      </Link>
      <div className="flex grow flex-row overflow-x-scroll md:overflow-x-hidden justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1 bg-gray-200">
        <NavLinksDashboard />
        <div className="hidden h-auto w-full grow rounded-md bg-white md:block"></div>

      </div>
    </div>
  );
}
