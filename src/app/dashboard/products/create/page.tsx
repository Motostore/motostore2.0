import Form from '../form';

interface CreateProductPageProps {
  searchParams?: {
    productType?: string;
  };
}

export default function CreateProductPage({ searchParams }: CreateProductPageProps) {
  const productType = searchParams?.productType || 'streaming'; // Valor por defecto

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Producto</h1>
      <Form productPath={productType} />
    </div>
  );
}