import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StatisticsGrid from '../StatisticsGrid';

/**
 * Unit Tests for StatisticsGrid
 * 
 * Tests:
 * - Auto-refresh timing (every 30 seconds)
 * - API integration
 * - Pusher real-time updates
 * - Error handling
 * 
 * Requirements: 2.1-2.9
 */

// Mock fetch
global.fetch = vi.fn();

// Mock Pusher client
vi.mock('../../../utils/pusherClient', () => ({
  default: {
    subscribe: vi.fn(() => ({
      bind: vi.fn(),
      unbind: vi.fn()
    })),
    unsubscribe: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

describe('StatisticsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial Load', () => {
    it('should fetch statistics on mount', async () => {
      const mockData = {
        activeUsers: 100,
        previousActiveUsers: 90,
        jobsToday: 50,
        previousJobsToday: 45,
        applicationsToday: 200,
        previousApplicationsToday: 180,
        enrollmentsToday: 30,
        previousEnrollmentsToday: 25,
        reviewsToday: 15,
        previousReviewsToday: 12
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/statistics/overview',
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer mock-token'
            }
          })
        );
      });
    });

    it('should display loading state initially', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { container } = render(<StatisticsGrid />);

      // Should show loading skeletons
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    it('should display statistics after successful fetch', async () => {
      const mockData = {
        activeUsers: 100,
        jobsToday: 50,
        applicationsToday: 200,
        enrollmentsToday: 30,
        reviewsToday: 15
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeTruthy();
        expect(screen.getByText('50')).toBeTruthy();
        expect(screen.getByText('200')).toBeTruthy();
      });
    });
  });

  describe('Auto-Refresh Timing', () => {
    it('should refresh statistics every 30 seconds', async () => {
      const mockData = {
        activeUsers: 100,
        jobsToday: 50
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      // Initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Advance time by another 30 seconds
      vi.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should not refresh before 30 seconds', async () => {
      const mockData = {
        activeUsers: 100
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      // Initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Advance time by 29 seconds (less than 30)
      vi.advanceTimersByTime(29000);

      // Should not have fetched again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should cleanup interval on unmount', async () => {
      const mockData = {
        activeUsers: 100
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const { unmount } = render(<StatisticsGrid />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Advance time by 30 seconds after unmount
      vi.advanceTimersByTime(30000);

      // Should not fetch after unmount
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getAllByText('خطأ في تحميل البيانات').length).toBeGreaterThan(0);
      });
    });

    it('should display error when response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getAllByText('خطأ في تحميل البيانات').length).toBeGreaterThan(0);
      });
    });

    it('should retry after error on next interval', async () => {
      // First call fails
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activeUsers: 100 })
      });

      render(<StatisticsGrid />);

      // Wait for first (failed) fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30000);

      // Should retry and succeed
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(screen.getByText('100')).toBeTruthy();
      });
    });
  });

  describe('Statistics Display', () => {
    it('should display all 5 statistics widgets', async () => {
      const mockData = {
        activeUsers: 100,
        jobsToday: 50,
        applicationsToday: 200,
        enrollmentsToday: 30,
        reviewsToday: 15
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getByText('المستخدمون النشطون')).toBeTruthy();
        expect(screen.getByText('الوظائف اليوم')).toBeTruthy();
        expect(screen.getByText('الطلبات اليوم')).toBeTruthy();
        expect(screen.getByText('التسجيلات اليوم')).toBeTruthy();
        expect(screen.getByText('التقييمات اليوم')).toBeTruthy();
      });
    });

    it('should handle missing data gracefully', async () => {
      const mockData = {}; // Empty response

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        // Should display 0 for all values
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThan(0);
      });
    });

    it('should display last update time', async () => {
      const mockData = {
        activeUsers: 100
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getByText(/آخر تحديث:/)).toBeTruthy();
      });
    });

    it('should display auto-refresh message', async () => {
      const mockData = {
        activeUsers: 100
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid />);

      await waitFor(() => {
        expect(screen.getByText('التحديث التلقائي كل 30 ثانية')).toBeTruthy();
      });
    });
  });

  describe('Custom API URL', () => {
    it('should use custom API URL when provided', async () => {
      const customUrl = '/api/custom/statistics';
      const mockData = {
        activeUsers: 100
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      render(<StatisticsGrid apiUrl={customUrl} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          customUrl,
          expect.any(Object)
        );
      });
    });
  });
});
