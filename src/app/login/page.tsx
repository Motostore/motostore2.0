import Form from "./form";

export default function Page() {
  return (
    <div className="flex flex-col flex- justify-center px-0 md:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-500">Iniciar Sesión</h2>
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form />
      </div>
    </div>
  );
}