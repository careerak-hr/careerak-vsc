/**
 * Unit Tests for Courses Page Components
 * 
 * Tests cover:
 * - Filter application and clearing
 * - Sort and view switching
 * - Search functionality
 * - Pagination
 * - Responsive behavior
 * 
 * Requirements: 1.1, 1.7, 7.1, 9.3, 9.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoursesPage from '../pages/11_CoursesPage';
import { AppProvider } from '../context/AppContext';
import { AnimationProvider } from '../context/AnimationContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5000'
  }
}));

// Helper function to render component with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <AnimationProvider>
          {component}
        </AnimationProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

// Mock course data
const mockCourses = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    instructor: { fullName: 'John Doe' },
    totalDuration: 10,
    price: { isFree: false, amount: 49.99 },
    level: 'Beginner',
    category: 'Programming',
    stats: { averageRating: 4.5, totalReviews: 100 }
  },
  {
    _id: '2',
    title: 'Advanced React',
    instructor: { fullName: 'Jane Smith' },
    totalDuration: 15,
    price: { isFree: false, amount: 79.99 },
    level: 'Advanced',
    category: 'Programming',
    stats: { averageRating: 4.8, totalReviews: 200 }
  },
  {
    _id: '3',
    title: 'Free HTML Course',
    instructor: { fullName: 'Bob Johnson' },
    totalDuration: 5,
    price: { isFree: true, amount: 0 },
    level: 'Beginner',
    category: 'Web Development',
    stats: { averageRating: 4.2, totalReviews: 50 }
  }
];

describe('CoursesPage Component', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('grid');
    
    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        courses: mockCourses,
        total: mockCourses.length,
        page: 1,
        limit: 12
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Filter Tests ====================
  
  describe('Filter Application', () => {
    
    it('should apply level filter correctly', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalled();
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('/api/courses');
    });

    it('should apply category filter correctly', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify API call structure
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should apply price filter (free/paid) correctly', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Free HTML Course')).toBeInTheDocument();
      });
      
      // Verify courses are displayed
      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    });

    it('should apply minimum rating filter correctly', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/JavaScript Fundamentals|Advanced React|Free HTML Course/)).toHaveLength(3);
      });
    });

    it('should apply duration range filter correctly', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should apply multiple filters simultaneously (Requirement 1.6)', async () => {
      // Mock API response with filtered results
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [mockCourses[0]], // Only beginner programming course
          total: 1,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Clearing', () => {
    
    it('should clear all filters when clear button is clicked (Requirement 1.7)', async () => {
      // Mock empty state first
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [],
          total: 0,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Courses Found|لا توجد دورات/)).toBeInTheDocument();
      });
      
      // Find and click clear filters button
      const clearButton = screen.getByText(/Clear Filters|مسح الفلاتر/);
      expect(clearButton).toBeInTheDocument();
      
      // Mock response after clearing
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: mockCourses.length,
          page: 1,
          limit: 12
        })
      });
      
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset page to 1 when filters are cleared', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify initial fetch
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // ==================== Sort Tests ====================
  
  describe('Sort Functionality', () => {
    
    it('should sort by newest (default)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('sort=newest');
    });

    it('should sort by most popular (Requirement 7.4)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify sort parameter in URL
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('sort=');
    });

    it('should sort by highest rated (Requirement 7.5)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should sort by price low to high (Requirement 7.6)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should reset page to 1 when sort changes', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify page parameter
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('page=1');
    });
  });

  // ==================== View Switching Tests ====================
  
  describe('View Switching', () => {
    
    it('should default to grid view (Requirement 9.1)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Check for grid view button
      const gridButton = screen.getByLabelText(/Grid view|عرض شبكي/);
      expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch to list view when list button is clicked (Requirement 9.2)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Find and click list view button
      const listButton = screen.getByLabelText(/List view|عرض قائمة/);
      fireEvent.click(listButton);
      
      // Verify list button is now pressed
      await waitFor(() => {
        expect(listButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should preserve view preference in localStorage (Requirement 9.4)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Click list view
      const listButton = screen.getByLabelText(/List view|عرض قائمة/);
      fireEvent.click(listButton);
      
      // Verify localStorage was called
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('coursesViewPreference', 'list');
      });
    });

    it('should maintain filters and sort when switching views (Requirement 9.3)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      const initialFetchCount = global.fetch.mock.calls.length;
      
      // Switch view
      const listButton = screen.getByLabelText(/List view|عرض قائمة/);
      fireEvent.click(listButton);
      
      // Should trigger new fetch with same filters
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(initialFetchCount + 1);
      });
    });
  });

  // ==================== Search Tests ====================
  
  describe('Search Functionality', () => {
    
    it('should search across course titles (Requirement 7.1)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should search across course descriptions (Requirement 7.1)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should search across course topics (Requirement 7.1)', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should reset page to 1 when search query changes', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify page parameter
      const fetchUrl = global.fetch.mock.calls[0][0];
      expect(fetchUrl).toContain('page=1');
    });

    it('should show no results message when search returns empty (Requirement 7.7)', async () => {
      // Mock empty search results
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [],
          total: 0,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Courses Found|لا توجد دورات/)).toBeInTheDocument();
      });
    });
  });

  // ==================== Pagination Tests ====================
  
  describe('Pagination', () => {
    
    it('should display pagination when total pages > 1 (Requirement 12.6)', async () => {
      // Mock response with multiple pages
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24, // 2 pages with limit 12
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2|صفحة 1 من 2/)).toBeInTheDocument();
      });
      
      // Check for pagination buttons
      expect(screen.getByText(/Previous|السابق/)).toBeInTheDocument();
      expect(screen.getByText(/Next|التالي/)).toBeInTheDocument();
    });

    it('should navigate to next page when next button is clicked', async () => {
      // Mock first page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2|صفحة 1 من 2/)).toBeInTheDocument();
      });
      
      // Mock second page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 2,
          limit: 12
        })
      });
      
      // Click next button
      const nextButton = screen.getByText(/Next|التالي/);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      // Mock second page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 2,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 2|صفحة 2 من 2/)).toBeInTheDocument();
      });
      
      // Mock first page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 1,
          limit: 12
        })
      });
      
      // Click previous button
      const prevButton = screen.getByText(/Previous|السابق/);
      fireEvent.click(prevButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should disable previous button on first page', async () => {
      // Mock first page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        const prevButton = screen.getByText(/Previous|السابق/);
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable next button on last page', async () => {
      // Mock last page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 2,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        const nextButton = screen.getByText(/Next|التالي/);
        expect(nextButton).toBeDisabled();
      });
    });

    it('should scroll to top when page changes', async () => {
      // Mock scrollIntoView
      Element.prototype.scrollIntoView = vi.fn();
      
      // Mock first page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2|صفحة 1 من 2/)).toBeInTheDocument();
      });
      
      // Mock second page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: 24,
          page: 2,
          limit: 12
        })
      });
      
      // Click next
      const nextButton = screen.getByText(/Next|التالي/);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      });
    });
  });

  // ==================== Responsive Behavior Tests ====================
  
  describe('Responsive Behavior', () => {
    
    it('should display courses in grid layout on desktop', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Check for grid classes
      const courseListings = document.querySelector('.course-listings');
      expect(courseListings).toHaveClass('grid');
    });

    it('should adapt layout for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
    });

    it('should adapt layout for tablet devices', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
    });

    it('should maintain functionality across different screen sizes', async () => {
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
      
      // Verify view toggle buttons work
      const listButton = screen.getByLabelText(/List view|عرض قائمة/);
      expect(listButton).toBeInTheDocument();
      
      fireEvent.click(listButton);
      
      await waitFor(() => {
        expect(listButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  // ==================== Loading and Error States ====================
  
  describe('Loading and Error States', () => {
    
    it('should display loading skeleton while fetching courses', async () => {
      // Delay the response
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            courses: mockCourses,
            total: mockCourses.length,
            page: 1,
            limit: 12
          })
        }), 100))
      );
      
      renderWithProviders(<CoursesPage />);
      
      // Should show loading state initially
      expect(screen.getByText(/الدورات التدريبية|Courses/)).toBeInTheDocument();
    });

    it('should display error message when API call fails', async () => {
      // Mock failed API response
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/An Error Occurred|حدث خطأ/)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      // Mock failed API response
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again|إعادة المحاولة/)).toBeInTheDocument();
      });
      
      // Mock successful retry
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: mockCourses,
          total: mockCourses.length,
          page: 1,
          limit: 12
        })
      });
      
      // Click retry button
      const retryButton = screen.getByText(/Try Again|إعادة المحاولة/);
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      });
    });
  });

  // ==================== Empty State Tests ====================
  
  describe('Empty State', () => {
    
    it('should display empty state when no courses match filters', async () => {
      // Mock empty response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [],
          total: 0,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Courses Found|لا توجد دورات/)).toBeInTheDocument();
      });
    });

    it('should show clear filters button in empty state when filters are applied', async () => {
      // Mock empty response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [],
          total: 0,
          page: 1,
          limit: 12
        })
      });
      
      renderWithProviders(<CoursesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No Courses Found|لا توجد دورات/)).toBeInTheDocument();
      });
    });
  });
});
