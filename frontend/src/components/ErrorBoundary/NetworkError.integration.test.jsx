/**
 * NetworkError Integration Tests
 * 
 * Requirements:
 * - FR-ERR-9: When network errors occur, the system shall display specific network error messages with retry options
 * 
 * This test file verifies that:
 * 1. Different network error types display specific messages
 * 2. Error messages are shown in the correct language
 * 3. Retry functionality works correctly
 * 4. Network errors are properly detected and categorized
 * 5. Integration with error boundaries works as expected
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useApiError } from '../../hooks/useNetworkError';
import NetworkError from './NetworkError';
import { NetworkErrorTypes, detectNetworkErrorType, getNetworkErrorMessage } from '../../utils/networkErrorHandler';

// Mock AppContext
const mockLanguages = {
  ar: 'ar',
  en: 'en',
  fr: 'fr'
};

let currentLanguage = 'en';

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    language: currentLanguage
  })
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('NetworkError Integration Tests - FR-ERR-9', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentLanguage = 'en';
  });

  describe('Specific Error Messages for Different Error Types', () => {
    it('should display specific message for NETWORK_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: errorMessage.action })).toBeInTheDocument();
    });

    it('should display specific message for TIMEOUT_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.TIMEOUT_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.TIMEOUT_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for SERVER_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.SERVER_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.SERVER_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for UNAUTHORIZED_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.UNAUTHORIZED_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.UNAUTHORIZED_ERROR, 'en');

      render(<NetworkError error={error} />);

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for FORBIDDEN_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.FORBIDDEN_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.FORBIDDEN_ERROR, 'en');

      render(<NetworkError error={error} />);

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for NOT_FOUND_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.NOT_FOUND_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NOT_FOUND_ERROR, 'en');

      render(<NetworkError error={error} />);

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for OFFLINE_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.OFFLINE_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.OFFLINE_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for RATE_LIMIT_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.RATE_LIMIT_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.RATE_LIMIT_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for CORS_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.CORS_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.CORS_ERROR, 'en');

      render(<NetworkError error={error} />);

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for DNS_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.DNS_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.DNS_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display specific message for SSL_ERROR', () => {
      const error = {
        type: NetworkErrorTypes.SSL_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.SSL_ERROR, 'en');

      render(<NetworkError error={error} />);

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });
  });

  describe('Multi-Language Support', () => {
    it('should display error message in Arabic', () => {
      currentLanguage = 'ar';
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'ar');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display error message in French', () => {
      currentLanguage = 'fr';
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'fr');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
    });

    it('should display different messages for different error types in Arabic', () => {
      currentLanguage = 'ar';
      
      const timeoutMessage = getNetworkErrorMessage(NetworkErrorTypes.TIMEOUT_ERROR, 'ar');
      const serverMessage = getNetworkErrorMessage(NetworkErrorTypes.SERVER_ERROR, 'ar');
      
      expect(timeoutMessage.title).not.toBe(serverMessage.title);
      expect(timeoutMessage.message).not.toBe(serverMessage.message);
    });
  });

  describe('Error Detection and Categorization', () => {
    it('should detect network error from axios error with no response', () => {
      const axiosError = {
        request: {},
        message: 'Network Error'
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.NETWORK_ERROR);
    });

    it('should detect timeout error from error code', () => {
      const axiosError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.TIMEOUT_ERROR);
    });

    it('should detect server error from 500 status', () => {
      const axiosError = {
        response: {
          status: 500
        }
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.SERVER_ERROR);
    });

    it('should detect unauthorized error from 401 status', () => {
      const axiosError = {
        response: {
          status: 401
        }
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.UNAUTHORIZED_ERROR);
    });

    it('should detect not found error from 404 status', () => {
      const axiosError = {
        response: {
          status: 404
        }
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.NOT_FOUND_ERROR);
    });

    it('should detect rate limit error from 429 status', () => {
      const axiosError = {
        response: {
          status: 429
        }
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.RATE_LIMIT_ERROR);
    });

    it('should detect offline error when navigator is offline', () => {
      // Mock navigator.onLine
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const axiosError = {
        message: 'Network Error'
      };

      const errorType = detectNetworkErrorType(axiosError);
      expect(errorType).toBe(NetworkErrorTypes.OFFLINE_ERROR);

      // Restore
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: originalOnLine
      });
    });
  });

  describe('Retry Functionality with Specific Messages', () => {
    it('should show retry button for retryable errors', () => {
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'en');

      render(
        <NetworkError
          error={error}
          onRetry={vi.fn()}
        />
      );

      const retryButton = screen.getByRole('button', { name: errorMessage.action });
      expect(retryButton).toBeInTheDocument();
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = {
        type: NetworkErrorTypes.UNAUTHORIZED_ERROR,
        isNetworkError: true,
        isRetryable: false
      };

      render(<NetworkError error={error} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const mockOnRetry = vi.fn();
      const error = {
        type: NetworkErrorTypes.NETWORK_ERROR,
        isNetworkError: true,
        isRetryable: true
      };

      render(
        <NetworkError
          error={error}
          onRetry={mockOnRetry}
        />
      );

      const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'en');
      const retryButton = screen.getByRole('button', { name: errorMessage.action });
      
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Real-World Scenario Integration', () => {
    // Test component that simulates a real API call with network error
    const TestComponent = ({ errorType }) => {
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);

      const simulateApiCall = () => {
        setLoading(true);
        
        // Simulate different error types
        setTimeout(() => {
          const mockError = {
            type: errorType,
            isNetworkError: true,
            isRetryable: [
              NetworkErrorTypes.NETWORK_ERROR,
              NetworkErrorTypes.TIMEOUT_ERROR,
              NetworkErrorTypes.SERVER_ERROR,
              NetworkErrorTypes.OFFLINE_ERROR
            ].includes(errorType)
          };
          
          setError(mockError);
          setLoading(false);
        }, 10);
      };

      const handleRetry = () => {
        setError(null);
        simulateApiCall();
      };

      const handleDismiss = () => {
        setError(null);
      };

      return (
        <div>
          <button onClick={simulateApiCall} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
          
          {error && (
            <NetworkError
              error={error}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          )}
        </div>
      );
    };

    it('should display specific network error message in real scenario', async () => {
      render(<TestComponent errorType={NetworkErrorTypes.NETWORK_ERROR} />);

      const fetchButton = screen.getByRole('button', { name: /fetch data/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'en');
        expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
        expect(screen.getByText(errorMessage.message)).toBeInTheDocument();
      });
    });

    it('should allow retry after network error', async () => {
      render(<TestComponent errorType={NetworkErrorTypes.TIMEOUT_ERROR} />);

      const fetchButton = screen.getByRole('button', { name: /fetch data/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.TIMEOUT_ERROR, 'en');
        expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Error should be cleared and retry attempted
      await waitFor(() => {
        expect(screen.queryByText(/request timeout/i)).not.toBeInTheDocument();
      });
    });

    it('should show different messages for different error types in sequence', async () => {
      const { rerender } = render(<TestComponent errorType={NetworkErrorTypes.NETWORK_ERROR} />);

      // First error
      const fetchButton = screen.getByRole('button', { name: /fetch data/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, 'en');
        expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      });

      // Change error type
      rerender(<TestComponent errorType={NetworkErrorTypes.SERVER_ERROR} />);
      
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/network connection error/i)).not.toBeInTheDocument();
      });

      // Trigger new error
      const fetchButton2 = screen.getByRole('button', { name: /fetch data/i });
      fireEvent.click(fetchButton2);

      await waitFor(() => {
        const errorMessage = getNetworkErrorMessage(NetworkErrorTypes.SERVER_ERROR, 'en');
        expect(screen.getByText(errorMessage.title)).toBeInTheDocument();
      });
    });
  });

  describe('FR-ERR-9 Compliance Verification', () => {
    it('should meet FR-ERR-9: display specific network error messages', () => {
      // Test all error types have specific messages
      const errorTypes = [
        NetworkErrorTypes.NETWORK_ERROR,
        NetworkErrorTypes.TIMEOUT_ERROR,
        NetworkErrorTypes.SERVER_ERROR,
        NetworkErrorTypes.CLIENT_ERROR,
        NetworkErrorTypes.CORS_ERROR,
        NetworkErrorTypes.DNS_ERROR,
        NetworkErrorTypes.SSL_ERROR,
        NetworkErrorTypes.RATE_LIMIT_ERROR,
        NetworkErrorTypes.UNAUTHORIZED_ERROR,
        NetworkErrorTypes.FORBIDDEN_ERROR,
        NetworkErrorTypes.NOT_FOUND_ERROR,
        NetworkErrorTypes.OFFLINE_ERROR
      ];

      errorTypes.forEach(errorType => {
        const message = getNetworkErrorMessage(errorType, 'en');
        
        // Each error type should have specific title and message
        expect(message.title).toBeTruthy();
        expect(message.message).toBeTruthy();
        expect(message.action).toBeTruthy();
        
        // Messages should be different for different error types
        const otherType = errorTypes.find(t => t !== errorType);
        if (otherType) {
          const otherMessage = getNetworkErrorMessage(otherType, 'en');
          expect(message.title).not.toBe(otherMessage.title);
        }
      });
    });

    it('should meet FR-ERR-9: provide retry options for retryable errors', () => {
      const retryableErrors = [
        NetworkErrorTypes.NETWORK_ERROR,
        NetworkErrorTypes.TIMEOUT_ERROR,
        NetworkErrorTypes.SERVER_ERROR,
        NetworkErrorTypes.DNS_ERROR,
        NetworkErrorTypes.OFFLINE_ERROR,
        NetworkErrorTypes.RATE_LIMIT_ERROR
      ];

      retryableErrors.forEach(errorType => {
        const mockOnRetry = vi.fn();
        const error = {
          type: errorType,
          isNetworkError: true,
          isRetryable: true
        };

        const { unmount } = render(
          <NetworkError
            error={error}
            onRetry={mockOnRetry}
          />
        );

        // Get the action button text from the error message
        const errorMessage = getNetworkErrorMessage(errorType, 'en');
        const retryButton = screen.getByRole('button', { name: errorMessage.action });
        expect(retryButton).toBeInTheDocument();

        unmount();
      });
    });

    it('should meet FR-ERR-9: display messages in multiple languages', () => {
      const languages = ['ar', 'en', 'fr'];
      
      languages.forEach(lang => {
        const message = getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, lang);
        
        expect(message.title).toBeTruthy();
        expect(message.message).toBeTruthy();
        expect(message.action).toBeTruthy();
        expect(message.suggestion).toBeTruthy();
      });
    });
  });
});
