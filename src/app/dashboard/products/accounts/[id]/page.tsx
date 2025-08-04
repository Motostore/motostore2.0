"use client";
import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { useEffect, useState } from "react";
import { License, LicenseProvider, Streaming, StreamingAccount, StreamingProfile } from "@/app/lib/definitions";
import { fetchProductById } from "@/app/lib/products.service";
import { BadgeStatus } from "@/app/components/MyBadgets";
import { ButtonEdit } from "@/app/components/MyButtons";

export default function Page({ params }: { params: { id: string } }) {
  const link = "/dashboard/products/accounts";
  const accountPath = "streaming/account";
  const providerPath = "streaming";
  const id = params.id;

  const [item, setItem] = useState<StreamingAccount>();
  // const [provider, setProvider] = useState<Streaming>(null);

  useEffect(() => {
    getItems();
  }, []);

  async function getItems() {
    const response = await fetchProductById(id, accountPath);
    if (response.ok) {
      const json: StreamingAccount = await response.json();
      setItem(json);
      // if (json.streamingProvider) {
      //   const response2 = await fetchProductById(json.streamingProvider.id, providerPath);

      //   if (response2.ok) {
      //     const json2: Streaming = await response2.json();
      //     setProvider(json2);
      //   }
      // }
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
              {
                label: "Perfiles",
                href: link,
              },
              {
                label: "Ver",
                href: `${link}/${id}`,
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
      {item ? (
        <>
          <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-4 px-4 md:py-6 md:px-8">
            <div className="flex flex-col md:flex-row gap-8 justify-start">
              <div className="w-full max-w-md bg-white dark:bg-gray-800 order-2 md:order-1">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                    {item ? `${item.id} - ${item.streamingProvider.name}` : "Sin definir proveedor"}
                  </h5>
                  :
                </div>
                {/* <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                  {item.description}
                </p> */}
                <div className="flow-root">
                  <ul
                    role="list"
                    className="divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            Descripción
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </li>
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            Perfiles
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                          {/* {item.stock} */}TODO
                        </p>
                      </div>
                    </li>
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center justify-between gap-8">
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
            </div>
            <div className="flex justify-end mt-4">
              <ButtonEdit
                text="Editar"
                iconSize="w-5"
                link={`${link}/${id}/edit`}
              />
            </div>
          </div>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </main>
  );
}
