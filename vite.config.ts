import { defineConfig, loadEnv } from "vite";
import type { ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), ""); // loads VITE_ variables

  return defineConfig({
    plugins: [react(), svgr()],
    base: env.VITE_BASE_URL,
  });
};
