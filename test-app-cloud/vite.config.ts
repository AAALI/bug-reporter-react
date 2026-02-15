import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { jiraServerPlugin } from './jira-server-plugin'

export default defineConfig({
  plugins: [react(), jiraServerPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5175,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  optimizeDeps: {
    include: ['quick-bug-reporter-react'],
  },
})
