import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js is a lazy-loaded decorative chunk (LogoScene); its size is expected.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          motion: ["motion"],
          router: ["react-router"],
        },
      },
    },
  },
});
