import "@/app/ui/globals.css";
import Header from '../ui/header';
import Navigation from '../ui/navigation';
import Footer from '../ui/footer';
import { ProfileProvider } from "../Context/profileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-700 bg-white">
            <Header />  {/* Renderiza el Header una sola vez */}
            
            {/* Solo envolver la parte del contenido que necesita el ProfileProvider */}
            <div className="w-100 h-100">
                <span className='motostore-advice hidden'>Anuncios aquí</span>
                <hr className='w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto my-2' />
                <Navigation />
            </div>

            <ProfileProvider>
                <div className="flex grow flex-col gap-4 md:flex-row">
                    <div className="px-4 py-10 md:px-8 lg:px-16 w-full">
                       {children}  {/* Contenido dinámico de cada página */}
                    </div>
                </div>
            </ProfileProvider>

            <Footer />
        </main>
    );
}

