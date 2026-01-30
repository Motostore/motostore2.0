import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/private/'], // Bloqueamos zonas sensibles
    },
    sitemap: 'https://motostorellc.com/sitemap.xml',
  };
}
