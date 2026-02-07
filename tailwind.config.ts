import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'mpro-dark': '#1F2F98',    // Ton bleu foncé
        'mpro-blue': '#1CA7EC',    // Ton bleu vif
        'mpro-cyan': '#4ADEDE',    // Ton cyan
        'mpro-light': '#7BD5F5',   // Bleu clair
        'mpro-bg': '#F4F7FE',      // Fond gris clair
      },
      borderRadius: {
        '2xl': '5px',
      }
    },
  },
  plugins: [],
};
export default config;