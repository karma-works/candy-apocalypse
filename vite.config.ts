import { defineConfig } from "vite";
import { env } from "node:process";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: env.CI_PROJECT_NAME ? `/${env.CI_PROJECT_NAME}/` : "",
  plugins: [react()],
});
