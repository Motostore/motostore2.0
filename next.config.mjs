/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://motostore-api.onrender.com/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;