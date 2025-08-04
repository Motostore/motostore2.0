'use client'
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { currentDate } from "@/app/common";
import { Recharge } from "@/app/lib/definitions";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/app/lib/products.service";
import Form from "../../form";

export default function Page({ params }: { params: { id: string } }) {

  const link = "/dashboard/products/recharges/";
  const productPath = "recharge";
  const id = params.id;

  const [item, setItem] = useState<Recharge>();

  useEffect(() => {
    getItem();
  }, []);

  async function getItem() {
    const response = await fetchProductById(id, productPath);
    if (response.ok) {
      const json = await response.json();
      console.log(json);
      setItem(json);
    } else {
      console.log("Ha ocurrido un error");
    }
  }

  return (
    <main>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-center">
        <div className="order-2 md:order-1">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Recargas', href: '/dashboard/products/recharges' },
              {
                label: 'Editar',
                href: `/dashboard/products/recharges/${id}/edit`,
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
      {
        item 
        ?
        <Form recharge={item} />
        :null
      }
    </main>
  )
}