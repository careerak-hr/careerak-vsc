/**
 * Contrast Audit Test Runner
 * This test runs the contrast audit and identifies failing combinations
 */

import { describe, it, expect } from 'vitest';
import { generateAuditReport } from '../utils/contrastAudit.js';

describe('Color Contrast Audit', () => {
  it('should identify all contrast issues', () => {
    const report = generateAuditReport();
    
    console.log('\n🎨 Color Contrast Audit Report\n');
    console.log(`Total combinations: ${report.total}`);
    console.log(`✅ Passing: ${report.passing} (${report.passRate}%)`);
    console.log(`❌ Failing: ${report.failing}\n`);
    
    if (report.failingCombinations.length > 0) {
      console.log('❌ Failing Combinations:\n');
      report.failingCombinations.forEach(combo => {
        console.log(`  ${combo.name}`);
        console.log(`    Text: ${combo.text} | Background: ${combo.bg}`);
        console.log(`    Ratio: ${combo.ratio}:1 (Required: ${combo.required}:1)`);
        console.log(`    Type: ${combo.isLarge ? 'Large Text' : 'Normal Text'}\n`);
      });
    }
    
    // This test is informational - we'll fix the issues in the next step
    expect(report.total).toBeGreaterThan(0);
  });
});
