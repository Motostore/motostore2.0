'use client'
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import Form from "../form";

export default function Page() {
    const link = '/dashboard/products/accounts';
  return (
    <main>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-center">
        <div className="order-2 md:order-1">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Cuentas', href: link },
            {
              label: 'Agregar',
              href: `${link}/create`,
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
      <Form account={null} />
    </main>
  )
}