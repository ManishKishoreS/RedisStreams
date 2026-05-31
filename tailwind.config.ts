import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0ea5e9",
          dark: "#0369a1",
        },
        status: {
          green: "#16a34a",
          amber: "#d97706",
          red: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
