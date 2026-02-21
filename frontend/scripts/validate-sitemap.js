/**
 * Sitemap Validation Script
 * 
 * Validates sitemap.xml against sitemap protocol standards
 * Ensures compliance with SEO requirements
 * 
 * Requirements: FR-SEO-8, NFR-SEO-4
 * Task: 6.6.7
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Validation result class
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.passed = 0;
    this.failed = 0;
  }

  addError(message) {
    this.errors.push(message);
    this.failed++;
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addInfo(message) {
    this.info.push(message);
  }

  addPass(message) {
    this.passed++;
  }

  isValid() {
    return this.errors.length === 0;
  }

  print() {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}           SITEMAP VALIDATION REPORT${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    // Summary
    console.log(`${colors.blue}📊 Summary:${colors.reset}`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`   ℹ️  Info: ${this.info.length}\n`);

    // Errors
    if (this.errors.length > 0) {
      console.log(`${colors.red}❌ ERRORS (${this.errors.length}):${colors.reset}`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log('');
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}⚠️  WARNINGS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
      console.log('');
    }

    // Info
    if (this.info.length > 0) {
      console.log(`${colors.cyan}ℹ️  INFORMATION:${colors.reset}`);
      this.info.forEach((info, index) => {
        console.log(`   ${index + 1}. ${info}`);
      });
      console.log('');
    }

    // Final result
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    if (this.isValid()) {
      console.log(`${colors.green}✅ VALIDATION PASSED - Sitemap is valid!${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ VALIDATION FAILED - Please fix the errors above${colors.reset}`);
    }
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  }
}

/**
 * Validate XML structure
 */
function validateXMLStructure(content, result) {
  console.log(`${colors.blue}🔍 Validating XML structure...${colors.reset}`);

  // Check XML declaration
  if (content.startsWith('<?xml version="1.0"')) {
    result.addPass('XML declaration present');
  } else {
    result.addError('Missing or invalid XML declaration');
  }

  // Check encoding
  if (content.includes('encoding="UTF-8"')) {
    result.addPass('UTF-8 encoding specified');
  } else {
    result.addWarning('UTF-8 encoding not specified (recommended)');
  }

  // Check urlset element
  if (content.includes('<urlset')) {
    result.addPass('URLset element present');
  } else {
    result.addError('Missing <urlset> element');
  }

  // Check namespace
  if (content.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    result.addPass('Correct sitemap namespace');
  } else {
    result.addError('Missing or incorrect sitemap namespace');
  }

  // Check closing urlset
  if (content.includes('</urlset>')) {
    result.addPass('URLset properly closed');
  } else {
    result.addError('Missing </urlset> closing tag');
  }
}

/**
 * Validate URL entries
 */
function validateURLEntries(content, result) {
  console.log(`${colors.blue}🔍 Validating URL entries...${colors.reset}`);

  // Extract all URL entries
  const urlMatches = content.match(/<url>[\s\S]*?<\/url>/g);
  
  if (!urlMatches || urlMatches.length === 0) {
    result.addError('No URL entries found in sitemap');
    return;
  }

  result.addPass(`Found ${urlMatches.length} URL entries`);
  result.addInfo(`Total URLs in sitemap: ${urlMatches.length}`);

  // Validate each URL entry
  urlMatches.forEach((urlEntry, index) => {
    const urlNum = index + 1;

    // Check for required <loc> element
    if (!urlEntry.includes('<loc>')) {
      result.addError(`URL #${urlNum}: Missing <loc> element`);
    } else {
      // Extract and validate URL
      const locMatch = urlEntry.match(/<loc>(.*?)<\/loc>/);
      if (locMatch) {
        const url = locMatch[1];
        
        // Validate URL format
        try {
          new URL(url);
          result.addPass(`URL #${urlNum}: Valid URL format`);
        } catch (e) {
          result.addError(`URL #${urlNum}: Invalid URL format - ${url}`);
        }

        // Check protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          result.addError(`URL #${urlNum}: URL must start with http:// or https://`);
        }
      }
    }

    // Check for <lastmod> element
    if (urlEntry.includes('<lastmod>')) {
      const lastmodMatch = urlEntry.match(/<lastmod>(.*?)<\/lastmod>/);
      if (lastmodMatch) {
        const lastmod = lastmodMatch[1];
        // Validate date format (YYYY-MM-DD or ISO 8601)
        if (!/^\d{4}-\d{2}-\d{2}/.test(lastmod)) {
          result.addWarning(`URL #${urlNum}: lastmod should be in YYYY-MM-DD format`);
        }
      }
    }

    // Check for <changefreq> element
    if (urlEntry.includes('<changefreq>')) {
      const changefreqMatch = urlEntry.match(/<changefreq>(.*?)<\/changefreq>/);
      if (changefreqMatch) {
        const changefreq = changefreqMatch[1];
        const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        if (!validFreqs.includes(changefreq)) {
          result.addError(`URL #${urlNum}: Invalid changefreq value - ${changefreq}`);
        }
      }
    }

    // Check for <priority> element
    if (urlEntry.includes('<priority>')) {
      const priorityMatch = urlEntry.match(/<priority>(.*?)<\/priority>/);
      if (priorityMatch) {
        const priority = parseFloat(priorityMatch[1]);
        if (isNaN(priority) || priority < 0 || priority > 1) {
          result.addError(`URL #${urlNum}: Priority must be between 0.0 and 1.0`);
        }
      }
    }
  });
}

