/**
 * Open Graph Tags Validation Script
 * 
 * This script validates Open Graph tags in the built HTML files.
 * Run after building the project to ensure all OG tags are present.
 * 
 * Usage:
 *   node scripts/validate-og-tags.js
 * 
 * Requirements:
 *   - Project must be built (npm run build)
 *   - dist/ folder must exist
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Required Open Graph tags
const requiredOGTags = [
  'og:title',
  'og:description',
  'og:type',
  'og:url',
  'og:image',
  'og:site_name',
  'og:locale',
];

// Required Twitter Card tags
const requiredTwitterTags = [
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
];

/**
 * Extract meta tags from HTML content
 */
function extractMetaTags(html) {
  const metaTags = {};
  
  // Extract Open Graph tags
  const ogRegex = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
  let match;
  while ((match = ogRegex.exec(html)) !== null) {
    metaTags[`og:${match[1]}`] = match[2];
  }
  
  // Extract Twitter Card tags
  const twitterRegex = /<meta\s+name=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
  while ((match = twitterRegex.exec(html)) !== null) {
    metaTags[`twitter:${match[1]}`] = match[2];
  }
  
  return metaTags;
}

/**
 * Validate a single HTML file
 */
function validateFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const metaTags = extractMetaTags(html);
  
  const results = {
    file: path.basename(filePath),
    passed: true,
    errors: [],
    warnings: [],
    tags: metaTags,
  };
  
  // Check required OG tags
  requiredOGTags.forEach(tag => {
    if (!metaTags[tag]) {
      results.errors.push(`Missing required tag: ${tag}`);
      results.passed = false;
    }
  });
  
  // Check required Twitter tags
  requiredTwitterTags.forEach(tag => {
    if (!metaTags[tag]) {
      results.errors.push(`Missing required tag: ${tag}`);
      results.passed = false;
    }
  });
  
  // Validate title length (50-60 characters)
  if (metaTags['og:title']) {
    const titleLength = metaTags['og:title'].length;
    if (titleLength < 50 || titleLength > 60) {
      results.warnings.push(
        `Title length is ${titleLength} characters (recommended: 50-60)`
      );
    }
  }
  
  // Validate description length (150-160 characters)
  if (metaTags['og:description']) {
    const descLength = metaTags['og:description'].length;
    if (descLength < 150 || descLength > 160) {
      results.warnings.push(
        `Description length is ${descLength} characters (recommended: 150-160)`
      );
    }
  }
  
  // Validate image URL is absolute
  if (metaTags['og:image'] && !metaTags['og:image'].startsWith('http')) {
    results.errors.push('Image URL must be absolute (start with http:// or https://)');
    results.passed = false;
  }
  
  // Validate URL is absolute
  if (metaTags['og:url'] && !metaTags['og:url'].startsWith('http')) {
    results.errors.push('URL must be absolute (start with http:// or https://)');
    results.passed = false;
  }
  
  return results;
}

/**
 * Print validation results
 */
function printResults(results) {
  console.log(`\n${colors.cyan}=== Open Graph Validation Results ===${colors.reset}\n`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  
  results.forEach(result => {
    const status = result.passed
      ? `${colors.green}✓ PASS${colors.reset}`
      : `${colors.red}✗ FAIL${colors.reset}`;
    
    console.log(`${status} ${result.file}`);
    
    if (result.errors.length > 0) {
      totalFailed++;
      result.errors.forEach(error => {
        console.log(`  ${colors.red}✗${colors.reset} ${error}`);
      });
    } else {
      totalPassed++;
    }
    
    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      result.warnings.forEach(warning => {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
      });
    }
    
    // Print found tags
    if (Object.keys(result.tags).length > 0) {
      console.log(`  ${colors.blue}Found tags:${colors.reset}`);
      Object.entries(result.tags).forEach(([key, value]) => {
        const truncated = value.length > 60 ? value.substring(0, 60) + '...' : value;
        console.log(`    ${key}: ${truncated}`);
      });
    }
    
    console.log('');
  });
  
  // Summary
  console.log(`${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`Total files: ${results.length}`);
  console.log(`${colors.green}Passed: ${totalPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${totalFailed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${totalWarnings}${colors.reset}\n`);
  
  return totalFailed === 0;
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.cyan}Open Graph Tags Validator${colors.reset}\n`);
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    console.error(`${colors.red}Error: dist/ folder not found. Please run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }
  
  // Find index.html
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`${colors.red}Error: index.html not found in dist/ folder.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`Validating: ${indexPath}\n`);
  
  // Validate the file
  const result = validateFile(indexPath);
  const allPassed = printResults([result]);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateFile, extractMetaTags };
