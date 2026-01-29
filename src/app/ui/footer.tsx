'use client';

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear(); // Dinámico para 2026

  const socialLinks = {
    whatsapp: "https://wa.me/13522248881",
    instagram: "https://www.instagram.com/motostorellc",
    tiktok: "https://www.tiktok.com/@motostorellc2",
    facebook: "https://www.facebook.com/motostorellc",
    x: "https://x.com/motostorellc",
    telegram: "https://t.me/motostorellc",
    youtube: "https://www.youtube.com/@motostorellc",
    linkedin: "https://www.linkedin.com/company/motostorellc"
  };

  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-8 font-sans">
      <div className="container mx-auto px-6 lg:px-16">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
          
          {/* 1. LADO IZQUIERDO: Branding */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="relative h-14 w-14 flex-shrink-0">
               <Image 
                 src="/motostore-logo.png" 
                 alt="Moto Store Logo" 
                 width={56} 
                 height={56} 
                 className="object-contain" 
                 priority
               />
            </div>
            
            <div className="text-center sm:text-left">
              <h5 className="text-xl font-bold text-slate-900 whitespace-nowrap">
                Moto Store LLC <span className="font-normal text-gray-500 hidden sm:inline">| Soluciones Digitales 24/7</span>
              </h5>
              <p className="font-normal text-gray-500 block sm:hidden text-sm">Soluciones Digitales 24/7</p>
            </div>
          </div>

          {/* 2. LADO DERECHO: Redes Sociales */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Síguenos
            </h4>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-5">
              {/* WhatsApp */}
              <SocialIcon href={socialLinks.whatsapp} title="WhatsApp" hoverColor="hover:text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </SocialIcon>
              {/* Instagram */}
              <SocialIcon href={socialLinks.instagram} title="Instagram" hoverColor="hover:text-[#E1306C]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </SocialIcon>
              {/* Otros iconos seguirían el mismo patrón... */}
            </div>
          </div>
        </div>

        {/* 3. COPYRIGHT */}
        <div className="border-t border-gray-100 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-400 font-medium">
            © {currentYear} Todos los derechos reservados por{" "}
            <Link href="/" className="font-bold text-slate-900 hover:text-[#E33127] transition-colors">
              Moto Store LLC
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Subcomponente para limpiar el código principal
function SocialIcon({ href, children, title, hoverColor }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`group transition-all duration-300 hover:-translate-y-1`} 
      title={title}
    >
      <svg 
        className={`w-6 h-6 text-slate-300 transition-colors duration-300 ${hoverColor}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </a>
  );
}







































