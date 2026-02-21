/**
 * Dark Mode Contrast Verification Script
 * 
 * Run this script to verify all dark mode color combinations
 * meet WCAG 2.1 Level AA standards.
 * 
 * Usage: node verifyDarkModeContrast.js
 */

import { generateContrastReport, verifyDarkModeContrast } from './contrastChecker.js';

// Run verification
console.log('Starting dark mode contrast verification...\n');

const results = verifyDarkModeContrast();
const report = generateContrastReport();

// Print report
console.log(report);

// Exit with appropriate code
if (results.failed.length > 0) {
  console.error('\n❌ VERIFICATION FAILED: Some color combinations do not meet WCAG AA standards.\n');
  process.exit(1);
} else {
  console.log('\n✅ VERIFICATION PASSED: All color combinations meet WCAG AA standards.\n');
  process.exit(0);
}
