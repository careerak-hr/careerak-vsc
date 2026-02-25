import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityLogWidget from '../ActivityLogWidget';
import { AppContext } from '../../../context/AppContext';
import pusherClient from '../../../utils/pusherClient';

// Mock pusherClient
jest.mock('../../../utils/pusherClient', () => ({
  isConnected: jest.fn(() => true)
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Helper function to create mock context
const createMockContext = (overrides = {}) => ({
  language: 'en',
  fontFamily: 'Arial, sans-serif',
  ...overrides
});

// Helper function to render with context
const renderWithContext = (component, contextValue = {}) => {
  const defaultContext = createMockContext(contextValue);
  return render(
    <AppContext.Provider value={defaultContext}>
      {component}
    </AppContext.Provider>
  );
};

// Mock activity log data
const mockActivityLogs = [
  {
    _id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    actorId: 'user1',
    actorName: 'John Doe',
    actionType: 'user_registered',
    targetType: 'User',
    targetId: 'target1',
    details: 'New user registered',
    ipAddress: '192.168.1.1'
  },
  {
    _id: '2',
    timestamp: new Date('2024-01-15T11:00:00Z'),
    actorId: 'user2',
    actorName: 'Jane Smith',
    actionType: 'job_posted',
    targetType: 'Job',
    targetId: 'target2',
    details: 'New job posted: Software Engineer',
    ipAddress: '192.168.1.2'
  },
  {
    _id: '3',
    timestamp: new Date('2024-01-15T11:30:00Z'),
    actorId: 'user3',
    actorName: 'Bob Johnson',
    actionType: 'content_reported',
    targetType: 'Review',
    targetId: 'target3',
    details: 'Content reported for inappropriate language',
    ipAddress: '192.168.1.3'
  }
];

describe('ActivityLogWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Basic Rendering', () => {
    test('renders activity log widget with title', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 3,
            page: 1,
            totalPages: 1
          }
        })
      });

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('Activity Log')).toBeInTheDocument();
      });
    });

    test('displays loading state initially', () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      renderWithContext(<ActivityLogWidget />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays activity entries after loading', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 3,
            page: 1,
            totalPages: 1
          }
        })
      });

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    test('displays total entries count', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 3,
            page: 1,
            totalPages: 1
          }
        })
      });

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('3 entries')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering by Multiple Criteria', () => {
    test('filters by action type', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showFilters={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select action type filter
      const actionTypeSelect = screen.getByDisplayValue('Filter by Type');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockActivityLogs[0]],
          pagination: { total: 1, page: 1, totalPages: 1 }
        })
      });

      fireEvent.change(actionTypeSelect, { target: { value: 'user_registered' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('actionType=user_registered'),
          expect.any(Object)
        );
      });
    });

    test('filters by user ID', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showFilters={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Enter user ID
      const userIdInput = screen.getByPlaceholderText('User ID');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockActivityLogs[0]],
          pagination: { total: 1, page: 1, totalPages: 1 }
        })
      });

      fireEvent.change(userIdInput, { target: { value: 'user1' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('actorId=user1'),
          expect.any(Object)
        );
      });
    });

    test('filters by date range', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showFilters={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Set date range
      const startDateInput = screen.getByPlaceholderText('Start Date');
      const endDateInput = screen.getByPlaceholderText('End Date');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-16' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('startDate=2024-01-15'),
          expect.any(Object)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('endDate=2024-01-16'),
          expect.any(Object)
        );
      });
    });

    test('combines multiple filters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showFilters={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Apply multiple filters
      const actionTypeSelect = screen.getByDisplayValue('Filter by Type');
      const userIdInput = screen.getByPlaceholderText('User ID');
      const startDateInput = screen.getByPlaceholderText('Start Date');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockActivityLogs[0]],
          pagination: { total: 1, page: 1, totalPages: 1 }
        })
      });

      fireEvent.change(actionTypeSelect, { target: { value: 'user_registered' } });
      fireEvent.change(userIdInput, { target: { value: 'user1' } });
      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });

      await waitFor(() => {
        const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1][0];
        expect(lastCall).toContain('actionType=user_registered');
        expect(lastCall).toContain('actorId=user1');
        expect(lastCall).toContain('startDate=2024-01-15');
      });
    });

    test('clears all filters when clear button is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showFilters={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Apply filters
      const actionTypeSelect = screen.getByDisplayValue('Filter by Type');
      fireEvent.change(actionTypeSelect, { target: { value: 'user_registered' } });

      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      // Clear filters
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(actionTypeSelect.value).toBe('');
      });
    });
  });

  describe('Search with Special Characters', () => {
    test('searches with special characters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Search with special characters
      const searchInput = screen.getByPlaceholderText('Search...');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockActivityLogs[2]],
          pagination: { total: 1, page: 1, totalPages: 1 },
          searchTerm: 'inappropriate @#$%'
        })
      });

      fireEvent.change(searchInput, { target: { value: 'inappropriate @#$%' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('q=inappropriate%20%40%23%24%25'),
          expect.any(Object)
        );
      });
    });

    test('searches with quotes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, totalPages: 0 },
          searchTerm: '"exact phrase"'
        })
      });

      fireEvent.change(searchInput, { target: { value: '"exact phrase"' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('q=%22exact%20phrase%22'),
          expect.any(Object)
        );
      });
    });

    test('searches with unicode characters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, totalPages: 0 },
          searchTerm: 'مستخدم جديد'
        })
      });

      fireEvent.change(searchInput, { target: { value: 'مستخدم جديد' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('q='),
          expect.any(Object)
        );
      });
    });
  });

  describe('Pagination with Large Dataset', () => {
    test('displays pagination controls when multiple pages exist', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 1,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
    });

    test('navigates to next page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 1,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
      });

      // Click next button
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 2,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: true
          }
        })
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    test('navigates to previous page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 2,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: true
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 10')).toBeInTheDocument();
      });

      // Click previous button
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 1,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        })
      });

      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    test('disables previous button on first page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 1,
            totalPages: 10,
            hasNextPage: true,
            hasPrevPage: false
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
      });
    });

    test('disables next button on last page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 100,
            page: 10,
            totalPages: 10,
            hasNextPage: false,
            hasPrevPage: true
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
      });
    });

    test('handles large dataset (1000+ entries)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: {
            total: 1500,
            page: 1,
            totalPages: 150,
            hasNextPage: true,
            hasPrevPage: false
          }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        expect(screen.getByText('1500 entries')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 150')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('retries fetch when retry button is clicked', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Click retry
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('displays no logs message when data is empty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, totalPages: 0 }
        })
      });

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('No activities found')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    test('listens for Pusher events when connected', async () => {
      pusherClient.isConnected.mockReturnValue(true);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget maxEntries={10} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Simulate Pusher event
      const newActivity = {
        _id: '4',
        timestamp: new Date(),
        actorName: 'New User',
        actionType: 'user_registered',
        targetType: 'User',
        details: 'Another new user',
        ipAddress: '192.168.1.4'
      };

      const event = new CustomEvent('pusher-activity-log', { detail: newActivity });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(screen.getByText('New User')).toBeInTheDocument();
      });
    });

    test('does not listen for Pusher events when disconnected', async () => {
      pusherClient.isConnected.mockReturnValue(false);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Pusher event should not affect the component
      const newActivity = {
        _id: '4',
        timestamp: new Date(),
        actorName: 'New User',
        actionType: 'user_registered',
        targetType: 'User',
        details: 'Another new user',
        ipAddress: '192.168.1.4'
      };

      const event = new CustomEvent('pusher-activity-log', { detail: newActivity });
      window.dispatchEvent(event);

      // Should not see the new activity
      expect(screen.queryByText('New User')).not.toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    test('renders in Arabic', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget />, { language: 'ar' });

      await waitFor(() => {
        expect(screen.getByText('سجل النشاطات')).toBeInTheDocument();
      });
    });

    test('renders in French', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockActivityLogs,
          pagination: { total: 3, page: 1, totalPages: 1 }
        })
      });

      renderWithContext(<ActivityLogWidget />, { language: 'fr' });

      await waitFor(() => {
        expect(screen.getByText('Journal d\'activité')).toBeInTheDocument();
      });
    });
  });
});
