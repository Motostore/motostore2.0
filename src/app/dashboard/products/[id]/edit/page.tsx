import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { Streaming } from "@/app/lib/definitions";
import { fetchProductById } from "@/app/lib/products.service";
import Form from "../../form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const link = "/dashboard/products/";
  const productPath = "streaming";
  const id = params.id;

  const response = await fetchProductById(id, productPath);
  let item: Streaming | null = null;

  if (response.ok) {
    item = await response.json();
  } else {
    console.log("Ha ocurrido un error");
  }

  return (
    <main>
      <div className="flex md:flex-row flex-col justify-between items-center md:items-center">
        <div className="order-2 md:order-1">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Streaming', href: '/dashboard/products' },
              {
                label: 'Editar',
                href: `/dashboard/products/${id}/edit`,
                active: true,
              },
            ]}
          />
        </div>
        <div className="flex items-start md:items-end flex-col mt-4 md:mt-0 order-2 md:order-1 mb-4 md:mb-0">
          <HeaderProfile />
        </div>
      </div>
      <hr className='w-full h-1 bg-gray-200 mx-auto my-5' />
      {
        item 
        ? <Form provider={item} />
        : null
      }
    </main>
  );
}

