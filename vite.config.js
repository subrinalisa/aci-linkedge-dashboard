import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA(
      {
        registerType: 'autoUpdate',
        devoptions: {
          enabled: true
        },

        // includeAssets: ['favicon.ico', 'robots.txt'],
        manifest: {
          name: 'PBI Dashboard',
          short_name: 'PBI',
          description: 'A description of PBI',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Increase the limit to 10 MiB
        },
      }
    ),

  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // base: '/pbi-dashboard/'
});
