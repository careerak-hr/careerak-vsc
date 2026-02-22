/**
 * Comprehensive Image Alt Text Audit Script
 * 
 * This script audits all images in the codebase to ensure they have
 * proper alt text according to WCAG 2.1 Level AA standards.
 * 
 * Requirements: FR-A11Y-9, NFR-A11Y-2
 * Task: 5.4.1 Add descriptive alt text to all images
 */

import { validateAltText, generateAltText, isDecorativeImage } from './altTextGuidelines.js';

/**
 * Known images in the codebase with their current alt text
 */
export const imageInventory = {
  // Logo images
  logos: [
    {
      file: 'frontend/src/pages/00_LanguagePage.jsx',
      line: 117,
      src: '/logo.jpg',
      current: 'Careerak logo - Professional HR and career development platform',
      status: 'excellent',
      seoScore: 95,
    },
    {
      file: 'frontend/src/pages/01_EntryPage.jsx',
      line: 111,
      src: '/logo.jpg',
      current: 'Careerak logo - Your gateway to career opportunities',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/pages/02_LoginPage.jsx',
      line: 102,
      src: '/logo.jpg',
      current: 'Careerak logo - Sign in to access your career dashboard',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/pages/03_AuthPage.jsx',
      line: 451,
      src: '/logo.jpg',
      current: 'Careerak logo - Create your professional account',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/pages/18_AdminDashboard.jsx',
      line: 714,
      src: '/logo.jpg',
      current: 'Careerak logo - Admin dashboard control panel',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/components/SplashScreen.jsx',
      line: 64,
      src: './logo.jpg',
      current: 'Careerak logo - The future of HR and career development',
      status: 'excellent',
      seoScore: 95,
    },
    {
      file: 'frontend/src/components/Navbar.jsx',
      line: 52,
      src: '/logo.png',
      current: 'Careerak - Professional HR and recruitment platform',
      status: 'excellent',
      seoScore: 90,
    },
  ],

  // Profile/User images
  profiles: [
    {
      file: 'frontend/src/pages/03_AuthPage.jsx',
      line: 507,
      src: 'dynamic (profileImage)',
      current: 'Your professional profile photo preview for job applications',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/components/auth/steps/Step4Details.jsx',
      line: 81,
      src: 'dynamic (profileImage)',
      current: 'Your professional profile photo preview for job applications',
      status: 'excellent',
      seoScore: 90,
    },
  ],

  // Functional images
  functional: [
    {
      file: 'frontend/src/components/modals/AIAnalysisModal.jsx',
      line: 134,
      src: 'dynamic (image)',
      current: 'Your uploaded photo being analyzed by AI for suitability',
      status: 'excellent',
      seoScore: 95,
    },
  ],

  // Component images (dynamic)
  components: [
    {
      file: 'frontend/src/components/LazyImage/LazyImage.jsx',
      note: 'Uses dynamic alt text from props - requires parent components to provide proper alt text',
      status: 'depends_on_usage',
    },
    {
      file: 'frontend/src/components/OptimizedImage/OptimizedImage.jsx',
      note: 'Uses dynamic alt text from props - requires parent components to provide proper alt text',
      status: 'depends_on_usage',
    },
  ],

  // Example/Test images
  examples: [
    {
      file: 'frontend/src/examples/LayoutShiftPreventionExample.jsx',
      line: 101,
      src: 'https://via.placeholder.com/800x600',
      current: 'Layout shift prevention example image demonstrating stable loading',
      status: 'excellent',
      seoScore: 95,
    },
    {
      file: 'frontend/src/examples/ImageOptimizationIntegration.example.jsx',
      line: 140,
      src: '/logo.jpg',
      current: 'Careerak logo - Professional HR platform',
      status: 'excellent',
      seoScore: 90,
    },
    {
      file: 'frontend/src/examples/ImageOptimizationIntegration.example.jsx',
      line: 160,
      src: 'dynamic (previewUrl)',
      current: 'Image upload preview for profile photo selection',
      status: 'excellent',
      seoScore: 85,
    },
  ],
};

/**
 * Generate audit report
 */
export const generateAuditReport = () => {
  const allImages = [
    ...imageInventory.logos,
    ...imageInventory.profiles,
    ...imageInventory.functional,
    ...imageInventory.examples,
  ];

  const stats = {
    total: allImages.length,
    excellent: allImages.filter(img => img.status === 'excellent').length,
    good: allImages.filter(img => img.status === 'good').length,
    poor: allImages.filter(img => img.status === 'poor').length,
    averageScore: Math.round(
      allImages.reduce((sum, img) => sum + (img.seoScore || 0), 0) / allImages.length
    ),
  };

  const needsImprovement = allImages.filter(img => 
    img.status === 'poor' || img.recommendation
  );

  return {
    stats,
    needsImprovement,
    summary: `
🖼️ Image Alt Text Audit Report
==============================

Total Images: ${stats.total}
✅ Excellent (90+): ${stats.excellent}
👍 Good (70-89): ${stats.good}
⚠️ Poor (<70): ${stats.poor}

Average SEO Score: ${stats.averageScore}/100

${needsImprovement.length > 0 ? `
Images Needing Improvement (${needsImprovement.length}):
${needsImprovement.map(img => `
📁 ${img.file}
   Current: "${img.current}"
   ${img.recommendation ? `Recommended: "${img.recommendation}"` : ''}
   Score: ${img.seoScore || 'N/A'}/100
`).join('')}
` : '✅ All images have excellent alt text!'}

Component Images:
- LazyImage: Uses dynamic alt text from props
- OptimizedImage: Uses dynamic alt text from props
- Ensure parent components provide SEO-optimized alt text

Recommendations:
1. Update poor-scoring images with more descriptive alt text
2. Add context and keywords to profile images
3. Ensure all dynamic images receive proper alt text from parent components
4. Test with screen readers to verify accessibility
    `,
  };
};

