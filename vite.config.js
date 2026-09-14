import { defineConfig } from "vite";

export default defineConfig({
  base: "/Website/",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
