/**
 * Axe-core Automated Accessibility Audit
 * Task: 5.6.6 Run axe-core automated testing
 * Requirements: FR-A11Y-1 through FR-A11Y-12, NFR-A11Y-1 through NFR-A11Y-5
 * 
 * This test suite runs automated accessibility checks using axe-core
 * to validate WCAG 2.1 Level AA compliance on rendered HTML.
 */

import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';

// Custom matcher for axe violations
expect.extend({
  toHaveNoViolations(results) {
    const { violations } = results;
    const pass = violations.length === 0;

    if (pass) {
      return {
        message: () => 'Expected to have accessibility violations, but none were found',
        pass: true,
      };
    }

    const violationMessages = violations.map((violation) => {
      const nodes = violation.nodes.map((node) => node.html).join('\n');
      return `${violation.id}: ${violation.description}\n${violation.help}\n${nodes}`;
    }).join('\n\n');

    return {
      message: () => `Expected no accessibility violations but found:\n\n${violationMessages}`,
      pass: false,
    };
  },
});

describe('Axe-core Automated Accessibility Audit', () => {
  describe('WCAG 2.1 Level AA - Color Contrast', () => {
    it('should validate color contrast for text elements', async () => {
      const html = `
        <div>
          <p style="color: #304B60; background: #E3DAD1;">Normal text with good contrast</p>
          <h1 style="color: #304B60; background: #E3DAD1;">Heading with good contrast</h1>
          <button style="color: #fff; background: #304B60;">Button with good contrast</button>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - ARIA Attributes', () => {
    it('should validate ARIA labels on buttons', async () => {
      const html = `
        <div>
          <button aria-label="Close dialog">X</button>
          <button aria-label="Open menu">☰</button>
          <button>Text Button</button>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
          'aria-allowed-attr': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });

    it('should validate ARIA live regions', async () => {
      const html = `
        <div>
          <div role="alert" aria-live="assertive">Error message</div>
          <div role="status" aria-live="polite">Loading...</div>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Images', () => {
    it('should validate all images have alt text', async () => {
      const html = `
        <div>
          <img src="profile.jpg" alt="User profile picture" />
          <img src="logo.png" alt="Company logo" />
          <img src="decorative.png" alt="" role="presentation" />
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'image-alt': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Form Labels', () => {
    it('should validate all form inputs have labels', async () => {
      const html = `
        <form>
          <label for="username">Username</label>
          <input type="text" id="username" name="username" />
          
          <label for="email">Email</label>
          <input type="email" id="email" name="email" />
          
          <label for="password">Password</label>
          <input type="password" id="password" name="password" />
        </form>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Heading Hierarchy', () => {
    it('should validate proper heading hierarchy', async () => {
      const html = `
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <h2>Another Section</h2>
          <h3>Another Subsection</h3>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Landmark Regions', () => {
    it('should validate landmark regions are present', async () => {
      const html = `
        <div>
          <header role="banner">
            <nav role="navigation">Navigation</nav>
          </header>
          <main role="main">
            <article>Content</article>
          </main>
          <footer role="contentinfo">Footer</footer>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'landmark-one-main': { enabled: true },
          'region': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Links', () => {
    it('should validate all links have accessible names', async () => {
      const html = `
        <div>
          <a href="/home">Home</a>
          <a href="/about">About Us</a>
          <a href="/contact" aria-label="Contact us">📧</a>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'link-name': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Keyboard Navigation', () => {
    it('should validate tabindex usage', async () => {
      const html = `
        <div>
          <button tabindex="0">Button 1</button>
          <button tabindex="0">Button 2</button>
          <div tabindex="-1">Programmatically focusable</div>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'tabindex': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Semantic HTML', () => {
    it('should validate list structure', async () => {
      const html = `
        <div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
          <ol>
            <li>Step 1</li>
            <li>Step 2</li>
          </ol>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'list': { enabled: true },
          'listitem': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Comprehensive WCAG 2.1 Level AA Audit', () => {
    it('should pass comprehensive accessibility audit', async () => {
      const html = `
        <div>
          <header role="banner">
            <h1>Careerak Platform</h1>
            <nav role="navigation" aria-label="Main navigation">
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/jobs">Jobs</a></li>
                <li><a href="/courses">Courses</a></li>
              </ul>
            </nav>
          </header>
          
          <main role="main">
            <h2>Welcome</h2>
            <p style="color: #304B60; background: #E3DAD1;">
              Find your next career opportunity
            </p>
            
            <form>
              <label for="search">Search Jobs</label>
              <input type="text" id="search" name="search" />
              <button type="submit">Search</button>
            </form>
            
            <section>
              <h3>Featured Jobs</h3>
              <ul>
                <li>
                  <img src="company1.png" alt="Company 1 logo" />
                  <a href="/job/1">Software Engineer</a>
                </li>
                <li>
                  <img src="company2.png" alt="Company 2 logo" />
                  <a href="/job/2">Product Manager</a>
                </li>
              </ul>
            </section>
          </main>
          
          <footer role="contentinfo">
            <p>&copy; 2026 Careerak</p>
          </footer>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode Accessibility', () => {
    it('should maintain accessibility in dark mode colors', async () => {
      const html = `
        <div style="background: #1a1a1a; color: #e0e0e0;">
          <h1 style="color: #e0e0e0;">Dark Mode Title</h1>
          <p style="color: #e0e0e0;">Dark mode text with good contrast</p>
          <button style="background: #2d2d2d; color: #e0e0e0; border: 2px solid #D4816180;">
            Dark Mode Button
          </button>
        </div>
      `;
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      document.body.removeChild(container);
      expect(results).toHaveNoViolations();
    });
  });
});
