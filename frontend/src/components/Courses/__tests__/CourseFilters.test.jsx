import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import CourseFilters from '../CourseFilters';

// Mock AppContext
const mockAppContext = {
  language: 'en',
  setLanguage: jest.fn(),
  isDark: false,
  toggleTheme: jest.fn(),
};

const renderWithContext = (component) => {
  return render(
    <AppProvider value={mockAppContext}>
      {component}
    </AppProvider>
  );
};

describe('CourseFilters Component', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();
  const defaultFilters = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all filter groups', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Duration (hours)')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
    });

    it('should render mobile toggle button on small screens', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const toggleBtn = screen.getByLabelText('Filters');
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveClass('filter-toggle-btn');
    });

    it('should render clear all button', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Level Filter', () => {
    it('should handle level selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const beginnerCheckbox = screen.getByLabelText(/beginner/i);
      fireEvent.click(beginnerCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        level: 'Beginner',
      });
    });

    it('should toggle level selection', () => {
      renderWithContext(
        <CourseFilters
          filters={{ level: 'Beginner' }}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const beginnerCheckbox = screen.getByLabelText(/beginner/i);
      fireEvent.click(beginnerCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        level: '',
      });
    });

    it('should render all level options', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByLabelText(/beginner/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/intermediate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/advanced/i)).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    it('should handle category selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const categorySelect = screen.getByRole('combobox');
      fireEvent.change(categorySelect, { target: { value: 'Programming' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        category: 'Programming',
      });
    });

    it('should render all category options', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const categorySelect = screen.getByRole('combobox');
      const options = categorySelect.querySelectorAll('option');

      expect(options.length).toBeGreaterThan(1); // Including "Select Category"
      expect(Array.from(options).some(opt => opt.value === 'Programming')).toBe(true);
      expect(Array.from(options).some(opt => opt.value === 'Design')).toBe(true);
    });
  });

  describe('Duration Filter', () => {
    it('should handle duration slider change', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        maxDuration: 50,
      });
    });

    it('should handle min duration input change', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const minInput = screen.getByPlaceholderText('Min');
      fireEvent.change(minInput, { target: { value: '10' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        minDuration: '10',
      });
    });

    it('should handle max duration input change', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const maxInput = screen.getByPlaceholderText('Max');
      fireEvent.change(maxInput, { target: { value: '50' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        maxDuration: '50',
      });
    });

    it('should display duration range', () => {
      renderWithContext(
        <CourseFilters
          filters={{ minDuration: 10, maxDuration: 50 }}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('10h')).toBeInTheDocument();
      expect(screen.getByText('50h')).toBeInTheDocument();
    });
  });

  describe('Price Filter', () => {
    it('should handle "All" price selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const allRadio = screen.getByLabelText(/all/i);
      fireEvent.click(allRadio);

      expect(mockOnChange).toHaveBeenCalledWith({
        isFree: undefined,
      });
    });

    it('should handle "Free" price selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const freeRadio = screen.getByLabelText(/free/i);
      fireEvent.click(freeRadio);

      expect(mockOnChange).toHaveBeenCalledWith({
        isFree: 'true',
      });
    });

    it('should handle "Paid" price selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const paidRadio = screen.getByLabelText(/paid/i);
      fireEvent.click(paidRadio);

      expect(mockOnChange).toHaveBeenCalledWith({
        isFree: 'false',
      });
    });
  });

  describe('Rating Filter', () => {
    it('should handle rating selection', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const ratingButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('stars')
      );

      fireEvent.click(ratingButtons[0]); // 5 stars

      expect(mockOnChange).toHaveBeenCalledWith({
        minRating: 5,
      });
    });

    it('should toggle rating selection', () => {
      renderWithContext(
        <CourseFilters
          filters={{ minRating: 5 }}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const ratingButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('stars')
      );

      fireEvent.click(ratingButtons[0]); // 5 stars

      expect(mockOnChange).toHaveBeenCalledWith({
        minRating: '',
      });
    });

    it('should render all rating options (1-5 stars)', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const ratingButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('stars')
      );

      expect(ratingButtons.length).toBe(5);
    });
  });

  describe('Clear Filters', () => {
    it('should call onClear when clear button is clicked', () => {
      renderWithContext(
        <CourseFilters
          filters={{ level: 'Beginner' }}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const clearBtn = screen.getByText('Clear All');
      fireEvent.click(clearBtn);

      expect(mockOnClear).toHaveBeenCalled();
    });

    it('should disable clear button when no filters applied', () => {
      renderWithContext(
        <CourseFilters
          filters={{}}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const clearBtn = screen.getByText('Clear All');
      expect(clearBtn).toBeDisabled();
    });
  });

  describe('Mobile Drawer', () => {
    it('should toggle drawer on mobile', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const toggleBtn = screen.getByLabelText('Filters');
      const filterPanel = screen.getByRole('complementary');

      expect(filterPanel).not.toHaveClass('open');

      fireEvent.click(toggleBtn);
      expect(filterPanel).toHaveClass('open');

      fireEvent.click(toggleBtn);
      expect(filterPanel).not.toHaveClass('open');
    });

    it('should close drawer when overlay is clicked', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const toggleBtn = screen.getByLabelText('Filters');
      fireEvent.click(toggleBtn);

      const overlay = document.querySelector('.filter-overlay');
      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay);
      
      const filterPanel = screen.getByRole('complementary');
      expect(filterPanel).not.toHaveClass('open');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Filters');
      expect(screen.getByLabelText('Filters')).toBeInTheDocument();
    });

    it('should have minimum touch target sizes', () => {
      renderWithContext(
        <CourseFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const toggleBtn = screen.getByLabelText('Filters');
      const styles = window.getComputedStyle(toggleBtn);
      
      // Check if min-height is set (44px for accessibility)
      expect(toggleBtn).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('Multi-language Support', () => {
    it('should render in Arabic', () => {
      const arabicContext = { ...mockAppContext, language: 'ar' };
      
      render(
        <AppProvider value={arabicContext}>
          <CourseFilters
            filters={defaultFilters}
            onChange={mockOnChange}
            onClear={mockOnClear}
          />
        </AppProvider>
      );

      expect(screen.getByText('الفلاتر')).toBeInTheDocument();
      expect(screen.getByText('المستوى')).toBeInTheDocument();
    });

    it('should render in French', () => {
      const frenchContext = { ...mockAppContext, language: 'fr' };
      
      render(
        <AppProvider value={frenchContext}>
          <CourseFilters
            filters={defaultFilters}
            onChange={mockOnChange}
            onClear={mockOnClear}
          />
        </AppProvider>
      );

      expect(screen.getByText('Filtres')).toBeInTheDocument();
      expect(screen.getByText('Niveau')).toBeInTheDocument();
    });
  });
});
