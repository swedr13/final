import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo under /final/. `npm run build:preview` targets
// /final/preview/ so each change can be checked live before production.
const base = process.env.PREVIEW ? "/final/preview/" : "/final/";

export default defineConfig({
  base,
  // Baked in at build time so pre-rendered HTML and the hydrating client always agree.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  plugins: [react()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{js,jsx}"],
  },
});
