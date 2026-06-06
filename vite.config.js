// Konfiguracja Vite. Tu ustawiam tylko jak frontend ma się budowac i skad brac assety.
// Jak cos sie sypie przy buildzie, to ten plik jest jednym z pierwszych miejsc do sprawdzenia.
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  appType: "spa",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
