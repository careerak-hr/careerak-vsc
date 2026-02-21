/**
 * Alt Text Guidelines and Utilities
 * 
 * This file provides guidelines and utilities for writing descriptive alt text
 * for images to meet WCAG 2.1 Level AA accessibility standards.
 * 
 * Requirements: FR-A11Y-9, NFR-A11Y-2
 * Design: Section 6.4 Screen Reader Support
 * Property: A11Y-5 - All meaningful images have alt text
 * 
 * WCAG 2.1 Guidelines:
 * - All meaningful images must have descriptive alt text
 * - Decorative images should have empty alt text (alt="")
 * - Alt text should describe the content and function of the image
 * - Alt text should be concise but descriptive (typically 125 characters or less)
 * - Avoid phrases like "image of" or "picture of"
 * - Include relevant context for the user
 */

/**
 * Alt Text Categories and Examples
 */
export const AltTextCategories = {
  // Logo images - describe the brand and context
  LOGO: {
    examples: [
      'Careerak logo - Professional HR and recruitment platform',
      'Careerak logo - Sign in to access your career dashboard',
      'Careerak logo - Create your professional account',
      'Careerak logo - Admin dashboard control panel',
    ],
    guidelines: [
      'Include brand name',
      'Add context about the page or action',
      'Keep it concise but informative',
    ],
  },

  // Profile/Avatar images - describe the person or entity
  PROFILE: {
    examples: [
      'John Doe profile photo',
      'Your profile photo preview',
      'Company logo for Acme Corporation',
      'User avatar',
    ],
    guidelines: [
      'Include person\'s name if known',
      'Indicate if it\'s a preview or final image',
      'For company profiles, mention it\'s a company logo',
    ],
  },

  // Functional images - describe the action or purpose
  FUNCTIONAL: {
    examples: [
      'Your uploaded photo being analyzed by AI for suitability',
      'Document preview for job application',
      'Certificate image showing completion of course',
    ],
    guidelines: [
      'Describe what the image shows',
      'Include the purpose or context',
      'Mention any actions being performed',
    ],
  },

  // Decorative images - use empty alt text
  DECORATIVE: {
    examples: [
      '', // Empty alt text for purely decorative images
    ],
    guidelines: [
      'Use alt="" for images that are purely decorative',
      'Use aria-hidden="true" for decorative images',
      'Don\'t describe decorative elements',
    ],
  },

  // Informational images - describe the information conveyed
  INFORMATIONAL: {
    examples: [
      'Bar chart showing job application statistics for 2024',
      'Pie chart of user demographics by country',
      'Timeline showing company milestones',
    ],
    guidelines: [
      'Describe the type of visualization',
      'Include key data points if simple',
      'For complex charts, provide a summary',
    ],
  },

  // Product/Item images - describe the item
  PRODUCT: {
    examples: [
      'Course thumbnail for Web Development Bootcamp',
      'Job posting image for Senior Developer position',
      'Training material cover for Leadership Skills',
    ],
    guidelines: [
      'Include the item name or title',
      'Mention the type of item',
      'Add relevant details',
    ],
  },
};

/**
 * Validate alt text quality
 * @param {string} altText - The alt text to validate
 * @returns {Object} Validation result with isValid and suggestions
 */
export const validateAltText = (altText) => {
  const issues = [];
  const suggestions = [];

  // Check if alt text is empty (might be intentional for decorative images)
  if (!altText || altText.trim() === '') {
    return {
      isValid: true,
      isDecorative: true,
      message: 'Empty alt text - ensure this is a decorative image',
    };
  }

  // Check length (recommended max 125 characters)
  if (altText.length > 125) {
    issues.push('Alt text is too long (over 125 characters)');
    suggestions.push('Consider making it more concise');
  }

  // Check for redundant phrases
  const redundantPhrases = [
    'image of',
    'picture of',
    'photo of',
    'graphic of',
    'icon of',
  ];
  
  const lowerAlt = altText.toLowerCase();
  redundantPhrases.forEach(phrase => {
    if (lowerAlt.includes(phrase)) {
      issues.push(`Contains redundant phrase: "${phrase}"`);
      suggestions.push(`Remove "${phrase}" - screen readers already announce it's an image`);
    }
  });

  // Check if it's too generic
  const genericTerms = ['logo', 'image', 'photo', 'picture'];
  if (genericTerms.includes(lowerAlt.trim())) {
    issues.push('Alt text is too generic');
    suggestions.push('Add more context about what the image shows or its purpose');
  }

  // Check if it ends with punctuation (recommended)
  if (altText.length > 20 && !altText.match(/[.!?]$/)) {
    suggestions.push('Consider ending with punctuation for better screen reader pauses');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    length: altText.length,
  };
};

/**
 * Generate alt text for common image types
 * @param {Object} options - Options for generating alt text
 * @returns {string} Generated alt text
 */
export const generateAltText = (options) => {
  const {
    type, // 'logo', 'profile', 'functional', 'informational', 'product'
    name, // Name of person, company, or item
    context, // Additional context
    action, // Action being performed
  } = options;

  switch (type) {
    case 'logo':
      return `${name || 'Company'} logo${context ? ` - ${context}` : ''}`;
    
    case 'profile':
      return `${name || 'User'} profile photo${context ? ` - ${context}` : ''}`;
    
    case 'functional':
      return `${name || 'Image'}${action ? ` ${action}` : ''}${context ? ` - ${context}` : ''}`;
    
    case 'informational':
      return `${name || 'Chart'}${context ? ` showing ${context}` : ''}`;
    
    case 'product':
      return `${name || 'Item'}${context ? ` for ${context}` : ''}`;
    
    default:
      return name || 'Image';
  }
};

/**
 * Check if an image is decorative
 * @param {HTMLImageElement} img - The image element
 * @returns {boolean} True if the image is decorative
 */
export const isDecorativeImage = (img) => {
  // Check if explicitly marked as decorative
  if (img.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  // Check if alt text is empty (intentionally decorative)
  if (img.alt === '') {
    return true;
  }

  // Check if image is in a decorative context
  const decorativeClasses = ['decoration', 'ornament', 'divider', 'spacer'];
  const classList = Array.from(img.classList);
  
  return decorativeClasses.some(cls => 
    classList.some(imgClass => imgClass.toLowerCase().includes(cls))
  );
};

/**
 * Audit all images on the page for alt text
 * @returns {Object} Audit results
 */
export const auditPageImages = () => {
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

  return results;
};

/**
 * Log audit results to console
 */
export const logAuditResults = () => {
  const results = auditPageImages();
  
  console.group('🖼️ Image Alt Text Audit');
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

// Export for use in development
if (process.env.NODE_ENV === 'development') {
  window.auditImageAltText = logAuditResults;
}

export default {
  AltTextCategories,
  validateAltText,
  generateAltText,
  isDecorativeImage,
  auditPageImages,
  logAuditResults,
};
