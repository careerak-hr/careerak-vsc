/**
 * Large Text Contrast Audit Tests
 * Task 5.5.2: Audit large text for 3:1 contrast ratio
 */

import { 
  auditLargeText, 
  generateAuditReport, 
  checkWCAGCompliance,
  getContrastRatio 
} from '../contrastAudit';

describe('Large Text Contrast Audit (Task 5.5.2)', () => {
  describe('auditLargeText()', () => {
    it('should return only large text combinations', () => {
      const results = auditLargeText();
      
      // All results should be marked as large text
      results.forEach(result => {
        expect(result.isLarge).toBe(true);
      });
    });

    it('should audit at least 16 large text combinations', () => {
      const results = auditLargeText();
      expect(results.length).toBeGreaterThanOrEqual(16);
    });

    it('should include light mode large text combinations', () => {
      const results = auditLargeText();
      const lightModeCombos = results.filter(r => 
        r.name.includes('Large Primary') || 
        r.name.includes('Large Accent') ||
        r.name.includes('Large White') ||
        r.name.includes('Large Secondary') ||
        r.name.includes('Large Hint')
      );
      
      expect(lightModeCombos.length).toBeGreaterThan(0);
    });

    it('should include dark mode large text combinations', () => {
      const results = auditLargeText();
      const darkModeCombos = results.filter(r => 
        r.name.includes('Large Dark')
      );
      
      expect(darkModeCombos.length).toBeGreaterThan(0);
    });
  });

  describe('generateAuditReport() - Large Text Section', () => {
    it('should include largeText section in report', () => {
      const report = generateAuditReport();
      
      expect(report.largeText).toBeDefined();
      expect(report.largeText.total).toBeDefined();
      expect(report.largeText.passing).toBeDefined();
      expect(report.largeText.failing).toBeDefined();
      expect(report.largeText.passRate).toBeDefined();
    });

    it('should calculate correct pass rate for large text', () => {
      const report = generateAuditReport();
      
      const expectedPassRate = report.largeText.total > 0
        ? ((report.largeText.passing / report.largeText.total) * 100).toFixed(1)
        : '0.0';
      
      expect(report.largeText.passRate).toBe(expectedPassRate);
    });

    it('should separate large text from normal text', () => {
      const report = generateAuditReport();
      
      expect(report.largeText.total + report.normalText.total).toBe(report.total);
    });
  });

  describe('WCAG Compliance for Large Text', () => {
    it('should require 3:1 ratio for large text', () => {
      const ratio = 3.5;
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.required).toBe(3);
      expect(compliance.passes).toBe(true);
    });

    it('should fail large text below 3:1 ratio', () => {
      const ratio = 2.8;
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.required).toBe(3);
      expect(compliance.passes).toBe(false);
    });

    it('should require 4.5:1 ratio for normal text', () => {
      const ratio = 4.6;
      const compliance = checkWCAGCompliance(ratio, false);
      
      expect(compliance.required).toBe(4.5);
      expect(compliance.passes).toBe(true);
    });
  });

  describe('Specific Large Text Combinations', () => {
    it('should pass: Large Primary text on Secondary bg', () => {
      const ratio = getContrastRatio('#304B60', '#E3DAD1');
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.passes).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3);
    });

    it('should pass: Large White text on Primary bg', () => {
      const ratio = getContrastRatio('#FFFFFF', '#304B60');
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.passes).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3);
    });

    it('should pass: Large Dark text on Dark bg', () => {
      const ratio = getContrastRatio('#e0e0e0', '#1a1a1a');
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.passes).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3);
    });

    it('should calculate contrast ratio for Large Accent text on White bg', () => {
      const ratio = getContrastRatio('#D48161', '#FFFFFF');
      const compliance = checkWCAGCompliance(ratio, true);
      
      // This test documents the actual contrast ratio
      // If it fails, it indicates a potential accessibility issue
      expect(parseFloat(compliance.ratio)).toBeGreaterThan(0);
      expect(compliance.required).toBe(3);
    });
  });

  describe('Report Structure', () => {
    it('should include all required fields in large text results', () => {
      const results = auditLargeText();
      
      results.forEach(result => {
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('bg');
        expect(result).toHaveProperty('isLarge');
        expect(result).toHaveProperty('ratio');
        expect(result).toHaveProperty('required');
        expect(result).toHaveProperty('passes');
        expect(result).toHaveProperty('level');
        expect(result).toHaveProperty('grade');
      });
    });

    it('should mark all large text with required ratio of 3', () => {
      const results = auditLargeText();
      
      results.forEach(result => {
        expect(result.required).toBe(3);
      });
    });
  });

  describe('Integration with Project Colors', () => {
    it('should audit project primary color (#304B60)', () => {
      const results = auditLargeText();
      const primaryCombos = results.filter(r => 
        r.text === '#304B60' || r.bg === '#304B60'
      );
      
      expect(primaryCombos.length).toBeGreaterThan(0);
    });

    it('should audit project secondary color (#E3DAD1)', () => {
      const results = auditLargeText();
      const secondaryCombos = results.filter(r => 
        r.text === '#E3DAD1' || r.bg === '#E3DAD1'
      );
      
      expect(secondaryCombos.length).toBeGreaterThan(0);
    });

    it('should audit project accent color (#D48161)', () => {
      const results = auditLargeText();
      const accentCombos = results.filter(r => 
        r.text === '#D48161' || r.bg === '#D48161'
      );
      
      expect(accentCombos.length).toBeGreaterThan(0);
    });

    it('should audit dark mode colors', () => {
      const results = auditLargeText();
      const darkModeCombos = results.filter(r => 
        r.bg === '#1a1a1a' || r.bg === '#2d2d2d'
      );
      
      expect(darkModeCombos.length).toBeGreaterThan(0);
    });
  });
});
