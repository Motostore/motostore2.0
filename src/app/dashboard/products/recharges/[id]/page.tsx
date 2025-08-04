"use client";
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { currentDate } from "@/app/common";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/app/lib/products.service";
import { Recharge } from "@/app/lib/definitions";
import { ButtonEdit } from "@/app/components/MyButtons";
import { BadgeItems, BadgeStatus } from "@/app/components/MyBadgets";
import ImageS3 from "@/app/ui/common/ImageS3";

export default function Page({ params }: { params: { id: string } }) {
  const link = "/dashboard/products/recharges";
  const productPath = "recharge";
  const id = params.id;

  const [item, setItem] = useState<Recharge>();

  useEffect(() => {
    getItems();
  }, []);

  async function getItems() {
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
            { label: "Recargas", href: link },
            {
              label: "Ver",
              href: `${link}/${id}`,
              active: true,
            },
          ]}
        />
        </div>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-2 md:order-1 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className="w-full h-1 bg-gray-200 mx-auto my-5" />
      {item ? (
        <>
        <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-6 px-8">
          <div className="flex gap-8 justify-start flex-col md:flex-row">
            <div className="w-full max-w-md p-4 bg-white sm:p-8 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">{item.name}</h5>
              </div>
              <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                {item.description}
              </p>
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        Proveedor
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        {item.provider}
                      </p>
                    </div>
                  </li>
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          Precios
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 truncate dark:text-gray-400 w-48">
                      <BadgeItems items={item.prices} />
                      </div>
                    </div>
                  </li>
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        Estatus
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        <BadgeStatus status={item.status} />
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center sm:p-8">
              <ImageS3 objectKey={item.image} objectName={item.name} width={200} height={200} placeholder="/assets/placeholder/no-image.png" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <ButtonEdit text="Editar" iconSize="w-5" link={`${link}/${id}/edit`} />
          </div>

        </div>
        </>
      ) : (
        <p>Item no encontrado</p>
      )}
    </main>
  );
}
