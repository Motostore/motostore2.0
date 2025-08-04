"use client";
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { useEffect, useState } from "react";
import { StreamingAccount, StreamingProfile } from "@/app/lib/definitions";
import { fetchProductById } from "@/app/lib/products.service";
import Form from "../../form";

export default function Page({ params }: { params: { id: string } }) {
  const link = "/dashboard/products/accounts";
  const providerPath = "streaming/account";
  const id = params.id;

  const [item, setItem] = useState<StreamingAccount>();

  useEffect(() => {
    getItem();
  }, []);

  async function getItem() {
    const response = await fetchProductById(id, providerPath);
    if (response.ok) {
      const json = await response.json();
      setItem(json);
    } else {
      console.log("Ha ocurrido un error");
    }
  }

  return (
    <main>
      <div className="flex md:flex-row flex-col md:justify-between items-center md:items-center">
        <div className="order-2 md:order-1">
          <Breadcrumbs
            breadcrumbs={[
              { label: "Cuentas", href: link },
              {
                label: "Editar",
                href: `${link}/${id}/edit`,
                active: true,
              },
            ]}
          />
        </div>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className="w-full h-1 bg-gray-200 mx-auto my-5" />
      {item ? <Form account={item} /> : null}
    </main>
  );
}
