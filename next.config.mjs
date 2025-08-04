/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flowbite.s3.amazonaws.com",
        port: "",
        pathname: "/docs/gallery/masonry/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        hostname: process.env.NEXTAUTH_URL, // Asegúrate de que esta variable esté definida en tu .env
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}`,
        port: "",
        pathname: "/**",
      }
    ],
  },

  // Para manejar CORS y permitir orígenes específicos
  async headers() {
    return [
      {
        source: "/api/:path*", // Aplicando cabeceras a las rutas de la API
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Cambia "*" por los orígenes específicos si es necesario
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },

  // Configuración adicional para desarrollo local
  devIndicators: {
    allowedDevOrigins: ['http://localhost:3000', 'http://192.168.31.208:3000'],  // Cambia esto según tu entorno de desarrollo
  },

  // Configuración adicional (si es necesario)
  reactStrictMode: true, // Puedes activar esta opción si prefieres un comportamiento más estricto
};

export default nextConfig;



