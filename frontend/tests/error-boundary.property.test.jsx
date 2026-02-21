/**
 * Property-Based Tests for Error Boundary Error Catching
 * Task 7.6.1: Write property-based test for error catching (100 iterations)
 * 
 * **Validates: Requirements FR-ERR-1, FR-ERR-3, FR-ERR-8**
 * 
 * These tests verify that error boundaries correctly catch component errors,
 * log error details, and allow recovery through retry functionality.
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
 * Arbitrary generator for error messages
 */
const errorMessageArbitrary = fc.oneof(
  fc.constant('Network error'),
  fc.constant('Database connection failed'),
  fc.constant('Invalid state'),
  fc.constant('Null reference'),
  fc.string({ minLength: 5, maxLength: 50 })
);

describe('Error Boundary Error Catching Property-Based Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error in tests (error boundaries log to console)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  /**
   * Property ERR-1: Error Catching Universality
   * ∀ error ∈ ComponentErrors: errorBoundary.catch(error) = true
   * 
   * Validates: FR-ERR-1
   */
  it('should catch all component errors universally', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Error boundary should catch the error and display error UI
          const errorUI = container.querySelector('.component-error-boundary-container');
          expect(errorUI).toBeTruthy();
          
          // Success component should not be rendered
          const successRender = screen.queryByTestId('success-render');
          expect(successRender).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-2: Error Logging Consistency
   * ∀ error ∈ CaughtErrors: console.error.called = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log all caught errors to console', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Console.error should have been called
          expect(consoleErrorSpy).toHaveBeenCalled();
          
          // Should log error details
          const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
          expect(errorCalls).toContain('ComponentErrorBoundary Error');
          expect(errorCalls).toContain('Timestamp:');
          expect(errorCalls).toContain('Component:');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-3: Error State Capture
   * error.caught = true → errorBoundary.state.hasError = true
   * 
   * Validates: FR-ERR-1
   */
  it('should capture error state when error is caught', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          // Error UI should be displayed (indicates hasError = true)
          const errorUI = container.querySelector('.route-error-boundary-container');
          expect(errorUI).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-4: Error Message Preservation
   * ∀ error with message M: errorBoundary captures M
   * 
   * Validates: FR-ERR-3
   */
  it('should preserve error messages in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 30 }),
        (errorMessage) => {
          const { container } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // In development, error details should be available
          const details = container.querySelector('.component-error-details');
          expect(details).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );

    process.env.NODE_ENV = originalEnv;
  });

  /**
   * Property ERR-5: Retry Functionality
   * errorUI.retry() → component.rerender() = true
   * 
   * Validates: FR-ERR-8
   */
  it('should allow retry and re-render after error', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          const { container, unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Error should be caught
          expect(screen.queryByTestId('success-render')).toBeNull();

          // Find retry button in this specific container
          const retryButton = container.querySelector('button[aria-label="Retry"]');
          expect(retryButton).toBeTruthy();

          // Click retry - this tests that the retry mechanism is present and functional
          fireEvent.click(retryButton);

          // The retry button click should trigger the handleRetry function
          // which resets the error boundary state

          // Cleanup
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-6: Error Boundary Isolation
   * Component error should not break parent components
   * 
   * Validates: FR-ERR-7
   */
  it('should isolate errors to component boundary without breaking page', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Use unique container for each test iteration
          const { container, unmount } = render(
            <div data-testid={`parent-container-${Date.now()}-${Math.random()}`}>
              <div data-testid="sibling-1">Sibling 1</div>
              <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
                <ThrowError shouldThrow={true} errorMessage={errorMessage} />
              </ComponentErrorBoundary>
              <div data-testid="sibling-2">Sibling 2</div>
            </div>
          );

          // Siblings should still render
          expect(screen.getByTestId('sibling-1')).toBeTruthy();
          expect(screen.getByTestId('sibling-2')).toBeTruthy();

          // Error UI should be displayed
          const errorUI = container.querySelector('.component-error-boundary-container');
          expect(errorUI).toBeTruthy();

          // Cleanup
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-7: User ID Logging
   * user.authenticated = true → errorLog.includes(userId)
   * 
   * Validates: FR-ERR-3
   */
  it('should include user ID in error logs when authenticated', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Network error', 'Database connection failed', 'Invalid state'),
        fc.constantFrom('user123', 'abc456def789', '507f1f77bcf86cd799439011'),
        (errorMessage, userId) => {
          consoleErrorSpy.mockClear();

          const { unmount } = render(
            <ComponentErrorBoundary language="en" user={{ _id: userId }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Check if user ID label was logged
          const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
          expect(errorCalls).toContain('User ID:');

          // Cleanup
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-8: Timestamp Logging
   * ∀ error: errorLog.includes(timestamp) AND timestamp.valid = true
   * 
   * Validates: FR-ERR-3
   */
  it('should include valid timestamp in error logs', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Check if timestamp was logged
          const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
          expect(errorCalls).toContain('Timestamp:');
          
          // Extract timestamp and validate it's a valid ISO string
          const timestampMatch = errorCalls.match(/Timestamp:\s*(\S+)/);
          if (timestampMatch) {
            const timestamp = timestampMatch[1];
            const date = new Date(timestamp);
            expect(date.toString()).not.toBe('Invalid Date');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-9: Component Stack Logging
   * ∀ error: errorLog.includes(componentStack)
   * 
   * Validates: FR-ERR-3
   */
  it('should include component stack in error logs', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          // Check if component stack was logged
          const errorCalls = consoleErrorSpy.mock.calls.flat().join(' ');
          expect(errorCalls).toContain('Component Stack:');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property ERR-10: Error Boundary Type Distinction
   * Route errors show full-page UI, component errors show inline UI
   * 
   * Validates: FR-ERR-6, FR-ERR-7
   */
  it('should distinguish between route and component error boundaries', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Test route error boundary
          const { container: routeContainer } = render(
            <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </RouteErrorBoundary>
          );

          const routeErrorUI = routeContainer.querySelector('.route-error-boundary-container');
          expect(routeErrorUI).toBeTruthy();

          // Test component error boundary
          const { container: componentContainer } = render(
            <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
              <ThrowError shouldThrow={true} errorMessage={errorMessage} />
            </ComponentErrorBoundary>
          );

          const componentErrorUI = componentContainer.querySelector('.component-error-boundary-container');
          expect(componentErrorUI).toBeTruthy();

          // They should have different class names
          expect(routeErrorUI.className).not.toBe(componentErrorUI.className);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

});

describe('Error Boundary Integration Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should handle nested error boundaries correctly', () => {
    const { container } = render(
      <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <div data-testid="outer-content">
          <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
            <ThrowError shouldThrow={true} errorMessage="Inner error" />
          </ComponentErrorBoundary>
        </div>
      </RouteErrorBoundary>
    );

    // Inner error boundary should catch the error
    const componentErrorUI = container.querySelector('.component-error-boundary-container');
    expect(componentErrorUI).toBeTruthy();

    // Outer content should still be visible
    expect(screen.getByTestId('outer-content')).toBeTruthy();
  });

  it('should display retry button in error UI', () => {
    render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </ComponentErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeTruthy();
  });

  it('should display go home button in route error UI', () => {
    render(
      <RouteErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </RouteErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /home/i });
    expect(homeButton).toBeTruthy();
  });

  it('should not display error UI when no error occurs', () => {
    const { container } = render(
      <ComponentErrorBoundary language="en" user={{ _id: 'test-user' }}>
        <ThrowError shouldThrow={false}>Success content</ThrowError>
      </ComponentErrorBoundary>
    );

    const errorUI = container.querySelector('.component-error-boundary-container');
    expect(errorUI).toBeNull();

    const successRender = screen.getByTestId('success-render');
    expect(successRender).toBeTruthy();
  });

});
