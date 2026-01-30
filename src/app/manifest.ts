import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moto Store LLC',
    short_name: 'MotoStore',
    description: 'Soluciones Digitales 24/7 - Recargas, Streaming y Más',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E33127',
    icons: [
      {
        src: '/favicon.ico', // <--- CAMBIO AQUÍ (Usamos el icono que ya existe)
        sizes: 'any',        // <--- CAMBIO AQUÍ (Para que acepte cualquier tamaño)
        type: 'image/x-icon',
      },
    ],
  }
}