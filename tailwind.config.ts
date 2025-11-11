// tailwind.config.ts
import type { Config } from "tailwindcss";

// Helper para usar variables CSS en formato "R G B" con opacidad
const withOpacity =
  (v: string) =>
  ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${v}))` : `rgb(var(${v}) / ${opacityValue})`;

const config: Config = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: { marquee: "marquee 50s linear infinite" },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      colors: {
        lightGray: "#D1D5DB",
        brand: {
          50:  withOpacity("--brand-50"),
          100: withOpacity("--brand-100"),
          200: withOpacity("--brand-200"),
          300: withOpacity("--brand-300"),
          400: withOpacity("--brand-400"),
          500: withOpacity("--brand-500"), // principal
          600: withOpacity("--brand-600"), // hover
          700: withOpacity("--brand-700"),
          800: withOpacity("--brand-800"),
          900: withOpacity("--brand-900"),
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

export default config;





