'use client';
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import Table from "./table";
import { UserProvider } from "@/app/Context/usersContext";
import { useState } from "react";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";

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
    <div className="flex md:flex-row flex-col justify-between items-start md:items-end">
      <h1 className="text-2xl font-bold leading-none tracking-tight md:text-3xl lg:text-3xl dark:text-white">Usuarios</h1>
      <div className="flex items-start md:items-end flex-col mt-4 md:mt-0">
          <HeaderProfile />
      </div>
    </div>
    <hr className='w-full h-1 bg-gray-200 mx-auto my-5' />
    <div>
      <UserProvider>
      <Table query={query} currentPage={currentPage} />
      </UserProvider>
    </div>
  </div>
  );
}