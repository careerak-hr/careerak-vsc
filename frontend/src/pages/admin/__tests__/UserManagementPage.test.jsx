import React from 'react';
import { describe, it, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagementPage from '../UserManagementPage';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage;

// Mock window.confirm and window.prompt
global.confirm = vi.fn(() => true);
global.prompt = vi.fn(() => 'Test reason');
global.alert = vi.fn();

// Mock UserDetailModal
vi.mock('../../../components/admin/UserDetailModal', () => ({
  default: function MockUserDetailModal({ user, onClose, onUserUpdated }) {
    return (
      <div data-testid="user-detail-modal">
        <h2>{user.name}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={onUserUpdated}>Update</button>
      </div>
    );
  }
}));

describe('UserManagementPage', () => {
  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      type: 'Employee',
      isVerified: true,
      isDisabled: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      type: 'Company',
      isVerified: false,
      isDisabled: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      type: 'Freelancer',
      isVerified: true,
      isDisabled: true,
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        users: mockUsers,
        total: mockUsers.length,
        totalPages: 1
      })
    });
  });

  describe('Search Functionality', () => {
    test('should search users by name', async () => {
      render(<UserManagementPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Wait for debounce and API call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/search?q=John'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    test('should search users by email', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'john@example.com' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/search?q=john%40example.com'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    test('should search users by user type', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'Employee' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/search?q=Employee'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    test('should handle empty search results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [],
          total: 0,
          totalPages: 0
        })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Combinations', () => {
    test('should filter by user type', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const typeFilter = screen.getByLabelText(/user type/i);
      fireEvent.change(typeFilter, { target: { value: 'Employee' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=Employee'),
          expect.any(Object)
        );
      });
    });

    test('should filter by status', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const statusFilter = screen.getByLabelText(/^status$/i);
      fireEvent.change(statusFilter, { target: { value: 'verified' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=verified'),
          expect.any(Object)
        );
      });
    });

    test('should filter by date range', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/registration from/i);
      const endDateInput = screen.getByLabelText(/registration to/i);

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('startDate=2024-01-01'),
          expect.any(Object)
        );
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('endDate=2024-12-31'),
          expect.any(Object)
        );
      });
    });

    test('should apply multiple filters simultaneously', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const typeFilter = screen.getByLabelText(/user type/i);
      const statusFilter = screen.getByLabelText(/^status$/i);

      fireEvent.change(typeFilter, { target: { value: 'Employee' } });
      fireEvent.change(statusFilter, { target: { value: 'verified' } });

      await waitFor(() => {
        const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1][0];
        expect(lastCall).toContain('type=Employee');
        expect(lastCall).toContain('status=verified');
      });
    });

    test('should clear all filters', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Apply filters
      const typeFilter = screen.getByLabelText(/user type/i);
      fireEvent.change(typeFilter, { target: { value: 'Employee' } });

      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(typeFilter.value).toBe('all');
      });
    });
  });

  describe('Disable/Enable Account', () => {
    test('should disable user account', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Find and click disable button for John Doe (not disabled)
      const disableButtons = screen.getAllByTitle('Disable Account');
      fireEvent.click(disableButtons[0]);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/1/disable'),
          expect.objectContaining({
            method: 'PATCH'
          })
        );
      });

      expect(alert).toHaveBeenCalledWith('User account disabled successfully');
    });

    test('should enable disabled user account', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      // Find and click enable button for Bob Johnson (disabled)
      const enableButton = screen.getByTitle('Enable Account');
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/3/enable'),
          expect.objectContaining({
            method: 'PATCH'
          })
        );
      });

      expect(alert).toHaveBeenCalledWith('User account enabled successfully');
    });

    test('should handle disable cancellation', async () => {
      global.confirm = vi.fn(() => false);

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const disableButtons = screen.getAllByTitle('Disable Account');
      fireEvent.click(disableButtons[0]);

      // Should not call API if user cancels
      await waitFor(() => {
        const disableCalls = fetch.mock.calls.filter(call => 
          call[0].includes('/disable')
        );
        expect(disableCalls.length).toBe(0);
      });
    });

    test('should handle disable error', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1
        })
      }).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already disabled' })
      });

      global.confirm = vi.fn(() => true);

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const disableButtons = screen.getAllByTitle('Disable Account');
      fireEvent.click(disableButtons[0]);

      await waitFor(() => {
        expect(alert).toHaveBeenCalledWith('Failed to disable user: User already disabled');
      });
    });
  });

  describe('User Actions', () => {
    test('should open user detail modal on view', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('View Details');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('user-detail-modal')).toBeInTheDocument();
      });
    });

    test('should delete user account', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1
        })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      global.confirm = vi.fn(() => true);
      global.prompt = vi.fn(() => 'Violation of terms');

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete User');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/1'),
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ reason: 'Violation of terms' })
          })
        );
      });

      expect(alert).toHaveBeenCalledWith('User deleted successfully');
    });

    test('should handle delete cancellation', async () => {
      global.confirm = vi.fn(() => false);

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete User');
      fireEvent.click(deleteButtons[0]);

      // Should not call API if user cancels
      await waitFor(() => {
        const deleteCalls = fetch.mock.calls.filter(call => 
          call[1]?.method === 'DELETE'
        );
        expect(deleteCalls.length).toBe(0);
      });
    });
  });

  describe('Pagination', () => {
    test('should navigate to next page', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: 50,
          totalPages: 3
        })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    test('should navigate to previous page', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: 50,
          totalPages: 3
        })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Go to page 2 first
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });

      // Then go back to page 1
      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    test('should disable previous button on first page', async () => {
      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const previousButtons = screen.getAllByText('Previous');
      expect(previousButtons[0]).toBeDisabled();
    });

    test('should disable next button on last page', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1
        })
      });

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nextButtons = screen.getAllByText('Next');
      expect(nextButtons[0]).toBeDisabled();
    });
  });

  describe('Loading and Error States', () => {
    test('should show loading state', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<UserManagementPage />);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    test('should handle fetch error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetch.mockRejectedValue(new Error('Network error'));

      render(<UserManagementPage />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to fetch users:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });
});
