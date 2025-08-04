import { CreditCardIcon, CursorArrowRaysIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function Tutorial() {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 p-2 md:py-8 place-items-center">
            <div className="w-full max-w-sm rounded-lg shadow-lg shadow-gray-400">
                <div className="flex flex-col items-center pb-2">
                    <div className='flex items-center justify-center w-28 h-28 bg-blue-700 rounded-full mt-5 mb-3'>
                        <PencilSquareIcon className="w-24 h-24 p-4 text-white" />
                    </div>
                    <div className='p-8 text-gray-500'>
                        <h5 className="mb-1 text-xl font-medium">Registro Rápido</h5>
                        <span className="text-sm">Crea una cuenta en nuestra plataforma y accede a una interfaz fácil de usar para gestionar tus recargas y otros servicios digitales de manera eficiente.</span>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-sm rounded-lg shadow-lg shadow-gray-400">
                <div className="flex flex-col items-center pb-10">
                    <div className='flex items-center justify-center w-28 h-28 bg-green-400 rounded-full mt-5 mb-3'>
                        <CursorArrowRaysIcon className="w-24 h-24 p-4 text-white" />
                    </div>
                    <div className='p-8 text-gray-500'>
                        <h5 className="mb-1 text-xl font-medium">Recarga Fácil</h5>
                        <span className="text-sm">Realiza recargas de saldo para los principales operadores en <strong>Colombia, Venezuela, Ecuador, Perú y Chile</strong> con solo unos clics. Seguro, rápido y accesible.</span>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-sm rounded-lg shadow-lg shadow-gray-400">
                <div className="flex flex-col items-center pb-10">
                    <div className='flex items-center justify-center w-28 h-28 bg-blue-400 rounded-full mt-5 mb-3'>
                        <CreditCardIcon className="w-24 h-24 p-4 text-white" />
                    </div>
                    <div className='p-8 text-gray-500'>
                        <h5 className="mb-1 text-xl font-medium">Pago Seguro</h5>
                        <span className="text-sm">Ofrecemos opciones de pago seguras y convenientes para que puedas recargar sin preocupaciones. Aceptamos tarjetas de crédito, débito y pagos en línea.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

