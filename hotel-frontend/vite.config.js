import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: { // <-- 2. Añade esta sección
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
