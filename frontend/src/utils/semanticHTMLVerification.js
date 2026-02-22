/**
 * Semantic HTML Verification Utility
 * 
 * This utility helps verify and document semantic HTML usage across the platform.
 * It provides guidelines and checks for proper semantic HTML implementation.
 * 
 * Requirements: FR-A11Y-6, NFR-A11Y-2
 */

/**
 * Semantic HTML Elements Guide
 * 
 * WCAG 2.1 Level AA requires proper use of semantic HTML elements
 */
export const SEMANTIC_ELEMENTS = {
  // Document Structure
  header: {
    purpose: 'Introductory content or navigational aids',
    usage: 'Page header, section header',
    ariaRole: 'banner (when direct child of body)',
    examples: ['Site header with logo and navigation', 'Article header with title and metadata']
  },
  
  nav: {
    purpose: 'Navigation links',
    usage: 'Main navigation, breadcrumbs, pagination',
    ariaRole: 'navigation',
    examples: ['Main site navigation', 'Footer navigation', 'Breadcrumb navigation']
  },
  
  main: {
    purpose: 'Main content of the document',
    usage: 'Primary content area (only one per page)',
    ariaRole: 'main',
    examples: ['Main content area containing articles, sections']
  },
  
  article: {
    purpose: 'Self-contained composition',
    usage: 'Blog post, news article, job posting, course card',
    ariaRole: 'article',
    examples: ['Job posting card', 'Course card', 'Blog post', 'Comment']
  },
  
  section: {
    purpose: 'Thematic grouping of content',
    usage: 'Chapters, tabs, themed content groups',
    ariaRole: 'region (when labeled)',
    examples: ['User information section', 'Profile actions section', 'Job listings section']
  },
  
  aside: {
    purpose: 'Content tangentially related to main content',
    usage: 'Sidebars, pull quotes, related links',
    ariaRole: 'complementary',
    examples: ['Sidebar with related jobs', 'Author bio', 'Related courses']
  },
  
  footer: {
    purpose: 'Footer for nearest sectioning content',
    usage: 'Page footer, article footer',
    ariaRole: 'contentinfo (when direct child of body)',
    examples: ['Site footer with links and copyright', 'Article footer with metadata']
  },
  
  // Content Sectioning
  h1: {
    purpose: 'Top-level heading',
    usage: 'Page title (only one per page)',
    ariaRole: 'heading level 1',
    examples: ['Job Postings', 'Profile Page', 'Settings']
  },
  
  h2: {
    purpose: 'Section heading',
    usage: 'Major sections within the page',
    ariaRole: 'heading level 2',
    examples: ['Available Positions', 'User Information', 'Profile Actions']
  },
  
  h3: {
    purpose: 'Subsection heading',
    usage: 'Subsections within h2 sections',
    ariaRole: 'heading level 3',
    examples: ['Job title in job card', 'Course title in course card']
  },
  
  // Text Content
  p: {
    purpose: 'Paragraph of text',
    usage: 'Body text, descriptions',
    ariaRole: 'none',
    examples: ['Job description', 'User bio', 'Course description']
  },
  
  ul: {
    purpose: 'Unordered list',
    usage: 'Lists where order doesn\'t matter',
    ariaRole: 'list',
    examples: ['Feature list', 'Navigation menu', 'Tag list']
  },
  
  ol: {
    purpose: 'Ordered list',
    usage: 'Lists where order matters',
    ariaRole: 'list',
    examples: ['Steps in a process', 'Rankings', 'Instructions']
  },
  
  // Forms
  form: {
    purpose: 'Interactive form',
    usage: 'User input collection',
    ariaRole: 'form (when labeled)',
    examples: ['Login form', 'Job application form', 'Profile edit form']
  },
  
  label: {
    purpose: 'Label for form control',
    usage: 'Associated with input, select, textarea',
    ariaRole: 'none',
    examples: ['Email label', 'Password label', 'Name label']
  },
  
  button: {
    purpose: 'Clickable button',
    usage: 'Actions, form submission',
    ariaRole: 'button',
    examples: ['Submit button', 'Cancel button', 'Apply button']
  },
  
  // Interactive
  a: {
    purpose: 'Hyperlink',
    usage: 'Navigation to other pages or sections',
    ariaRole: 'link',
    examples: ['Internal links', 'External links', 'Anchor links']
  }
};

/**
 * Semantic HTML Best Practices
 */
