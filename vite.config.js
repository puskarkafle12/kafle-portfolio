import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'spa-fallback-404',
      closeBundle() {
        copyFileSync(
          resolve('dist/index.html'),
          resolve('dist/404.html'),
        )
      },
    },
  ],
})
