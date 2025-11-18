import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Accept hostnames from the network so we can access the dev server from remote hosts
    // Add the domain you want to allow (e.g. play.onara.top)
    host: true,
    allowedHosts: ['play.onara.top', 'mjda.onara.top'],
  },
  preview: {
    port: 3000,
  },
})
