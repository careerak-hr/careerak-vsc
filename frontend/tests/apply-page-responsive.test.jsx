/**
 * Apply Page Responsive Design Tests
 * Task: 18.4 - Write unit tests for responsive behavior
 * Requirements: 9.7, 9.8, 10.1-10.10
 * 
 * This test suite verifies:
 * - Mobile layouts (<640px)
 * - Tablet layouts (640-1023px)
 * - Desktop layouts (>=1024px)
 * - RTL layouts
 * - Font application for all languages
 * - Touch targets (>=44px)
 * - Input font size (>=16px to prevent iOS zoom)
 * - Color palette compliance
 * - Input border color (#D4816180)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Apply Page Responsive Design', () => {
  describe('CSS Files Existence', () => {
    it('should have applyPageResponsive.css file', () => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      expect(existsSync(cssPath)).toBe(true);
    });

    it('should have applyPageFonts.css file', () => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      expect(existsSync(cssPath)).toBe(true);
    });

    it('should import responsive styles in 08_ApplyPage.css', () => {
      const cssPath = join(process.cwd(), 'src', 'pages', '08_ApplyPage.css');
      const cssContent = readFileSync(cssPath, 'utf-8');
      expect(cssContent).toContain("@import '../styles/applyPageResponsive.css'");
    });

    it('should import font styles in 08_ApplyPage.css', () => {
      const cssPath = join(process.cwd(), 'src', 'pages', '08_ApplyPage.css');
      const cssContent = readFileSync(cssPath, 'utf-8');
      expect(cssContent).toContain("@import '../styles/applyPageFonts.css'");
    });
  });

  describe('Color Palette Compliance', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should define primary color (#304B60)', () => {
      expect(cssContent).toContain('--primary: #304B60');
    });

    it('should define secondary color (#E3DAD1)', () => {
      expect(cssContent).toContain('--secondary: #E3DAD1');
    });

    it('should define accent color (#D48161)', () => {
      expect(cssContent).toContain('--accent: #D48161');
    });

    it('should define input border color (#D4816180) - CRITICAL', () => {
      expect(cssContent).toContain('--input-border: #D4816180');
    });

    it('should use input border color for all form inputs', () => {
      expect(cssContent).toContain('border: 2px solid var(--input-border)');
    });

    it('should maintain input border color on focus - CRITICAL', () => {
      expect(cssContent).toContain('border-color: var(--input-border)');
      // Verify it's in the focus state
      const focusSection = cssContent.match(/\.apply-form-input:focus[^}]+}/s);
      expect(focusSection).toBeTruthy();
      expect(focusSection[0]).toContain('border-color: var(--input-border)');
    });
  });

  describe('Mobile Layout (<640px)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have mobile breakpoint styles', () => {
      expect(cssContent).toContain('@media (max-width: 639px)');
    });

    it('should prevent horizontal scroll on mobile', () => {
      const mobileSection = cssContent.match(/@media \(max-width: 639px\)[^}]+\{[^}]+overflow-x: hidden[^}]+\}/s);
      expect(mobileSection).toBeTruthy();
    });

    it('should have smaller padding on mobile', () => {
      const mobileSection = cssContent.match(/@media \(max-width: 639px\)[^@]+/s);
      expect(mobileSection[0]).toContain('padding: 1.5rem');
    });

    it('should stack header elements on mobile', () => {
      const mobileSection = cssContent.match(/@media \(max-width: 639px\)[^@]+/s);
      expect(mobileSection[0]).toContain('flex-direction: column');
    });

    it('should have smaller icon size on mobile', () => {
      const mobileSection = cssContent.match(/@media \(max-width: 639px\)[^@]+/s);
      expect(mobileSection[0]).toContain('width: 3.5rem');
      expect(mobileSection[0]).toContain('height: 3.5rem');
    });

    it('should have smaller font sizes on mobile', () => {
      const mobileSection = cssContent.match(/@media \(max-width: 639px\)[^@]+/s);
      expect(mobileSection[0]).toContain('font-size: 1.25rem');
    });
  });

  describe('Tablet Layout (640-1023px)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have tablet breakpoint styles', () => {
      expect(cssContent).toContain('@media (min-width: 640px)');
    });

    it('should have medium padding on tablet', () => {
      const tabletSection = cssContent.match(/@media \(min-width: 640px\)[^@]+/s);
      expect(tabletSection[0]).toContain('padding: 3rem');
    });

    it('should have two-column button layout on tablet', () => {
      const tabletSection = cssContent.match(/@media \(min-width: 640px\)[^@]+/s);
      expect(tabletSection[0]).toContain('grid-template-columns: 1fr 1fr');
    });

    it('should have medium icon size on tablet', () => {
      const tabletSection = cssContent.match(/@media \(min-width: 640px\)[^@]+/s);
      expect(tabletSection[0]).toContain('width: 5rem');
      expect(tabletSection[0]).toContain('height: 5rem');
    });
  });

  describe('Desktop Layout (>=1024px)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have desktop breakpoint styles', () => {
      expect(cssContent).toContain('@media (min-width: 1024px)');
    });

    it('should have large padding on desktop', () => {
      const desktopSection = cssContent.match(/@media \(min-width: 1024px\)[^@]+/s);
      expect(desktopSection[0]).toContain('padding: 4rem');
    });

    it('should have two-column form layout on desktop', () => {
      const desktopSection = cssContent.match(/@media \(min-width: 1024px\)[^@]+/s);
      expect(desktopSection[0]).toContain('grid-template-columns: 1fr 1fr');
    });

    it('should have large icon size on desktop', () => {
      const desktopSection = cssContent.match(/@media \(min-width: 1024px\)[^@]+/s);
      expect(desktopSection[0]).toContain('width: 6rem');
      expect(desktopSection[0]).toContain('height: 6rem');
    });

    it('should have larger font sizes on desktop', () => {
      const desktopSection = cssContent.match(/@media \(min-width: 1024px\)[^@]+/s);
      expect(desktopSection[0]).toContain('font-size: 2.5rem');
    });
  });

  describe('Touch Targets (>=44px)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have minimum 44px height for submit button', () => {
      expect(cssContent).toContain('min-height: 44px');
      const submitBtnSection = cssContent.match(/\.apply-submit-btn[^}]+\}/s);
      expect(submitBtnSection[0]).toContain('min-height: 44px');
    });

    it('should have minimum 44px height for cancel button', () => {
      const cancelBtnSection = cssContent.match(/\.apply-cancel-btn[^}]+\}/s);
      expect(cancelBtnSection[0]).toContain('min-height: 44px');
    });

    it('should have minimum 44px for file preview remove button', () => {
      const removeSection = cssContent.match(/\.apply-file-preview-remove[^}]+\}/s);
      expect(removeSection[0]).toContain('min-width: 44px');
      expect(removeSection[0]).toContain('min-height: 44px');
    });
  });

  describe('Input Font Size (>=16px to prevent iOS zoom)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have 16px font size for text inputs', () => {
      const inputSection = cssContent.match(/\.apply-form-input[^}]+\}/s);
      expect(inputSection[0]).toContain('font-size: 16px');
    });

    it('should have 16px font size for textareas', () => {
      const textareaSection = cssContent.match(/\.apply-form-textarea[^}]+\}/s);
      expect(textareaSection[0]).toContain('font-size: 16px');
    });

    it('should have 16px font size for selects', () => {
      const selectSection = cssContent.match(/\.apply-form-select[^}]+\}/s);
      expect(selectSection[0]).toContain('font-size: 16px');
    });

    it('should maintain 16px font size in Arabic', () => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      const fontsContent = readFileSync(fontsPath, 'utf-8');
      // Look in the Font Size Adjustments section
      const fontSizeSection = fontsContent.match(/Font Size Adjustments for Readability[\s\S]*?\/\* ========================================/);
      expect(fontSizeSection[0]).toContain('font-size: 16px');
      expect(fontSizeSection[0]).toContain('[lang="ar"] .apply-form-input');
    });
  });

  describe('RTL Support', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have RTL styles for header', () => {
      expect(cssContent).toContain('[dir="rtl"] .apply-header-text-container h2');
    });

    it('should swap border sides in RTL', () => {
      const rtlSection = cssContent.match(/\[dir="rtl"\][^}]+\}/s);
      expect(rtlSection[0]).toContain('border-right: none');
      expect(rtlSection[0]).toContain('border-left: 4px solid var(--accent)');
    });

    it('should swap padding sides in RTL', () => {
      const rtlSection = cssContent.match(/\[dir="rtl"\][^}]+\}/s);
      expect(rtlSection[0]).toContain('padding-right: 0');
      expect(rtlSection[0]).toContain('padding-left: 0.75rem');
    });

    it('should swap margin for required label in RTL', () => {
      const rtlSection = cssContent.match(/\[dir="rtl"\] \.apply-form-label-required[^}]+\}/s);
      expect(rtlSection[0]).toContain('margin-left: 0');
      expect(rtlSection[0]).toContain('margin-right: 0.25rem');
    });
  });

  describe('Font Application - Arabic', () => {
    let fontsContent;

    beforeEach(() => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      fontsContent = readFileSync(fontsPath, 'utf-8');
    });

    it('should apply Amiri font for Arabic', () => {
      expect(fontsContent).toContain('[lang="ar"] .apply-page-container');
      expect(fontsContent).toContain("font-family: 'Amiri', 'Cairo', serif !important");
    });

    it('should apply Amiri to all Arabic elements', () => {
      const arabicSection = fontsContent.match(/\[lang="ar"\] \.apply-page-container[^}]+\}/s);
      expect(arabicSection[0]).toContain("font-family: 'Amiri', 'Cairo', serif !important");
    });

    it('should have bold weight for Arabic headers', () => {
      const arabicHeaderSection = fontsContent.match(/\[lang="ar"\] \.apply-header-text-container h2[^}]+\}/s);
      expect(arabicHeaderSection[0]).toContain('font-weight: 900');
    });

    it('should have medium weight for Arabic inputs', () => {
      const arabicInputSection = fontsContent.match(/\[lang="ar"\] \.apply-form-input[^}]+\}/s);
      expect(arabicInputSection[0]).toContain('font-weight: 600');
    });
  });

  describe('Font Application - English', () => {
    let fontsContent;

    beforeEach(() => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      fontsContent = readFileSync(fontsPath, 'utf-8');
    });

    it('should apply Cormorant Garamond font for English', () => {
      expect(fontsContent).toContain('[lang="en"] .apply-page-container');
      expect(fontsContent).toContain("font-family: 'Cormorant Garamond', serif !important");
    });

    it('should apply Cormorant Garamond to all English elements', () => {
      const englishSection = fontsContent.match(/\[lang="en"\] \.apply-page-container[^}]+\}/s);
      expect(englishSection[0]).toContain("font-family: 'Cormorant Garamond', serif !important");
    });

    it('should have bold weight for English headers', () => {
      const englishHeaderSection = fontsContent.match(/\[lang="en"\] \.apply-header-text-container h2[^}]+\}/s);
      expect(englishHeaderSection[0]).toContain('font-weight: 700');
    });

    it('should have medium weight for English inputs', () => {
      const englishInputSection = fontsContent.match(/\[lang="en"\] \.apply-form-input[^}]+\}/s);
      expect(englishInputSection[0]).toContain('font-weight: 600');
    });
  });

  describe('Font Application - French', () => {
    let fontsContent;

    beforeEach(() => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      fontsContent = readFileSync(fontsPath, 'utf-8');
    });

    it('should apply EB Garamond font for French', () => {
      expect(fontsContent).toContain('[lang="fr"] .apply-page-container');
      expect(fontsContent).toContain("font-family: 'EB Garamond', serif !important");
    });

    it('should apply EB Garamond to all French elements', () => {
      const frenchSection = fontsContent.match(/\[lang="fr"\] \.apply-page-container[^}]+\}/s);
      expect(frenchSection[0]).toContain("font-family: 'EB Garamond', serif !important");
    });

    it('should have bold weight for French headers', () => {
      const frenchHeaderSection = fontsContent.match(/\[lang="fr"\] \.apply-header-text-container h2[^}]+\}/s);
      expect(frenchHeaderSection[0]).toContain('font-weight: 700');
    });

    it('should have medium weight for French inputs', () => {
      const frenchInputSection = fontsContent.match(/\[lang="fr"\] \.apply-form-input[^}]+\}/s);
      expect(frenchInputSection[0]).toContain('font-weight: 600');
    });
  });

  describe('Accessibility Features', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have focus-visible styles', () => {
      expect(cssContent).toContain(':focus-visible');
    });

    it('should have outline for keyboard navigation', () => {
      const focusSection = cssContent.match(/focus-visible[^}]+\}/s);
      expect(focusSection[0]).toContain('outline: 3px solid var(--accent)');
    });

    it('should support reduced motion', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('should support high contrast mode', () => {
      expect(cssContent).toContain('@media (prefers-contrast: high)');
    });

    it('should have thicker borders in high contrast mode', () => {
      const highContrastSection = cssContent.match(/@media \(prefers-contrast: high\)[^@]+/s);
      expect(highContrastSection[0]).toContain('border-width: 3px');
    });
  });

  describe('Safe Area Support (iOS Notch)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have safe area support', () => {
      expect(cssContent).toContain('@supports (padding: max(0px))');
    });

    it('should use env(safe-area-inset-*)', () => {
      const safeAreaSection = cssContent.match(/@supports \(padding: max\(0px\)\)[^}]+\}/s);
      expect(safeAreaSection[0]).toContain('env(safe-area-inset-left)');
      expect(safeAreaSection[0]).toContain('env(safe-area-inset-right)');
      expect(safeAreaSection[0]).toContain('env(safe-area-inset-bottom)');
    });
  });

  describe('Dark Mode Support', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have dark mode styles', () => {
      expect(cssContent).toContain('@media (prefers-color-scheme: dark)');
    });

    it('should have dark background in dark mode', () => {
      const darkModeSection = cssContent.match(/@media \(prefers-color-scheme: dark\)[^@]+/s);
      expect(darkModeSection[0]).toContain('background-color: #1a1a1a');
    });

    it('should have dark card background in dark mode', () => {
      const darkModeSection = cssContent.match(/@media \(prefers-color-scheme: dark\)[^@]+/s);
      expect(darkModeSection[0]).toContain('background-color: #2a2a2a');
    });
  });

  describe('Print Styles', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have print styles', () => {
      expect(cssContent).toContain('@media print');
    });

    it('should hide buttons in print', () => {
      const printSection = cssContent.match(/@media print[^@]+/s);
      expect(printSection[0]).toContain('display: none');
    });

    it('should remove shadows in print', () => {
      const printSection = cssContent.match(/@media print[^@]+/s);
      expect(printSection[0]).toContain('box-shadow: none');
    });
  });

  describe('Very Small Screens (<375px)', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have very small screen breakpoint', () => {
      expect(cssContent).toContain('@media (max-width: 374px)');
    });

    it('should reduce base font size on very small screens', () => {
      const verySmallSection = cssContent.match(/@media \(max-width: 374px\)[^@]+/s);
      expect(verySmallSection[0]).toContain('font-size: 14px');
    });

    it('should have smaller padding on very small screens', () => {
      const verySmallSection = cssContent.match(/@media \(max-width: 374px\)[^@]+/s);
      expect(verySmallSection[0]).toContain('padding: 1rem');
    });
  });

  describe('Landscape Mode', () => {
    let cssContent;

    beforeEach(() => {
      const cssPath = join(process.cwd(), 'src', 'styles', 'applyPageResponsive.css');
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should have landscape mode styles', () => {
      expect(cssContent).toContain('@media (max-height: 500px) and (orientation: landscape)');
    });

    it('should reduce vertical padding in landscape', () => {
      const landscapeSection = cssContent.match(/@media \(max-height: 500px\) and \(orientation: landscape\)[^@]+/s);
      expect(landscapeSection[0]).toContain('padding-top: 2rem');
      expect(landscapeSection[0]).toContain('padding-bottom: 2rem');
    });
  });

  describe('Font Loading Optimization', () => {
    let fontsContent;

    beforeEach(() => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      fontsContent = readFileSync(fontsPath, 'utf-8');
    });

    it('should have font-display: swap', () => {
      expect(fontsContent).toContain('font-display: swap');
    });

    it('should have fonts-loading class', () => {
      expect(fontsContent).toContain('.fonts-loading');
    });

    it('should have fonts-loaded class', () => {
      expect(fontsContent).toContain('.fonts-loaded');
    });

    it('should have fallback fonts', () => {
      expect(fontsContent).toContain('@supports not (font-family:');
    });
  });

  describe('Text Rendering Optimization', () => {
    let fontsContent;

    beforeEach(() => {
      const fontsPath = join(process.cwd(), 'src', 'styles', 'applyPageFonts.css');
      fontsContent = readFileSync(fontsPath, 'utf-8');
    });

    it('should have optimizeLegibility', () => {
      expect(fontsContent).toContain('text-rendering: optimizeLegibility');
    });

    it('should have antialiasing', () => {
      expect(fontsContent).toContain('-webkit-font-smoothing: antialiased');
      expect(fontsContent).toContain('-moz-osx-font-smoothing: grayscale');
    });
  });
});
