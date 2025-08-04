'use client'
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { currentDate } from "@/app/common";
import Form from "../form";

export default function Page() {

  return (
    <main>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-center">
        <div className="order-2 md:order-1">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Recargas', href: '/dashboard/products/recharges' },
              {
                label: 'Agregar',
                href: `/dashboard/products/recharges/create`,
                active: true,
              },
            ]}
          />
        </div>
          <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
              <HeaderProfile />
          </div>
      </div>
      <hr className='w-full h-1 bg-gray-200 mx-auto my-5' />
      <Form recharge={null} />
    </main>
  )
}