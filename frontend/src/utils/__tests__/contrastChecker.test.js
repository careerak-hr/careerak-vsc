/**
 * Color Contrast Checker Tests
 * 
 * Tests for WCAG 2.1 Level AA compliance
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  auditColorCombination,
  auditCareerakColors,
  CAREERAK_COLORS
} from '../contrastChecker';

describe('Color Contrast Checker', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      const result = hexToRgb('#304B60');
      expect(result).toEqual({ r: 48, g: 75, b: 96, a: 1 });
    });

    it('should convert 8-digit hex with alpha to RGBA', () => {
      const result = hexToRgb('#D4816180');
      expect(result.r).toBe(212);
      expect(result.g).toBe(129);
      expect(result.b).toBe(97);
      expect(result.a).toBeCloseTo(0.5, 2);
    });

    it('should convert 3-digit hex to RGB', () => {
      const result = hexToRgb('#FFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('should handle hex without # prefix', () => {
      const result = hexToRgb('304B60');
      expect(result).toEqual({ r: 48, g: 75, b: 96, a: 1 });
    });
  });

  describe('getLuminance', () => {
    it('should calculate luminance for white', () => {
      const lum = getLuminance({ r: 255, g: 255, b: 255 });
      expect(lum).toBeCloseTo(1, 2);
    });

    it('should calculate luminance for black', () => {
      const lum = getLuminance({ r: 0, g: 0, b: 0 });
      expect(lum).toBeCloseTo(0, 2);
    });

    it('should calculate luminance for gray', () => {
      const lum = getLuminance({ r: 128, g: 128, b: 128 });
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate 21:1 for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate 1:1 for same colors', () => {
      const ratio = getContrastRatio('#304B60', '#304B60');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle colors with alpha', () => {
      const ratio = getContrastRatio('#D4816180', '#E3DAD1');
      expect(ratio).toBeGreaterThan(1);
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should pass for 4.5:1 normal text', () => {
      const result = meetsWCAG_AA(4.5, 'normal');
      expect(result.passes).toBe(true);
      expect(result.level).toBe('AA');
    });

    it('should fail for 4.4:1 normal text', () => {
      const result = meetsWCAG_AA(4.4, 'normal');
      expect(result.passes).toBe(false);
      expect(result.level).toBe('Fail');
    });

    it('should pass for 3:1 large text', () => {
      const result = meetsWCAG_AA(3, 'large');
      expect(result.passes).toBe(true);
      expect(result.level).toBe('AA');
    });

    it('should fail for 2.9:1 large text', () => {
      const result = meetsWCAG_AA(2.9, 'large');
      expect(result.passes).toBe(false);
      expect(result.level).toBe('Fail');
    });
  });

  describe('auditColorCombination', () => {
    it('should audit a passing combination', () => {
      const result = auditColorCombination('#000000', '#FFFFFF', 'normal');
      expect(result.passes).toBe(true);
      expect(result.aa.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThan(4.5);
    });

    it('should audit a failing combination', () => {
      const result = auditColorCombination('#888888', '#999999', 'normal');
      expect(result.passes).toBe(false);
      expect(result.aa.passes).toBe(false);
    });
  });

  describe('Careerak Color Palette', () => {
    it('should have all required light mode colors', () => {
      expect(CAREERAK_COLORS.light.primary).toBe('#304B60');
      expect(CAREERAK_COLORS.light.secondary).toBe('#E3DAD1');
      expect(CAREERAK_COLORS.light.accent).toBe('#A04D2F'); // Adjusted for better contrast
    });

    it('should have all required dark mode colors', () => {
      expect(CAREERAK_COLORS.dark.primary).toBe('#1A2332');
      expect(CAREERAK_COLORS.dark.accent).toBe('#E09A7A');
    });
  });

  describe('Careerak Color Combinations - Light Mode', () => {
    it('should pass: primary text on primary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.light.text.primary,
        CAREERAK_COLORS.light.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: secondary text on primary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.light.text.secondary,
        CAREERAK_COLORS.light.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: accent on primary background for UI elements (3:1)', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.light.accent,
        CAREERAK_COLORS.light.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'large'); // UI elements use large text threshold (3:1)
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(3); // UI components need 3:1 minimum
    });

    it('should pass: white text on accent background', () => {
      const ratio = getContrastRatio('#FFFFFF', CAREERAK_COLORS.light.accent);
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Careerak Color Combinations - Dark Mode', () => {
    it('should pass: primary text on primary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.dark.text.primary,
        CAREERAK_COLORS.dark.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: secondary text on primary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.dark.text.secondary,
        CAREERAK_COLORS.dark.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: accent on primary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.dark.accent,
        CAREERAK_COLORS.dark.bg.primary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should pass: primary text on secondary background', () => {
      const ratio = getContrastRatio(
        CAREERAK_COLORS.dark.text.primary,
        CAREERAK_COLORS.dark.bg.secondary
      );
      const result = meetsWCAG_AA(ratio, 'normal');
      expect(result.passes).toBe(true);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('auditCareerakColors', () => {
    it('should audit all light mode combinations', () => {
      const results = auditCareerakColors();
      expect(results.light.length).toBeGreaterThan(0);
      
      // Check that text combinations pass 4.5:1
      const textCombinations = results.light.filter(r => 
        r.foreground !== CAREERAK_COLORS.light.accent
      );
      const textPass = textCombinations.every(r => r.passes);
      expect(textPass).toBe(true);
      
      // Check that accent passes 3:1 for UI elements
      const accentCombo = results.light.find(r => 
        r.foreground === CAREERAK_COLORS.light.accent
      );
      if (accentCombo) {
        expect(parseFloat(accentCombo.ratio)).toBeGreaterThanOrEqual(3);
      }
    });

    it('should audit all dark mode combinations', () => {
      const results = auditCareerakColors();
      expect(results.dark.length).toBeGreaterThan(0);
      
      // All combinations should pass
      const allPass = results.dark.every(r => r.passes);
      expect(allPass).toBe(true);
    });

    it('should verify text combinations meet 4.5:1 minimum', () => {
      const results = auditCareerakColors();
      const allCombinations = [...results.light, ...results.dark];
      
      // Filter out accent color (which is for UI elements only)
      const textCombinations = allCombinations.filter(combo => 
        combo.foreground !== CAREERAK_COLORS.light.accent &&
        combo.foreground !== CAREERAK_COLORS.dark.accent
      );
      
      textCombinations.forEach(combo => {
        expect(parseFloat(combo.ratio)).toBeGreaterThanOrEqual(4.5);
      });
    });
    
    it('should verify UI accent colors meet 3:1 minimum', () => {
      const results = auditCareerakColors();
      const allCombinations = [...results.light, ...results.dark];
      
      // Check accent colors meet 3:1 for UI elements
      const accentCombinations = allCombinations.filter(combo => 
        combo.foreground === CAREERAK_COLORS.light.accent ||
        combo.foreground === CAREERAK_COLORS.dark.accent
      );
      
      accentCombinations.forEach(combo => {
        expect(parseFloat(combo.ratio)).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
