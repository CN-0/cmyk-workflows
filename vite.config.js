import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target:
          "https://fc184d2c-806a-42cd-81a6-57e42d9f6a61-00-313n78z3nrb6e.sisko.replit.dev:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "192.168.1.100",
      "fc184d2c-806a-42cd-81a6-57e42d9f6a61-00-313n78z3nrb6e.sisko.replit.dev",
    ],
  },
});
