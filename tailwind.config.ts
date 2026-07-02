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
        // 브랜드: 페어웨이 그린 + 골드 (신뢰감 있는 프리미엄 톤)
        fairway: {
          50: "#f0f7f2",
          100: "#dcecdf",
          200: "#bcd9c3",
          300: "#8fbe9c",
          400: "#5c9c70",
          500: "#3a7f52",
          600: "#2a6540",
          700: "#225034",
          800: "#1d402c",
          900: "#183526",
          950: "#0c1e15",
        },
        gold: {
          50: "#fbf8ef",
          100: "#f5edd4",
          200: "#ebd9a7",
          300: "#dfbf72",
          400: "#d4a94e",
          500: "#c8964a",
          600: "#b07a38",
          700: "#925e30",
          800: "#784b2e",
          900: "#653f29",
        },
        cream: "#faf8f3",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(24,53,38,0.04), 0 4px 12px rgba(24,53,38,0.04)",
        "card-hover":
          "0 2px 4px rgba(24,53,38,0.06), 0 8px 20px rgba(24,53,38,0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
