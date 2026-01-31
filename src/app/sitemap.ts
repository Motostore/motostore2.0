import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://motostorellc.com';

  return [
    {
      url: baseUrl, // Tu portada (La más importante)
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/calculadorapaypal`, // 🔥 ¡ESTA ES CLAVE PARA EL SEO!
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // Alta prioridad porque trae tráfico
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // El dashboard es privado, así que le bajamos prioridad (Google no puede entrar ahí sin clave)
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    }
  ];
}
