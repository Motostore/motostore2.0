// src/app/calculadora-comisiones-paypal/layout.tsx

// ¡¡¡IMPORTANTE!!! ELIMINA CUALQUIER LÍNEA QUE IMPORTE 'globals.css' AQUÍ.
// NO DEBE HABER NINGUNA DE ESTAS LÍNEAS EN ESTE ARCHIVO:
// import './globals.css';
// import '@/globals.css';
// import '../globals.css';


import Header from '../ui/header'; // Ruta corregida
import Navigation from '../ui/navigation'; // Ruta corregida
import Footer from '../ui/footer'; // Ruta corregida

export default function Layout({ children }: { children: React.ReactNode;}) {
    return (
        <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-700 bg-white">
            <Header></Header>
            <div className=" w-100 h-100 ">
                <span className='motostore-advice hidden'>Anuncios aquí</span>
                <hr className='w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto mt-2' />
                <Navigation></Navigation>
            </div>
            <div  className="flex grow flex-col gap-4 md:flex-row">
                <div className="flex flex-col justify-center gap-6 px-4 md:px-20 w-full">
                   {children}
                </div>
            </div>
            <Footer></Footer>
        </main>
    )
}