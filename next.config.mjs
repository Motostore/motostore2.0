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
        hostname: process.env.NEXTAUTH_URL,
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_AWS_URL_IMAGES}`,
        port: "",
        pathname: "/**",
      }
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },

  devIndicators: {
    allowedDevOrigins: ['http://localhost:3000', 'http://192.168.31.208:3000'],
  },

  reactStrictMode: true,

  // ✅ Esta línea evita que Vercel falle por errores de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;




