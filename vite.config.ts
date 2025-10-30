import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
