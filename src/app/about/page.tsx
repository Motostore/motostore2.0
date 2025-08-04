import Image from "next/image";

export default function Page() {
  return (
    <div className="p-4 md:p-10 rounded-lg text-gray-700 bg-white">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 py-8`}>
        
        <div className="order-1 py-4">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-orange-600"></h2>
          <p className="text-lg leading-relaxed text-justify first-letter:text-5xl first-letter:text-orange-500 first-letter:pr-2 first-letter:pl-4">
            En <strong>Moto Store LLC</strong>, somos un equipo comprometido y apasionado por ayudar a nuestros clientes a alcanzar su máximo potencial. Ofrecemos soluciones innovadoras y de alta calidad en plataformas digitales, siempre con dedicación y excelencia. Nuestra misión es satisfacer las necesidades de nuestros clientes con productos y servicios que generen un impacto real, aumentando su rendimiento y expansión.
          </p>
          <p className="mt-4 text-lg text-justify">
            Nos mantenemos a la vanguardia tecnológica, con un equipo altamente capacitado que trabaja en estrecha colaboración con cada cliente para garantizar resultados excepcionales. Estamos aquí para ayudarte a crecer y lograr el éxito en el mundo digital.
          </p>
          <p className="mt-4 text-lg text-justify italic text-gray-500">
            *Nota: El nombre <strong>Moto Store LLC</strong> no proviene de la venta de motos. “Moto” es un apodo personal inspirado en el personaje Moto Moto de la película Madagascar, y fue adoptado con cariño por quienes me conocen. Este nombre representa cercanía, originalidad y una identidad auténtica dentro del entorno digital.*
          </p>
        </div>

        <div className="order-2 text-center">
          <Image
            width={450}
            height={450}
            className="pt-4 mx-auto"
            alt="Ilustración sobre quiénes somos"
            src="/illustrations/about.svg"
          />
        </div>

        {/* Mover imagen de Misión a la izquierda */}
        <div className="order-3 text-left">
          <Image
            width={450}
            height={450}
            className="pt-4 mx-auto"
            alt="Ilustración sobre la misión"
            src="/illustrations/mision.svg"
          />
        </div>

        <div className="order-4 py-4">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-orange-600">Misión</h2>
          <p className="text-lg leading-relaxed text-justify first-letter:text-5xl first-letter:text-orange-500 first-letter:pr-2 first-letter:pl-4">
            En <strong>Moto Store LLC</strong>, nuestra misión es brindar soluciones digitales de alta calidad que resuelvan las necesidades de nuestros clientes de manera eficaz y personalizada. Nos comprometemos a proporcionar productos innovadores y un servicio de excelencia que impulse el crecimiento y el éxito de cada uno de nuestros clientes.
          </p>
          <p className="mt-4 text-lg text-justify">
            Nuestra prioridad es ofrecer un acompañamiento cercano y asesoría profesional, asegurando que cada cliente logre su máximo potencial mediante soluciones que generen un impacto real en su negocio.
          </p>
        </div>

        <div className="order-5 py-4">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-orange-600">Visión</h2>
          <p className="text-lg leading-relaxed text-justify first-letter:text-5xl first-letter:text-orange-500 first-letter:pr-2 first-letter:pl-4">
            Nuestra visión es convertirnos en un referente global en el mercado de soluciones digitales, destacándonos no solo por nuestra innovación, sino también por el compromiso genuino con nuestros clientes. Nos enfocamos en simplificar los procesos de negocio y ofrecer soluciones altamente efectivas que se adapten a las necesidades cambiantes de cada empresa.
          </p>
          <p className="mt-4 text-lg text-justify">
            En <strong>Moto Store LLC</strong>, trabajamos incansablemente para ofrecer soluciones digitales rápidas, eficientes y personalizadas, siempre superando las expectativas de nuestros clientes con un enfoque íntegro y un servicio excepcional.
          </p>
        </div>

        <div className="order-6 text-center">
          <Image
            width={450}
            height={450}
            className="pt-4 mx-auto"
            alt="Ilustración sobre la visión"
            src="/illustrations/vision.svg"
          />
        </div>
      </div>
    </div>
  );
}









































