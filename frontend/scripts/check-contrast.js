#!/usr/bin/env node

/**
 * Automated Contrast Checker Script
 * Task 5.5.5: Use automated contrast checker
 * 
 * This script automatically checks color contrast compliance for WCAG 2.1 Level AA.
 * It can be run:
 * - Manually: npm run check:contrast
 * - In CI/CD pipeline
 * - As a pre-commit hook
 * - During development
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: Some checks failed (warnings)
 * - 2: Critical checks failed
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate relative luminance
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance
 */
function checkWCAGCompliance(ratio, isLargeText = false) {
  const requiredRatio = isLargeText ? 3 : 4.5;
  const passes = ratio >= requiredRatio;
  
  return {
    passes,
    ratio: ratio.toFixed(2),
    required: requiredRatio,
    level: passes ? 'AA' : 'Fail',
    grade: ratio >= 7 ? 'AAA' : (passes ? 'AA' : 'Fail')
  };
}

/**
 * Define color combinations to check
 */
function getColorCombinations() {
  return {
    critical: [
      // These MUST pass for accessibility compliance
      { name: 'Primary text on Secondary bg (Light)', text: '#304B60', bg: '#E3DAD1', isLarge: false },
      { name: 'Primary text on White bg', text: '#304B60', bg: '#FFFFFF', isLarge: false },
      { name: 'White text on Primary bg', text: '#FFFFFF', bg: '#304B60', isLarge: false },
      { name: 'Dark text on Dark bg (Dark)', text: '#e0e0e0', bg: '#1a1a1a', isLarge: false },
      { name: 'Dark text on Dark surface', text: '#e0e0e0', bg: '#2d2d2d', isLarge: false },
    ],
    important: [
      // These should pass but are not critical
      { name: 'Secondary text on Primary bg', text: '#E3DAD1', bg: '#304B60', isLarge: false },
      { name: 'White text on Danger bg', text: '#FFFFFF', bg: '#D32F2F', isLarge: false },
      { name: 'White text on Success bg', text: '#FFFFFF', bg: '#388E3C', isLarge: false },
      { name: 'Danger text on Secondary bg', text: '#D32F2F', bg: '#E3DAD1', isLarge: false },
      { name: 'Success text on Secondary bg', text: '#388E3C', bg: '#E3DAD1', isLarge: false },
    ],
    largeText: [
      // Large text combinations (≥18pt or ≥14pt bold) - 3:1 ratio required
      { name: 'Large Primary text on Secondary bg', text: '#304B60', bg: '#E3DAD1', isLarge: true },
      { name: 'Large Accent text on Secondary bg', text: '#D48161', bg: '#E3DAD1', isLarge: true },
      { name: 'Large Dark text on Dark bg', text: '#e0e0e0', bg: '#1a1a1a', isLarge: true },
    ],
    warnings: [
      // These are known to not meet standards but are acceptable for UI components
      { name: 'Accent text on Secondary bg (UI only)', text: '#D48161', bg: '#E3DAD1', isLarge: false },
      { name: 'Accent text on White bg (UI only)', text: '#D48161', bg: '#FFFFFF', isLarge: false },
    ]
  };
}

/**
 * Run contrast checks
 */
function runContrastChecks() {
  const combinations = getColorCombinations();
  const results = {
    critical: { passed: [], failed: [] },
    important: { passed: [], failed: [] },
    largeText: { passed: [], failed: [] },
    warnings: { passed: [], failed: [] }
  };
  
  // Check each category
  for (const [category, combos] of Object.entries(combinations)) {
    combos.forEach(combo => {
      const ratio = getContrastRatio(combo.text, combo.bg);
      const compliance = checkWCAGCompliance(ratio, combo.isLarge);
      
      const result = {
        ...combo,
        ...compliance
      };
      
      if (compliance.passes) {
        results[category].passed.push(result);
      } else {
        results[category].failed.push(result);
      }
    });
  }
  
  return results;
}

/**
 * Print results
 */
