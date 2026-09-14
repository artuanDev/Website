import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages hosts this repository below `/Website/`; Vercel serves it
  // from the domain root. The GitHub workflow sets VITE_BASE_PATH explicitly.
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
