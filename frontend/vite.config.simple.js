import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Simplified config for debugging build issues
export default defineConfig({
  plugins: [
    react(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$|tests\/.*\.jsx?$/,
  },

  server: {
    port: 3000,
    open: true,
    host: true,
  },

  build: {
    outDir: 'build',
    sourcemap: false, // Disable sourcemaps for faster build
    chunkSizeWarningLimit: 500,
    target: 'es2015',
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    
    minify: 'esbuild', // Faster than terser
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
