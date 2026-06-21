// Dev-only Vite config for running locally with the FastAPI backend.
// Not used in production (Vercel uses vite.config.js). Proxies /api/* to the
// local backend on :8001, stripping the /api prefix so /api/menu -> /menu.
import { defineConfig } from 'vite'

// No @vitejs/plugin-react here on purpose: index.html is self-contained and
// loads React (UMD) + Babel from CDNs, transforming its <script type="text/babel">
// in the browser. The React plugin's refresh preamble assumes a bundled React and
// breaks rendering for this CDN setup, so we serve the page statically and only proxy /api.
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
