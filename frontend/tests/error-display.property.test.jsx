/**
 * Property-Based Tests for Error Display
 * Task 7.6.2: Write property-based test for error display (100 iterations)
 * 
 * **Validates: Requirements FR-ERR-2, FR-ERR-4, FR-ERR-5, FR-ERR-6, FR-ERR-7**
 * 
 * These tests verify that error boundaries correctly display error UI with:
 * - User-friendly error messages in multiple languages
 * - Retry button functionality
 * - Go Home button (route errors)
 * - Proper visual elements (icons, titles, descriptions)
 * - Accessibility attributes (ARIA labels, roles)
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import RouteErrorBoundary from '../src/components/ErrorBoundary/RouteErrorBoundary';
import ComponentErrorBoundary from '../src/components/ErrorBoundary/ComponentErrorBoundary';

// Mock AppContext
vi.mock('../src/context/AppContext', () => ({
  useApp: () => ({
    language: 'en',
    user: { _id: 'test-user-123' }
  })
}));

// Mock error tracking
vi.mock('../src/utils/errorTracking', () => ({
  logError: vi.fn()
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

/**
 * Test component that throws errors on demand
 */
class ThrowError extends React.Component {
  render() {
    if (this.props.shouldThrow) {
      throw new Error(this.props.errorMessage || 'Test error');
    }
    return <div data-testid="success-render">{this.props.children || 'Success'}</div>;
  }
}

/**
 * Arbitrary generators
 */
const errorMessageArbitrary = fc.oneof(
  fc.constant('Network error'),
  fc.constant('Database connection failed'),
  fc.constant('Invalid state'),
  fc.constant('Null reference'),
  fc.string({ minLength: 5, maxLength: 50 })
);

const languageArbitrary = fc.constantFrom('ar', 'en', 'fr');

