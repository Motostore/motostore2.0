'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define un esquema general para un producto
const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido.'),
  description: yup.string().required('La descripción es requerida.'),
  price: yup.number().required('El precio es requerido.').min(0, 'El precio debe ser un número positivo.'),
  // Puedes agregar más validaciones aquí
});

export default function Form({ productPath }: { productPath: string }) { // Recibe el tipo de producto como una prop
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const body = {
        name: data.name,
        description: data.description,
        price: data.price,
        // Agrega otros campos del formulario aquí
      };

      // La llamada a la API es ahora genérica
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, productPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el producto.');
      }

      toast.success('Producto creado exitosamente!');
      router.push('/dashboard/products');
    } catch (e: any) {
      toast.error(e.message || 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      autoComplete="off"
      className="space-y-2 mb-4"
    >
      <div className="w-full md:w-fit border-2 border-gray-300 rounded-lg py-6 px-4 md:px-8">
        <div className="flex gap-4 md:gap-20 flex-col md:flex-row">
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-gray-700" htmlFor="name">Nombre</label>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              <input {...register('name')} id="name" type='text' placeholder="Nombre" className="w-full mt-1 p-2 border border-gray-300 rounded text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="description">Descripción</label>
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              <textarea {...register('description')} id="description" placeholder="Descripción" className="w-full mt-1 p-2 border border-gray-300 rounded text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-700" htmlFor="price">Precio</label>
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              <input {...register('price')} id="price" type='number' step="0.01" placeholder="Precio" className="w-full mt-1 p-2 border border-gray-300 rounded text-gray-900" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="flex w-full md:w-fit justify-center rounded-md bg-green-500 hover:bg-green-400 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm"
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </form>
  );
}