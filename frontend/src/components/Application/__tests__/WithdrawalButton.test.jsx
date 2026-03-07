/**
 * Unit Tests: WithdrawalButton Component
 * 
 * Tests withdraw button display logic, confirmation dialog,
 * withdrawal API call, and status update
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WithdrawalButton from '../WithdrawalButton';
import { AppProvider } from '../../../context/AppContext';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = mockLocalStorage;

// Helper to render with context
const renderWithContext = (component, language = 'en') => {
  return render(
    <AppProvider value={{ language }}>
      {component}
    </AppProvider>
  );
};

describe('WithdrawalButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  /**
   * Test: Withdraw button display logic
   * Requirement 6.1
   */
  describe('Withdraw Button Display Logic', () => {
    test('should display withdraw button for Submitted status', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument();
    });

    test('should display withdraw button for Reviewed status', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Reviewed"
        />
      );

      expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument();
    });

    test('should NOT display withdraw button for Shortlisted status', () => {
      const { container } = renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Shortlisted"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should NOT display withdraw button for Accepted status', () => {
      const { container } = renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Accepted"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should NOT display withdraw button for Rejected status', () => {
      const { container } = renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Rejected"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should NOT display withdraw button for Withdrawn status', () => {
      const { container } = renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Withdrawn"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  /**
   * Test: Confirmation dialog
   * Requirement 6.2
   */
  describe('Confirmation Dialog', () => {
    test('should show confirmation dialog when withdraw button clicked', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/confirm withdrawal/i)).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    test('should close dialog when cancel button clicked', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Dialog should be closed
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    test('should display correct text in Arabic', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />,
        'ar'
      );

      const withdrawButton = screen.getByRole('button', { name: /سحب الطلب/i });
      fireEvent.click(withdrawButton);

      expect(screen.getByText(/تأكيد سحب الطلب/i)).toBeInTheDocument();
      expect(screen.getByText(/هل أنت متأكد/i)).toBeInTheDocument();
    });

    test('should display correct text in French', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />,
        'fr'
      );

      const withdrawButton = screen.getByRole('button', { name: /retirer/i });
      fireEvent.click(withdrawButton);

      expect(screen.getByText(/confirmer le retrait/i)).toBeInTheDocument();
      expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Withdrawal API call
   * Requirement 6.3
   */
  describe('Withdrawal API Call', () => {
    test('should call withdrawal API with correct parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            applicationId: '123',
            status: 'Withdrawn',
            withdrawnAt: new Date().toISOString()
          }
        })
      });

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/applications/123/withdraw'),
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
              'Content-Type': 'application/json'
            })
          })
        );
      });
    });

    test('should show success message on successful withdrawal', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            applicationId: '123',
            status: 'Withdrawn',
            withdrawnAt: new Date().toISOString()
          }
        })
      });

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/withdrawn successfully/i)).toBeInTheDocument();
      });
    });

    test('should show error message on failed withdrawal', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            message: 'Withdrawal not allowed'
          }
        })
      });

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/withdrawal not allowed/i)).toBeInTheDocument();
      });
    });

    test('should call onWithdrawSuccess callback on success', async () => {
      const mockOnSuccess = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            applicationId: '123',
            status: 'Withdrawn',
            withdrawnAt: new Date().toISOString()
          }
        })
      });

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
          onWithdrawSuccess={mockOnSuccess}
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            applicationId: '123',
            status: 'Withdrawn'
          })
        );
      });
    });

    test('should call onWithdrawError callback on error', async () => {
      const mockOnError = jest.fn();

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
          onWithdrawError={mockOnError}
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
  });

  /**
   * Test: Loading states
   */
  describe('Loading States', () => {
    test('should disable button during withdrawal', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: {} })
        }), 100))
      );

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      // Button should be disabled
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /withdrawing/i });
        expect(button).toBeDisabled();
      });
    });

    test('should show loading spinner during withdrawal', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: {} })
        }), 100))
      );

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Open dialog and confirm
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/withdrawing/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test: Accessibility
   */
  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      const button = screen.getByRole('button', { name: /withdraw/i });
      expect(button).toHaveAttribute('aria-label');
    });

    test('should have proper role for messages', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { applicationId: '123', status: 'Withdrawn' }
        })
      });

      renderWithContext(
        <WithdrawalButton
          applicationId="123"
          currentStatus="Submitted"
        />
      );

      // Trigger withdrawal
      const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
      fireEvent.click(withdrawButton);

      const confirmButton = screen.getByRole('button', { name: /yes, withdraw/i });
      fireEvent.click(confirmButton);

      // Success message should have alert role
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
