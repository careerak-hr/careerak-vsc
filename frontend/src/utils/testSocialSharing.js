#!/usr/bin/env node

/**
 * Social Media Sharing Test Script
 * 
 * Automated testing for Open Graph and Twitter Card meta tags.
 * This script validates that all pages have proper social media meta tags.
 * 
 * Usage:
 *   node frontend/src/utils/testSocialSharing.js
 * 
 * Requirements:
 *   - Node.js 14+
 *   - Application running locally or deployed
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login Page' },
  { path: '/auth', name: 'Auth Page' },
  { path: '/jobs', name: 'Job Postings' },
  { path: '/courses', name: 'Courses' },
  { path: '/profile', name: 'Profile' },
  { path: '/settings', name: 'Settings' },
];

// Required meta tags
const REQUIRED_OG_TAGS = [
  'og:title',
  'og:description',
  'og:type',
  'og:url',
  'og:image',
  'og:site_name',
];

const REQUIRED_TWITTER_TAGS = [
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Fetch HTML content from a URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract meta tags from HTML
 */
function extractMetaTags(html) {
  const metaTags = {};
  
  // Extract Open Graph tags
  const ogRegex = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
  let match;
  while ((match = ogRegex.exec(html)) !== null) {
    metaTags[`og:${match[1]}`] = match[2];
  }
  
  // Extract Twitter tags
  const twitterRegex = /<meta\s+name=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
  while ((match = twitterRegex.exec(html)) !== null) {
    metaTags[`twitter:${match[1]}`] = match[2];
  }
  
  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    metaTags.title = titleMatch[1];
  }
  
  // Extract description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i);
  if (descMatch) {
    metaTags.description = descMatch[1];
  }
  
  return metaTags;
}

/**
 * Validate meta tags
 */
function validateMetaTags(metaTags, pageName) {
  const results = {
    page: pageName,
    passed: true,
    errors: [],
    warnings: [],
    info: {},
  };
  
  // Check required Open Graph tags
  REQUIRED_OG_TAGS.forEach(tag => {
    if (!metaTags[tag]) {
      results.errors.push(`Missing required tag: ${tag}`);
      results.passed = false;
    } else {
      results.info[tag] = metaTags[tag];
    }
  });
  
  // Check required Twitter tags
  REQUIRED_TWITTER_TAGS.forEach(tag => {
    if (!metaTags[tag]) {
      results.errors.push(`Missing required tag: ${tag}`);
      results.passed = false;
    } else {
      results.info[tag] = metaTags[tag];
    }
  });
  
  // Validate title length (50-60 characters)
  if (metaTags['og:title']) {
    const titleLength = metaTags['og:title'].length;
    if (titleLength < 50) {
      results.warnings.push(`Title too short: ${titleLength} characters (recommended: 50-60)`);
    } else if (titleLength > 60) {
      results.warnings.push(`Title too long: ${titleLength} characters (recommended: 50-60)`);
    }
  }
  
  // Validate description length (150-160 characters)
  if (metaTags['og:description']) {
    const descLength = metaTags['og:description'].length;
    if (descLength < 150) {
      results.warnings.push(`Description too short: ${descLength} characters (recommended: 150-160)`);
    } else if (descLength > 160) {
      results.warnings.push(`Description too long: ${descLength} characters (recommended: 150-160)`);
    }
  }
  
  // Validate image URL is absolute
  if (metaTags['og:image']) {
    if (!metaTags['og:image'].startsWith('http')) {
      results.errors.push('Image URL must be absolute (start with http:// or https://)');
      results.passed = false;
    }
  }
  
  // Check Twitter card type
  if (metaTags['twitter:card'] && metaTags['twitter:card'] !== 'summary_large_image') {
    results.warnings.push(`Twitter card type is "${metaTags['twitter:card']}" (recommended: "summary_large_image")`);
  }
  
  return results;
}

/**
 * Print test results
 */
function printResults(results) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}Page: ${results.page}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (results.passed && results.warnings.length === 0) {
    console.log(`${colors.green}✅ All tests passed!${colors.reset}`);
  } else if (results.passed && results.warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Passed with warnings${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Tests failed${colors.reset}`);
  }
  
  // Print errors
  if (results.errors.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    results.errors.forEach(error => {
      console.log(`  ${colors.red}✗${colors.reset} ${error}`);
    });
  }
  
  // Print warnings
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    results.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
    });
  }
  
  // Print meta tag info
  console.log(`\n${colors.cyan}Meta Tags:${colors.reset}`);
  Object.entries(results.info).forEach(([key, value]) => {
    const displayValue = value.length > 60 ? value.substring(0, 57) + '...' : value;
    console.log(`  ${colors.green}✓${colors.reset} ${key}: ${displayValue}`);
  });
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Social Media Sharing Test Suite      ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.blue}Testing URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}Pages to test: ${PAGES_TO_TEST.length}${colors.reset}\n`);
  
  const allResults = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  
  for (const page of PAGES_TO_TEST) {
    const url = `${BASE_URL}${page.path}`;
    
    try {
      console.log(`${colors.cyan}Testing: ${page.name}...${colors.reset}`);
      
      const html = await fetchHTML(url);
      const metaTags = extractMetaTags(html);
      const results = validateMetaTags(metaTags, page.name);
      
      allResults.push(results);
      
      if (results.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
      
      totalWarnings += results.warnings.length;
      
      printResults(results);
      
    } catch (error) {
      console.log(`${colors.red}❌ Error testing ${page.name}: ${error.message}${colors.reset}`);
      totalFailed++;
    }
  }
  
  // Print summary
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}Passed: ${totalPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${totalFailed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${totalWarnings}${colors.reset}`);
  console.log(`${colors.blue}Total: ${PAGES_TO_TEST.length}${colors.reset}`);
  
  if (totalFailed === 0 && totalWarnings === 0) {
    console.log(`\n${colors.green}🎉 All tests passed with no warnings!${colors.reset}`);
    process.exit(0);
  } else if (totalFailed === 0) {
    console.log(`\n${colors.yellow}⚠️  All tests passed but with ${totalWarnings} warning(s)${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ ${totalFailed} test(s) failed${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
