import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',     // Regla para todos los robots (Google, Bing, etc)
      allow: '/',         // Permitir ver la web pública
      disallow: ['/dashboard/', '/api/'], // ⛔ PROHIBIDO entrar al panel privado y a la API
    },
    sitemap: 'https://motostorellc.com/sitemap.xml', // Le damos el mapa
  };
}