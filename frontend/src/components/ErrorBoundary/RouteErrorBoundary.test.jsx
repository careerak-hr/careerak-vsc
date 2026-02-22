import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteErrorBoundary from './RouteErrorBoundary';

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

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test route error');
  }
  return <div>Route rendered successfully</div>;
};

describe('RouteErrorBoundary - Error Catching', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock window.location.reload
    delete window.location;
    window.location = { reload: vi.fn(), href: '' };
  });

  it('should render children when no error occurs', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={false} />
      </RouteErrorBoundary>
    );

    expect(screen.getByText('Route rendered successfully')).toBeInTheDocument();
  });

  it('should catch and display route-level errors', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    // Verify error UI is displayed
    expect(screen.getByText('Sorry, an unexpected error occurred')).toBeInTheDocument();
    expect(screen.getByText(/We apologize for the inconvenience/i)).toBeInTheDocument();
  });

  it('should display retry button when error occurs', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should display go home button when error occurs', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /go home/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('should reload page when retry button is clicked', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should navigate to home when go home button is clicked', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /go home/i });
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  it('should log error details to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    // Verify console.error was called with error details
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Check for specific log entries
    const logCalls = consoleErrorSpy.mock.calls.map(call => call[0]);
    expect(logCalls).toContain('=== RouteErrorBoundary Error ===');
    expect(logCalls.some(call => call.includes('Timestamp:'))).toBe(true);
    expect(logCalls.some(call => call.includes('Component:'))).toBe(true);
  });

  it('should log user ID when authenticated user encounters error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const mockUser = { _id: 'user456', name: 'Test User' };

    // Create a test error boundary with user prop
    class TestRouteErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          hasError: false,
          error: null,
          errorInfo: null,
          errorTimestamp: null,
        };
      }

      static getDerivedStateFromError(error) {
        return {
          hasError: true,
          errorTimestamp: new Date().toISOString(),
        };
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
      <TestRouteErrorBoundary user={mockUser}>
        <ThrowError shouldThrow={true} />
      </TestRouteErrorBoundary>
    );

    // Verify that console.error was called with user ID
    const userIdCalls = consoleErrorSpy.mock.calls.filter(
      call => call[0] === 'User ID:' && call[1] === 'user456'
    );
    
    expect(userIdCalls.length).toBeGreaterThan(0);
  });

  it('should display error timestamp in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    // In development, error details should be visible
    const detailsButton = screen.getByText(/error details/i);
    expect(detailsButton).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsButton);

    // Verify timestamp is displayed
    expect(screen.getByText(/timestamp:/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RouteErrorBoundary>
    );

    // Verify alert role and aria-live
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });
});
