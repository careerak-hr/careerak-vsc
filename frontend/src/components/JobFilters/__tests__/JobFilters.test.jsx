import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobFilters from '../JobFilters';
import { AppProvider } from '../../../context/AppContext';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      postingTypes: ['Permanent Job', 'Temporary/Lecturer'],
      locations: {
        cities: ['Riyadh', 'Jeddah'],
        countries: ['Saudi Arabia']
      },
      jobTypes: ['Full-time', 'Part-time'],
      experienceLevels: ['Entry', 'Mid', 'Senior'],
      salaryRange: { min: 0, max: 100000 }
    })
  })
);

const mockOnFilterChange = jest.fn();
const mockOnClearFilters = jest.fn();

const renderWithProvider = (component) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('JobFilters - Clear Filters Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders clear filters button', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/clear filters|مسح الفلاتر/i)).toBeInTheDocument();
    });
  });

  test('clear button is disabled when no filters are active', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      expect(clearButton).toBeDisabled();
      expect(clearButton).toHaveClass('disabled');
    });
  });

  test('clear button is enabled when filters are active', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search for a job|ابحث عن وظيفة/i);
      fireEvent.change(searchInput, { target: { value: 'developer' } });
    });

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      expect(clearButton).not.toBeDisabled();
      expect(clearButton).not.toHaveClass('disabled');
    });
  });

  test('clicking clear button clears all filters', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Set a filter
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search for a job|ابحث عن وظيفة/i);
      fireEvent.change(searchInput, { target: { value: 'developer' } });
    });

    // Click clear button
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      fireEvent.click(clearButton);
    });

    // Check if onClearFilters was called
    await waitFor(() => {
      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    // Check if search input is cleared
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search for a job|ابحث عن وظيفة/i);
      expect(searchInput.value).toBe('');
    });
  });

  test('clear button has proper accessibility attributes', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      expect(clearButton).toHaveAttribute('aria-label');
      expect(clearButton).toHaveAttribute('title');
    });
  });

  test('clear button shows icon', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      const icon = clearButton.querySelector('.clear-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  test('filter icon is displayed in header', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    await waitFor(() => {
      const filterIcon = document.querySelector('.filter-icon');
      expect(filterIcon).toBeInTheDocument();
    });
  });

  test('clearing animation is applied', async () => {
    renderWithProvider(
      <JobFilters 
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Set a filter
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search for a job|ابحث عن وظيفة/i);
      fireEvent.change(searchInput, { target: { value: 'developer' } });
    });

    // Click clear button
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear filters|مسح الفلاتر/i });
      fireEvent.click(clearButton);
    });

    // Check if clearing class is applied
    const filtersContainer = document.querySelector('.job-filters');
    expect(filtersContainer).toHaveClass('clearing');

    // Wait for animation to complete
    await waitFor(() => {
      expect(filtersContainer).not.toHaveClass('clearing');
    }, { timeout: 200 });
  });
});
