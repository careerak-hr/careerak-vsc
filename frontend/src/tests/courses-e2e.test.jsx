/**
 * Frontend E2E Tests for Courses Page
 * 
 * Tests user interactions and UI behavior
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import CoursePlayerPage from '../pages/CoursePlayerPage';

// Mock API calls
global.fetch = jest.fn();

const mockCourses = [
  {
    _id: '1',
    title: 'JavaScript Basics',
    description: 'Learn JavaScript from scratch',
    level: 'Beginner',
    category: 'Programming',
    totalDuration: 10,
    totalLessons: 20,
    price: { amount: 0, isFree: true },
    stats: { averageRating: 4.5, totalEnrollments: 100, totalReviews: 50 },
    badges: [{ type: 'new' }]
  },
  {
    _id: '2',
    title: 'Advanced React',
    description: 'Master React development',
    level: 'Advanced',
    category: 'Programming',
    totalDuration: 20,
    totalLessons: 40,
    price: { amount: 99, isFree: false },
    stats: { averageRating: 4.8, totalEnrollments: 50, totalReviews: 30 },
    badges: [{ type: 'top_rated' }]
  }
];

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Courses Page E2E - Frontend', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ============================================================================
  // Test 17.1: Browse → Filter → View Details → Enroll
  // ============================================================================
  describe('17.1 Browse and Filter Courses', () => {
    test('should display courses on page load', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
        expect(screen.getByText('Advanced React')).toBeInTheDocument();
      });
    });

    test('should filter courses by level', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const levelFilter = screen.getByLabelText(/Beginner/i);
        fireEvent.click(levelFilter);
      });

      // Should trigger new API call with filter
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('level=Beginner'),
        expect.any(Object)
      );
    });

    test('should filter courses by price', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const freeFilter = screen.getByLabelText(/Free/i);
        fireEvent.click(freeFilter);
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('isFree=true'),
        expect.any(Object)
      );
    });

    test('should search courses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search/i);
        fireEvent.change(searchInput, { target: { value: 'JavaScript' } });
      });

      // Debounced search should trigger
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=JavaScript'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    test('should sort courses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const sortSelect = screen.getByLabelText(/sort/i);
        fireEvent.change(sortSelect, { target: { value: 'rating' } });
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=rating'),
        expect.any(Object)
      );
    });

    test('should toggle view mode', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const listViewButton = screen.getByLabelText(/list view/i);
        fireEvent.click(listViewButton);
      });

      // Should update view state
      expect(screen.getByTestId('course-list')).toBeInTheDocument();
    });

    test('should clear all filters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const clearButton = screen.getByText(/clear all/i);
        fireEvent.click(clearButton);
      });

      // Should reset to default API call
      expect(fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('level='),
        expect.any(Object)
      );
    });
  });

  // ============================================================================
  // Test 17.5: Responsive Design
  // ============================================================================
  describe('17.5 Responsive Design', () => {
    test('should be responsive on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      // Mobile layout should show single column
      const grid = screen.getByTestId('course-grid');
      expect(grid).toHaveClass('grid-cols-1');
    });

    test('should be responsive on tablet', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      // Tablet layout should show two columns
      const grid = screen.getByTestId('course-grid');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    test('should be responsive on desktop', () => {
      global.innerWidth = 1440;
      global.dispatchEvent(new Event('resize'));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      // Desktop layout should show four columns
      const grid = screen.getByTestId('course-grid');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    test('should support RTL mode', () => {
      document.documentElement.dir = 'rtl';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      const container = screen.getByTestId('courses-page');
      expect(container).toHaveAttribute('dir', 'rtl');

      document.documentElement.dir = 'ltr';
    });

    test('should have proper touch targets on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(44); // 44px minimum
      });
    });
  });

  // ============================================================================
  // Test 17.7: Performance
  // ============================================================================
  describe('17.7 Performance Tests', () => {
    test('should load courses within 2 seconds', async () => {
      const startTime = performance.now();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000);
    });

    test('should lazy load images', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('loading', 'lazy');
        });
      });
    });

    test('should debounce search input', async () => {
      jest.useFakeTimers();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: mockCourses, total: 2 })
      });

      renderWithProviders(<CoursesPage />);

      const searchInput = await screen.findByPlaceholderText(/search/i);

      // Type multiple characters quickly
      fireEvent.change(searchInput, { target: { value: 'J' } });
      fireEvent.change(searchInput, { target: { value: 'Ja' } });
      fireEvent.change(searchInput, { target: { value: 'Jav' } });

      // Should not call API yet
      expect(fetch).toHaveBeenCalledTimes(1); // Only initial load

      // Fast-forward time
      jest.advanceTimersByTime(500);

      // Now should call API once
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });
  });
});
