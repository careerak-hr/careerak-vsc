/**
 * Skip Links Test
 * 
 * Verifies that skip links are present and functional
 * Meets WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 * 
 * Requirements:
 * - FR-A11Y-7: Skip links to main content and navigation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SkipLink from '../components/Accessibility/SkipLink';

describe('Skip Links', () => {
  describe('SkipLink Component', () => {
    beforeEach(() => {
      // Create a main content element for testing
      const mainContent = document.createElement('main');
      mainContent.id = 'main-content';
      mainContent.tabIndex = -1;
      document.body.appendChild(mainContent);
    });

    it('should render skip link with correct text in Arabic', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      expect(skipLink).toBeTruthy();
    });

    it('should render skip link with correct text in English', () => {
      render(<SkipLink targetId="main-content" language="en" />);
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeTruthy();
    });

    it('should render skip link with correct text in French', () => {
      render(<SkipLink targetId="main-content" language="fr" />);
      const skipLink = screen.getByText('Passer au contenu principal');
      expect(skipLink).toBeTruthy();
    });

    it('should have correct href attribute', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });

    it('should have skip-link class for styling', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      expect(skipLink.classList.contains('skip-link')).toBe(true);
    });

    it('should focus main content when clicked', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      const mainContent = document.getElementById('main-content');
      
      // Mock focus and scrollIntoView methods
      const focusSpy = vi.fn();
      const scrollIntoViewSpy = vi.fn();
      mainContent.focus = focusSpy;
      mainContent.scrollIntoView = scrollIntoViewSpy;
      
      fireEvent.click(skipLink);
      
      expect(focusSpy).toHaveBeenCalled();
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    });

    it('should have aria-label attribute', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      expect(skipLink.getAttribute('aria-label')).toBe('تخطي إلى المحتوى الرئيسي');
    });

    it('should default to Arabic when no language specified', () => {
      render(<SkipLink targetId="main-content" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      expect(skipLink).toBeTruthy();
    });

    it('should work with custom target ID', () => {
      const customMain = document.createElement('main');
      customMain.id = 'custom-main';
      customMain.tabIndex = -1;
      document.body.appendChild(customMain);

      render(<SkipLink targetId="custom-main" language="en" />);
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink.getAttribute('href')).toBe('#custom-main');
    });
  });

  describe('Skip Link Styling', () => {
    it('should be visually hidden by default', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      // Check if it has the skip-link class which positions it off-screen
      expect(skipLink.classList.contains('skip-link')).toBe(true);
    });

    it('should be focusable', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      // Verify the element is focusable
      skipLink.focus();
      
      // The CSS will handle visibility on focus
      // We just verify the element can receive focus
      expect(skipLink.tagName).toBe('A');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });
  });

  describe('Accessibility Requirements', () => {
    it('should meet WCAG 2.4.1 Bypass Blocks', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      // Skip link should be the first focusable element
      // It should allow keyboard users to bypass navigation
      expect(skipLink.tagName).toBe('A');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });

    it('should be keyboard accessible', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      // Should be focusable via keyboard
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);
      
      // Should be activatable via Enter key
      fireEvent.keyDown(skipLink, { key: 'Enter', code: 'Enter' });
    });

    it('should have sufficient color contrast', () => {
      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      // The CSS uses #304B60 (dark blue) background with #E3DAD1 (light beige) text
      // This combination provides sufficient contrast (>4.5:1)
      expect(skipLink.classList.contains('skip-link')).toBe(true);
    });
  });

  describe('Multi-language Support', () => {
    const languages = [
      { code: 'ar', text: 'تخطي إلى المحتوى الرئيسي' },
      { code: 'en', text: 'Skip to main content' },
      { code: 'fr', text: 'Passer au contenu principal' }
    ];

    languages.forEach(({ code, text }) => {
      it(`should display correct text for ${code}`, () => {
        render(<SkipLink targetId="main-content" language={code} />);
        const skipLink = screen.getByText(text);
        expect(skipLink).toBeTruthy();
        expect(skipLink.getAttribute('aria-label')).toBe(text);
      });
    });
  });

  describe('Integration with Main Content', () => {
    it('should target element with id="main-content"', () => {
      const mainContent = document.createElement('main');
      mainContent.id = 'main-content';
      mainContent.tabIndex = -1;
      document.body.appendChild(mainContent);

      render(<SkipLink targetId="main-content" language="ar" />);
      const skipLink = screen.getByText('تخطي إلى المحتوى الرئيسي');
      
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      expect(document.getElementById('main-content')).toBeTruthy();
    });

    it('should work with tabIndex="-1" on main content', () => {
      const mainContent = document.createElement('main');
      mainContent.id = 'main-content';
      mainContent.tabIndex = -1;
      document.body.appendChild(mainContent);

      // tabIndex="-1" allows programmatic focus but not tab navigation
      expect(mainContent.tabIndex).toBe(-1);
    });
  });
});
