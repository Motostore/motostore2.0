'use client';
import "@/app/ui/globals.css";
import "@/app/ui/slideshow.css";
import 'react-slideshow-image/dist/styles.css';
import Navigation from './ui/navigation';
import Header from './ui/header';
import Footer from './ui/footer';
import HomeTutorial from './ui/common/home-tutorial';
import GalleryHome from "./components/GalleryHome";
import { Fade, Slide } from 'react-slideshow-image';
import { ProfileProvider } from './Context/profileContext';
import { useEffect, useState } from "react";
import { fetchGuestProducts } from "./lib/guest.service";

export default function Home() {

  const [items, setItems] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const result = await fetchGuestProducts();
    setItems(result);
  }

  const images = [
    "/assets/banner/Mesadetrabajo1@72x-01.png",
    "/assets/banner/Mesadetrabajo1@72x-02.png",
    "/assets/banner/Mesadetrabajo1@72x-03.png",
    "/assets/banner/Mesadetrabajo1@72x-05.png",
    "/assets/banner/Mesadetrabajo1@72x-04.png", // Agregado banner 04
    "/assets/banner/Mesadetrabajo1@72x-06.png"  // Agregado banner 06
  ];

  const buttonStyle = {
    width: "30px",
    background: 'none',
    border: '0px',
    marginLeft: '10px',
    marginRight: '10px',
  };

  const properties = {
    arrows: false,
    prevArrow: <button style={{ ...buttonStyle }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff"><path d="M242 180.6v-138L0 256l242 213.4V331.2h270V180.6z"/></svg></button>,
    nextArrow: <button style={{ ...buttonStyle }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#fff"><path d="M512 256L270 42.6v138.2H0v150.6h270v138z"/></svg></button>,
    duration: 5000,
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden text-gray-500 bg-white">
      <ProfileProvider>
        <div className='text-gray-500 bg-white'>
          <Header /> {/* Ya renderiza la fecha */}
          <div className=" w-100 h-100 mt-2">
            <span className='motostore-advice inline-block hidden'>Anuncios aquí</span>
            <hr className='w-11/12 h-1 bg-gray-400 rounded-full border-none m-auto mb-2' />
            <Navigation />
          </div>
        </div>
      </ProfileProvider>
      <div className='shadow-md'>
        <Fade
          duration={5000}
          onChange={function noRefCheck(){}}
          onStartChange={function noRefCheck(){}}
        >
          {
          images.map((each, index) => (
          <div className="each-slide" key={index}>
            <div>
              <img
                alt="Banner image"
                src={each}
              />
            </div>
          </div>
          ))
          }
        </Fade>
      </div>
      <div className='py-2 px-0 md:py-6 md:px-10 max-w-max m-auto'>
        <GalleryHome buttonText={''} items={items} className={"md:grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4"} />
      </div>

      <HomeTutorial />
      <Footer />
    </main>
  )
}

