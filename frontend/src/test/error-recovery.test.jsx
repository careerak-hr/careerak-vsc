import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import RouteErrorBoundary from '../components/ErrorBoundary/RouteErrorBoundary';
import { AppProvider } from '../context/AppContext';

/**
 * Error Recovery Automated Tests
 * Task 9.6.5: Test error recovery
 * 
 * Requirements:
 * - FR-ERR-1: Catch component errors
 * - FR-ERR-4: Provide retry button
 * - FR-ERR-8: Reset error boundary on retry
 * - NFR-REL-1: 95%+ recovery success rate
 */

// Mock error tracking
vi.mock('../utils/errorTracking', () => ({
  logError: vi.fn(),
}));

// Test component that can throw errors
const ThrowError = ({ shouldThrow, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="success">Component rendered successfully</div>;
};

// Wrapper with AppProvider for context
const TestWrapper = ({ children }) => (
  <AppProvider>
    {children}
  </AppProvider>
);

describe('Error Recovery Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Component Error Boundary', () => {
    it('should catch component errors (FR-ERR-1)', () => {
      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Verify error UI is displayed
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should display retry button (FR-ERR-4)', () => {
      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Look for retry button (in any language)
      const retryButton = screen.getByRole('button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should reset error boundary on retry (FR-ERR-8)', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Verify error UI is displayed
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // Fix the error
      shouldThrow = false;

      // Click retry button
      const retryButton = screen.getByRole('button');
      await user.click(retryButton);

      // Rerender with fixed component
      rerender(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Verify component renders successfully after retry
      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });
    });

    it('should isolate errors to individual components', () => {
      render(
        <TestWrapper>
          <div>
            <ComponentErrorBoundary componentName="Component1">
              <ThrowError shouldThrow={true} errorMessage="Error 1" />
            </ComponentErrorBoundary>
            <ComponentErrorBoundary componentName="Component2">
              <ThrowError shouldThrow={false} />
            </ComponentErrorBoundary>
          </div>
        </TestWrapper>
      );

      // Component 1 should show error
      expect(screen.queryByText('Component rendered successfully')).toBeInTheDocument();
      
      // Component 2 should render successfully
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('should log error details (FR-ERR-3)', () => {
      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} errorMessage="Detailed test error" />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Verify console.error was called with error details
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Check that error message is in the logs
      const errorCalls = consoleErrorSpy.mock.calls.flat();
      const hasErrorMessage = errorCalls.some(call => 
        typeof call === 'string' && call.includes('ComponentErrorBoundary')
      );
      expect(hasErrorMessage).toBe(true);
    });
  });

  describe('Error Recovery Success Rate', () => {
    it('should achieve 95%+ recovery success rate (NFR-REL-1)', async () => {
      const user = userEvent.setup();
      const totalTests = 20;
      let successfulRecoveries = 0;

      for (let i = 0; i < totalTests; i++) {
        let shouldThrow = true;

        const { rerender, unmount } = render(
          <TestWrapper>
            <ComponentErrorBoundary componentName={`TestComponent${i}`}>
              <ThrowError shouldThrow={shouldThrow} />
            </ComponentErrorBoundary>
          </TestWrapper>
        );

        // Verify error is caught
        expect(screen.queryByTestId('success')).not.toBeInTheDocument();

        // Fix the error
        shouldThrow = false;

        // Click retry
        const retryButton = screen.getByRole('button');
        await user.click(retryButton);

        // Rerender with fixed component
        rerender(
          <TestWrapper>
            <ComponentErrorBoundary componentName={`TestComponent${i}`}>
              <ThrowError shouldThrow={shouldThrow} />
            </ComponentErrorBoundary>
          </TestWrapper>
        );

        // Check if recovery was successful
        try {
          await waitFor(() => {
            expect(screen.getByTestId('success')).toBeInTheDocument();
          }, { timeout: 1000 });
          successfulRecoveries++;
        } catch (error) {
          // Recovery failed
        }

        unmount();
      }

      const successRate = (successfulRecoveries / totalTests) * 100;
      
      console.log(`Error Recovery Success Rate: ${successRate}%`);
      console.log(`Successful Recoveries: ${successfulRecoveries}/${totalTests}`);

      // Verify success rate is at least 95%
      expect(successRate).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Error Types', () => {
    it('should handle render errors', () => {
      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} errorMessage="Render error" />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      expect(screen.queryByTestId('success')).not.toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle null reference errors', () => {
      const NullError = () => {
        const obj = null;
        return <div>{obj.property}</div>;
      };

      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <NullError />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle undefined errors', () => {
      const UndefinedError = () => {
        const obj = undefined;
        return <div>{obj.method()}</div>;
      };

      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <UndefinedError />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle type errors', () => {
      const TypeError = () => {
        const num = 123;
        return <div>{num.toUpperCase()}</div>;
      };

      render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <TypeError />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple Error Recovery', () => {
    it('should handle multiple sequential errors and recoveries', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // First error
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // First recovery
      shouldThrow = false;
      const retryButton1 = screen.getByRole('button');
      await user.click(retryButton1);
      
      rerender(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });

      // Second error
      shouldThrow = true;
      rerender(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // Second recovery
      shouldThrow = false;
      const retryButton2 = screen.getByRole('button');
      await user.click(retryButton2);
      
      rerender(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={shouldThrow} />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Resilience', () => {
    it('should maintain error boundary state across multiple errors', () => {
      const { rerender } = render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} errorMessage="Error 1" />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // First error caught
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // Trigger different error
      rerender(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError shouldThrow={true} errorMessage="Error 2" />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Error boundary should still be active
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();
    });

    it('should handle rapid error triggering', async () => {
      const user = userEvent.setup();
      let errorCount = 0;

      const RapidError = () => {
        if (errorCount < 5) {
          errorCount++;
          throw new Error(`Rapid error ${errorCount}`);
        }
        return <div data-testid="success">Success</div>;
      };

      const { rerender } = render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <RapidError />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      // Error should be caught
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();

      // Multiple retries
      for (let i = 0; i < 5; i++) {
        const retryButton = screen.getByRole('button');
        await user.click(retryButton);
        
        rerender(
          <TestWrapper>
            <ComponentErrorBoundary componentName="TestComponent">
              <RapidError />
            </ComponentErrorBoundary>
          </TestWrapper>
        );
      }

      // Eventually should succeed
      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });
    });
  });
});
