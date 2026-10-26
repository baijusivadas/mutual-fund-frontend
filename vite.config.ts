import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleMarketApi } from "./src/server/marketServerMiddleware";

function marketApiPlugin(): Plugin {
  return {
    name: "market-api-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api/market/")) {
          return handleMarketApi(req, res, next);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), marketApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.xlsx", "**/*.xls"],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});

