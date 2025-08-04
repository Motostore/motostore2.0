// home-tutorial.tsx
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Tutorial from "./tutorial";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMobileScreenButton,
  faIdCard,
  faPenToSquare,
  faShieldHalved,
  faBullhorn // Nuevo ícono para Marketing Digital
} from '@fortawesome/free-solid-svg-icons';

export default function HomeTutorial() {
  const iconContainerSize = '64px';
  const faIconActualSize = 48;
  const starlinkLogoActualSize = 60;
  const starlinkLogoVerticalAdjust = 0;

  return (
    <div className='p-2 md:p-10'>
      <div className='px-2 lg:px-16 my-4'>
        <h2 className="text-gray-600 uppercase text-center text-lg md:text-2xl font-bold">
          Recargas Telefónicas y Servicios Digitales Internacionales
        </h2>
        <hr className='w-full h-1 bg-gray-400 rounded-full border-none m-auto my-2' />
        <div>
          <p>
            En <strong>Moto Store LLC</strong>, ofrecemos una plataforma donde puedes realizar recargas telefónicas y acceder a servicios digitales de manera rápida, segura y accesible. Nuestro servicio está disponible para varios países, incluyendo Venezuela, Colombia, Ecuador, Perú, Chile y te permite disfrutar de una variedad de soluciones digitales que facilitan tu vida y negocio.

            ¡Únete a nosotros para disfrutar de una experiencia de recarga y servicios digitales sin igual, estés donde estés!
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {/* Starlink */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center text-gray-800"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto', overflow: 'hidden' }}>
            <Image
              src="/starlink-logo.png"
              alt="Starlink Logo"
              width={starlinkLogoActualSize}
              height={starlinkLogoActualSize}
              className="object-contain"
              style={{ position: 'relative', top: `${starlinkLogoVerticalAdjust}px` }}
            />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Starlink</h4>
          <p className="text-center text-gray-600">Accede a internet de alta velocidad y confiabilidad con Starlink, el servicio de internet satelital más avanzado disponible internacionalmente.</p>
        </div>

        {/* Recargas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto' }}>
            <FontAwesomeIcon icon={faMobileScreenButton} className="text-green-500"
              style={{ width: `${faIconActualSize}px`, height: `${faIconActualSize}px` }} />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Recargas</h4>
          <p className="text-center text-gray-600">Recarga saldo para cualquier operador móvil en Venezuela, Colombia, Ecuador, Perú y más. Rápido, seguro y confiable.</p>
        </div>

        {/* Licencia */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto' }}>
            <FontAwesomeIcon icon={faIdCard} className="text-indigo-500"
              style={{ width: `${faIconActualSize}px`, height: `${faIconActualSize}px` }} />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Licencia</h4>
          <p className="text-center text-gray-600">Obtén tus licencias digitales con procesos simples y atención personalizada. Ideal para negocios y emprendedores digitales.</p>
        </div>

        {/* Registro Rápido */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto' }}>
            <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600"
              style={{ width: `${faIconActualSize}px`, height: `${faIconActualSize}px` }} />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Registro Rápido</h4>
          <p className="text-center text-gray-600">Crea tu cuenta en segundos y empieza a gestionar tus recargas y servicios digitales con total comodidad y eficiencia.</p>
        </div>

        {/* Marketing Digital (MODIFICADA) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto' }}>
            <FontAwesomeIcon icon={faBullhorn} className="text-orange-500"
              style={{ width: `${faIconActualSize}px`, height: `${faIconActualSize}px` }} />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Marketing Digital</h4>
          <p className="text-center text-gray-600">Impulsa tu presencia online con nuestras soluciones de marketing digital: estrategias efectivas, automatización, branding y publicidad en redes sociales.</p>
        </div>

        {/* Pago Seguro */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4 flex justify-center items-center"
            style={{ width: iconContainerSize, height: iconContainerSize, margin: '0 auto' }}>
            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500"
              style={{ width: `${faIconActualSize}px`, height: `${faIconActualSize}px` }} />
          </div>
          <h4 className="text-center font-semibold text-xl mb-2">Pago Seguro</h4>
          <p className="text-center text-gray-600">Ofrecemos pagos seguros con tarjeta, transferencias y métodos locales. Tu tranquilidad es nuestra prioridad.</p>
        </div>
      </div>
    </div>
  );
}







