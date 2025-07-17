

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // hoặc '@vitejs/plugin-react-swc' nếu muốn
import svgr from '@svgr/rollup'
import path, { resolve } from 'path'
import fs from 'fs/promises'

export default defineConfig({
  plugins: [
    svgr(),         // Để hỗ trợ import SVG như React component
    react(),        // Nếu muốn dùng SWC: đổi thành @vitejs/plugin-react-swc
  ],

   define: {
    global: {}, // Fix lỗi 'global is not defined' do dùng @stomp/stompjs
  },

   server: {
    proxy: {
      '/ws': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        ws: true, 
      },
    }
  },

  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad(
              { filter: /src\\.*\.js$/ },
              async (args) => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8'),
              })
            )
          },
        },
      ],
    },
  },
  base: '/TrackMentalHealth', // giữ lại nếu deploy lên GitHub Pages hoặc sub-path
})
