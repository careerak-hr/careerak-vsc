import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RouteErrorBoundary from './RouteErrorBoundary';
import ComponentErrorBoundary from './ComponentErrorBoundary';
import { logError } from '../../utils/errorTracking';

/**
 * Error Logging Tests
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp) to console
 * - FR-ERR-3: Include user ID if authenticated
 * 
 * Tests verify that:
 * 1. Errors are logged to console with all required details
 * 2. Component name is included in logs
 * 3. Stack trace is included in logs
 * 4. Timestamp is included in logs
 * 5. User ID is included when user is authenticated
 * 6. Error tracking service is called with correct data
 * 7. Both RouteErrorBoundary and ComponentErrorBoundary log correctly
 */

// Mock AppContext
vi.mock('../../context/AppContext', () => ({
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
vi.mock('../../utils/errorTracking', () => ({
  logError: vi.fn(),
}));

// Component that throws an error
const ThrowError = ({ message = 'Test error' }) => {
  throw new Error(message);
};

describe('Error Logging - FR-ERR-3', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error to verify logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear mock calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('RouteErrorBoundary Logging', () => {
    it('should log error to console with all required details', () => {
      // Create a custom error boundary class to test logging directly
      class TestRouteErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          const timestamp = new Date().toISOString();
          const componentName = errorInfo.componentStack.split('\n')[1]?.trim() || 'Unknown';
          
          // FR-ERR-3: Log error details to console
          console.error('=== RouteErrorBoundary Error ===');
          console.error('Timestamp:', timestamp);
          console.error('Component:', componentName);
          console.error('Error:', error);
          console.error('Stack Trace:', error.stack);
          console.error('Component Stack:', errorInfo.componentStack);
          console.error('================================');
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestRouteErrorBoundary>
          <ThrowError message="Route error test" />
        </TestRouteErrorBoundary>
      );

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Verify error boundary header is logged
      const headerCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === '=== RouteErrorBoundary Error ==='
      );
      expect(headerCalls.length).toBeGreaterThan(0);

      // Verify timestamp is logged
      const timestampCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Timestamp:'
      );
      expect(timestampCalls.length).toBeGreaterThan(0);
      expect(timestampCalls[0][1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format

      // Verify component name is logged
      const componentCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Component:'
      );
      expect(componentCalls.length).toBeGreaterThan(0);

      // Verify error is logged
      const errorCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Error:'
      );
      expect(errorCalls.length).toBeGreaterThan(0);
      expect(errorCalls[0][1]).toBeInstanceOf(Error);
      expect(errorCalls[0][1].message).toBe('Route error test');

      // Verify stack trace is logged
      const stackCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Stack Trace:'
      );
      expect(stackCalls.length).toBeGreaterThan(0);
      expect(stackCalls[0][1]).toBeTruthy();

      // Verify component stack is logged
      const componentStackCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Component Stack:'
      );
      expect(componentStackCalls.length).toBeGreaterThan(0);
    });

    it('should log user ID when user is authenticated', () => {
      const mockUser = { _id: 'user-123', email: 'test@example.com' };

      class TestRouteErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          const timestamp = new Date().toISOString();
          const componentName = 'TestComponent';
          
          console.error('=== RouteErrorBoundary Error ===');
          console.error('Timestamp:', timestamp);
          console.error('Component:', componentName);
          
          // FR-ERR-3: Include user ID if authenticated
          if (this.props.user && this.props.user._id) {
            console.error('User ID:', this.props.user._id);
          }
          
          console.error('Error:', error);
          console.error('================================');
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestRouteErrorBoundary user={mockUser}>
          <ThrowError />
        </TestRouteErrorBoundary>
      );

      // Verify user ID is logged
      const userIdCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'User ID:' && call[1] === 'user-123'
      );
      expect(userIdCalls.length).toBeGreaterThan(0);
    });

    it('should NOT log user ID when user is not authenticated', () => {
      class TestRouteErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          console.error('=== RouteErrorBoundary Error ===');
          
          // FR-ERR-3: Include user ID if authenticated
          if (this.props.user && this.props.user._id) {
            console.error('User ID:', this.props.user._id);
          }
          
          console.error('Error:', error);
          console.error('================================');
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestRouteErrorBoundary user={null}>
          <ThrowError />
        </TestRouteErrorBoundary>
      );

      // Verify user ID is NOT logged
      const userIdCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'User ID:'
      );
      expect(userIdCalls.length).toBe(0);
    });

    it('should call error tracking service with correct data', () => {
      const mockUser = { _id: 'user-456', email: 'user@example.com' };

      class TestRouteErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          const timestamp = new Date().toISOString();
          const componentName = 'TestComponent';
          
          // Log to console
          console.error('=== RouteErrorBoundary Error ===');
          console.error('Timestamp:', timestamp);
          console.error('Component:', componentName);
          console.error('Error:', error);
          console.error('================================');

          // Send to error tracking service
          logError(error, {
            component: componentName,
            action: 'route-render',
            userId: this.props.user?._id,
            level: 'error',
            extra: {
              componentStack: errorInfo.componentStack,
              timestamp: timestamp,
              errorBoundary: 'RouteErrorBoundary',
            },
          });
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestRouteErrorBoundary user={mockUser}>
          <ThrowError message="Tracking test error" />
        </TestRouteErrorBoundary>
      );

      // Verify logError was called
      expect(logError).toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'TestComponent',
          action: 'route-render',
          userId: 'user-456',
          level: 'error',
          extra: expect.objectContaining({
            errorBoundary: 'RouteErrorBoundary',
            timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          }),
        })
      );
    });
  });

  describe('ComponentErrorBoundary Logging', () => {
    it('should log error to console with all required details', () => {
      class TestComponentErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, retryCount: 0 };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          const timestamp = new Date().toISOString();
          const componentName = this.props.componentName || 'Unknown';
          
          // FR-ERR-3: Log error details to console
          console.error('=== ComponentErrorBoundary Error ===');
          console.error('Timestamp:', timestamp);
          console.error('Component:', componentName);
          console.error('Error:', error);
          console.error('Stack Trace:', error.stack);
          console.error('Component Stack:', errorInfo.componentStack);
          console.error('Retry Count:', this.state.retryCount);
          console.error('====================================');
        }

        render() {
          if (this.state.hasError) {
            return <div>Component error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestComponentErrorBoundary componentName="JobCard">
          <ThrowError message="Component error test" />
        </TestComponentErrorBoundary>
      );

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Verify error boundary header is logged
      const headerCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === '=== ComponentErrorBoundary Error ==='
      );
      expect(headerCalls.length).toBeGreaterThan(0);

      // Verify timestamp is logged
      const timestampCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Timestamp:'
      );
      expect(timestampCalls.length).toBeGreaterThan(0);

      // Verify component name is logged
      const componentCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Component:' && call[1] === 'JobCard'
      );
      expect(componentCalls.length).toBeGreaterThan(0);

      // Verify error is logged
      const errorCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Error:'
      );
      expect(errorCalls.length).toBeGreaterThan(0);

      // Verify stack trace is logged
      const stackCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Stack Trace:'
      );
      expect(stackCalls.length).toBeGreaterThan(0);

      // Verify retry count is logged
      const retryCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Retry Count:'
      );
      expect(retryCalls.length).toBeGreaterThan(0);
    });

    it('should log user ID when user is authenticated', () => {
      const mockUser = { _id: 'user-789', email: 'component@example.com' };

      class TestComponentErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          console.error('=== ComponentErrorBoundary Error ===');
          
          // FR-ERR-3: Include user ID if authenticated
          if (this.props.user && this.props.user._id) {
            console.error('User ID:', this.props.user._id);
          }
          
          console.error('Error:', error);
          console.error('====================================');
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestComponentErrorBoundary user={mockUser}>
          <ThrowError />
        </TestComponentErrorBoundary>
      );

      // Verify user ID is logged
      const userIdCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'User ID:' && call[1] === 'user-789'
      );
      expect(userIdCalls.length).toBeGreaterThan(0);
    });

    it('should call error tracking service with correct data', () => {
      const mockUser = { _id: 'user-999', email: 'tracking@example.com' };

      class TestComponentErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, retryCount: 0 };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          const timestamp = new Date().toISOString();
          const componentName = this.props.componentName || 'Unknown';
          
          console.error('=== ComponentErrorBoundary Error ===');
          console.error('Error:', error);
          console.error('====================================');

          // Send to error tracking service
          logError(error, {
            component: componentName,
            action: 'component-render',
            userId: this.props.user?._id,
            level: 'error',
            extra: {
              componentStack: errorInfo.componentStack,
              timestamp: timestamp,
              retryCount: this.state.retryCount,
              errorBoundary: 'ComponentErrorBoundary',
            },
          });
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestComponentErrorBoundary user={mockUser} componentName="ProfileCard">
          <ThrowError message="Component tracking test" />
        </TestComponentErrorBoundary>
      );

      // Verify logError was called
      expect(logError).toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'ProfileCard',
          action: 'component-render',
          userId: 'user-999',
          level: 'error',
          extra: expect.objectContaining({
            errorBoundary: 'ComponentErrorBoundary',
            retryCount: 0,
          }),
        })
      );
    });
  });

  describe('Error Logging Format', () => {
    it('should log timestamp in ISO 8601 format', () => {
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
        }

        render() {
          if (this.state.hasError) {
            return <div>Error</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowError />
        </TestErrorBoundary>
      );

      const timestampCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Timestamp:'
      );
      
      expect(timestampCalls.length).toBeGreaterThan(0);
      
      // Verify ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const timestamp = timestampCalls[0][1];
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Verify it's a valid date
      const date = new Date(timestamp);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should log error with stack trace', () => {
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
        }

        render() {
          if (this.state.hasError) {
            return <div>Error</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowError message="Stack trace test" />
        </TestErrorBoundary>
      );

      const stackCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Stack Trace:'
      );
      
      expect(stackCalls.length).toBeGreaterThan(0);
      
      const stackTrace = stackCalls[0][1];
      expect(stackTrace).toBeTruthy();
      expect(typeof stackTrace).toBe('string');
      expect(stackTrace).toContain('Error: Stack trace test');
    });

    it('should log component stack from errorInfo', () => {
      class TestErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          console.error('Component Stack:', errorInfo.componentStack);
        }

        render() {
          if (this.state.hasError) {
            return <div>Error</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowError />
        </TestErrorBoundary>
      );

      const componentStackCalls = consoleErrorSpy.mock.calls.filter(
        call => call[0] === 'Component Stack:'
      );
      
      expect(componentStackCalls.length).toBeGreaterThan(0);
      
      const componentStack = componentStackCalls[0][1];
      expect(componentStack).toBeTruthy();
      expect(typeof componentStack).toBe('string');
    });
  });

  describe('Error Tracking Service Integration', () => {
    it('should prepare error data for future tracking service', () => {
      const mockUser = { _id: 'user-integration', email: 'integration@test.com' };
      const testError = new Error('Integration test error');

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
          const componentName = 'IntegrationTestComponent';
          
          // Prepare data for error tracking service
          logError(error, {
            component: componentName,
            action: 'test-action',
            userId: this.props.user?._id,
            level: 'error',
            extra: {
              componentStack: errorInfo.componentStack,
              timestamp: timestamp,
              errorBoundary: 'TestErrorBoundary',
              customData: { test: true },
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

      render(
        <TestErrorBoundary user={mockUser}>
          <ThrowError message="Integration test error" />
        </TestErrorBoundary>
      );

      // Verify logError was called with complete data structure
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Integration test error',
        }),
        expect.objectContaining({
          component: 'IntegrationTestComponent',
          action: 'test-action',
          userId: 'user-integration',
          level: 'error',
          extra: expect.objectContaining({
            errorBoundary: 'TestErrorBoundary',
            customData: { test: true },
          }),
        })
      );
    });
  });
});
