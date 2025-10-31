import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to suppress WebSocket errors
const suppressWebSocketErrors = () => ({
  name: 'suppress-ws-errors',
  configureServer(server: any) {
    server.ws.on('error', (err: any) => {
      // Suppress WebSocket compression errors from browser extensions
      if (err.code === 'WS_ERR_UNEXPECTED_RSV_1') {
        console.warn('⚠️ WebSocket compression error (browser extension interference) - ignoring');
        return;
      }
      console.error('WebSocket error:', err);
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
    // Re-enable HMR but handle errors gracefully
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8080,
      overlay: false, // Disable error overlay
    },
    watch: {
      usePolling: false,
    }
  },
  plugins: [react(), mode === "development" && componentTagger(), suppressWebSocketErrors()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunks configuration for better code splitting
        manualChunks(id) {
          // Vendor packages
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // All other node_modules in a common vendor chunk
            return 'vendor';
          }
          
          // UI components in separate chunk
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
          
          // Pages in separate chunks
          if (id.includes('src/pages')) {
            return 'pages';
          }
        },
      },
    },
  },
}));
