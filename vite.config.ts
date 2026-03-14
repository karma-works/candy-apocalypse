import { defineConfig } from "vite";
import { env } from "node:process";
import react from "@vitejs/plugin-react";

const base = env.CI_PROJECT_NAME
  ? `/${env.CI_PROJECT_NAME}/`
  : env.GITHUB_REPOSITORY
    ? `/${env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "";

export default defineConfig({
  base,
  plugins: [react()],
});