function printResults(results) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}AUTOMATED CONTRAST CHECKER REPORT${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
  
  let hasFailures = false;
  let hasCriticalFailures = false;
  
  // Critical checks
  console.log(`${colors.bright}🔴 CRITICAL CHECKS (Must Pass):${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.critical.passed.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.critical.failed.length}${colors.reset}\n`);
  
  if (results.critical.failed.length > 0) {
    hasCriticalFailures = true;
    results.critical.failed.forEach(item => {
      console.log(`  ${colors.red}❌ ${item.name}${colors.reset}`);
      console.log(`     Text: ${item.text} | Background: ${item.bg}`);
      console.log(`     Ratio: ${item.ratio}:1 (Required: ${item.required}:1)`);
      console.log(`     ${item.isLarge ? 'Large text' : 'Normal text'}\n`);
    });
  }
  
  // Important checks
  console.log(`${colors.bright}🟡 IMPORTANT CHECKS (Should Pass):${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.important.passed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Failed: ${results.important.failed.length}${colors.reset}\n`);
  
  if (results.important.failed.length > 0) {
    hasFailures = true;
    results.important.failed.forEach(item => {
      console.log(`  ${colors.yellow}⚠️  ${item.name}${colors.reset}`);
      console.log(`     Text: ${item.text} | Background: ${item.bg}`);
      console.log(`     Ratio: ${item.ratio}:1 (Required: ${item.required}:1)\n`);
    });
  }
  
  // Large text checks
  console.log(`${colors.bright}📏 LARGE TEXT CHECKS (≥18pt or ≥14pt bold):${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.largeText.passed.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.largeText.failed.length}${colors.reset}\n`);
  
  if (results.largeText.failed.length > 0) {
    hasFailures = true;
    results.largeText.failed.forEach(item => {
      console.log(`  ${colors.red}❌ ${item.name}${colors.reset}`);
      console.log(`     Text: ${item.text} | Background: ${item.bg}`);
      console.log(`     Ratio: ${item.ratio}:1 (Required: ${item.required}:1)\n`);
    });
  }
  
  // Warnings (known issues)
  console.log(`${colors.bright}ℹ️  KNOWN WARNINGS (Acceptable for UI components):${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.warnings.passed.length}${colors.reset}`);
  console.log(`${colors.blue}ℹ️  Failed (Expected): ${results.warnings.failed.length}${colors.reset}\n`);
  
  if (results.warnings.failed.length > 0) {
    results.warnings.failed.forEach(item => {
      console.log(`  ${colors.blue}ℹ️  ${item.name}${colors.reset}`);
      console.log(`     Text: ${item.text} | Background: ${item.bg}`);
      console.log(`     Ratio: ${item.ratio}:1 (Required: ${item.required}:1)`);
      console.log(`     Note: Acceptable for UI components, not for text content\n`);
    });
  }
  
  // Summary
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}SUMMARY:${colors.reset}`);
  console.log(`${colors.cyan}WCAG 2.1 Level AA Requirements:${colors.reset}`);
  console.log(`  - Normal text: 4.5:1 minimum`);
  console.log(`  - Large text (≥18pt or ≥14pt bold): 3:1 minimum`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
  
  // Exit code
  if (hasCriticalFailures) {
    console.log(`${colors.red}${colors.bright}❌ CRITICAL FAILURES DETECTED${colors.reset}`);
    console.log(`${colors.red}Fix critical contrast issues before deploying.${colors.reset}\n`);
    return 2;
  } else if (hasFailures) {
    console.log(`${colors.yellow}${colors.bright}⚠️  WARNINGS DETECTED${colors.reset}`);
    console.log(`${colors.yellow}Consider fixing these issues for better accessibility.${colors.reset}\n`);
    return 1;
  } else {
    console.log(`${colors.green}${colors.bright}✅ ALL CHECKS PASSED${colors.reset}`);
    console.log(`${colors.green}All color combinations meet WCAG 2.1 Level AA standards.${colors.reset}\n`);
    return 0;
  }
}

/**
 * Save report to file
 */
function saveReport(results) {
  const reportPath = join(__dirname, '..', 'contrast-report.json');
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    wcagLevel: 'AA',
    results,
    summary: {
      critical: {
        total: results.critical.passed.length + results.critical.failed.length,
        passed: results.critical.passed.length,
        failed: results.critical.failed.length
      },
      important: {
        total: results.important.passed.length + results.important.failed.length,
        passed: results.important.passed.length,
        failed: results.important.failed.length
      },
      largeText: {
        total: results.largeText.passed.length + results.largeText.failed.length,
        passed: results.largeText.passed.length,
        failed: results.largeText.failed.length
      }
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}📄 Report saved to: ${reportPath}${colors.reset}\n`);
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}🚀 Running Automated Contrast Checker...${colors.reset}\n`);
  
  const results = runContrastChecks();
  saveReport(results);
  const exitCode = printResults(results);
  
  process.exit(exitCode);
}

// Run the checker
main();
