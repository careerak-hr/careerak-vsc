/**
 * Contrast Audit Runner
 * Run this script to audit color contrast for normal and large text
 * 
 * Usage:
 * 1. Import in your app: import './utils/runContrastAudit';
 * 2. Or run directly: node frontend/src/utils/runContrastAudit.js
 * 3. Check browser console for results
 */

import { logAuditReport, auditLargeText, generateAuditReport } from './contrastAudit.js';

// Run the audit
console.log('🚀 Starting Color Contrast Audit...\n');

// Generate full report
const report = logAuditReport();

// Show large text specific summary
console.group('📏 Large Text Summary (Task 5.5.2)');
console.log(`Large text combinations audited: ${report.largeText.total}`);
console.log(`Pass rate: ${report.largeText.passRate}%`);
console.log(`Required ratio: 3:1 minimum`);

if (report.largeText.passing === report.largeText.total) {
  console.log('✅ All large text combinations meet WCAG 2.1 Level AA (3:1 ratio)');
} else {
  console.warn(`⚠️ ${report.largeText.failing} large text combinations need attention`);
}
console.groupEnd();

// Export for use in other modules
export { report };
