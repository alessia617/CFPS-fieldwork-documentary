import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_GH_PAGES === '1'
    ? '/CFPS-fieldwork-documentary/'
    : '/'

  return {
    base,
    plugins: [
      tailwindcss(),
      react(),
    ],
  }
})
