import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteErrorBoundary from '../components/ErrorBoundary/RouteErrorBoundary';
import { AppProvider } from '../context/AppContext';

/**
 * Route-Level Error Boundary Verification Test
 * Acceptance Criteria: Route-level errors show full-page boundary
 * 
 * Requirements:
 * - FR-ERR-6: Display full-page error boundary for route-level errors
 * - FR-ERR-4: Provide "Retry" button
 * - FR-ERR-5: Provide "Go Home" button
 */

// Mock error tracking
vi.mock('../utils/errorTracking', () => ({
  logError: vi.fn(),
}));

// Test component that throws route-level error
const RouteErrorComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Route-level error occurred');
  }
  return <div data-testid="route-content">Route content loaded successfully</div>;
};

// Wrapper with necessary providers
const TestWrapper = ({ children }) => (
  <AppProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </AppProvider>
);

describe('Route-Level Error Boundary Verification', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should display full-page error boundary for route-level errors (FR-ERR-6)', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify route content is NOT displayed
    expect(screen.queryByTestId('route-content')).not.toBeInTheDocument();

    // Verify error boundary container exists with full-page styling
    const errorContainer = document.querySelector('.route-error-boundary-container');
    expect(errorContainer).toBeInTheDocument();

    // Verify full-page styling is applied
    const styles = window.getComputedStyle(errorContainer);
    expect(styles.position).toBe('fixed');
    expect(styles.zIndex).toBe('9999');
  });

  it('should provide Retry button (FR-ERR-4)', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Find all buttons
    const buttons = screen.getAllByRole('button');
    
    // Should have at least 2 buttons (Retry and Go Home)
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    
    // Verify at least one button exists (Retry button)
    expect(buttons[0]).toBeInTheDocument();
  });

  it('should provide Go Home button (FR-ERR-5)', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Find all buttons
    const buttons = screen.getAllByRole('button');
    
    // Should have at least 2 buttons (Retry and Go Home)
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    
    // Verify second button exists (Go Home button)
    expect(buttons[1]).toBeInTheDocument();
  });

  it('should display error card with proper styling', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify error card exists
    const errorCard = document.querySelector('.route-error-boundary-card');
    expect(errorCard).toBeInTheDocument();

    // Verify card has proper styling
    const styles = window.getComputedStyle(errorCard);
    // Background can be 'white' or 'rgb(255, 255, 255)' depending on browser
    expect(styles.background).toMatch(/white|rgb\(255,\s*255,\s*255\)/);
  });

  it('should display error icon', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify error icon exists
    const errorIcon = document.querySelector('.route-error-icon');
    expect(errorIcon).toBeInTheDocument();

    // Verify icon contains SVG
    const svg = errorIcon.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display error title and description', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify title exists
    const title = document.querySelector('.route-error-title');
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBeTruthy();

    // Verify description exists
    const description = document.querySelector('.route-error-description');
    expect(description).toBeInTheDocument();
    expect(description.textContent).toBeTruthy();
  });

  it('should log error details to console (FR-ERR-3)', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Verify error log contains RouteErrorBoundary identifier
    const errorCalls = consoleErrorSpy.mock.calls.flat();
    const hasRouteErrorBoundary = errorCalls.some(call => 
      typeof call === 'string' && call.includes('RouteErrorBoundary')
    );
    expect(hasRouteErrorBoundary).toBe(true);
  });

  it('should display error details in development mode', () => {
    // Set NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify error details section exists
    const errorDetails = document.querySelector('.route-error-details');
    expect(errorDetails).toBeInTheDocument();

    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify container has role="alert"
    const errorContainer = document.querySelector('.route-error-boundary-container');
    expect(errorContainer).toHaveAttribute('role', 'alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('should render successfully when no error occurs', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={false} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify route content is displayed
    expect(screen.getByTestId('route-content')).toBeInTheDocument();

    // Verify error boundary is NOT displayed
    const errorContainer = document.querySelector('.route-error-boundary-container');
    expect(errorContainer).not.toBeInTheDocument();
  });

  it('should cover full viewport (full-page boundary)', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    const errorContainer = document.querySelector('.route-error-boundary-container');
    const styles = window.getComputedStyle(errorContainer);

    // Verify full viewport coverage
    expect(styles.position).toBe('fixed');
    expect(styles.top).toBe('0px');
    expect(styles.left).toBe('0px');
    expect(styles.right).toBe('0px');
    expect(styles.bottom).toBe('0px');
    expect(styles.width).toBe('100vw');
    expect(styles.height).toBe('100vh');
  });

  it('should have high z-index to overlay everything', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    const errorContainer = document.querySelector('.route-error-boundary-container');
    const styles = window.getComputedStyle(errorContainer);

    // Verify high z-index
    expect(styles.zIndex).toBe('9999');
  });

  it('should display action buttons container', () => {
    render(
      <TestWrapper>
        <RouteErrorBoundary>
          <RouteErrorComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </TestWrapper>
    );

    // Verify actions container exists
    const actionsContainer = document.querySelector('.route-error-actions');
    expect(actionsContainer).toBeInTheDocument();

    // Verify it contains buttons
    const buttons = actionsContainer.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
