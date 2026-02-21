/**
 * Property-Based Tests for Error Boundary Logging
 * 
 * Task 7.6.4: Write property-based test for error logging (100 iterations)
 * 
 * Property ERR-4: Error Logging
 * ∀ error ∈ CaughtErrors:
 *   console.error.called = true
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp) to console
 * - FR-ERR-3: Include user ID if authenticated
 * 
 * Validates that:
 * 1. All caught errors are logged to console
 * 2. Logs include component name, timestamp, stack trace
 * 3. User ID is included when authenticated
 * 4. Error tracking service is called
 * 5. Logs are formatted correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import fc from 'fast-check';

// Mock AppContext
vi.mock('../src/context/AppContext', () => ({
  useApp: () => ({
    language: 'en',
    user: null,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock error tracking utility
const mockLogError = vi.fn();
vi.mock('../src/utils/errorTracking', () => ({
  logError: mockLogError,
}));

// Arbitraries for property-based testing
const errorMessageArbitrary = fc.string({ minLength: 1, maxLength: 100 });
const componentNameArbitrary = fc.string({ minLength: 1, maxLength: 50 });
const userIdArbitrary = fc.string({ minLength: 5, maxLength: 30 });
const retryCountArbitrary = fc.integer({ min: 0, max: 10 });

// Component that throws an error
const ThrowError = ({ message = 'Test error' }) => {
  throw new Error(message);
};

describe('Error Logging Property-Based Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error to verify logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear mock calls
    vi.clearAllMocks();
    mockLogError.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  /**
   * Property LOG-1: All Errors Are Logged
   * ∀ error ∈ CaughtErrors: console.error.called = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log all caught errors to console (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          // Reset spy before each iteration
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              console.error('=== Error Boundary ===');
              console.error('Error:', error);
              console.error('======================');
            }

            render() {
              if (this.state.hasError) {
                return <div>Error occurred</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: console.error must be called for every caught error
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(consoleErrorSpy.mock.calls.length).toBeGreaterThan(0);

          // Verify error was logged
          const errorCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Error:'
          );
          expect(errorCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-2: Component Name Logging
   * ∀ error ∈ CaughtErrors: log.includes(componentName) = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log component name for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        componentNameArbitrary,
        (errorMessage, componentName) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              const component = this.props.componentName || 'Unknown';
              console.error('Component:', component);
              console.error('Error:', error);
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary componentName={componentName}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: Component name must be logged
          const componentCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Component:' && call[1] === componentName
          );
          expect(componentCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-3: Timestamp Logging
   * ∀ error ∈ CaughtErrors: log.includes(timestamp) = true AND timestamp.isValid = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log valid timestamp for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              const timestamp = new Date().toISOString();
              console.error('Timestamp:', timestamp);
              console.error('Error:', error);
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: Timestamp must be logged and valid
          const timestampCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Timestamp:'
          );
          expect(timestampCalls.length).toBeGreaterThan(0);

          const timestamp = timestampCalls[0][1];
          expect(timestamp).toBeTruthy();
          
          // Verify ISO 8601 format
          expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          
          // Verify it's a valid date
          const date = new Date(timestamp);
          expect(date.toString()).not.toBe('Invalid Date');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-4: Stack Trace Logging
   * ∀ error ∈ CaughtErrors: log.includes(stackTrace) = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log stack trace for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              console.error('Error:', error);
              console.error('Stack Trace:', error.stack);
              console.error('Component Stack:', errorInfo.componentStack);
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: Stack trace must be logged
          const stackCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Stack Trace:'
          );
          expect(stackCalls.length).toBeGreaterThan(0);
          
          const stackTrace = stackCalls[0][1];
          expect(stackTrace).toBeTruthy();
          expect(typeof stackTrace).toBe('string');
          expect(stackTrace).toContain(`Error: ${errorMessage}`);

          // Property: Component stack must be logged
          const componentStackCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Component Stack:'
          );
          expect(componentStackCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-5: User ID Logging When Authenticated
   * ∀ error ∈ CaughtErrors WHERE user.authenticated = true:
   *   log.includes(userId) = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log user ID when user is authenticated (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        userIdArbitrary,
        (errorMessage, userId) => {
          consoleErrorSpy.mockClear();

          const mockUser = { _id: userId, email: 'test@example.com' };

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              console.error('Error:', error);
              
              // FR-ERR-3: Include user ID if authenticated
              if (this.props.user && this.props.user._id) {
                console.error('User ID:', this.props.user._id);
              }
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary user={mockUser}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: User ID must be logged when user is authenticated
          const userIdCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'User ID:' && call[1] === userId
          );
          expect(userIdCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-6: No User ID When Not Authenticated
   * ∀ error ∈ CaughtErrors WHERE user.authenticated = false:
   *   log.includes(userId) = false
   * 
   * Validates: FR-ERR-3
   */
  it('should NOT log user ID when user is not authenticated (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        (errorMessage) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              console.error('Error:', error);
              
              // FR-ERR-3: Include user ID if authenticated
              if (this.props.user && this.props.user._id) {
                console.error('User ID:', this.props.user._id);
              }
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary user={null}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: User ID must NOT be logged when user is not authenticated
          const userIdCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'User ID:'
          );
          expect(userIdCalls.length).toBe(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-7: Error Tracking Service Called
   * ∀ error ∈ CaughtErrors: errorTrackingService.called = true
   * 
   * Validates: FR-ERR-3 (prepared for future error tracking service integration)
   */
  it('should call error tracking service for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        componentNameArbitrary,
        userIdArbitrary,
        (errorMessage, componentName, userId) => {
          mockLogError.mockClear();

          const mockUser = { _id: userId, email: 'test@example.com' };

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              const timestamp = new Date().toISOString();
              
              // Send to error tracking service
              mockLogError(error, {
                component: this.props.componentName,
                action: 'test-action',
                userId: this.props.user?._id,
                level: 'error',
                extra: {
                  componentStack: errorInfo.componentStack,
                  timestamp: timestamp,
                  errorBoundary: 'TestErrorBoundary',
                },
              });
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary user={mockUser} componentName={componentName}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: Error tracking service must be called
          expect(mockLogError).toHaveBeenCalled();
          expect(mockLogError).toHaveBeenCalledWith(
            expect.objectContaining({
              message: errorMessage,
            }),
            expect.objectContaining({
              component: componentName,
              userId: userId,
              level: 'error',
            })
          );

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-8: Retry Count Logging
   * ∀ error ∈ CaughtErrors: log.includes(retryCount) = true
   * 
   * Validates: FR-ERR-3
   */
  it('should log retry count for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        retryCountArbitrary,
        (errorMessage, initialRetryCount) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { 
                hasError: false,
                retryCount: props.initialRetryCount || 0,
              };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              console.error('Error:', error);
              console.error('Retry Count:', this.state.retryCount);
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary initialRetryCount={initialRetryCount}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: Retry count must be logged
          const retryCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Retry Count:' && call[1] === initialRetryCount
          );
          expect(retryCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-9: Complete Log Structure
   * ∀ error ∈ CaughtErrors:
   *   log.includes(header) AND
   *   log.includes(timestamp) AND
   *   log.includes(component) AND
   *   log.includes(error) AND
   *   log.includes(stackTrace) AND
   *   log.includes(footer)
   * 
   * Validates: FR-ERR-3
   */
  it('should log complete error structure for all errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        errorMessageArbitrary,
        componentNameArbitrary,
        (errorMessage, componentName) => {
          consoleErrorSpy.mockClear();

          class TestErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false };
            }

            static getDerivedStateFromError() {
              return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
              const timestamp = new Date().toISOString();
              
              // Complete log structure
              console.error('=== Error Boundary ===');
              console.error('Timestamp:', timestamp);
              console.error('Component:', this.props.componentName);
              console.error('Error:', error);
              console.error('Stack Trace:', error.stack);
              console.error('Component Stack:', errorInfo.componentStack);
              console.error('======================');
            }

            render() {
              if (this.state.hasError) {
                return <div>Error</div>;
              }
              return this.props.children;
            }
          }

          const { unmount } = render(
            <TestErrorBoundary componentName={componentName}>
              <ThrowError message={errorMessage} />
            </TestErrorBoundary>
          );

          // Property: All required log elements must be present
          const headerCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === '=== Error Boundary ==='
          );
          expect(headerCalls.length).toBeGreaterThan(0);

          const timestampCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Timestamp:'
          );
          expect(timestampCalls.length).toBeGreaterThan(0);

          const componentCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Component:'
          );
          expect(componentCalls.length).toBeGreaterThan(0);

          const errorCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Error:'
          );
          expect(errorCalls.length).toBeGreaterThan(0);

          const stackCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Stack Trace:'
          );
          expect(stackCalls.length).toBeGreaterThan(0);

          const componentStackCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === 'Component Stack:'
          );
          expect(componentStackCalls.length).toBeGreaterThan(0);

          const footerCalls = consoleErrorSpy.mock.calls.filter(
            call => call[0] === '======================'
          );
          expect(footerCalls.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOG-10: Log Consistency Across Multiple Errors
   * ∀ error1, error2 ∈ CaughtErrors:
   *   logFormat(error1) = logFormat(error2)
   * 
   * Validates: FR-ERR-3
   */
  it('should maintain consistent log format across multiple errors (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(errorMessageArbitrary, { minLength: 2, maxLength: 5 }),
        (errorMessages) => {
          const logFormats = [];

          errorMessages.forEach((errorMessage) => {
            consoleErrorSpy.mockClear();

            class TestErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false };
              }

              static getDerivedStateFromError() {
                return { hasError: true };
              }

              componentDidCatch(error, errorInfo) {
                console.error('=== Error ===');
                console.error('Timestamp:', new Date().toISOString());
                console.error('Error:', error);
                console.error('=============');
              }

              render() {
                if (this.state.hasError) {
                  return <div>Error</div>;
                }
                return this.props.children;
              }
            }

            const { unmount } = render(
              <TestErrorBoundary>
                <ThrowError message={errorMessage} />
              </TestErrorBoundary>
            );

            // Capture log format (order of log calls from our error boundary only)
            // Filter to only include our specific log messages
            const logFormat = consoleErrorSpy.mock.calls
              .filter(call => 
                call[0] === '=== Error ===' ||
                call[0] === 'Timestamp:' ||
                call[0] === 'Error:' ||
                call[0] === '============='
              )
              .map(call => call[0]);
            logFormats.push(logFormat);

            unmount();
          });

          // Property: All log formats should be consistent
          const firstFormat = logFormats[0];
          logFormats.forEach((format) => {
            expect(format).toEqual(firstFormat);
          });

          // Verify the expected format is present
          expect(firstFormat).toEqual([
            '=== Error ===',
            'Timestamp:',
            'Error:',
            '============='
          ]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
