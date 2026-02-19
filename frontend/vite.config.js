import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';
import { injectManifest } from 'workbox-build';

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// Custom plugin to generate version.json for cache busting
const versionPlugin = () => ({
  name: 'version-plugin',
  closeBundle() {
    const versionInfo = {
      version: packageJson.version,
      buildTimestamp: Date.now(),
      buildDate: new Date().toISOString(),
      nodeVersion: process.version,
    };
    
    const versionPath = path.resolve(__dirname, 'build', 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    console.log(`✓ Generated version.json: v${versionInfo.version}`);
  },
});

// Workbox plugin for service worker generation
const workboxPlugin = () => ({
  name: 'workbox-plugin',
  async closeBundle() {
    try {
      const { count, size, warnings } = await injectManifest({
        swSrc: path.resolve(__dirname, 'public', 'service-worker.js'),
        swDest: path.resolve(__dirname, 'build', 'service-worker.js'),
        globDirectory: path.resolve(__dirname, 'build'),
        globPatterns: [
          '**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff,woff2,ttf,eot}',
        ],
        // Exclude large files and source maps
        globIgnores: [
          '**/node_modules/**/*',
          '**/stats.html',
          '**/*.map',
          '**/version.json',
        ],
        // Maximum file size to precache (2MB)
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
      });

      console.log(`✓ Generated service worker with ${count} files (${(size / 1024 / 1024).toFixed(2)} MB)`);
      
      if (warnings.length > 0) {
        console.warn('⚠ Workbox warnings:', warnings);
      }
    } catch (error) {
      console.error('✗ Failed to generate service worker:', error);
      throw error;
    }
  },
});

// Custom plugin to add preload tags for critical resources
const preloadPlugin = () => ({
  name: 'preload-plugin',
  transformIndexHtml(html) {
    // Vite automatically handles modulepreload for entry chunks
    // This plugin ensures critical vendor chunks are also preloaded
    return {
      html,
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'modulepreload',
            // React vendor chunk is critical for initial render
            href: '/assets/js/react-vendor-[hash].js',
            crossorigin: true,
          },
          injectTo: 'head-prepend',
        },
      ],
    };
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Preload plugin for critical resources
    preloadPlugin(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './build/stats.html',
      open: false, // Set to true to auto-open in browser
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: treemap, sunburst, network
    }),
    // Version plugin for cache busting
    versionPlugin(),
    // Workbox plugin for service worker
    workboxPlugin(),
  ],
  
  // Define environment variables for cache busting
  define: {
    'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(Date.now()),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString()),
  },
  
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
    
    // Module preload configuration for critical resources
    modulePreload: {
      // Preload all direct imports
      polyfill: true,
      // Custom resolver for preloading critical chunks
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Always preload react-vendor chunk as it's critical
        return deps.filter(dep => {
          return dep.includes('react-vendor') || 
                 dep.includes('router-vendor') ||
                 !dep.includes('vendor'); // Preload non-vendor chunks (app code)
        });
      },
    },
    
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
    
    // Minification options - Enhanced for production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console and debugger statements
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize conditionals
        conditionals: true,
        // Evaluate constant expressions
        evaluate: true,
        // Optimize boolean expressions
        booleans: true,
        // Optimize loops
        loops: true,
        // Remove unused variables
        unused: true,
        // Hoist function declarations
        hoist_funs: true,
        // Hoist variable declarations
        hoist_vars: false,
        // Optimize if-return and if-continue
        if_return: true,
        // Join consecutive var statements
        join_vars: true,
        // Optimize sequences
        sequences: true,
        // Remove unreachable code
        side_effects: true,
        // Optimize property access
        properties: true,
        // Reduce variables
        reduce_vars: true,
        // Collapse single-use variables
        collapse_vars: true,
        // Inline functions
        inline: 2,
        // Pass multiple times for better optimization
        passes: 2,
      },
      mangle: {
        // Mangle variable names for smaller size
        toplevel: true,
        // Keep class names for debugging
        keep_classnames: false,
        // Keep function names for debugging
        keep_fnames: false,
        // Safari 10 bug workaround
        safari10: true,
      },
      format: {
        // Remove comments
        comments: false,
        // Use ASCII only
        ascii_only: true,
        // Preserve annotations
        preserve_annotations: false,
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

  // Test configuration for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
