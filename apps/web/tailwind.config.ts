import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        navy: "#081120",
        gold: "#FFD700",
        red: "#C1121F",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        glow: {
          from: {
            boxShadow: "0 0 20px rgba(255,215,0,0.2)",
          },
          to: {
            boxShadow: "0 0 50px rgba(255,215,0,0.5)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
