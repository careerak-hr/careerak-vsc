const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // PurgeCSS for removing unused CSS in production
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './public/index.html',
          './index.html',
        ],
        // Safelist important classes that might be added dynamically
        safelist: {
          standard: [
            // Dark mode classes
            /^dark:/,
            // RTL/LTR classes
            /^rtl:/,
            /^ltr:/,
            // Animation classes
            /^animate-/,
            // Tailwind responsive classes
            /^sm:/,
            /^md:/,
            /^lg:/,
            /^xl:/,
            /^2xl:/,
            // Focus and hover states
            /^hover:/,
            /^focus:/,
            /^active:/,
            /^disabled:/,
            // Framer Motion classes (if used)
            /^motion-/,
            // React classes
            /^react-/,
            // Capacitor classes
            /^capacitor-/,
            // Custom animation classes
            /^slide-/,
            /^fade-/,
            /^expand-/,
            /^modal-/,
            /^shake/,
          ],
          deep: [
            // Preserve classes added by third-party libraries
            /react-easy-crop/,
            /react-image-crop/,
            /react-confetti/,
            /i18next/,
          ],
          greedy: [
            // Preserve classes with dynamic suffixes
            /^bg-/,
            /^text-/,
            /^border-/,
            /^rounded-/,
            /^shadow-/,
            /^p-/,
            /^m-/,
            /^w-/,
            /^h-/,
            /^flex-/,
            /^grid-/,
            /^gap-/,
            /^space-/,
            /^opacity-/,
            /^z-/,
            /^transition-/,
            /^duration-/,
            /^ease-/,
            /^transform/,
            /^scale-/,
            /^rotate-/,
            /^translate-/,
          ],
        },
        // Default extractor for Tailwind CSS
        defaultExtractor: content => {
          // Capture as many selectors as possible
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          
          // Capture classes within other characters like .block(class="w-1/2")
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          
          return broadMatches.concat(innerMatches);
        },
        // Reject specific selectors (be careful with this)
        rejected: false, // Set to true to see what's being removed
        // Print rejected selectors
        printRejected: false, // Set to true for debugging
        // Print all selectors
        printAll: false, // Set to true for debugging
      },
    } : {}),
    // CSS minification for production builds (runs after PurgeCSS)
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifySelectors: true,
          reduceIdents: false, // Keep identifiers for debugging
          zindex: false, // Don't optimize z-index values
        }],
      },
    } : {}),
  }
}
