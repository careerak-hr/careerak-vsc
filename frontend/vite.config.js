import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './build/stats.html',
      open: false, // Set to true to auto-open in browser
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: treemap, sunburst, network
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Esbuild options for JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // Build configuration with code splitting
  build: {
    // Output directory
    outDir: 'build',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Chunk size warning limit (200KB)
    chunkSizeWarningLimit: 200,
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunks for vendor separation
        manualChunks: (id) => {
          // React core libraries (must be first to avoid circular dependencies)
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          
          // React Router
          if (id.includes('node_modules/react-router-dom') || 
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')) {
            return 'router-vendor';
          }
          
          // i18n libraries
          if (id.includes('node_modules/i18next') || 
              id.includes('node_modules/react-i18next') ||
              id.includes('node_modules/i18next-browser-languagedetector')) {
            return 'i18n-vendor';
          }
          
          // Capacitor libraries
          if (id.includes('node_modules/@capacitor')) {
            return 'capacitor-vendor';
          }
          
          // Sentry monitoring (error tracking)
          if (id.includes('node_modules/@sentry')) {
            return 'sentry-vendor';
          }
          
          // Animation libraries
          if (id.includes('node_modules/react-confetti')) {
            return 'animation-vendor';
          }
          
          // Image processing libraries
          if (id.includes('node_modules/react-easy-crop') || 
              id.includes('node_modules/react-image-crop')) {
            return 'image-vendor';
          }
          
          // NOTE: zxcvbn is lazy loaded - not included in vendor chunks
          // This reduces initial bundle by 818KB (68%)
          
          // Crypto libraries
          if (id.includes('node_modules/crypto-js')) {
            return 'crypto-vendor';
          }
          
          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          
          // Validation libraries
          if (id.includes('node_modules/ajv') || 
              id.includes('node_modules/mailcheck')) {
            return 'validation-vendor';
          }
          
          // Other node_modules (catch-all for remaining dependencies)
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        
        // Chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inline limit (4KB)
    assetsInlineLimit: 4096,
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      'axios',
      '@sentry/react',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // Treat .js files as JSX
      },
    },
  },

  // Preview server configuration (for production build preview)
  preview: {
    port: 3000,
    open: true,
  },
});
