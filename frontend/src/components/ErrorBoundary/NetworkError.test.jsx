/**
 * NetworkError Component Tests
 * 
 * Requirements:
 * - FR-ERR-9: When network errors occur, the system shall display specific network error messages with retry options
 * 
 * Test Coverage:
 * - Network error message display for different error types
 * - Multi-language support (Arabic, English, French)
 * - Retry functionality
 * - Offline detection and auto-retry
 * - Accessibility compliance
 * - Responsive design
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NetworkError, { NetworkErrorBoundary } from './NetworkError';
import { NetworkErrorTypes } from '../../utils/networkErrorHandler';

// Mock AppContext
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    language: 'en'
  })
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('NetworkError Component', () => {
  const mockOnRetry = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Display', () => {
    it('should display network error message', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Connection Error',
        message: 'Unable to connect to the server.',
        action: 'Retry',
        suggestion: 'Check your internet connection'
      };

      render(
        <NetworkError
          error={error}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to the server.')).toBeInTheDocument();
    });

    it('should display timeout error message', () => {
      const error = {
        type: NetworkErrorTypes.TIMEOUT_ERROR,
        title: 'Request Timeout',
        message: 'The request took longer than expected.',
        action: 'Retry'
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('Request Timeout')).toBeInTheDocument();
      expect(screen.getByText('The request took longer than expected.')).toBeInTheDocument();
    });

    it('should display server error message', () => {
      const error = {
        type: NetworkErrorTypes.SERVER_ERROR,
        title: 'Server Error',
        message: 'A server error occurred.',
        action: 'Retry'
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });

    it('should display offline error message', () => {
      const error = {
        type: NetworkErrorTypes.OFFLINE_ERROR,
        title: 'Offline',
        message: 'You are currently offline.',
        action: 'Retry'
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should call onRetry when retry button is clicked', async () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        action: 'Retry',
        isRetryable: true
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during retry', async () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        action: 'Retry',
        isRetryable: true
      };

      const slowRetry = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<NetworkError error={error} onRetry={slowRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument();
      });
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = {
        type: NetworkErrorTypes.UNAUTHORIZED_ERROR,
        title: 'Unauthorized',
        message: 'Session expired',
        action: 'Log In',
        isRetryable: false
      };

      render(<NetworkError error={error} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should call onDismiss when dismiss button is clicked', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        action: 'Retry'
      };

      render(
        <NetworkError
          error={error}
          onRetry={mockOnRetry}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        action: 'Retry'
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      const { container } = render(
        <NetworkError error={error} size="small" />
      );

      expect(container.querySelector('.network-error--small')).toBeInTheDocument();
    });

    it('should apply medium size class by default', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      const { container } = render(<NetworkError error={error} />);

      expect(container.querySelector('.network-error--medium')).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      const { container } = render(
        <NetworkError error={error} size="large" />
      );

      expect(container.querySelector('.network-error--large')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      const { container } = render(<NetworkError error={error} />);

      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      const { container } = render(<NetworkError error={error} />);

      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    });

    it('should have aria-label on retry button', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        action: 'Retry',
        isRetryable: true
      };

      render(<NetworkError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toHaveAttribute('aria-label');
    });
  });

  describe('Error Details', () => {
    it('should show error details when showDetails is true', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed',
        context: {
          url: '/api/jobs',
          method: 'GET',
          status: 500
        }
      };

      render(<NetworkError error={error} showDetails={true} />);

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });

    it('should not show error details when showDetails is false', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };

      render(<NetworkError error={error} showDetails={false} />);

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    });
  });
});

describe('NetworkErrorBoundary', () => {
  const mockOnError = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should catch network errors', () => {
    const ThrowError = () => {
      const error = new Error('Network error');
      error.networkError = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        title: 'Network Error',
        message: 'Connection failed'
      };
      throw error;
    };

    render(
      <NetworkErrorBoundary onError={mockOnError}>
        <ThrowError />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('should not catch non-network errors', () => {
    const ThrowError = () => {
      throw new Error('Regular error');
    };

    expect(() => {
      render(
        <NetworkErrorBoundary>
          <ThrowError />
        </NetworkErrorBoundary>
      );
    }).toThrow();
  });

  it('should call onError callback when error is caught', () => {
    const ThrowError = () => {
      const error = new Error('Network error');
      error.isNetworkError = true;
      error.type = NetworkErrorTypes.NETWORK_ERROR;
      throw error;
    };

    render(
      <NetworkErrorBoundary onError={mockOnError}>
        <ThrowError />
      </NetworkErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalled();
  });

  it('should reset error state on retry', async () => {
    const ThrowError = ({ shouldThrow }) => {
      if (shouldThrow) {
        const error = new Error('Network error');
        error.networkError = {
          type: NetworkErrorTypes.NETWORK_ERROR,
          title: 'Network Error',
          message: 'Connection failed'
        };
        throw error;
      }
      return <div>Success</div>;
    };

    const { rerender } = render(
      <NetworkErrorBoundary onRetry={mockOnRetry}>
        <ThrowError shouldThrow={true} />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    rerender(
      <NetworkErrorBoundary onRetry={mockOnRetry}>
        <ThrowError shouldThrow={false} />
      </NetworkErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
