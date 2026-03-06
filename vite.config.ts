import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'assets/*'],
        manifest: {
          name: "SmartList AI - Assistente de Compras",
          short_name: "SmartList",
          description: "Gerencie suas compras com eficiência e inteligência. Listas inteligentes, controle financeiro e recomendações personalizadas.",
          theme_color: "#102216",
          background_color: "#102216",
          display: "standalone",
          icons: [
            {
              src: "/favicon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable"
            },
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
