import { defineConfig } from 'vite'
import { env } from 'node:process'
import glsl from 'vite-plugin-glsl';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: env.CI_PROJECT_NAME ? `/${env.CI_PROJECT_NAME}/` : '',
  plugins: [
    react(),
    glsl(),
  ],
})