export const BEST_PRACTICES = {
  headingHierarchy: {
    rule: 'Use proper heading hierarchy (h1 → h2 → h3)',
    rationale: 'Screen readers use headings for navigation',
    examples: {
      correct: '<h1>Page Title</h1> → <h2>Section</h2> → <h3>Subsection</h3>',
      incorrect: '<h1>Page Title</h1> → <h3>Section</h3> (skipped h2)'
    }
  },
  
  oneMainPerPage: {
    rule: 'Only one <main> element per page',
    rationale: 'Identifies primary content for assistive technologies',
    examples: {
      correct: '<main id="main-content">...</main>',
      incorrect: 'Multiple <main> elements'
    }
  },
  
  labeledSections: {
    rule: 'Label sections with aria-labelledby or aria-label',
    rationale: 'Helps screen reader users understand section purpose',
    examples: {
      correct: '<section aria-labelledby="user-info"><h2 id="user-info">User Info</h2></section>',
      incorrect: '<section><h2>User Info</h2></section>'
    }
  },
  
  buttonNotDiv: {
    rule: 'Use <button> for buttons, not <div>',
    rationale: 'Buttons have built-in keyboard and screen reader support',
    examples: {
      correct: '<button onClick={handleClick}>Click me</button>',
      incorrect: '<div onClick={handleClick}>Click me</div>'
    }
  },
  
  semanticOverDiv: {
    rule: 'Use semantic elements instead of <div> when possible',
    rationale: 'Provides meaning and structure for assistive technologies',
    examples: {
      correct: '<article><header><h2>Title</h2></header><p>Content</p></article>',
      incorrect: '<div><div><h2>Title</h2></div><p>Content</p></div>'
    }
  }
};

/**
 * Verify semantic HTML structure in a component
 * 
 * @param {Object} structure - Component structure to verify
 * @returns {Object} Verification results
 */
export function verifySemanticStructure(structure) {
  const issues = [];
  const recommendations = [];
  
  // Check for main element
  if (!structure.hasMain) {
    issues.push({
      severity: 'error',
      element: 'main',
      message: 'Missing <main> element. Every page should have exactly one <main> element.',
      fix: 'Add <main id="main-content" tabIndex="-1"> wrapper around primary content'
    });
  }
  
  // Check for heading hierarchy
  if (structure.headings) {
    const headingLevels = structure.headings.map(h => parseInt(h.level));
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        issues.push({
          severity: 'warning',
          element: `h${headingLevels[i]}`,
          message: `Heading hierarchy skipped from h${headingLevels[i - 1]} to h${headingLevels[i]}`,
          fix: `Use h${headingLevels[i - 1] + 1} instead of h${headingLevels[i]}`
        });
      }
    }
  }
  
  // Check for labeled sections
  if (structure.sections) {
    structure.sections.forEach(section => {
      if (!section.hasLabel) {
        recommendations.push({
          severity: 'info',
          element: 'section',
          message: 'Section should have aria-labelledby or aria-label',
          fix: 'Add aria-labelledby pointing to heading id, or aria-label with descriptive text'
        });
      }
    });
  }
  
  // Check for semantic elements usage
  if (structure.divCount > structure.semanticCount * 2) {
    recommendations.push({
      severity: 'info',
      element: 'div',
      message: 'High ratio of <div> to semantic elements',
      fix: 'Consider replacing some <div> elements with semantic alternatives (article, section, aside, etc.)'
    });
  }
  
  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    recommendations,
    score: calculateSemanticScore(structure)
  };
}

/**
 * Calculate semantic HTML score (0-100)
 * 
 * @param {Object} structure - Component structure
 * @returns {number} Score from 0 to 100
 */
function calculateSemanticScore(structure) {
  let score = 0;
  
  // Main element (20 points)
  if (structure.hasMain) score += 20;
  
  // Proper heading hierarchy (20 points)
  if (structure.hasProperHeadingHierarchy) score += 20;
  
  // Labeled sections (20 points)
  if (structure.labeledSectionsRatio > 0.8) score += 20;
  else if (structure.labeledSectionsRatio > 0.5) score += 10;
  
  // Semantic vs div ratio (20 points)
  const semanticRatio = structure.semanticCount / (structure.semanticCount + structure.divCount);
  if (semanticRatio > 0.6) score += 20;
  else if (semanticRatio > 0.4) score += 10;
  
  // Button vs div for interactive elements (20 points)
  if (structure.buttonVsDivRatio > 0.8) score += 20;
  else if (structure.buttonVsDivRatio > 0.5) score += 10;
  
  return Math.min(100, score);
}

