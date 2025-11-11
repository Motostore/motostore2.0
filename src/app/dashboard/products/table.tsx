'use client';

// Importa los componentes de botón específicos que necesitas de MyButtons.tsx
import { ButtonCreate, ButtonEdit, ButtonDelete } from '@/app/components/MyButtons';
import Link from 'next/link';

type AnyRec = Record<string, any>;

export default function ProductsTable({ items, isSuperuser }: { items: AnyRec[]; isSuperuser: boolean }) {
  const allProducts = [
    ...(items.streamings || []),
    ...(items.recharges || []),
    ...(items.licenses || []),
    ...(items.marketing || []),
  ];

  const hasProducts = allProducts.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Productos</h2>
        {isSuperuser && (
          // Usa el nombre de componente correcto: <ButtonCreate>
          <ButtonCreate link="/dashboard/products/create" text="Agregar Producto" />
        )}
      </div>
      
      {hasProducts ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                {isSuperuser && <th scope="col" className="px-6 py-3">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {allProducts.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.price}</td>
                  {isSuperuser && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Usa los nombres de componentes correctos */}
                        <ButtonEdit link={`/dashboard/products/edit/${item.id}`} />
                        <ButtonDelete trigger={() => {/* Lógica de eliminación */}} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-6 text-sm text-slate-500 text-center">
          <p>No hay productos creados todavía.</p>
          {isSuperuser && (
            <p className="mt-2 text-gray-500">
              Haz clic en el botón de arriba para agregar uno.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