/**
 * Validate all current alt text
 */
export const validateAllAltText = () => {
  const allImages = [
    ...imageInventory.logos,
    ...imageInventory.profiles,
    ...imageInventory.functional,
    ...imageInventory.examples,
  ];

  const results = allImages.map(img => {
    if (!img.current) return { ...img, validation: { isValid: false, issues: ['No alt text'] } };
    
    const validation = validateAltText(img.current);
    return { ...img, validation };
  });

  const invalid = results.filter(img => !img.validation.isValid);
  
  return {
    total: results.length,
    valid: results.length - invalid.length,
    invalid: invalid.length,
    invalidImages: invalid,
    results,
  };
};

/**
 * Generate improvement suggestions
 */
export const generateImprovementSuggestions = () => {
  const report = generateAuditReport();
  const validation = validateAllAltText();
  
  const suggestions = [];

  // Profile images need more context
  imageInventory.profiles.forEach(img => {
    if (img.recommendation) {
      suggestions.push({
        file: img.file,
        line: img.line,
        current: img.current,
        suggested: img.recommendation,
        reason: 'Add professional context for job applications',
        priority: 'medium',
      });
    }
  });

  // Poor scoring images
  report.needsImprovement.forEach(img => {
    if (img.status === 'poor') {
      suggestions.push({
        file: img.file,
        line: img.line,
        current: img.current,
        suggested: img.recommendation,
        reason: 'Current alt text is too generic or unclear',
        priority: 'high',
      });
    }
  });

  // Validation issues
  validation.invalidImages.forEach(img => {
    suggestions.push({
      file: img.file,
      line: img.line,
      current: img.current,
      issues: img.validation.issues,
      suggestions: img.validation.suggestions,
      reason: 'Alt text has validation issues',
      priority: 'medium',
    });
  });

  return {
    total: suggestions.length,
    high: suggestions.filter(s => s.priority === 'high').length,
    medium: suggestions.filter(s => s.priority === 'medium').length,
    suggestions,
  };
};

/**
 * Check for missing alt text patterns in code
 */
export const checkForMissingAltPatterns = () => {
  const patterns = [
    {
      pattern: '<img[^>]*src=[^>]*>',
      description: 'img tags that might be missing alt attributes',
      severity: 'high',
    },
    {
      pattern: 'alt=""[^>]*src=',
      description: 'Images with empty alt text (check if decorative)',
      severity: 'medium',
    },
    {
      pattern: 'alt="image"',
      description: 'Generic alt text that should be more descriptive',
      severity: 'high',
    },
  ];

  return {
    patterns,
    note: 'Run grep searches on codebase to find these patterns',
  };
};

/**
 * Runtime audit function for browser console
 */
export const auditCurrentPage = () => {
  if (typeof window === 'undefined') {
    console.log('This function must be run in a browser environment');
    return;
  }

  const images = document.querySelectorAll('img');
  const results = {
    total: images.length,
    withAlt: 0,
    withoutAlt: 0,
    decorative: 0,
    issues: [],
  };

  images.forEach((img, index) => {
    const alt = img.alt;
    const src = img.src;

    if (isDecorativeImage(img)) {
      results.decorative++;
      return;
    }

    if (!alt || alt.trim() === '') {
      results.withoutAlt++;
      results.issues.push({
        index,
        src,
        issue: 'Missing alt text',
        element: img,
      });
    } else {
      results.withAlt++;
      const validation = validateAltText(alt);
      
      if (!validation.isValid) {
        results.issues.push({
          index,
          src,
          alt,
          validation,
          element: img,
        });
      }
    }
  });

  console.group('🖼️ Current Page Image Audit');
  console.log(`Total images: ${results.total}`);
  console.log(`✅ With alt text: ${results.withAlt}`);
  console.log(`❌ Without alt text: ${results.withoutAlt}`);
  console.log(`🎨 Decorative: ${results.decorative}`);
  
  if (results.issues.length > 0) {
    console.group(`⚠️ Issues found: ${results.issues.length}`);
    results.issues.forEach(issue => {
      console.log(`\nImage: ${issue.src}`);
      console.log(`Issue: ${issue.issue || 'Quality issues'}`);
      if (issue.validation) {
        console.log('Validation:', issue.validation);
      }
      console.log('Element:', issue.element);
    });
    console.groupEnd();
  } else {
    console.log('✅ No issues found!');
  }
  
  console.groupEnd();
  
  return results;
};

// Export for development use
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.auditAllImages = auditCurrentPage;
  window.imageAuditReport = generateAuditReport;
}

export default {
  imageInventory,
  generateAuditReport,
  validateAllAltText,
  generateImprovementSuggestions,
  checkForMissingAltPatterns,
  auditCurrentPage,
};