/**
 * Get semantic HTML recommendations for a component type
 * 
 * @param {string} componentType - Type of component (page, card, form, etc.)
 * @returns {Array} Recommendations
 */
export function getSemanticRecommendations(componentType) {
  const recommendations = {
    page: [
      'Wrap main content in <main id="main-content" tabIndex="-1">',
      'Use <header> for page header with logo and navigation',
      'Use <footer> for page footer with links and copyright',
      'Use <nav> for navigation menus',
      'Use proper heading hierarchy (h1 for page title, h2 for sections)',
      'Label sections with aria-labelledby or aria-label'
    ],
    
    card: [
      'Use <article> for self-contained cards (job, course, etc.)',
      'Use <h3> for card title',
      'Use <p> for card description',
      'Use <button> for card actions',
      'Add aria-label to card for screen readers'
    ],
    
    form: [
      'Use <form> element for forms',
      'Use <label> associated with each input',
      'Use <fieldset> and <legend> for grouped inputs',
      'Use <button type="submit"> for form submission',
      'Add aria-describedby for error messages'
    ],
    
    list: [
      'Use <ul> for unordered lists',
      'Use <ol> for ordered lists',
      'Use <li> for list items',
      'Consider <article> for complex list items',
      'Add aria-label to list for context'
    ],
    
    navigation: [
      'Use <nav> element',
      'Add aria-label to describe navigation purpose',
      'Use <ul> and <li> for navigation items',
      'Use <a> for links, <button> for actions',
      'Add aria-current="page" to current page link'
    ]
  };
  
  return recommendations[componentType] || recommendations.page;
}

/**
 * Semantic HTML checklist for developers
 */
export const SEMANTIC_CHECKLIST = {
  structure: [
    '✓ Page has exactly one <main> element',
    '✓ Page has <header> for site/page header',
    '✓ Page has <footer> for site/page footer',
    '✓ Navigation uses <nav> element',
    '✓ Skip link points to main content'
  ],
  
  headings: [
    '✓ Page has exactly one <h1>',
    '✓ Heading hierarchy is logical (no skipped levels)',
    '✓ Headings describe content accurately',
    '✓ Sections have headings'
  ],
  
  content: [
    '✓ Self-contained content uses <article>',
    '✓ Thematic groups use <section>',
    '✓ Sections are labeled with aria-labelledby or aria-label',
    '✓ Related content uses <aside>',
    '✓ Paragraphs use <p>'
  ],
  
  interactive: [
    '✓ Buttons use <button> element',
    '✓ Links use <a> element',
    '✓ Forms use <form> element',
    '✓ Form controls have associated <label>',
    '✓ Interactive elements have proper ARIA attributes'
  ],
  
  lists: [
    '✓ Unordered lists use <ul> and <li>',
    '✓ Ordered lists use <ol> and <li>',
    '✓ Definition lists use <dl>, <dt>, <dd>',
    '✓ Navigation menus use list structure'
  ]
};

/**
 * Export verification report
 * 
 * @param {Object} results - Verification results
 * @returns {string} Formatted report
 */
export function generateSemanticReport(results) {
  let report = '# Semantic HTML Verification Report\n\n';
  
  report += `## Overall Score: ${results.score}/100\n\n`;
  
  if (results.issues.length > 0) {
    report += '## Issues\n\n';
    results.issues.forEach(issue => {
      report += `### ${issue.severity.toUpperCase()}: ${issue.element}\n`;
      report += `- **Message**: ${issue.message}\n`;
      report += `- **Fix**: ${issue.fix}\n\n`;
    });
  }
  
  if (results.recommendations.length > 0) {
    report += '## Recommendations\n\n';
    results.recommendations.forEach(rec => {
      report += `### ${rec.severity.toUpperCase()}: ${rec.element}\n`;
      report += `- **Message**: ${rec.message}\n`;
      report += `- **Fix**: ${rec.fix}\n\n`;
    });
  }
  
  if (results.passed && results.recommendations.length === 0) {
    report += '## ✅ All Checks Passed!\n\n';
    report += 'This component follows semantic HTML best practices.\n';
  }
  
  return report;
}

export default {
  SEMANTIC_ELEMENTS,
  BEST_PRACTICES,
  SEMANTIC_CHECKLIST,
  verifySemanticStructure,
  getSemanticRecommendations,
  generateSemanticReport
};
