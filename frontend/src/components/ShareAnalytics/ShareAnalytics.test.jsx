/**
 * Unit tests for ShareAnalytics component
 * Validates: Requirement 15 (Share Analytics tracking)
 * - 15.1: Record share events with timestamp, content type, share method
 * - 15.3: Calculate share rate
 * - 15.4: Dashboard showing most shared content by type and platform
 * Validates: Requirement 18 (Multi-language support: ar, en, fr)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';
import ShareAnalytics from './ShareAnalytics';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaShareAlt: () => <span data-testid="icon-share-alt" />,
  FaBriefcase: () => <span data-testid="icon-briefcase" />,
  FaGraduationCap: () => <span data-testid="icon-graduation" />,
  FaUser: () => <span data-testid="icon-user" />,
  FaBuilding: () => <span data-testid="icon-building" />,
  FaWhatsapp: () => <span data-testid="icon-whatsapp" />,
  FaLinkedin: () => <span data-testid="icon-linkedin" />,
  FaTwitter: () => <span data-testid="icon-twitter" />,
  FaFacebook: () => <span data-testid="icon-facebook" />,
  FaTelegram: () => <span data-testid="icon-telegram" />,
  FaEnvelope: () => <span data-testid="icon-envelope" />,
  FaLink: () => <span data-testid="icon-link" />,
  FaCommentDots: () => <span data-testid="icon-comment" />,
  FaMobile: () => <span data-testid="icon-mobile" />,
  FaCalendarAlt: () => <span data-testid="icon-calendar" />,
}));

const makeContext = (language = 'en') => ({ language, token: 'test-token' });

const renderWithContext = (ui, language = 'en') =>
  render(
    <AppContext.Provider value={makeContext(language)}>
      {ui}
    </AppContext.Provider>
  );

// Mock API responses
const mockSummaryData = {
  success: true,
  data: {
    total: 150,
    byContentType: [
      { _id: 'job', count: 80 },
      { _id: 'course', count: 40 },
      { _id: 'profile', count: 20 },
      { _id: 'company', count: 10 },
    ],
  },
};

const mockPlatformData = {
  success: true,
  data: {
    byPlatform: [
      { _id: 'whatsapp', count: 50 },
      { _id: 'linkedin', count: 40 },
      { _id: 'twitter', count: 30 },
      { _id: 'facebook', count: 20 },
      { _id: 'copy_link', count: 10 },
    ],
  },
};

const mockTopContentData = {
  success: true,
  data: {
    topContent: [
      { contentType: 'job', contentId: 'job001', shareCount: 25 },
      { contentType: 'course', contentId: 'course001', shareCount: 18 },
      { contentType: 'job', contentId: 'job002', shareCount: 12 },
    ],
  },
};

const setupFetchMock = (overrides = {}) => {
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/analytics/summary')) {
      return Promise.resolve({
        json: () => Promise.resolve(overrides.summary || mockSummaryData),
      });
    }
    if (url.includes('/analytics/by-platform')) {
      return Promise.resolve({
        json: () => Promise.resolve(overrides.platform || mockPlatformData),
      });
    }
    if (url.includes('/analytics/top-content')) {
      return Promise.resolve({
        json: () => Promise.resolve(overrides.topContent || mockTopContentData),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({ success: false }) });
  });
};

describe('ShareAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetchMock();
  });

  // ─── Loading state ────────────────────────────────────────────────────────

  describe('Loading state', () => {
    it('shows loading indicator while fetching data', () => {
      global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
      renderWithContext(<ShareAnalytics token="test-token" />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('hides loading indicator after data is fetched', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  // ─── Error state ──────────────────────────────────────────────────────────

  describe('Error state', () => {
    it('shows error message when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      });
    });
  });

  // ─── Requirement 15: Share Analytics data display ─────────────────────────

  describe('Analytics data display (Req 15)', () => {
    it('displays total shares count (Req 15.3)', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });
    });

    it('displays "Total Shares" label', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('Total Shares')).toBeInTheDocument();
      });
    });

    it('displays content type breakdown (Req 15.4)', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('By Content Type')).toBeInTheDocument();
        // Use getAllByText since "Job" appears in both content-type list and top-content table
        expect(screen.getAllByText('Job').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Course').length).toBeGreaterThan(0);
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Company')).toBeInTheDocument();
      });
    });

    it('displays share counts for each content type', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('80 shares')).toBeInTheDocument();
        expect(screen.getByText('40 shares')).toBeInTheDocument();
        expect(screen.getByText('20 shares')).toBeInTheDocument();
        expect(screen.getByText('10 shares')).toBeInTheDocument();
      });
    });

    it('displays platform breakdown (Req 15.4)', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('By Platform')).toBeInTheDocument();
      });
    });

    it('displays top shared content table (Req 15.4)', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('Most Shared')).toBeInTheDocument();
      });
    });

    it('displays top content with rank numbers', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('displays share counts in top content table', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });

    it('shows "No data available" when no content type data', async () => {
      setupFetchMock({
        summary: {
          success: true,
          data: { total: 0, byContentType: [] },
        },
      });
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getAllByText('No data available').length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Date range filter ────────────────────────────────────────────────────

  describe('Date range filter', () => {
    it('renders preset period buttons', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('Last 7 days')).toBeInTheDocument();
        expect(screen.getByText('Last 30 days')).toBeInTheDocument();
        expect(screen.getByText('Last 90 days')).toBeInTheDocument();
      });
    });

    it('highlights the active period button (30 days by default)', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        const btn30 = screen.getByText('Last 30 days');
        expect(btn30).toHaveClass('period-btn-active');
      });
    });

    it('changes active period when a preset button is clicked', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => expect(screen.getByText('Last 7 days')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Last 7 days'));

      await waitFor(() => {
        expect(screen.getByText('Last 7 days')).toHaveClass('period-btn-active');
        expect(screen.getByText('Last 30 days')).not.toHaveClass('period-btn-active');
      });
    });

    it('re-fetches data when period changes', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => expect(screen.getByText('Last 7 days')).toBeInTheDocument());

      const initialCallCount = global.fetch.mock.calls.length;
      fireEvent.click(screen.getByText('Last 7 days'));

      await waitFor(() => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('fetches with correct days parameter for 7-day preset', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      // Wait for initial load to complete
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

      // Clear previous calls and click 7-day preset
      global.fetch.mockClear();
      fireEvent.click(screen.getByText('Last 7 days'));

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const summaryCall = calls.find(([url]) => url.includes('/analytics/summary'));
        expect(summaryCall).toBeTruthy();
        expect(summaryCall[0]).toContain('days=7');
      });
    });

    it('shows custom range toggle button', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('Custom Range')).toBeInTheDocument();
      });
    });

    it('shows date inputs when custom range is toggled', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => expect(screen.getByText('Custom Range')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Custom Range'));

      await waitFor(() => {
        expect(screen.getByText('From')).toBeInTheDocument();
        expect(screen.getByText('To')).toBeInTheDocument();
      });
    });

    it('applies custom date range when Apply is clicked', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => expect(screen.getByText('Custom Range')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Custom Range'));

      await waitFor(() => expect(screen.getByText('Apply')).toBeInTheDocument());

      const initialCallCount = global.fetch.mock.calls.length;
      fireEvent.click(screen.getByText('Apply'));

      await waitFor(() => {
        expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('fetches with startDate/endDate when custom range is applied', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => expect(screen.getByText('Custom Range')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Custom Range'));
      await waitFor(() => expect(screen.getByText('Apply')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Apply'));

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const summaryCall = calls.find(([url]) =>
          url.includes('/analytics/summary') && url.includes('startDate')
        );
        expect(summaryCall).toBeTruthy();
      });
    });
  });

  // ─── Requirement 18: Multi-language support ───────────────────────────────

  describe('Multi-language support (Req 18)', () => {
    it('renders title in English', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'en');
      await waitFor(() => {
        expect(screen.getByText('Share Analytics')).toBeInTheDocument();
      });
    });

    it('renders title in Arabic', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      await waitFor(() => {
        expect(screen.getByText('إحصائيات المشاركة')).toBeInTheDocument();
      });
    });

    it('renders title in French', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'fr');
      await waitFor(() => {
        expect(screen.getByText('Analytiques de partage')).toBeInTheDocument();
      });
    });

    it('renders "Total Shares" in Arabic', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      await waitFor(() => {
        expect(screen.getByText('إجمالي المشاركات')).toBeInTheDocument();
      });
    });

    it('renders "Total Shares" in French', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'fr');
      await waitFor(() => {
        expect(screen.getByText('Total des partages')).toBeInTheDocument();
      });
    });

    it('renders period labels in Arabic', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      await waitFor(() => {
        expect(screen.getByText('آخر 7 أيام')).toBeInTheDocument();
        expect(screen.getByText('آخر 30 يوم')).toBeInTheDocument();
        expect(screen.getByText('آخر 90 يوم')).toBeInTheDocument();
      });
    });

    it('renders period labels in French', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'fr');
      await waitFor(() => {
        expect(screen.getByText('7 derniers jours')).toBeInTheDocument();
        expect(screen.getByText('30 derniers jours')).toBeInTheDocument();
        expect(screen.getByText('90 derniers jours')).toBeInTheDocument();
      });
    });

    it('renders in RTL direction for Arabic', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      await waitFor(() => {
        const container = document.querySelector('.share-analytics');
        expect(container).toHaveAttribute('dir', 'rtl');
      });
    });

    it('renders in LTR direction for English', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'en');
      await waitFor(() => {
        const container = document.querySelector('.share-analytics');
        expect(container).toHaveAttribute('dir', 'ltr');
      });
    });

    it('renders in LTR direction for French', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />, 'fr');
      await waitFor(() => {
        const container = document.querySelector('.share-analytics');
        expect(container).toHaveAttribute('dir', 'ltr');
      });
    });

    it('renders loading text in Arabic', () => {
      global.fetch = vi.fn(() => new Promise(() => {}));
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      expect(screen.getByText('جارٍ التحميل...')).toBeInTheDocument();
    });

    it('renders error text in Arabic', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      renderWithContext(<ShareAnalytics token="test-token" />, 'ar');
      await waitFor(() => {
        expect(screen.getByText('فشل تحميل البيانات')).toBeInTheDocument();
      });
    });
  });

  // ─── API calls ────────────────────────────────────────────────────────────

  describe('API calls', () => {
    it('fetches summary, platform, and top-content data on mount', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        const urls = global.fetch.mock.calls.map(([url]) => url);
        expect(urls.some((u) => u.includes('/analytics/summary'))).toBe(true);
        expect(urls.some((u) => u.includes('/analytics/by-platform'))).toBe(true);
        expect(urls.some((u) => u.includes('/analytics/top-content'))).toBe(true);
      });
    });

    it('includes Authorization header when token is provided', async () => {
      renderWithContext(<ShareAnalytics token="my-auth-token" />);
      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const summaryCall = calls.find(([url]) => url.includes('/analytics/summary'));
        expect(summaryCall[1].headers.Authorization).toBe('Bearer my-auth-token');
      });
    });

    it('fetches with default 30-day period on mount', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const summaryCall = calls.find(([url]) => url.includes('/analytics/summary'));
        expect(summaryCall[0]).toContain('days=30');
      });
    });

    it('requests top 10 content items', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const topCall = calls.find(([url]) => url.includes('/analytics/top-content'));
        expect(topCall[0]).toContain('limit=10');
      });
    });
  });

  // ─── Platform bar chart ───────────────────────────────────────────────────

  describe('Platform bar chart', () => {
    it('renders platform bars for each platform', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        const bars = document.querySelectorAll('.platform-bar-fill');
        expect(bars.length).toBeGreaterThan(0);
      });
    });

    it('renders platform count numbers', async () => {
      renderWithContext(<ShareAnalytics token="test-token" />);
      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('40')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
      });
    });
  });
});
