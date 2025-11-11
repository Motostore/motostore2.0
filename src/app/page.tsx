// src/app/page.tsx
'use client';

// NO importes globals.css aquí (ya lo hace layout.tsx)

// estilos del slideshow (si los usas)
import './ui/slideshow.css';
import 'react-slideshow-image/dist/styles.css';

import Head from 'next/head';
import Header from './ui/header';
import Navigation from './ui/navigation';
import Footer from './ui/footer';
import HomeTutorial from './ui/common/home-tutorial';
import GalleryHome from './components/GalleryHome';

import { Fade } from 'react-slideshow-image';
import { useEffect, useState } from 'react';
import { fetchGuestProducts } from './lib/guest.service';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetchGuestProducts();
        setItems(result);
      } catch (err) {
        console.error('fetchGuestProducts error:', err);
      }
    })();
  }, []);

  const images = [
    '/assets/banner/Mesadetrabajo1@72x-01.png',
    '/assets/banner/Mesadetrabajo1@72x-02.png',
    '/assets/banner/Mesadetrabajo1@72x-03.png',
    '/assets/banner/Mesadetrabajo1@72x-05.png',
    '/assets/banner/Mesadetrabajo1@72x-04.png',
    '/assets/banner/Mesadetrabajo1@72x-06.png',
    '/assets/banner/Mesadetrabajo1@72x-07.png',
  ];

  return (
    <>
      {/* Metadata por página (client-side) */}
      <Head>
        <title>Moto Store LLC | Soluciones Digitales 24/7</title>
        <meta name="description" content="Plataforma Moto Store LLC" />
      </Head>

      <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-500 bg-white">
        {/* Cabecera y navegación */}
        <Header />
        <div className="w-100 h-100 mt-2">
          <span className="motostore-advice inline-block hidden">Anuncios aquí</span>
          <hr className="w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto mb-2" />
          <Navigation />
        </div>

        {/* Slider */}
        <div className="shadow-md">
          <Fade duration={5000}>
            {images.map((each, index) => (
              <div className="each-slide" key={index}>
                <div>
                  <img alt="Banner image" src={each} />
                </div>
              </div>
            ))}
          </Fade>
        </div>

        {/* Galería */}
        <div className="py-2 px-0 md:py-6 md:px-10 max-w-max m-auto">
          <GalleryHome
            buttonText=""
            items={items}
            className="md:grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4"
          />
        </div>

        <HomeTutorial />
        <Footer />
      </main>
    </>
  );
}







