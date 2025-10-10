import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import writeJsonPlugin from './vite-plugin-write-json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), writeJsonPlugin()],
})
