import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://motostorellc.com'; // Tu dominio real

  return [
    {
      url: baseUrl, // La página de inicio (Home)
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`, // La página de Login
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Si tuvieras una página de registro pública, iría aquí
  ];
}