import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Tus rutas de contenido
    "./node_modules/flowbite-react/lib/**/*.js",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 50s linear infinite", // La animación personalizada
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      colors: {
        // Personaliza tu paleta de colores si es necesario
        lightGray: "#D1D5DB", // Ejemplo de un gris claro
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

export default config;




