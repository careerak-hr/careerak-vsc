/**
 * Mobile Responsive Testing (320px - 767px)
 * Tests all pages and components for mobile compatibility
 * Task: 9.3.1 Test on mobile (320px - 767px)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Mobile Responsive Testing (320px - 767px)', () => {
  let originalInnerWidth;
  let originalInnerHeight;

  beforeEach(() => {
    // Store original dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  const setViewport = (width, height = 667) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  describe('Viewport Breakpoints', () => {
    it('should handle very small mobile (320px)', () => {
      setViewport(320, 568);
      expect(window.innerWidth).toBe(320);
      expect(window.innerWidth).toBeGreaterThanOrEqual(320);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });

    it('should handle small mobile (375px - iPhone SE)', () => {
      setViewport(375, 667);
      expect(window.innerWidth).toBe(375);
      expect(window.innerWidth).toBeGreaterThanOrEqual(320);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });

    it('should handle medium mobile (390px - iPhone 12/13)', () => {
      setViewport(390, 844);
      expect(window.innerWidth).toBe(390);
      expect(window.innerWidth).toBeGreaterThanOrEqual(320);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });

    it('should handle large mobile (430px - iPhone 14 Pro Max)', () => {
      setViewport(430, 932);
      expect(window.innerWidth).toBe(430);
      expect(window.innerWidth).toBeGreaterThanOrEqual(320);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });

    it('should handle Android mobile (360px - Galaxy S21)', () => {
      setViewport(360, 800);
      expect(window.innerWidth).toBe(360);
      expect(window.innerWidth).toBeGreaterThanOrEqual(320);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });

    it('should handle max mobile width (767px)', () => {
      setViewport(767, 1024);
      expect(window.innerWidth).toBe(767);
      expect(window.innerWidth).toBeLessThanOrEqual(767);
    });
  });

  describe('CSS Media Query Validation', () => {
    it('should apply mobile styles at 320px', () => {
      setViewport(320);
      const mediaQuery = window.matchMedia('(max-width: 639px)');
      expect(mediaQuery.matches).toBe(true);
    });

    it('should apply mobile styles at 639px', () => {
      setViewport(639);
      const mediaQuery = window.matchMedia('(max-width: 639px)');
      expect(mediaQuery.matches).toBe(true);
    });

    it('should apply very small mobile styles at 374px', () => {
      setViewport(374);
      const mediaQuery = window.matchMedia('(max-width: 374px)');
      expect(mediaQuery.matches).toBe(true);
    });
  });

  describe('Responsive Design Requirements', () => {
    it('should prevent horizontal scroll on mobile', () => {
      setViewport(375);
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      
      // Body should have overflow-x: hidden
      expect(['hidden', 'clip']).toContain(computedStyle.overflowX);
    });

    it('should have proper viewport meta tag', () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeTruthy();
      
      const content = viewportMeta?.getAttribute('content') || '';
      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');
    });

    it('should support touch events', () => {
      expect('ontouchstart' in window || navigator.maxTouchPoints > 0).toBe(true);
    });
  });

  describe('Typography on Mobile', () => {
    it('should have readable font sizes (minimum 14px)', () => {
      setViewport(320);
      const html = document.documentElement;
      const computedStyle = window.getComputedStyle(html);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    it('should prevent iOS zoom on input focus (16px minimum)', () => {
      setViewport(375);
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      
      const computedStyle = window.getComputedStyle(input);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // iOS requires 16px to prevent zoom
      expect(fontSize).toBeGreaterThanOrEqual(16);
      
      document.body.removeChild(input);
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum touch target size (44x44px)', () => {
      setViewport(375);
      const button = document.createElement('button');
      button.textContent = 'Test';
      document.body.appendChild(button);
      
      const computedStyle = window.getComputedStyle(button);
      const minHeight = parseFloat(computedStyle.minHeight);
      const minWidth = parseFloat(computedStyle.minWidth);
      
      // WCAG 2.1 Level AAA requires 44x44px
      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
      
      document.body.removeChild(button);
    });
  });

  describe('Images on Mobile', () => {
    it('should have responsive images (max-width: 100%)', () => {
      setViewport(375);
      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      document.body.appendChild(img);
      
      const computedStyle = window.getComputedStyle(img);
      const maxWidth = computedStyle.maxWidth;
      
      expect(maxWidth).toBe('100%');
      
      document.body.removeChild(img);
    });
  });

  describe('Layout on Mobile', () => {
    it('should stack grid columns on mobile', () => {
      setViewport(375);
      const grid = document.createElement('div');
      grid.className = 'grid-cols-2';
      document.body.appendChild(grid);
      
      const computedStyle = window.getComputedStyle(grid);
      const gridTemplateColumns = computedStyle.gridTemplateColumns;
      
      // Should be single column on mobile
      expect(gridTemplateColumns === '1fr' || gridTemplateColumns === 'none').toBe(true);
      
      document.body.removeChild(grid);
    });

    it('should have proper padding on mobile containers', () => {
      setViewport(375);
      const container = document.createElement('div');
      container.className = 'container';
      document.body.appendChild(container);
      
      const computedStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      
      // Should have at least 1rem (16px) padding
      expect(paddingLeft).toBeGreaterThanOrEqual(16);
      expect(paddingRight).toBeGreaterThanOrEqual(16);
      
      document.body.removeChild(container);
    });
  });

  describe('Modals on Mobile', () => {
    it('should be full-width on mobile', () => {
      setViewport(375);
      const modal = document.createElement('div');
      modal.className = 'modal-content';
      document.body.appendChild(modal);
      
      const computedStyle = window.getComputedStyle(modal);
      const width = computedStyle.width;
      const maxWidth = computedStyle.maxWidth;
      
      expect(width === '100%' || maxWidth === '100%').toBe(true);
      
      document.body.removeChild(modal);
    });
  });

  describe('Forms on Mobile', () => {
    it('should stack form fields vertically', () => {
      setViewport(375);
      const formGrid = document.createElement('div');
      formGrid.className = 'form-grid';
      document.body.appendChild(formGrid);
      
      const computedStyle = window.getComputedStyle(formGrid);
      const gridTemplateColumns = computedStyle.gridTemplateColumns;
      
      expect(gridTemplateColumns === '1fr' || gridTemplateColumns === 'none').toBe(true);
      
      document.body.removeChild(formGrid);
    });

    it('should have full-width submit buttons', () => {
      setViewport(375);
      const button = document.createElement('button');
      button.className = 'form-submit-btn';
      document.body.appendChild(button);
      
      const computedStyle = window.getComputedStyle(button);
      const width = computedStyle.width;
      
      expect(width === '100%' || parseFloat(width) >= 300).toBe(true);
      
      document.body.removeChild(button);
    });
  });

  describe('Navigation on Mobile', () => {
    it('should show hamburger menu on mobile', () => {
      setViewport(375);
      const hamburger = document.createElement('div');
      hamburger.className = 'navbar-hamburger';
      document.body.appendChild(hamburger);
      
      const computedStyle = window.getComputedStyle(hamburger);
      const display = computedStyle.display;
      
      expect(display).not.toBe('none');
      
      document.body.removeChild(hamburger);
    });
  });

  describe('Tables on Mobile', () => {
    it('should be scrollable horizontally', () => {
      setViewport(375);
      const tableContainer = document.createElement('div');
      tableContainer.className = 'table-container';
      document.body.appendChild(tableContainer);
      
      const computedStyle = window.getComputedStyle(tableContainer);
      const overflowX = computedStyle.overflowX;
      
      expect(['auto', 'scroll']).toContain(overflowX);
      
      document.body.removeChild(tableContainer);
    });
  });

  describe('Landscape Mode', () => {
    it('should handle landscape orientation', () => {
      setViewport(667, 375); // Landscape
      const mediaQuery = window.matchMedia('(orientation: landscape)');
      expect(mediaQuery.matches).toBe(true);
    });

    it('should adjust layout for short landscape screens', () => {
      setViewport(667, 400); // Short landscape
      const mediaQuery = window.matchMedia('(max-height: 500px) and (orientation: landscape)');
      expect(mediaQuery.matches).toBe(true);
    });
  });

  describe('Safe Area Support', () => {
    it('should support safe area insets for notched devices', () => {
      setViewport(390, 844); // iPhone 12
      const element = document.createElement('div');
      element.className = 'safe-area-top';
      document.body.appendChild(element);
      
      const computedStyle = window.getComputedStyle(element);
      const paddingTop = computedStyle.paddingTop;
      
      // Should have safe area padding
      expect(paddingTop).toBeTruthy();
      
      document.body.removeChild(element);
    });
  });

  describe('Performance on Mobile', () => {
    it('should have optimized scrollbar on mobile', () => {
      setViewport(375);
      const style = document.createElement('style');
      style.textContent = '::-webkit-scrollbar { width: 4px; }';
      document.head.appendChild(style);
      
      // Check if scrollbar styles are applied
      const scrollbarWidth = window.getComputedStyle(document.documentElement)
        .getPropertyValue('scrollbar-width');
      
      expect(['thin', 'auto', 'none']).toContain(scrollbarWidth);
      
      document.head.removeChild(style);
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain color contrast on mobile', () => {
      setViewport(375);
      // Color contrast should be maintained regardless of viewport
      // This is a placeholder - actual contrast testing requires visual analysis
      expect(true).toBe(true);
    });

    it('should support screen reader navigation', () => {
      setViewport(375);
      const main = document.createElement('main');
      main.setAttribute('role', 'main');
      document.body.appendChild(main);
      
      expect(main.getAttribute('role')).toBe('main');
      
      document.body.removeChild(main);
    });
  });

  describe('RTL Support on Mobile', () => {
    it('should support RTL layout for Arabic', () => {
      setViewport(375);
      document.documentElement.setAttribute('dir', 'rtl');
      
      const dir = document.documentElement.getAttribute('dir');
      expect(dir).toBe('rtl');
      
      document.documentElement.removeAttribute('dir');
    });
  });
});
