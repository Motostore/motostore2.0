'use client';
import { Datepicker } from "flowbite-react";
import TransactionsList from "./TransactionsList";
import { DropdownExport } from "./MyDropdowns";
import Search from "../ui/search";
import { Suspense } from "react";

export default function Transactions({span}) {
  return (
    <div className={`bg-white text-gray-600 rounded-lg px-2 ${span}`}>
        <div className="flex justify-between items-center py-1.5 flex-col md:flex-row">
            <h2 className="text-lg">Transacciones</h2>
            <DropdownExport />
        </div>
        <hr className="h-1 border-gray-300 rounded" />
        <div className="mt-4 flex justify-between flex-col md:flex-row gap-2">
          <Suspense>
            <Search placeholder="Buscar..." />
          </Suspense>
          <Datepicker className="w-full md:w-36" />
        </div>
        <div className="my-4 py-2 px border-2 border-gray-200 rounded-md px-2">
        <TransactionsList />
        </div>
    </div>
  );
}
