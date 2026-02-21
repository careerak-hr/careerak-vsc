/**
 * SEO Alt Text Optimizer
 * 
 * Optimizes image alt text for both accessibility and SEO purposes.
 * Implements requirements FR-SEO-11 and FR-A11Y-9.
 * 
 * SEO Best Practices:
 * - Include relevant keywords naturally
 * - Be descriptive and specific
 * - Keep it concise (125 characters or less)
 * - Avoid keyword stuffing
 * - Include context about the page/content
 * - Use natural language
 * 
 * Requirements:
 * - FR-SEO-11: Include descriptive alt text for SEO purposes
 * - FR-A11Y-9: Include descriptive alt text for all meaningful images
 * - NFR-SEO-1: Achieve Lighthouse SEO score of 95+
 */

/**
 * SEO-optimized alt text templates for different image types
 */
export const SEOAltTextTemplates = {
  // Logo images - brand + context + keywords
  logo: {
    homepage: 'Careerak logo - Professional HR recruitment and career development platform',
    login: 'Careerak logo - Sign in to access your career dashboard and job opportunities',
    signup: 'Careerak logo - Create your professional account for job search and recruitment',
    admin: 'Careerak logo - Admin dashboard for HR management and recruitment control',
    entry: 'Careerak logo - Your gateway to career opportunities and professional growth',
    splash: 'Careerak logo - The future of HR technology and career development',
    navbar: 'Careerak - Professional HR recruitment platform connecting talent with opportunities',
  },

  // Profile images - person/company + role + context
  profile: {
    user: (name) => `${name} professional profile photo on Careerak recruitment platform`,
    company: (name) => `${name} company logo - Employer profile on Careerak job board`,
    preview: 'Your professional profile photo preview for job applications',
    avatar: (name) => `${name} user avatar on Careerak career platform`,
  },

  // Job-related images
  job: {
    posting: (title, company) => `${title} job opportunity at ${company} - Apply on Careerak`,
    thumbnail: (title) => `${title} position thumbnail - View job details and requirements`,
    company: (company) => `${company} employer logo - Browse open positions and career opportunities`,
  },

  // Course images
  course: {
    thumbnail: (title) => `${title} online course - Professional training and skill development`,
    certificate: (title) => `${title} course completion certificate - Professional credential`,
    instructor: (name) => `${name} course instructor - Expert trainer on Careerak Academy`,
  },

  // Functional images
  functional: {
    upload: 'Upload your professional photo for AI-powered profile analysis',
    analysis: 'Your photo being analyzed by AI for professional suitability and quality',
    document: 'Document preview for job application submission',
    resume: 'Resume/CV document preview - Professional experience and qualifications',
  },

  // Decorative images (empty alt text)
  decorative: '',
};

/**
 * Generate SEO-optimized alt text
 * 
 * @param {Object} options - Options for generating alt text
 * @param {string} options.type - Image type (logo, profile, job, course, functional)
 * @param {string} options.context - Specific context (homepage, login, etc.)
 * @param {string} options.name - Name of person, company, or item
 * @param {string} options.title - Title for jobs/courses
 * @param {string} options.company - Company name for jobs
 * @param {string[]} options.keywords - Additional SEO keywords to include
 * @param {number} options.maxLength - Maximum length (default: 125)
 * @returns {string} SEO-optimized alt text
 */
