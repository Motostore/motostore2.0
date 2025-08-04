'use client';
import "@/app/ui/globals.css";
import Header from '../ui/header';
import Navigation from '../ui/navigation';
import Footer from '../ui/footer';
import { ProfileProvider } from "../Context/profileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-700 bg-white">
            <Header />
            <div className="w-100 h-100">
                <span className='motostore-advice hidden'>Anuncios aquí</span>
                <hr className='w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto my-2' />
                <Navigation />
            </div>
            {/* Se ha ajustado el padding superior y la alineación vertical */}
            <ProfileProvider>
                <div className="flex grow flex-col gap-4 md:flex-row pt-10">
                    <div className="flex flex-col w-full">
                       {children}
                    </div>
                </div>
            </ProfileProvider>
            <Footer />
        </main>
    );
}
