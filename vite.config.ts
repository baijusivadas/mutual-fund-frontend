import { defineConfig, Plugin, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleMarketApi } from "./src/server/marketServerMiddleware";
import { handleChatApi } from "./src/server/chatServerMiddleware";

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

function chatApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "chat-api-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrl = req.url?.split("?")[0];
        if (cleanUrl === "/api/chat" || cleanUrl === "/api/chat/route") {
          return handleChatApi(req, res, next, env);
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = env.VITE_BACKEND_URL || "http://localhost:3000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), marketApiPlugin(), chatApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    assetsInclude: ["**/*.xlsx", "**/*.xls"],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  };
});
