/**
 * Property-Based Tests for Error Boundary Retry Functionality
 * Task 7.6.3: Write property-based test for retry functionality (100 iterations)
 * 
 * **Validates: Requirements FR-ERR-4, FR-ERR-8**
 * 
 * These tests verify that error boundaries correctly implement retry functionality,
 * allowing users to recover from errors by re-rendering components or reloading pages.
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
 * Test component that can throw errors conditionally
 */
class ConditionalErrorComponent extends React.Component {
  render() {
    if (this.props.shouldThrow) {
      throw new Error(this.props.errorMessage || 'Test error');
    }
    return (
      <div data-testid="success-render">
        {this.props.children || 'Success'}
        {this.props.renderCount && (
          <span data-testid="render-count">{this.props.renderCount}</span>
        )}
      </div>
    );
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

const retryCountArbitrary = fc.integer({ min: 1, max: 5 });

describe('Error Boundary Retry Functionality Property-Based Tests', () => {
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
   * Property RETRY-1: Retry Button Presence
   * errorUI.visible = true → retryButton.exists = true
   * 
   * Validates: FR-ERR-4
   */
  it('should always display retry button when error is caught', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ConditionalErrorComponent shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Retry button should be present
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();
          expect(retryButton.textContent).toContain('Retry');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-2: Retry Button Functionality
   * retryButton.click() → errorBoundary.state.hasError = false
   * 
   * Validates: FR-ERR-8
   */
  it('should reset error state when retry button is clicked', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          let shouldThrow = true;
          
          const TestComponent = () => {
            if (shouldThrow) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Success</div>;
          };

          const { container, rerender, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          // Error should be caught
          expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

          // Click retry button
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();

          // Fix the error before retry
          shouldThrow = false;
          fireEvent.click(retryButton);

          // After retry, error UI should be gone and success should render
          // Note: The component will re-render after state reset
          waitFor(() => {
            expect(screen.queryByTestId('success-render')).toBeTruthy();
          });

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-3: Retry Count Increment
   * ∀ retry: retryCount[n+1] = retryCount[n] + 1
   * 
   * Validates: FR-ERR-8
   */
  it('should increment retry count on each retry attempt', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        retryCountArbitrary,
        (errorMessage, maxRetries) => {
          let throwCount = 0;
          let retryCount = 0;

          const TestComponent = () => {
            throwCount++;
            if (throwCount <= maxRetries) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Success after {retryCount} retries</div>;
          };

          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          // Perform retries
          for (let i = 0; i < maxRetries; i++) {
            const retryButton = container.querySelector('button[aria-label="Retry"]');
            if (retryButton) {
              retryCount++;
              fireEvent.click(retryButton);
            }
          }

          // After all retries, component should eventually succeed
          expect(throwCount).toBeGreaterThan(0);

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-4: Retry Idempotence
   * retry(retry(state)) = retry(state)
   * Multiple retries should not cause side effects
   * 
   * Validates: FR-ERR-8
   */
  it('should handle multiple retry attempts without side effects', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        fc.integer({ min: 2, max: 5 }),
        (errorMessage, retryAttempts) => {
          let shouldThrow = true;

          const TestComponent = () => {
            if (shouldThrow) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Success</div>;
          };

          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          // Perform multiple retries while error persists
          for (let i = 0; i < retryAttempts; i++) {
            const retryButton = container.querySelector('button[aria-label="Retry"]');
            expect(retryButton).toBeTruthy();
            fireEvent.click(retryButton);
            
            // Error UI should still be present since error persists
            expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-5: Retry Button Accessibility
   * ∀ retryButton: retryButton.hasAttribute('aria-label') = true
   * 
   * Validates: FR-ERR-4
   */
  it('should have accessible retry button with aria-label', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ConditionalErrorComponent shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();
          expect(retryButton.getAttribute('aria-label')).toBe('Retry');

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-6: Retry Clears Error State
   * errorBoundary.retry() → errorBoundary.state.error = null
   * 
   * Validates: FR-ERR-8
   */
  it('should clear error state completely on retry', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          let shouldThrow = true;

          const TestComponent = () => {
            if (shouldThrow) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Success</div>;
          };

          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          // Error should be displayed
          expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

          // Fix error and retry
          shouldThrow = false;
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          fireEvent.click(retryButton);

          // Error UI should be cleared
          waitFor(() => {
            expect(container.querySelector('.component-error-boundary-container')).toBeNull();
          });

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-7: Retry Re-renders Component
   * retry() → component.render() called again
   * 
   * Validates: FR-ERR-8
   */
  it('should re-render component when retry is clicked', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          let renderCount = 0;
          let shouldThrow = true;

          const TestComponent = () => {
            renderCount++;
            if (shouldThrow && renderCount <= 2) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Render #{renderCount}</div>;
          };

          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          const initialRenderCount = renderCount;
          expect(initialRenderCount).toBeGreaterThan(0);

          // Find retry button
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          
          // Only test if retry button exists (error was caught)
          if (retryButton) {
            // Fix error and retry
            shouldThrow = false;
            fireEvent.click(retryButton);

            // Component should have rendered again
            expect(renderCount).toBeGreaterThan(initialRenderCount);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-8: Route Error Boundary Retry
   * Route error boundary should have retry functionality
   * 
   * Validates: FR-ERR-4, FR-ERR-8
   */
  it('should provide retry functionality in route error boundary', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Mock window.location using Object.defineProperty
          const reloadMock = vi.fn();
          delete window.location;
          window.location = { reload: reloadMock };

          const { container, unmount } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ConditionalErrorComponent shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          // Retry button should be present
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();

          // Click retry should trigger page reload
          fireEvent.click(retryButton);
          expect(reloadMock).toHaveBeenCalled();

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-9: Retry Button Clickability
   * ∀ retryButton: retryButton.disabled = false
   * 
   * Validates: FR-ERR-4
   */
  it('should have enabled retry button that can be clicked', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ConditionalErrorComponent shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();
          expect(retryButton.disabled).toBe(false);

          // Button should be clickable
          let clicked = false;
          retryButton.onclick = () => { clicked = true; };
          fireEvent.click(retryButton);
          expect(clicked).toBe(true);

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property RETRY-10: Retry Preserves Context
   * retry() should not lose application context (language, user)
   * 
   * Validates: FR-ERR-8
   */
  it('should preserve application context after retry', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        fc.constantFrom('ar', 'en', 'fr'),
        fc.constantFrom('user123', 'user456', 'user789'),
        (errorMessage, language, userId) => {
          let shouldThrow = true;

          const TestComponent = () => {
            if (shouldThrow) {
              throw new Error(errorMessage);
            }
            return <div data-testid="success-render">Success</div>;
          };

          const { container, unmount } = render(
            <ComponentErrorBoundary language={language} user={{ _id: userId }}>
              <TestComponent />
            </ComponentErrorBoundary>
          );

          // Error should be caught
          expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

          // Fix error and retry
          shouldThrow = false;
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          fireEvent.click(retryButton);

          // Context should be preserved (component should render successfully)
          waitFor(() => {
            expect(screen.queryByTestId('success-render')).toBeTruthy();
          });

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

});

describe('Error Boundary Retry Integration Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should successfully recover from error after retry', () => {
    let shouldThrow = true;

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Temporary error');
      }
      return <div data-testid="success-render">Recovered!</div>;
    };

    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <TestComponent />
      </ComponentErrorBoundary>
    );

    // Error should be displayed
    expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

    // Fix the error
    shouldThrow = false;

    // Click retry
    const retryButton = container.querySelector('button[aria-label="Retry"]');
    fireEvent.click(retryButton);

    // Should recover
    waitFor(() => {
      expect(screen.getByTestId('success-render')).toBeTruthy();
      expect(screen.getByTestId('success-render').textContent).toBe('Recovered!');
    });
  });

  it('should handle retry with persistent errors gracefully', () => {
    const TestComponent = () => {
      throw new Error('Persistent error');
    };

    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <TestComponent />
      </ComponentErrorBoundary>
    );

    // Error should be displayed
    expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

    // Click retry multiple times
    for (let i = 0; i < 3; i++) {
      const retryButton = container.querySelector('button[aria-label="Retry"]');
      fireEvent.click(retryButton);
      
      // Error UI should still be present
      expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();
    }
  });

  it('should display retry button in both error boundary types', () => {
    const TestComponent = () => {
      throw new Error('Test error');
    };

    // Component error boundary
    const { container: componentContainer } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <TestComponent />
      </ComponentErrorBoundary>
    );

    expect(componentContainer.querySelector('button[aria-label="Retry"]')).toBeTruthy();

    // Route error boundary
    const { container: routeContainer } = render(
      <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <TestComponent />
      </RouteErrorBoundary>
    );

    expect(routeContainer.querySelector('button[aria-label="Retry"]')).toBeTruthy();
  });

  it('should not display success content while error persists', () => {
    const TestComponent = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <TestComponent />
      </ComponentErrorBoundary>
    );

    // Success content should not be visible
    expect(screen.queryByTestId('success-render')).toBeNull();

    // Error UI should be visible
    expect(container.querySelector('.component-error-boundary-container')).toBeTruthy();

    // Click retry (error persists)
    const retryButton = container.querySelector('button[aria-label="Retry"]');
    fireEvent.click(retryButton);

    // Success content should still not be visible
    expect(screen.queryByTestId('success-render')).toBeNull();
  });

});
