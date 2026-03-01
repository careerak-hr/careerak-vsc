/**
 * 🧪 New For You Component Tests
 * اختبارات مكون "جديد لك"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import NewForYou from './NewForYou';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage;

// Mock user
const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com'
};

// Mock recommendations
const mockRecommendations = [
  {
    _id: 'rec1',
    userId: 'user123',
    itemType: 'job',
    itemId: {
      title: 'Senior Developer',
      company: { name: 'Tech Corp' },
      description: 'Great opportunity for experienced developers...'
    },
    score: 85,
    reasons: [
      'تطابق 90% مع مهاراتك',
      'خبرة مناسبة للمستوى المطلوب'
    ],
    createdAt: '2026-02-28T10:00:00Z'
  },
  {
    _id: 'rec2',
    userId: 'user123',
    itemType: 'job',
    itemId: {
      title: 'Frontend Engineer',
      company: { name: 'Design Studio' },
      description: 'Looking for creative frontend developers...'
    },
    score: 78,
    reasons: [
      'مهارات React مطابقة',
      'موقع قريب منك'
    ],
    createdAt: '2026-02-28T10:00:00Z'
  }
];

// Wrapper component with AppContext
const Wrapper = ({ children }) => (
  <AppProvider value={{ language: 'ar', user: mockUser }}>
    {children}
  </AppProvider>
);

describe('NewForYou Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<NewForYou />, { wrapper: Wrapper });

      expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/جاري التحميل/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should display recommendations when fetch succeeds', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
        expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      });
    });

    it('should display match scores', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('78%')).toBeInTheDocument();
      });
    });

    it('should display company names', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
        expect(screen.getByText('Design Studio')).toBeInTheDocument();
      });
    });

    it('should display recommendation reasons', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('تطابق 90% مع مهاراتك')).toBeInTheDocument();
        expect(screen.getByText('مهارات React مطابقة')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/فشل في تحميل التوصيات/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/إعادة المحاولة/i)).toBeInTheDocument();
      });
    });

    it('should retry fetch when retry button is clicked', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            count: 2,
            recommendations: mockRecommendations
          })
        });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/فشل في تحميل التوصيات/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByText(/إعادة المحاولة/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no recommendations', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 0,
          recommendations: []
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/لا توجد توصيات جديدة حالياً/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should mark recommendation as seen when clicked', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            count: 1,
            recommendations: [mockRecommendations[0]]
          })
        })
        .mockResolvedValueOnce({ ok: true }); // Mark as seen

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      });

      const card = screen.getByText('Senior Developer').closest('.recommendation-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/recommendations/rec1/seen'),
          expect.objectContaining({
            method: 'PATCH'
          })
        );
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with correct URL and headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 0,
          recommendations: []
        })
      });

      render(<NewForYou limit={10} />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/recommendations/new?limit=10'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-token',
              'Content-Type': 'application/json'
            })
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByLabelText(/تقديم/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/حفظ/i)).toBeInTheDocument();
      });
    });

    it('should have semantic HTML structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      const { container } = render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(container.querySelector('section')).toBeInTheDocument();
        expect(container.querySelector('article')).toBeInTheDocument();
        expect(container.querySelector('h2')).toBeInTheDocument();
        expect(container.querySelector('h3')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render grid layout', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          recommendations: mockRecommendations
        })
      });

      const { container } = render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(container.querySelector('.recommendations-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Internationalization', () => {
    it('should display Arabic text by default', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 0,
          recommendations: []
        })
      });

      render(<NewForYou />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('جديد لك')).toBeInTheDocument();
      });
    });

    it('should display English text when language is en', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 0,
          recommendations: []
        })
      });

      const EnglishWrapper = ({ children }) => (
        <AppProvider value={{ language: 'en', user: mockUser }}>
          {children}
        </AppProvider>
      );

      render(<NewForYou />, { wrapper: EnglishWrapper });

      await waitFor(() => {
        expect(screen.getByText('New For You')).toBeInTheDocument();
      });
    });
  });
});
