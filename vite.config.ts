import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js (Por Ellos city podium) is a lazy chunk of ~610 kB loaded only on that page.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/@supabase/")) {
            return "supabase";
          }
        },
      },
    },
  },
});
