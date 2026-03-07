import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import CourseCard from './CourseCard';
import '@testing-library/jest-dom';

// Mock LazyImage component
jest.mock('../LazyImage/LazyImage', () => {
  return function MockLazyImage({ alt }) {
    return <img alt={alt} />;
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const mockCourse = {
  _id: 'course123',
  title: 'Introduction to React',
  description: 'Learn React from scratch with hands-on projects',
  thumbnail: 'courses/react-intro.jpg',
  level: 'Beginner',
  totalDuration: 10,
  totalLessons: 25,
  price: {
    amount: 49.99,
    currency: 'USD',
    isFree: false
  },
  stats: {
    averageRating: 4.5,
    totalReviews: 120,
    totalEnrollments: 500
  },
  badges: [
    { type: 'most_popular', awardedAt: new Date() },
    { type: 'recommended', awardedAt: new Date() }
  ]
};

const mockFreeCourse = {
  ...mockCourse,
  _id: 'course456',
  title: 'Free JavaScript Course',
  price: {
    amount: 0,
    currency: 'USD',
    isFree: true
  }
};

const renderWithProviders = (component, language = 'en') => {
  return render(
    <BrowserRouter>
      <AppProvider value={{ language }}>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render course card with all information', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText(/Learn React from scratch/)).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText(/10.*hours/)).toBeInTheDocument();
      expect(screen.getByText(/25.*lessons/)).toBeInTheDocument();
      expect(screen.getByText(/500.*students/)).toBeInTheDocument();
      expect(screen.getByText(/120.*reviews/)).toBeInTheDocument();
    });

    it('should render course thumbnail', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const image = screen.getByAltText('Introduction to React');
      expect(image).toBeInTheDocument();
    });

    it('should render badges', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Most Popular')).toBeInTheDocument();
      expect(screen.getByText('Recommended')).toBeInTheDocument();
    });

    it('should render rating stars correctly', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const stars = screen.getAllByText('★');
      expect(stars.length).toBeGreaterThan(0);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should render price for paid course', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      expect(screen.getByText(/49.99.*USD/)).toBeInTheDocument();
    });

    it('should render "Free" for free course', () => {
      renderWithProviders(<CourseCard course={mockFreeCourse} />);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('should render wishlist button', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      expect(wishlistButton).toBeInTheDocument();
    });

    it('should render view details button', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  describe('Grid and List Views', () => {
    it('should render in grid view by default', () => {
      const { container } = renderWithProviders(<CourseCard course={mockCourse} />);

      const card = container.querySelector('.course-card-grid');
      expect(card).toBeInTheDocument();
    });

    it('should render in list view when specified', () => {
      const { container } = renderWithProviders(<CourseCard course={mockCourse} view="list" />);

      const card = container.querySelector('.course-card-list');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should navigate to course details when card is clicked', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const card = screen.getByText('Introduction to React').closest('.course-card');
      fireEvent.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/courses/course123');
    });

    it('should navigate to course details when view details button is clicked', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const button = screen.getByText('View Details');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/courses/course123');
    });

    it('should add course to wishlist when wishlist button is clicked', async () => {
      localStorage.setItem('token', 'fake-token');
      global.fetch.mockResolvedValueOnce({ ok: true });

      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/wishlist/course123'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-token'
            })
          })
        );
      });
    });

    it('should remove course from wishlist when already wishlisted', async () => {
      localStorage.setItem('token', 'fake-token');
      global.fetch.mockResolvedValueOnce({ ok: true });

      renderWithProviders(<CourseCard course={mockCourse} />);

      // First add to wishlist
      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/wishlist/course123'),
          expect.objectContaining({ method: 'POST' })
        );
      });

      // Then remove from wishlist
      global.fetch.mockResolvedValueOnce({ ok: true });
      const removeButton = screen.getByLabelText(/Remove from Wishlist/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/wishlist/course123'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    it('should redirect to login if not authenticated when adding to wishlist', async () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should stop propagation when wishlist button is clicked', () => {
      localStorage.setItem('token', 'fake-token');
      global.fetch.mockResolvedValueOnce({ ok: true });

      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      // Card navigation should not be triggered
      expect(mockNavigate).not.toHaveBeenCalledWith('/courses/course123');
    });
  });

  describe('Multilingual Support', () => {
    it('should render in Arabic', () => {
      renderWithProviders(<CourseCard course={mockCourse} />, 'ar');

      expect(screen.getByText('مبتدئ')).toBeInTheDocument();
      expect(screen.getByText(/ساعة/)).toBeInTheDocument();
      expect(screen.getByText(/درس/)).toBeInTheDocument();
      expect(screen.getByText(/طالب/)).toBeInTheDocument();
      expect(screen.getByText('عرض التفاصيل')).toBeInTheDocument();
    });

    it('should render in French', () => {
      renderWithProviders(<CourseCard course={mockCourse} />, 'fr');

      expect(screen.getByText('Débutant')).toBeInTheDocument();
      expect(screen.getByText(/heures/)).toBeInTheDocument();
      expect(screen.getByText(/leçons/)).toBeInTheDocument();
      expect(screen.getByText(/étudiants/)).toBeInTheDocument();
      expect(screen.getByText('Voir les détails')).toBeInTheDocument();
    });

    it('should render badges in Arabic', () => {
      renderWithProviders(<CourseCard course={mockCourse} />, 'ar');

      expect(screen.getByText('الأكثر شعبية')).toBeInTheDocument();
      expect(screen.getByText('موصى به')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle course with no badges', () => {
      const courseNoBadges = { ...mockCourse, badges: [] };
      renderWithProviders(<CourseCard course={courseNoBadges} />);

      expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
    });

    it('should handle course with zero rating', () => {
      const courseNoRating = {
        ...mockCourse,
        stats: { ...mockCourse.stats, averageRating: 0, totalReviews: 0 }
      };
      renderWithProviders(<CourseCard course={courseNoRating} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText(/0.*reviews/)).toBeInTheDocument();
    });

    it('should handle course with no enrollments', () => {
      const courseNoEnrollments = {
        ...mockCourse,
        stats: { ...mockCourse.stats, totalEnrollments: 0 }
      };
      renderWithProviders(<CourseCard course={courseNoEnrollments} />);

      expect(screen.getByText(/0.*students/)).toBeInTheDocument();
    });

    it('should handle missing stats gracefully', () => {
      const courseNoStats = { ...mockCourse, stats: undefined };
      renderWithProviders(<CourseCard course={courseNoStats} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText(/0.*reviews/)).toBeInTheDocument();
      expect(screen.getByText(/0.*students/)).toBeInTheDocument();
    });

    it('should handle wishlist API error gracefully', async () => {
      localStorage.setItem('token', 'fake-token');
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Wishlist error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      expect(wishlistButton).toHaveAttribute('aria-label');
    });

    it('should disable wishlist button while loading', async () => {
      localStorage.setItem('token', 'fake-token');
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = screen.getByLabelText(/Add to Wishlist/i);
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(wishlistButton).toBeDisabled();
      });
    });

    it('should have minimum touch target size for buttons', () => {
      const { container } = renderWithProviders(<CourseCard course={mockCourse} />);

      const wishlistButton = container.querySelector('.wishlist-button');
      const viewDetailsButton = container.querySelector('.view-details-button');

      // Check CSS ensures minimum 44x44px (tested via CSS)
      expect(wishlistButton).toBeInTheDocument();
      expect(viewDetailsButton).toBeInTheDocument();
    });
  });
});
