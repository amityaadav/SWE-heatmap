import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        depth: {
          unaware: "#e5e7eb",
          recognize: "#bfdbfe",
          explain: "#93c5fd",
          apply: "#60a5fa",
          debug: "#3b82f6",
          teach: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
