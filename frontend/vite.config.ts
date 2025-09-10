import { defineConfig, loadEnv } from "vite";

declare const process: any;
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
/** @type {import('vite').UserConfigExport} */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ({ mode }: { mode: string }) => {
  // load all env vars (including VITE_*) for current mode
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL || "http://localhost:5000";

  return defineConfig({
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          // This will transform your SVG to a React component
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    // Dev server proxy so frontend can call /api/* and get forwarded to backend
    server: {
      proxy: {
        // forward /api requests to backend
        "/api": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
};
