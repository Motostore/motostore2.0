'use client';
import './css/motodropdown.css';
import HeaderProfile from '../ui/dashboard/header-profile';
import MyTabs from './MyTabs';
import Transactions from './Transactions';
import { ProductProvider } from '../Context/productsContext';
import { useEffect, useState } from 'react';
import { getCurrentSession } from '../lib/app-session';
import { Session } from 'next-auth';

export default function Dashboard() {

  const [sess, setSess] = useState<Session>();
  const [canView, setCanView] = useState(false);

  useEffect(() => {
    currentSession()
  }, [])

  async function currentSession() {
    const result = await getCurrentSession();
    setSess(result);
    setCanView(["CLIENT", "RESELLER"].includes(result.user.role))
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center md:justify-between md:items-end">
        <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white">Tablero</h1>
        <div className="flex items-end flex-col">
          <HeaderProfile />
        </div>
      </div>
      <hr className='w-full h-1 bg-gray-400 border-none mx-auto my-5' />
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4">
          <ProductProvider>
          <MyTabs span={`${ canView ? 'md:col-span-8': 'md:col-span-12'}`} />
          </ProductProvider>
          {
            canView ? <Transactions span="col-span-1 md:col-span-4" />
            : null
          }
        </div>
      </div>
    </div>
  );
}
