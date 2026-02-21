/**
 * Heading Hierarchy Audit Utility
 * 
 * This utility helps audit and verify proper heading hierarchy (h1, h2, h3)
 * across all pages according to WCAG 2.1 Level AA and SEO best practices.
 * 
 * Requirements:
 * - FR-SEO-12: Use proper heading hierarchy (h1, h2, h3)
 * - NFR-SEO-1: Achieve Lighthouse SEO score of 95+
 * - NFR-A11Y-1: Achieve Lighthouse Accessibility score of 95+
 * 
 * Best Practices:
 * 1. Each page should have exactly ONE h1 (page title)
 * 2. Headings should not skip levels (h1 → h2 → h3, not h1 → h3)
 * 3. Headings should be descriptive and meaningful
 * 4. Use semantic HTML for better accessibility
 */

/**
 * Validates heading hierarchy in a DOM element
 * @param {HTMLElement} element - The element to check
 * @returns {Object} Validation result with issues array
 */
export const validateHeadingHierarchy = (element = document.body) => {
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const issues = [];
  let previousLevel = 0;
  let h1Count = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent.trim();

    // Check for h1 count
    if (level === 1) {
      h1Count++;
      if (h1Count > 1) {
        issues.push({
          type: 'multiple-h1',
          message: `Multiple h1 tags found (${h1Count}). Each page should have exactly one h1.`,
          element: heading,
          text
        });
      }
    }

    // Check for skipped levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        type: 'skipped-level',
        message: `Heading level skipped from h${previousLevel} to h${level}. Headings should not skip levels.`,
        element: heading,
        text
      });
    }

    // Check for empty headings
    if (!text) {
      issues.push({
        type: 'empty-heading',
        message: `Empty h${level} tag found. Headings should have descriptive text.`,
        element: heading
      });
    }

    previousLevel = level;
  });

  // Check if h1 exists
  if (h1Count === 0) {
    issues.push({
      type: 'missing-h1',
      message: 'No h1 tag found. Each page should have exactly one h1 as the main page title.'
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    headingCount: headings.length,
    h1Count
  };
};

/**
 * Gets heading structure for a page
 * @param {HTMLElement} element - The element to analyze
 * @returns {Array} Array of heading objects with level and text
 */
export const getHeadingStructure = (element = document.body) => {
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return Array.from(headings).map(heading => ({
    level: parseInt(heading.tagName.substring(1)),
    tag: heading.tagName.toLowerCase(),
    text: heading.textContent.trim(),
    id: heading.id || null
  }));
};

/**
 * Generates a heading hierarchy report
 * @returns {Object} Report with validation results and structure
 */
export const generateHeadingReport = () => {
  const validation = validateHeadingHierarchy();
  const structure = getHeadingStructure();

  return {
    ...validation,
    structure,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
};

/**
 * Logs heading hierarchy to console (for development)
 */
export const logHeadingHierarchy = () => {
  const report = generateHeadingReport();
  
  console.group('📋 Heading Hierarchy Report');
  console.log('Valid:', report.valid ? '✅' : '❌');
  console.log('Total Headings:', report.headingCount);
  console.log('H1 Count:', report.h1Count);
  
  if (report.issues.length > 0) {
    console.group('⚠️ Issues Found:');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
      if (issue.text) console.log(`   Text: "${issue.text}"`);
    });
    console.groupEnd();
  }
  
  console.group('📊 Structure:');
  report.structure.forEach(heading => {
    const indent = '  '.repeat(heading.level - 1);
    console.log(`${indent}${heading.tag}: ${heading.text}`);
  });
  console.groupEnd();
  
  console.groupEnd();
  
  return report;
};

/**
 * Recommended heading structure templates for common page types
 */
export const headingTemplates = {
  // Profile/Dashboard pages
  profile: {
    h1: 'Page Title (e.g., "My Profile", "Dashboard")',
    sections: [
      { h2: 'Personal Information' },
      { h2: 'Account Settings' },
      { h2: 'Activity History' }
    ]
  },
  
  // Listing pages (Jobs, Courses)
  listing: {
    h1: 'Page Title (e.g., "Job Postings", "Courses")',
    sections: [
      { h2: 'Filters' },
      { h2: 'Results', subsections: [
        { h3: 'Individual Item Title (in each card)' }
      ]}
    ]
  },
  
  // Form pages (Post Job, Apply)
  form: {
    h1: 'Page Title (e.g., "Post a Job", "Apply for Position")',
    sections: [
      { h2: 'Basic Information' },
      { h2: 'Details' },
      { h2: 'Additional Information' }
    ]
  },
  
  // Settings page
  settings: {
    h1: 'Settings',
    sections: [
      { h2: 'Language Settings' },
      { h2: 'Theme Settings' },
      { h2: 'Notification Settings' },
      { h2: 'Account Settings' }
    ]
  },
  
  // Admin Dashboard
  admin: {
    h1: 'Admin Dashboard',
    sections: [
      { h2: 'Overview' },
      { h2: 'User Management', subsections: [
        { h3: 'Active Users' },
        { h3: 'Pending Approvals' }
      ]},
      { h2: 'Content Management' },
      { h2: 'System Settings' }
    ]
  }
};

export default {
  validateHeadingHierarchy,
  getHeadingStructure,
  generateHeadingReport,
  logHeadingHierarchy,
  headingTemplates
};
