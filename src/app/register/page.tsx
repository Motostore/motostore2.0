import { LocationSelectProvider } from "../Context/locationSelectContext";
import RegisterForm from "./form";

export default function Page() {

  return (
    <div className="flex min-h-full flex-col justify-center px-0 md:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-500">Registro De Usuario</h2>
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <LocationSelectProvider>
          <RegisterForm />
        </LocationSelectProvider>
      </div>
    </div>
  );
}