export const generateSEOAltText = (options) => {
  const {
    type,
    context,
    name,
    title,
    company,
    keywords = [],
    maxLength = 125,
  } = options;

  let altText = '';

  // Generate base alt text from templates
  switch (type) {
    case 'logo':
      altText = SEOAltTextTemplates.logo[context] || SEOAltTextTemplates.logo.homepage;
      break;

    case 'profile':
      if (context === 'user' && name) {
        altText = SEOAltTextTemplates.profile.user(name);
      } else if (context === 'company' && name) {
        altText = SEOAltTextTemplates.profile.company(name);
      } else if (context === 'preview') {
        altText = SEOAltTextTemplates.profile.preview;
      } else if (context === 'avatar' && name) {
        altText = SEOAltTextTemplates.profile.avatar(name);
      } else {
        altText = name ? `${name} profile photo` : 'User profile photo';
      }
      break;

    case 'job':
      if (context === 'posting' && title && company) {
        altText = SEOAltTextTemplates.job.posting(title, company);
      } else if (context === 'thumbnail' && title) {
        altText = SEOAltTextTemplates.job.thumbnail(title);
      } else if (context === 'company' && company) {
        altText = SEOAltTextTemplates.job.company(company);
      } else {
        altText = title ? `${title} job opportunity` : 'Job posting';
      }
      break;

    case 'course':
      if (context === 'thumbnail' && title) {
        altText = SEOAltTextTemplates.course.thumbnail(title);
      } else if (context === 'certificate' && title) {
        altText = SEOAltTextTemplates.course.certificate(title);
      } else if (context === 'instructor' && name) {
        altText = SEOAltTextTemplates.course.instructor(name);
      } else {
        altText = title ? `${title} course` : 'Training course';
      }
      break;

    case 'functional':
      altText = SEOAltTextTemplates.functional[context] || 'Functional image';
      break;

    case 'decorative':
      return SEOAltTextTemplates.decorative;

    default:
      altText = name || title || 'Image';
  }

  // Add additional keywords naturally if provided
  if (keywords.length > 0 && altText.length < maxLength - 20) {
    const keywordPhrase = keywords.slice(0, 2).join(' and ');
    if (!altText.toLowerCase().includes(keywordPhrase.toLowerCase())) {
      altText += ` - ${keywordPhrase}`;
    }
  }

  // Truncate if too long
  if (altText.length > maxLength) {
    altText = altText.substring(0, maxLength - 3) + '...';
  }

  return altText;
};

/**
 * Validate alt text for SEO
 * 
 * @param {string} altText - The alt text to validate
 * @returns {Object} Validation result with SEO score and suggestions
 */
export const validateSEOAltText = (altText) => {
  const issues = [];
  const suggestions = [];
  let seoScore = 100;

  // Check if empty (decorative images are OK)
  if (!altText || altText.trim() === '') {
    return {
      isValid: true,
      isDecorative: true,
      seoScore: 0,
      message: 'Empty alt text - ensure this is a decorative image',
    };
  }

  // Check length
  if (altText.length < 10) {
    issues.push('Alt text is too short for SEO');
    suggestions.push('Add more descriptive context (aim for 50-125 characters)');
    seoScore -= 20;
  } else if (altText.length > 125) {
    issues.push('Alt text is too long (over 125 characters)');
    suggestions.push('Shorten to 125 characters or less');
    seoScore -= 15;
  }

  // Check for redundant phrases (bad for SEO)
  const redundantPhrases = ['image of', 'picture of', 'photo of', 'graphic of'];
  const lowerAlt = altText.toLowerCase();
  
  redundantPhrases.forEach(phrase => {
    if (lowerAlt.includes(phrase)) {
      issues.push(`Contains redundant phrase: "${phrase}"`);
      suggestions.push(`Remove "${phrase}" - it doesn't add SEO value`);
      seoScore -= 10;
    }
  });

  // Check for keyword stuffing
  const words = altText.toLowerCase().split(/\s+/);
  const wordFrequency = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  Object.entries(wordFrequency).forEach(([word, count]) => {
    if (count > 2) {
      issues.push(`Keyword "${word}" appears ${count} times - possible keyword stuffing`);
      suggestions.push('Use natural language and avoid repeating keywords');
      seoScore -= 15;
    }
  });

  // Check for SEO keywords (positive indicators)
  const seoKeywords = [
    'professional', 'career', 'job', 'recruitment', 'hr', 'training',
    'course', 'opportunity', 'platform', 'development', 'skill',
  ];

  const hasKeywords = seoKeywords.some(keyword => lowerAlt.includes(keyword));
  if (!hasKeywords && altText.length > 20) {
    suggestions.push('Consider adding relevant keywords naturally (e.g., "professional", "career", "job")');
    seoScore -= 10;
  }

  // Check for specificity
  const genericTerms = ['logo', 'image', 'photo', 'picture'];
  if (genericTerms.includes(lowerAlt.trim())) {
    issues.push('Alt text is too generic for SEO');
    suggestions.push('Add specific details about what the image shows');
    seoScore -= 25;
  }

  // Check for context
  const hasContext = altText.includes('-') || altText.includes(':') || altText.split(' ').length > 5;
  if (!hasContext && altText.length > 10) {
    suggestions.push('Add context to improve SEO (e.g., "on Careerak platform")');
    seoScore -= 5;
  }

  return {
    isValid: issues.length === 0,
    seoScore: Math.max(0, seoScore),
    issues,
    suggestions,
    length: altText.length,
    hasKeywords,
  };
};

