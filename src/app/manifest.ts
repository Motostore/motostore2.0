import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moto Store LLC',
    short_name: 'MotoStore',
    description: 'Soluciones Digitales 24/7 - Recargas, Streaming y Más',
    start_url: '/dashboard', // Al abrir la app, va directo al dashboard
    display: 'standalone', // Esto quita la barra del navegador (Look de App)
    background_color: '#ffffff',
    theme_color: '#E33127', // Tu color rojo de marca
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}