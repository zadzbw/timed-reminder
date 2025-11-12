import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import reactSWC from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const isDev = process.env.NODE_ENV === 'development'

const getChunkName = (id: string, map: Record<string, string[]>) => {
  if (id.includes('/node_modules/')) {
    for (const [name, chunks] of Object.entries(map)) {
      for (const lib of chunks) {
        if (id.includes(`/node_modules/${lib}/`)) {
          return name
        }
      }
    }
  }
}

export default defineConfig({
  define: {
    __DEV__: isDev,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [reactSWC(), tailwindcss()],
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // for async chunks
        manualChunks(id) {
          return getChunkName(id, {
            react: ['react', 'react-dom'],
            jotai: ['jotai'],
            chart: ['echarts', 'zrender'],
          })
        },
      },
    },
  },
})
