/**
 * SearchPage Tests
 * 
 * اختبارات لميزة التبديل بين عرض القائمة والخريطة
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SearchPage from '../SearchPage';

describe('SearchPage - View Mode Toggle', () => {
  
  // Helper function to render with router
  const renderWithRouter = (initialEntries = ['/search']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <SearchPage />
      </MemoryRouter>
    );
  };

  describe('Basic Rendering', () => {
    it('should render search page', () => {
      renderWithRouter();
      expect(screen.getByPlaceholderText(/ابحث عن وظائف/i)).toBeInTheDocument();
    });

    it('should render view mode toggle buttons', () => {
      renderWithRouter();
      expect(screen.getByText('قائمة')).toBeInTheDocument();
      expect(screen.getByText('خريطة')).toBeInTheDocument();
    });

    it('should render list view by default', () => {
      renderWithRouter();
      expect(screen.getByText(/عرض القائمة/i)).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('should toggle to map view when map button is clicked', async () => {
      renderWithRouter();
      
      const mapButton = screen.getByText('خريطة');
      fireEvent.click(mapButton);
      
      await waitFor(() => {
        expect(screen.getByText(/عرض الخريطة/i)).toBeInTheDocument();
      });
    });

    it('should toggle back to list view when list button is clicked', async () => {
      renderWithRouter();
      
      // Switch to map
      const mapButton = screen.getByText('خريطة');
      fireEvent.click(mapButton);
      
      // Switch back to list
      const listButton = screen.getByText('قائمة');
      fireEvent.click(listButton);
      
      await waitFor(() => {
        expect(screen.getByText(/عرض القائمة/i)).toBeInTheDocument();
      });
    });

    it('should apply active class to current view button', () => {
      renderWithRouter();
      
      const listButton = screen.getByText('قائمة').closest('button');
      expect(listButton).toHaveClass('active');
      
      const mapButton = screen.getByText('خريطة').closest('button');
      expect(mapButton).not.toHaveClass('active');
    });
  });

  describe('URL Integration', () => {
    it('should load list view from URL parameter', () => {
      renderWithRouter(['/search?view=list']);
      expect(screen.getByText(/عرض القائمة/i)).toBeInTheDocument();
    });

    it('should load map view from URL parameter', () => {
      renderWithRouter(['/search?view=map']);
      expect(screen.getByText(/عرض الخريطة/i)).toBeInTheDocument();
    });

    it('should default to list view if no URL parameter', () => {
      renderWithRouter(['/search']);
      expect(screen.getByText(/عرض القائمة/i)).toBeInTheDocument();
    });

    it('should ignore invalid view parameter', () => {
      renderWithRouter(['/search?view=invalid']);
      expect(screen.getByText(/عرض القائمة/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on toggle buttons', () => {
      renderWithRouter();
      
      const listButton = screen.getByLabelText('عرض القائمة');
      const mapButton = screen.getByLabelText('عرض الخريطة');
      
      expect(listButton).toBeInTheDocument();
      expect(mapButton).toBeInTheDocument();
    });

    it('should have title attribute on toggle buttons', () => {
      renderWithRouter();
      
      const listButton = screen.getByTitle('عرض القائمة');
      const mapButton = screen.getByTitle('عرض الخريطة');
      
      expect(listButton).toBeInTheDocument();
      expect(mapButton).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render SVG icons in toggle buttons', () => {
      renderWithRouter();
      
      const buttons = screen.getAllByRole('button');
      const toggleButtons = buttons.filter(btn => 
        btn.textContent === 'قائمة' || btn.textContent === 'خريطة'
      );
      
      toggleButtons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    it('should show results count', () => {
      renderWithRouter();
      expect(screen.getByText(/تم العثور على/i)).toBeInTheDocument();
    });

    it('should show no results message when results are empty', () => {
      renderWithRouter();
      expect(screen.getByText(/لا توجد نتائج/i)).toBeInTheDocument();
    });
  });
});

describe('SearchPage - Integration', () => {
  it('should maintain view mode across navigation', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/search?view=map']}>
        <SearchPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/عرض الخريطة/i)).toBeInTheDocument();
    
    // Simulate navigation
    rerender(
      <MemoryRouter initialEntries={['/search?view=map']}>
        <SearchPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/عرض الخريطة/i)).toBeInTheDocument();
  });
});