/**
 * Validate sitemap size and limits
 */
function validateSizeLimits(content, filePath, result) {
  console.log(`${colors.blue}🔍 Validating size limits...${colors.reset}`);

  // Check file size (max 50MB uncompressed)
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

  result.addInfo(`File size: ${fileSizeInBytes} bytes (${fileSizeInMB.toFixed(2)} MB)`);

  if (fileSizeInMB > 50) {
    result.addError('Sitemap exceeds 50MB limit (uncompressed)');
  } else {
    result.addPass('File size within limits');
  }

  // Check URL count (max 50,000 URLs)
  const urlCount = (content.match(/<url>/g) || []).length;
  
  if (urlCount > 50000) {
    result.addError(`Sitemap contains ${urlCount} URLs (max 50,000)`);
  } else {
    result.addPass('URL count within limits');
  }

  // Recommendations
  if (urlCount > 10000) {
    result.addWarning('Consider splitting sitemap into multiple files for better performance');
  }
}

/**
 * Validate required public pages
 */
function validateRequiredPages(content, result) {
  console.log(`${colors.blue}🔍 Validating required public pages...${colors.reset}`);

  const requiredPages = [
    { path: '/', name: 'Homepage' },
    { path: '/job-postings', name: 'Job Postings' },
    { path: '/courses', name: 'Courses' }
  ];

  requiredPages.forEach(page => {
    if (content.includes(`<loc>https://careerak.com${page.path}</loc>`)) {
      result.addPass(`${page.name} page included`);
    } else {
      result.addError(`Missing required page: ${page.name} (${page.path})`);
    }
  });
}

/**
 * Validate SEO best practices
 */
function validateSEOBestPractices(content, result) {
  console.log(`${colors.blue}🔍 Validating SEO best practices...${colors.reset}`);

  // Check for homepage priority
  const homepageMatch = content.match(/<url>[\s\S]*?<loc>https:\/\/careerak\.com\/<\/loc>[\s\S]*?<priority>(.*?)<\/priority>[\s\S]*?<\/url>/);
  if (homepageMatch) {
    const priority = parseFloat(homepageMatch[1]);
    if (priority === 1.0) {
      result.addPass('Homepage has highest priority (1.0)');
    } else {
      result.addWarning(`Homepage priority is ${priority}, should be 1.0`);
    }
  }

  // Check for lastmod dates
  const urlsWithLastmod = (content.match(/<lastmod>/g) || []).length;
  const totalUrls = (content.match(/<url>/g) || []).length;
  
  if (urlsWithLastmod === totalUrls) {
    result.addPass('All URLs have lastmod dates');
  } else {
    result.addWarning(`Only ${urlsWithLastmod}/${totalUrls} URLs have lastmod dates`);
  }

  // Check for changefreq
  const urlsWithChangefreq = (content.match(/<changefreq>/g) || []).length;
  
  if (urlsWithChangefreq === totalUrls) {
    result.addPass('All URLs have changefreq specified');
  } else {
    result.addInfo(`${urlsWithChangefreq}/${totalUrls} URLs have changefreq specified`);
  }

  // Check for priority
  const urlsWithPriority = (content.match(/<priority>/g) || []).length;
  
  if (urlsWithPriority === totalUrls) {
    result.addPass('All URLs have priority specified');
  } else {
    result.addInfo(`${urlsWithPriority}/${totalUrls} URLs have priority specified`);
  }
}

/**
 * Main validation function
 */
function validateSitemap(filePath) {
  const result = new ValidationResult();

  console.log(`${colors.cyan}🚀 Starting sitemap validation...${colors.reset}\n`);
  console.log(`${colors.blue}📄 File: ${filePath}${colors.reset}\n`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    result.addError(`Sitemap file not found: ${filePath}`);
    result.print();
    return result;
  }

  // Read sitemap content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    result.addError(`Failed to read sitemap file: ${error.message}`);
    result.print();
    return result;
  }

  // Run validation checks
  validateXMLStructure(content, result);
  validateURLEntries(content, result);
  validateSizeLimits(content, filePath, result);
  validateRequiredPages(content, result);
  validateSEOBestPractices(content, result);

  // Print results
  result.print();

  // Additional recommendations
  if (result.isValid()) {
    console.log(`${colors.green}📝 Next steps:${colors.reset}`);
    console.log('   1. Submit sitemap to Google Search Console');
    console.log('   2. Submit sitemap to Bing Webmaster Tools');
    console.log('   3. Add sitemap URL to robots.txt');
    console.log('   4. Test with online validators:');
    console.log('      - https://www.xml-sitemaps.com/validate-xml-sitemap.html');
    console.log('      - https://search.google.com/test/rich-results');
    console.log(`   5. Sitemap URL: https://careerak.com/sitemap.xml\n`);
  }

  return result;
}

/**
 * Main execution
 */
function main() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const result = validateSitemap(sitemapPath);

  // Exit with appropriate code
  process.exit(result.isValid() ? 0 : 1);
}

// Run the script
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  validateSitemap,
  ValidationResult
};
