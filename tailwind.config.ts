import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#EDF0F4", 2: "#F7F9FB" },
        ink: { DEFAULT: "#0F131B", 2: "#3D4756", 3: "#6B7789" },
        rule: "#C8CFD9",
        depth: {
          0: "#C2382B",
          1: "#E8796E",
          2: "#F0A99E",
          3: "#8ECB92",
          4: "#3EA06B",
          5: "#1C6B3C",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
