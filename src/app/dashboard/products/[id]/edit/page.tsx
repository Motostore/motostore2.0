// src/app/dashboard/products/[id]/edit/page.tsx

"use client"; // ¡IMPORTANTE! Esta línea debe estar al principio.

import Breadcrumbs from "@/app/ui/transactions/breadcrumbs";
import HeaderProfile from "@/app/ui/dashboard/header-profile";
import { Streaming } from "@/app/lib/definitions";
import { fetchProductById } from "@/app/lib/products.service";
import Form from "../../form"; // Verifica que esta ruta a Form sea correcta.

// NO DEBE HABER NINGUNA INTERFAZ LLAMADA 'PageProps' O 'ProductEditPageProps' DEFINIDA AQUÍ.
// Los 'params' se tipan directamente en la firma de la función.
export default function Page({ params }: { params: { id: string } }) {
  const link = "/dashboard/products/";
  const productPath = "streaming";
  const id = params.id;

  const [item, setItem] = useState<Streaming>();

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

