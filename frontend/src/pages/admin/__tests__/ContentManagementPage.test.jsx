import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentManagementPage from '../ContentManagementPage';
import { AppContext } from '../../../context/AppContext';

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

// Mock context
const mockContextValue = {
  language: 'en',
  fontFamily: 'Arial, sans-serif'
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockContextValue}>
      {component}
    </AppContext.Provider>
  );
};

describe('ContentManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render the page title', () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
      });

      renderWithContext(<ContentManagementPage />);
      expect(screen.getByText('Content Management')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
      });

      renderWithContext(<ContentManagementPage />);
      expect(screen.getByText('Pending Jobs')).toBeInTheDocument();
      expect(screen.getByText('Pending Courses')).toBeInTheDocument();
      expect(screen.getByText('Flagged Content')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {}));

      renderWithContext(<ContentManagementPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show empty state when no content', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('No content found')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Switching', () => {
    it('should switch to pending courses tab', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        });

      renderWithContext(<ContentManagementPage />);

      const coursesTab = screen.getByText('Pending Courses');
      fireEvent.click(coursesTab);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/content/pending-courses'),
          expect.any(Object)
        );
      });
    });

    it('should switch to flagged content tab', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        });

      renderWithContext(<ContentManagementPage />);

      const flaggedTab = screen.getByText('Flagged Content');
      fireEvent.click(flaggedTab);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/content/flagged'),
          expect.any(Object)
        );
      });
    });

    it('should reset to page 1 when switching tabs', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: Array(20).fill({}), 
            pagination: { total: 40, totalPages: 2 } 
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const coursesTab = screen.getByText('Pending Courses');
      fireEvent.click(coursesTab);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Content Display', () => {
    it('should display pending jobs', async () => {
      const mockJobs = [
        {
          _id: '1',
          title: 'Software Engineer',
          company: { name: 'Tech Corp' },
          field: 'IT',
          description: 'Great job opportunity',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: mockJobs, 
          pagination: { total: 1, totalPages: 1 } 
        })
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText(/Tech Corp/)).toBeInTheDocument();
      });
    });

    it('should display pending courses', async () => {
      const mockCourses = [
        {
          _id: '1',
          title: 'React Masterclass',
          postedBy: { name: 'John Doe' },
          field: 'Programming',
          description: 'Learn React',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: mockCourses, 
            pagination: { total: 1, totalPages: 1 } 
          })
        });

      renderWithContext(<ContentManagementPage />);

      const coursesTab = screen.getByText('Pending Courses');
      fireEvent.click(coursesTab);

      await waitFor(() => {
        expect(screen.getByText('React Masterclass')).toBeInTheDocument();
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });
    });

    it('should display flagged reviews', async () => {
      const mockReviews = [
        {
          _id: '1',
          overallRating: 5,
          comment: 'Great experience',
          flaggedBy: ['user1', 'user2'],
          flagReason: 'Inappropriate content',
          createdAt: new Date().toISOString()
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: mockReviews, 
            pagination: { total: 1, totalPages: 1 } 
          })
        });

      renderWithContext(<ContentManagementPage />);

      const flaggedTab = screen.getByText('Flagged Content');
      fireEvent.click(flaggedTab);

      await waitFor(() => {
        expect(screen.getByText(/Great experience/)).toBeInTheDocument();
        expect(screen.getByText(/2 users/)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination when multiple pages exist', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: Array(20).fill({ _id: '1', title: 'Test' }), 
          pagination: { total: 40, totalPages: 2, page: 1 } 
        })
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 \/ 2/)).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: Array(20).fill({ _id: '1', title: 'Test' }), 
            pagination: { total: 40, totalPages: 2, page: 1 } 
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: Array(20).fill({ _id: '2', title: 'Test 2' }), 
            pagination: { total: 40, totalPages: 2, page: 2 } 
          })
        });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 \/ 2/)).toBeInTheDocument();
      });

      const nextButton = screen.getByText('→');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    it('should disable previous button on first page', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: Array(20).fill({ _id: '1', title: 'Test' }), 
          pagination: { total: 40, totalPages: 2, page: 1 } 
        })
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        const prevButton = screen.getByText('←');
        expect(prevButton).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('should handle non-ok responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should include auth token in requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: { total: 0, totalPages: 0 } })
      });

      renderWithContext(<ContentManagementPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });
    });
  });
});
