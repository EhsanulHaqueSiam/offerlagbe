import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    __BUILD_HASH__: JSON.stringify(Date.now().toString(36)),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/maplibre-gl") || id.includes("node_modules/react-map-gl")) {
            return "maplibre";
          }
        },
      },
    },
  },
});
