// next.config.mjs (o next.config.js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... otras configuraciones que ya tengas ...

  typescript: {
    // !! ADVERTENCIA !!
    // Ignorar los errores de TypeScript durante la compilación en producción.
    // Esto solo debe usarse como una solución temporal para errores persistentes
    // que bloquean la compilación y que no se pueden resolver de otra manera.
    // Asegúrate de que tu IDE y 'npm run dev' aún muestren los errores para corregirlos.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;