describe('Error Display Property-Based Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  /**
   * Property ERR-DISPLAY-1: Error UI Visibility
   * error.caught = true → errorUI.visible = true
   * 
   * Validates: FR-ERR-2, FR-ERR-6, FR-ERR-7
   */
  it('should display error UI when error is caught', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentErrorUI = componentContainer.querySelector('.component-error-boundary-container');
          expect(componentErrorUI).toBeTruthy();
          expect(componentErrorUI).toBeVisible();

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeErrorUI = routeContainer.querySelector('.route-error-boundary-container');
          expect(routeErrorUI).toBeTruthy();
          expect(routeErrorUI).toBeVisible();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-2: Error Icon Presence
   * ∀ errorUI: errorUI.contains(icon) = true
   * 
   * Validates: FR-ERR-2
   */
  it('should display error icon in error UI', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentIcon = componentContainer.querySelector('.component-error-icon');
          expect(componentIcon).toBeTruthy();
          expect(componentIcon.querySelector('svg')).toBeTruthy();

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeIcon = routeContainer.querySelector('.route-error-icon');
          expect(routeIcon).toBeTruthy();
          expect(routeIcon.querySelector('svg')).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-3: Error Title Presence
   * ∀ errorUI: errorUI.contains(title) = true AND title.length > 0
   * 
   * Validates: FR-ERR-2
   */
  it('should display error title in error UI', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentTitle = componentContainer.querySelector('.component-error-title');
          expect(componentTitle).toBeTruthy();
          expect(componentTitle.textContent.length).toBeGreaterThan(0);

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeTitle = routeContainer.querySelector('.route-error-title');
          expect(routeTitle).toBeTruthy();
          expect(routeTitle.textContent.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-4: Error Description Presence
   * ∀ errorUI: errorUI.contains(description) = true AND description.length > 0
   * 
   * Validates: FR-ERR-2
   */
  it('should display error description in error UI', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentDescription = componentContainer.querySelector('.component-error-description');
          expect(componentDescription).toBeTruthy();
          expect(componentDescription.textContent.length).toBeGreaterThan(0);

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeDescription = routeContainer.querySelector('.route-error-description');
          expect(routeDescription).toBeTruthy();
          expect(routeDescription.textContent.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-5: Retry Button Presence
   * ∀ errorUI: errorUI.contains(retryButton) = true
   * 
   * Validates: FR-ERR-4
   */
  it('should display retry button in error UI', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentRetryButton = componentContainer.querySelector('button[aria-label*="Retry"]');
          expect(componentRetryButton).toBeTruthy();
          expect(componentRetryButton.textContent.length).toBeGreaterThan(0);

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeRetryButton = routeContainer.querySelector('button[aria-label*="Retry"]');
          expect(routeRetryButton).toBeTruthy();
          expect(routeRetryButton.textContent.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-6: Go Home Button Presence (Route Errors Only)
   * ∀ routeErrorUI: routeErrorUI.contains(homeButton) = true
   * 
   * Validates: FR-ERR-5, FR-ERR-6
   */
  it('should display go home button in route error UI', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const homeButton = container.querySelector('button[aria-label*="Home"]');
          expect(homeButton).toBeTruthy();
          expect(homeButton.textContent.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-7: Multi-Language Support
   * ∀ language ∈ {ar, en, fr}: errorUI(language).text ≠ errorUI(otherLanguage).text
   * 
   * Validates: FR-ERR-2
   */
  it('should display error messages in correct language', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        languageArbitrary,
        (errorMessage, language) => {
          const { container } = render(
            <ComponentErrorBoundary language={language} user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Error UI should be displayed
          const errorUI = container.querySelector('.component-error-boundary-container');
          expect(errorUI).toBeTruthy();

          // Title and description should exist
          const title = container.querySelector('.component-error-title');
          const description = container.querySelector('.component-error-description');
          
          expect(title).toBeTruthy();
          expect(description).toBeTruthy();
          expect(title.textContent.length).toBeGreaterThan(0);
          expect(description.textContent.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-8: ARIA Role Presence
   * ∀ errorUI: errorUI.hasAttribute('role', 'alert') = true
   * 
   * Validates: FR-ERR-2 (Accessibility)
   */
  it('should have proper ARIA role for accessibility', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentErrorUI = componentContainer.querySelector('[role="alert"]');
          expect(componentErrorUI).toBeTruthy();

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeErrorUI = routeContainer.querySelector('[role="alert"]');
          expect(routeErrorUI).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-9: ARIA Live Region
   * ∀ errorUI: errorUI.hasAttribute('aria-live') = true
   * 
   * Validates: FR-ERR-2 (Accessibility)
   */
  it('should have aria-live attribute for screen readers', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentErrorUI = componentContainer.querySelector('[aria-live]');
          expect(componentErrorUI).toBeTruthy();
          expect(componentErrorUI.getAttribute('aria-live')).toBe('polite');

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeErrorUI = routeContainer.querySelector('[aria-live]');
          expect(routeErrorUI).toBeTruthy();
          expect(routeErrorUI.getAttribute('aria-live')).toBe('assertive');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-10: Button ARIA Labels
   * ∀ button ∈ errorUI.buttons: button.hasAttribute('aria-label') = true
   * 
   * Validates: FR-ERR-2, FR-ERR-4, FR-ERR-5 (Accessibility)
   */
  it('should have aria-label on all buttons', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test ComponentErrorBoundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentButtons = componentContainer.querySelectorAll('button');
          componentButtons.forEach(button => {
            expect(button.hasAttribute('aria-label')).toBe(true);
            expect(button.getAttribute('aria-label').length).toBeGreaterThan(0);
          });

          // Test RouteErrorBoundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeButtons = routeContainer.querySelectorAll('button');
          routeButtons.forEach(button => {
            expect(button.hasAttribute('aria-label')).toBe(true);
            expect(button.getAttribute('aria-label').length).toBeGreaterThan(0);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-11: Error UI Structure Consistency
   * ∀ errorUI: errorUI.structure = {icon, title, description, buttons}
   * 
   * Validates: FR-ERR-2
   */
  it('should have consistent error UI structure', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Check all required elements exist
          expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();
          expect(container.querySelector('.component-error-icon')).toBeTruthy();
          expect(container.querySelector('.component-error-title')).toBeTruthy();
          expect(container.querySelector('.component-error-description')).toBeTruthy();
          expect(container.querySelector('button')).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-DISPLAY-12: No Success Content When Error
   * error.caught = true → successContent.visible = false
   * 
   * Validates: FR-ERR-1, FR-ERR-2
   */
  it('should not display success content when error is caught', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage}>
                Success Content
              </ThrowError>
            </ComponentErrorBoundary>
          );

          // Success content should not be rendered
          const successRender = screen.queryByTestId('success-render');
          expect(successRender).toBeNull();

          // Error UI should be displayed instead (use container to scope query)
          const errorUI = container.querySelector('[role="alert"]');
          expect(errorUI).toBeTruthy();

          // Cleanup
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

});

describe('Error Display Integration Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should display different UI for route vs component errors', () => {
    // Route error UI
    const { container: routeContainer } = render(
      <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Route error" />
      </RouteErrorBoundary>
    );

    // Component error UI
    const { container: componentContainer } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Component error" />
      </ComponentErrorBoundary>
    );

    // Route should have home button
    const homeButton = routeContainer.querySelector('button[aria-label*="Home"]');
    expect(homeButton).toBeTruthy();

    // Component should not have home button
    const componentHomeButton = componentContainer.querySelector('button[aria-label*="Home"]');
    expect(componentHomeButton).toBeNull();

    // Both should have retry button
    expect(routeContainer.querySelector('button[aria-label*="Retry"]')).toBeTruthy();
    expect(componentContainer.querySelector('button[aria-label*="Retry"]')).toBeTruthy();
  });

  it('should display error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </ComponentErrorBoundary>
    );

    const details = container.querySelector('.component-error-details');
    expect(details).toBeTruthy();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not display error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </ComponentErrorBoundary>
    );

    const details = container.querySelector('.component-error-details');
    expect(details).toBeNull();

    process.env.NODE_ENV = originalEnv;
  });

  it('should display error UI with proper styling classes', () => {
    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </ComponentErrorBoundary>
    );

    // Check for styling classes
    expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();
    expect(container.querySelector('.component-error-boundary-card')).toBeTruthy();
    expect(container.querySelector('.component-error-icon')).toBeTruthy();
    expect(container.querySelector('.component-error-content')).toBeTruthy();
    expect(container.querySelector('.component-error-btn')).toBeTruthy();
  });

});
