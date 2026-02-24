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

// Sitemap generation plugin
// Implements: FR-SEO-8, Task 6.4.1, Task 10.2.3
const sitemapPlugin = () => ({
  name: 'sitemap-plugin',
  closeBundle() {
    try {
      console.log('🗺️  Generating sitemap...');
      
      // Import and execute sitemap generation
      const { generateSitemapXML, routes, BASE_URL } = require('./scripts/generate-sitemap.js');
      
      // Generate sitemap XML
      const sitemapXML = generateSitemapXML();
      
      // Write to build directory
      const sitemapPath = path.resolve(__dirname, 'build', 'sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
      
      // Count public routes
      const publicRoutes = routes.filter(r => r.public || process.env.SITEMAP_INCLUDE_PROTECTED === 'true').length;
      
      console.log(`✓ Generated sitemap.xml with ${publicRoutes} URLs`);
      console.log(`  Base URL: ${BASE_URL}`);
      console.log(`  Location: ${sitemapPath}`);
    } catch (error) {
      console.error('✗ Failed to generate sitemap:', error.message);
      // Don't fail the build, just warn
      console.warn('⚠ Build will continue without sitemap');
    }
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
    // Sitemap generation plugin - FR-SEO-8, Task 10.2.3
    sitemapPlugin(),
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
    include: /src\/.*\.jsx?$|tests\/.*\.jsx?$/,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // ============================================================================
  // BUILD CONFIGURATION - CODE SPLITTING OPTIMIZATION
  // ============================================================================
  // Implements:
  // - FR-PERF-2: Load only required code chunks per route
  // - FR-PERF-5: Chunks not exceeding 200KB
  // - NFR-PERF-2: Reduce initial bundle size by 40-60%
  // - Design Section 3.2: Route-based splitting, vendor chunk separation
  // ============================================================================
  build: {
    // Output directory
    outDir: 'build',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Chunk size warning limit (200KB) - FR-PERF-5
    chunkSizeWarningLimit: 200,
    
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
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
      // Optimize tree-shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      
      output: {
        // Manual chunks for vendor separation - OPTIMIZED for TTI < 3.8s
        // Implements FR-PERF-2: Load only required code chunks per route
        // Implements FR-PERF-5: Chunks not exceeding 200KB
        manualChunks: (id) => {
          // CRITICAL: Skip zxcvbn entirely - it should be a dynamic chunk
          // This prevents it from being bundled into any vendor chunk
          if (id.includes('node_modules/zxcvbn')) {
            return; // Return undefined to create a separate async chunk
          }
          
          // React core libraries (CRITICAL - must load first)
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          
          // React Router (CRITICAL - needed for routing)
          if (id.includes('node_modules/react-router-dom') || 
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')) {
            return 'router-vendor';
          }
          
          // i18n libraries (CRITICAL - needed for initial render)
          if (id.includes('node_modules/i18next') || 
              id.includes('node_modules/react-i18next') ||
              id.includes('node_modules/i18next-browser-languagedetector')) {
            return 'i18n-vendor';
          }
          
          // HTTP client (CRITICAL - needed for API calls)
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          
          // === NON-CRITICAL VENDORS (Lazy loaded) ===
          
          // Framer Motion (LAZY - animations not critical for TTI)
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-vendor';
          }
          
          // React Helmet (LAZY - SEO not critical for TTI)
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet-vendor';
          }
          
          // Pusher (LAZY - real-time features not critical for TTI)
          if (id.includes('node_modules/pusher-js')) {
            return 'pusher-vendor';
          }
          
          // Capacitor libraries (LAZY - mobile features not critical for TTI)
          if (id.includes('node_modules/@capacitor')) {
            return 'capacitor-vendor';
          }
          
          // Sentry monitoring (LAZY - error tracking not critical for TTI)
          if (id.includes('node_modules/@sentry')) {
            return 'sentry-vendor';
          }
          
          // Animation libraries (LAZY)
          if (id.includes('node_modules/react-confetti')) {
            return 'confetti-vendor';
          }
          
          // Image processing libraries (LAZY)
          if (id.includes('node_modules/react-easy-crop') || 
              id.includes('node_modules/react-image-crop')) {
            return 'image-vendor';
          }
          
          // Crypto libraries (LAZY)
          if (id.includes('node_modules/crypto-js')) {
            return 'crypto-vendor';
          }
          
          // Validation libraries (LAZY)
          if (id.includes('node_modules/ajv') || 
              id.includes('node_modules/mailcheck')) {
            return 'validation-vendor';
          }
          
          // Workbox (LAZY - service worker not critical for TTI)
          if (id.includes('node_modules/workbox')) {
            return 'workbox-vendor';
          }
          
          // Prop Types (LAZY - only used in development)
          if (id.includes('node_modules/prop-types')) {
            return 'prop-types-vendor';
          }
          
          // Web Vitals (LAZY - monitoring not critical for TTI)
          if (id.includes('node_modules/web-vitals')) {
            return 'web-vitals-vendor';
          }
          
          // Tar (LAZY - compression rarely used)
          if (id.includes('node_modules/tar')) {
            return 'tar-vendor';
          }
          
          // Other node_modules (catch-all for remaining small dependencies)
          // This should now be much smaller after splitting out major libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        
        // Chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          // Special handling for zxcvbn - mark it as async
          if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('zxcvbn')) {
            return `assets/js/lazy-[name]-[hash].js`;
          }
          
          // Route-based chunks get descriptive names for debugging
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        // Asset file naming - organized by type for better caching
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
        
        // Optimize chunk loading with import analysis
        experimentalMinChunkSize: 10000, // 10KB minimum chunk size to reduce HTTP requests
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
    
    // ============================================================================
    // IMAGE OPTIMIZATION CONFIGURATION
    // ============================================================================
    // Implements:
    // - FR-PERF-3: WebP format with JPEG/PNG fallback
    // - FR-PERF-4: Lazy load images with placeholder loading states
    // - Design Section 3.3: Image Optimization
    // - Task 10.2.4: Configure image optimization
    // ============================================================================
    
    // Asset inline limit (4KB)
    // Images smaller than 4KB are inlined as base64 data URLs
    // This reduces HTTP requests for small icons and improves performance
    // Larger images are emitted as separate files with hash for cache busting
    assetsInlineLimit: 4096,
    
    // Image optimization notes:
    // 1. Static images in /public are served as-is (use for already optimized images)
    // 2. Images imported in code are processed by Vite:
    //    - Small images (<4KB) are inlined as base64
    //    - Large images are copied to build/assets/images/ with hash
    // 3. Cloudinary images are optimized at runtime via imageOptimization.js:
    //    - Automatic format selection (WebP with JPEG/PNG fallback)
    //    - Automatic quality optimization (q_auto)
    //    - Lazy loading with Intersection Observer (LazyImage component)
    //    - Blur-up placeholders for better UX
    // 4. Service worker caches images with CacheFirst strategy (50MB limit)
    //
    // Best practices:
    // - Use LazyImage component for all Cloudinary images
    // - Use appropriate presets (PROFILE_MEDIUM, THUMBNAIL_LARGE, etc.)
    // - Provide descriptive alt text for accessibility
    // - Use responsive images with srcset for different screen sizes
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
    include: ['tests/**/*.{test,spec}.{js,jsx}', 'src/**/*.{test,spec}.{js,jsx}'],
  },
});
