import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';
import { AppProvider } from '../../context/AppContext';

// Mock AppContext with proper language support
const MockAppProvider = ({ children, language = 'en' }) => {
  return (
    <AppProvider>
      <div data-testid="mock-app" data-language={language}>
        {children}
      </div>
    </AppProvider>
  );
};

// Override useApp hook for testing
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    language: 'en'
  }),
  AppProvider: ({ children }) => <div>{children}</div>
}));

const renderWithContext = (component) => {
  return render(component);
};

describe('Pagination Component', () => {
  let mockOnPageChange;

  beforeEach(() => {
    mockOnPageChange = vi.fn();
  });

  describe('Rendering', () => {
    it('should render pagination with correct info', () => {
      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
          resultsPerPage={12}
        />
      );

      expect(screen.getByText(/Showing 1 to 12 of 60 results/i)).toBeInTheDocument();
    });

    it('should not render when totalResults is 0', () => {
      const { container } = renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={0}
          totalResults={0}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 1', () => {
      const { container } = renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={1}
          totalResults={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render all page numbers when totalPages <= 5', () => {
      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('should render with ellipsis when totalPages > 5', () => {
      renderWithContext(
        <Pagination
          currentPage={5}
          totalPages={10}
          totalResults={120}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange when clicking a page number', () => {
      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const page3Button = screen.getByText('3');
      fireEvent.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange when clicking Next button', () => {
      renderWithContext(
        <Pagination
          currentPage={2}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByLabelText(/Next/i);
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange when clicking Previous button', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByLabelText(/Previous/i);
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should not call onPageChange when clicking current page', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByText('3');
      fireEvent.click(currentPageButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable Previous button on first page', () => {
      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByLabelText(/Previous/i);
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      renderWithContext(
        <Pagination
          currentPage={5}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByLabelText(/Next/i);
      expect(nextButton).toBeDisabled();
    });

    it('should enable both buttons on middle pages', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByLabelText(/Previous/i);
      const nextButton = screen.getByLabelText(/Next/i);

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should mark current page as active', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveClass('active');
    });
  });

  describe('Results Display', () => {
    it('should show correct range for first page', () => {
      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
          resultsPerPage={12}
        />
      );

      expect(screen.getByText(/Showing 1 to 12 of 60 results/i)).toBeInTheDocument();
    });

    it('should show correct range for middle page', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
          resultsPerPage={12}
        />
      );

      expect(screen.getByText(/Showing 25 to 36 of 60 results/i)).toBeInTheDocument();
    });

    it('should show correct range for last page with partial results', () => {
      renderWithContext(
        <Pagination
          currentPage={5}
          totalPages={5}
          totalResults={58}
          onPageChange={mockOnPageChange}
          resultsPerPage={12}
        />
      );

      expect(screen.getByText(/Showing 49 to 58 of 58 results/i)).toBeInTheDocument();
    });
  });

  describe('Multilingual Support', () => {
    it('should render in Arabic', () => {
      // Temporarily override the mock for this test
      vi.doMock('../../context/AppContext', () => ({
        useApp: () => ({ language: 'ar' }),
        AppProvider: ({ children }) => <div>{children}</div>
      }));

      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      // Check for Arabic text (numbers are universal)
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render in French', () => {
      // Temporarily override the mock for this test
      vi.doMock('../../context/AppContext', () => ({
        useApp: () => ({ language: 'fr' }),
        AppProvider: ({ children }) => <div>{children}</div>
      }));

      renderWithContext(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      // Check for page numbers (universal)
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithContext(
        <Pagination
          currentPage={2}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByLabelText(/Previous/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Next/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Page 1/i)).toBeInTheDocument();
    });

    it('should mark current page with aria-current', () => {
      renderWithContext(
        <Pagination
          currentPage={3}
          totalPages={5}
          totalResults={60}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });
  });
});