/**
 * Optimize existing alt text for SEO
 * 
 * @param {string} currentAlt - Current alt text
 * @param {Object} context - Context information
 * @returns {string} Optimized alt text
 */
export const optimizeAltTextForSEO = (currentAlt, context = {}) => {
  if (!currentAlt || currentAlt.trim() === '') {
    return currentAlt; // Keep empty for decorative images
  }

  let optimized = currentAlt;

  // Remove redundant phrases
  const redundantPhrases = ['image of', 'picture of', 'photo of', 'graphic of'];
  redundantPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    optimized = optimized.replace(regex, '').trim();
  });

  // Add context if missing and available
  if (context.platform && !optimized.toLowerCase().includes('careerak')) {
    optimized += ' on Careerak platform';
  }

  // Add keywords if missing
  if (context.keywords && context.keywords.length > 0) {
    const missingKeywords = context.keywords.filter(
      keyword => !optimized.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (missingKeywords.length > 0 && optimized.length < 100) {
      optimized += ` - ${missingKeywords[0]}`;
    }
  }

  // Ensure proper length
  if (optimized.length > 125) {
    optimized = optimized.substring(0, 122) + '...';
  }

  return optimized;
};

/**
 * Audit all images for SEO alt text
 * 
 * @returns {Object} Audit results with SEO scores
 */
export const auditImagesForSEO = () => {
  const images = document.querySelectorAll('img');
  const results = {
    total: images.length,
    optimized: 0,
    needsImprovement: 0,
    poor: 0,
    decorative: 0,
    averageSEOScore: 0,
    details: [],
  };

  let totalScore = 0;
  let scoredImages = 0;

  images.forEach((img, index) => {
    const alt = img.alt;
    const src = img.src;

    // Skip decorative images
    if (alt === '' && img.getAttribute('aria-hidden') === 'true') {
      results.decorative++;
      return;
    }

    const validation = validateSEOAltText(alt);
    
    if (!validation.isDecorative) {
      totalScore += validation.seoScore;
      scoredImages++;

      if (validation.seoScore >= 80) {
        results.optimized++;
      } else if (validation.seoScore >= 50) {
        results.needsImprovement++;
      } else {
        results.poor++;
      }

      results.details.push({
        index,
        src,
        alt,
        seoScore: validation.seoScore,
        validation,
        element: img,
      });
    } else {
      results.decorative++;
    }
  });

  results.averageSEOScore = scoredImages > 0 ? Math.round(totalScore / scoredImages) : 0;

  return results;
};

/**
 * Log SEO audit results to console
 */
export const logSEOAuditResults = () => {
  const results = auditImagesForSEO();
  
  console.group('🔍 SEO Alt Text Audit');
  console.log(`Total images: ${results.total}`);
  console.log(`✅ SEO Optimized (80+): ${results.optimized}`);
  console.log(`⚠️ Needs Improvement (50-79): ${results.needsImprovement}`);
  console.log(`❌ Poor SEO (<50): ${results.poor}`);
  console.log(`🎨 Decorative: ${results.decorative}`);
  console.log(`📊 Average SEO Score: ${results.averageSEOScore}/100`);
  
  if (results.details.length > 0) {
    console.group(`📋 Detailed Results`);
    results.details.forEach(detail => {
      const emoji = detail.seoScore >= 80 ? '✅' : detail.seoScore >= 50 ? '⚠️' : '❌';
      console.log(`\n${emoji} SEO Score: ${detail.seoScore}/100`);
      console.log(`Image: ${detail.src}`);
      console.log(`Alt: "${detail.alt}"`);
      
      if (detail.validation.issues.length > 0) {
        console.log('Issues:', detail.validation.issues);
      }
      if (detail.validation.suggestions.length > 0) {
        console.log('Suggestions:', detail.validation.suggestions);
      }
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return results;
};

// Export for use in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.auditImagesForSEO = logSEOAuditResults;
}

export default {
  SEOAltTextTemplates,
  generateSEOAltText,
  validateSEOAltText,
  optimizeAltTextForSEO,
  auditImagesForSEO,
  logSEOAuditResults,
};
