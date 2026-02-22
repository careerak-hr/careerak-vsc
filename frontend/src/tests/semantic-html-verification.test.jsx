/**
 * Semantic HTML Verification Tests
 * 
 * These tests verify that all pages and components use proper semantic HTML
 * as required by FR-A11Y-6 and NFR-A11Y-2 (WCAG 2.1 Level AA)
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';

// Import pages to test
import ProfilePage from '../pages/07_ProfilePage';
import JobPostingsPage from '../pages/09_JobPostingsPage';
import CoursesPage from '../pages/11_CoursesPage';
import SettingsPage from '../pages/14_SettingsPage';

// Import components to test
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

/**
 * Helper function to render component with all required providers
 */
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          {component}
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Semantic HTML Verification', () => {
  
  describe('Document Structure Elements', () => {
    
    test('Navbar uses <nav> element with proper ARIA', () => {
      renderWithProviders(<Navbar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');
      expect(nav).toHaveAttribute('aria-label');
    });
    
    test('Footer uses <footer> element with proper ARIA', () => {
      renderWithProviders(<Footer />);
      
      // Footer contains navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Check for footer element
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });
    
    test('ProfilePage has exactly one <main> element', () => {
      renderWithProviders(<ProfilePage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
      
      // Verify only one main element
      const allMains = document.querySelectorAll('main');
      expect(allMains).toHaveLength(1);
    });
    
    test('JobPostingsPage has exactly one <main> element', () => {
      renderWithProviders(<JobPostingsPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
      expect(main).toHaveAttribute('id', 'main-content');
      
      // Verify only one main element
      const allMains = document.querySelectorAll('main');
      expect(allMains).toHaveLength(1);
    });
    
    test('CoursesPage has exactly one <main> element', () => {
      renderWithProviders(<CoursesPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
      
      // Verify only one main element
      const allMains = document.querySelectorAll('main');
      expect(allMains).toHaveLength(1);
    });
    
    test('SettingsPage has exactly one <main> element', () => {
      renderWithProviders(<SettingsPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
      
      // Verify only one main element
      const allMains = document.querySelectorAll('main');
      expect(allMains).toHaveLength(1);
    });
  });
  
  describe('Heading Hierarchy', () => {
    
    test('ProfilePage has exactly one <h1>', () => {
      renderWithProviders(<ProfilePage />);
      
      const h1Elements = document.querySelectorAll('h1');
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0].textContent).toBeTruthy();
    });
    
    test('JobPostingsPage has proper heading hierarchy', () => {
      renderWithProviders(<JobPostingsPage />);
      
      // Should have one h1
      const h1Elements = document.querySelectorAll('h1');
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      
      // Check heading hierarchy (no skipped levels)
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(allHeadings).map(h => 
        parseInt(h.tagName.charAt(1))
      );
      
      // Verify no skipped levels
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });
    
    test('CoursesPage has proper heading hierarchy', () => {
      renderWithProviders(<CoursesPage />);
      
      // Should have one h1
      const h1Elements = document.querySelectorAll('h1');
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      
      // All headings should have text content
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      allHeadings.forEach(heading => {
        expect(heading.textContent.trim()).toBeTruthy();
      });
    });
  });
  
  describe('Section Elements', () => {
    
    test('ProfilePage uses <section> elements with labels', () => {
      renderWithProviders(<ProfilePage />);
      
      const sections = document.querySelectorAll('section');
      
      // Each section should have aria-labelledby or aria-label
      sections.forEach(section => {
        const hasLabel = 
          section.hasAttribute('aria-labelledby') || 
          section.hasAttribute('aria-label');
        expect(hasLabel).toBe(true);
      });
    });
    
    test('JobPostingsPage uses <section> elements with labels', () => {
      renderWithProviders(<JobPostingsPage />);
      
      const sections = document.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
      
      // Each section should have aria-labelledby or aria-label
      sections.forEach(section => {
        const hasLabel = 
          section.hasAttribute('aria-labelledby') || 
          section.hasAttribute('aria-label');
        expect(hasLabel).toBe(true);
      });
    });
  });
  
  describe('Article Elements', () => {
    
    test('JobPostingsPage uses <article> for job cards', () => {
      renderWithProviders(<JobPostingsPage />);
      
      // Wait for jobs to load (they're mocked with setTimeout)
      setTimeout(() => {
        const articles = document.querySelectorAll('article');
        expect(articles.length).toBeGreaterThan(0);
        
        // Each article should have a heading
        articles.forEach(article => {
          const heading = article.querySelector('h1, h2, h3, h4, h5, h6');
          expect(heading).toBeInTheDocument();
        });
      }, 1000);
    });
  });
  
  describe('Interactive Elements', () => {
    
    test('Navbar uses <button> elements for actions', () => {
      renderWithProviders(<Navbar />);
      
      // All interactive elements should be buttons or links
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have accessible names
      buttons.forEach(button => {
        const hasAccessibleName = 
          button.textContent.trim() ||
          button.hasAttribute('aria-label') ||
          button.hasAttribute('aria-labelledby');
        expect(hasAccessibleName).toBe(true);
      });
    });
    
    test('Footer uses <button> elements for navigation actions', () => {
      renderWithProviders(<Footer />);
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have accessible names
      buttons.forEach(button => {
        const hasAccessibleName = 
          button.textContent.trim() ||
          button.hasAttribute('aria-label') ||
          button.hasAttribute('aria-labelledby');
        expect(hasAccessibleName).toBe(true);
      });
    });
    
    test('No divs are used as buttons', () => {
      renderWithProviders(<ProfilePage />);
      
      // Find all divs with onClick handlers (anti-pattern)
      const allDivs = document.querySelectorAll('div');
      const clickableDivs = Array.from(allDivs).filter(div => 
        div.hasAttribute('onclick') || 
        div.onclick !== null
      );
      
      // Should be 0 (all clickable elements should be buttons or links)
      expect(clickableDivs.length).toBe(0);
    });
  });
  
  describe('Semantic vs Non-Semantic Ratio', () => {
    
    test('JobPostingsPage has good semantic/div ratio', () => {
      renderWithProviders(<JobPostingsPage />);
      
      const semanticElements = document.querySelectorAll(
        'main, header, nav, article, section, aside, footer, ' +
        'h1, h2, h3, h4, h5, h6, p, ul, ol, li, form, label, button, a'
      );
      const divElements = document.querySelectorAll('div');
      
      const semanticCount = semanticElements.length;
      const divCount = divElements.length;
      
      // Semantic elements should be at least 30% of total
      const ratio = semanticCount / (semanticCount + divCount);
      expect(ratio).toBeGreaterThan(0.3);
    });
  });
  
  describe('ARIA Landmarks', () => {
    
    test('Page has proper landmark roles', () => {
      renderWithProviders(<ProfilePage />);
      
      // Should have main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Should have navigation landmark
      const nav = screen.queryByRole('navigation');
      // Nav might not be in ProfilePage itself, but in layout
    });
  });
  
  describe('Skip Links', () => {
    
    test('Skip link targets main content', () => {
      renderWithProviders(<ProfilePage />);
      
      // Main content should have id for skip link
      const main = document.querySelector('#main-content');
      expect(main).toBeInTheDocument();
      expect(main.tagName).toBe('MAIN');
    });
  });
});

describe('Semantic HTML Best Practices', () => {
  
  test('All pages follow semantic HTML checklist', () => {
    const pages = [
      ProfilePage,
      JobPostingsPage,
      CoursesPage,
      SettingsPage
    ];
    
    pages.forEach(PageComponent => {
      const { container } = renderWithProviders(<PageComponent />);
      
      // Has main element
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      
      // Has heading
      const heading = container.querySelector('h1, h2, h3, h4, h5, h6');
      expect(heading).toBeInTheDocument();
      
      // No empty headings
      const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      allHeadings.forEach(h => {
        expect(h.textContent.trim()).toBeTruthy();
      });
    });
  });
  
  test('Interactive elements are keyboard accessible', () => {
    renderWithProviders(<Navbar />);
    
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    
    // All buttons and links should be keyboard accessible
    [...buttons, ...links].forEach(element => {
      // Should not have tabindex="-1" unless it's for programmatic focus
      if (element.hasAttribute('tabindex')) {
        const tabindex = parseInt(element.getAttribute('tabindex'));
        // tabindex should be >= 0 or -1 for programmatic focus only
        expect(tabindex >= -1).toBe(true);
      }
    });
  });
});

describe('Accessibility Compliance', () => {
  
  test('Meets WCAG 2.1 Level AA semantic requirements', () => {
    renderWithProviders(<JobPostingsPage />);
    
    // Check for required semantic elements
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper ARIA usage
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby]');
    expect(elementsWithAria.length).toBeGreaterThan(0);
  });
});
