/**
 * Bookmark Button Tests
 * Tests for bookmark button functionality and UI feedback
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BookmarkButton from '../../components/JobPostings/BookmarkButton';
import { AuthProvider } from '../../context/AuthContext';

// Mock fetch
global.fetch = vi.fn();

describe('BookmarkButton Component', () => {
  const mockJob = {
    _id: 'job123',
    title: 'Test Job',
    isBookmarked: false
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  test('should render bookmark button', () => {
    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should show unbookmarked state initially', () => {
    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const icon = screen.getByTestId('bookmark-icon');
    expect(icon).toHaveClass('unbookmarked');
  });

  test('should show bookmarked state when bookmarked', () => {
    const bookmarkedJob = { ...mockJob, isBookmarked: true };
    
    render(
      <AuthProvider>
        <BookmarkButton job={bookmarkedJob} />
      </AuthProvider>
    );
    
    const icon = screen.getByTestId('bookmark-icon');
    expect(icon).toHaveClass('bookmarked');
  });

  test('should toggle bookmark on click', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookmarked: true })
    });

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/jobs/${mockJob._id}/bookmark`,
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('should show loading state while toggling', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('should change color when bookmarked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookmarked: true })
    });

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('bookmark-icon');
    
    // Initially gray
    expect(icon).toHaveStyle({ color: '#9CA3AF' });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      // Should be golden after bookmark
      expect(icon).toHaveStyle({ color: '#F59E0B' });
    });
  });

  test('should show animation on bookmark', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookmarked: true })
    });

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const icon = screen.getByTestId('bookmark-icon');
      expect(icon).toHaveClass('animate-bounce');
    });
  });

  test('should handle bookmark error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/خطأ/i)).toBeInTheDocument();
    });
  });

  test('should require authentication', () => {
    render(
      <AuthProvider value={{ user: null }}>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/يجب تسجيل الدخول/i)).toBeInTheDocument();
  });

  test('should update bookmark count', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookmarked: true, bookmarkCount: 5 })
    });

    const { rerender } = render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});

describe('Bookmark Button Accessibility', () => {
  const mockJob = {
    _id: 'job123',
    title: 'Test Job',
    isBookmarked: false
  };

  test('should have accessible label', () => {
    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  test('should update aria-label when bookmarked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookmarked: true })
    });

    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'حفظ الوظيفة');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'إزالة من المحفوظات');
    });
  });

  test('should be keyboard accessible', () => {
    render(
      <AuthProvider>
        <BookmarkButton job={mockJob} />
      </AuthProvider>
    );
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(fetch).toHaveBeenCalled();
  });
});
