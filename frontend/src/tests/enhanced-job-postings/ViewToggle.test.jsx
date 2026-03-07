/**
 * View Toggle Tests
 * Tests for Grid/List view toggle functionality and persistence
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import ViewToggle from '../../components/JobPostings/ViewToggle';

describe('ViewToggle Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should render view toggle buttons', () => {
    render(<ViewToggle view="grid" onToggle={() => {}} />);
    
    const gridButton = screen.getByLabelText(/grid/i);
    const listButton = screen.getByLabelText(/list/i);
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
  });

  test('should highlight active view', () => {
    const { rerender } = render(<ViewToggle view="grid" onToggle={() => {}} />);
    
    const gridButton = screen.getByLabelText(/grid/i);
    expect(gridButton).toHaveClass('active');
    
    rerender(<ViewToggle view="list" onToggle={() => {}} />);
    const listButton = screen.getByLabelText(/list/i);
    expect(listButton).toHaveClass('active');
  });

  test('should call onToggle when clicked', () => {
    const mockToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockToggle} />);
    
    const listButton = screen.getByLabelText(/list/i);
    fireEvent.click(listButton);
    
    expect(mockToggle).toHaveBeenCalledWith('list');
  });

  test('should toggle between grid and list', () => {
    const mockToggle = vi.fn();
    const { rerender } = render(<ViewToggle view="grid" onToggle={mockToggle} />);
    
    // Click list button
    const listButton = screen.getByLabelText(/list/i);
    fireEvent.click(listButton);
    expect(mockToggle).toHaveBeenCalledWith('list');
    
    // Rerender with list view
    rerender(<ViewToggle view="list" onToggle={mockToggle} />);
    
    // Click grid button
    const gridButton = screen.getByLabelText(/grid/i);
    fireEvent.click(gridButton);
    expect(mockToggle).toHaveBeenCalledWith('grid');
  });
});

describe('useViewPreference Hook', () => {
  test('should default to grid view', () => {
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe('grid');
  });

  test('should load saved preference from localStorage', () => {
    localStorage.setItem('jobViewPreference', 'list');
    
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe('list');
  });

  test('should save preference to localStorage', () => {
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      result.current[1](); // Toggle view
    });
    
    expect(localStorage.getItem('jobViewPreference')).toBe('list');
  });

  test('should persist preference across page reloads', () => {
    // First render
    const { result: result1 } = renderHook(() => useViewPreference());
    
    act(() => {
      result1.current[1](); // Toggle to list
    });
    
    // Simulate page reload by creating new hook instance
    const { result: result2 } = renderHook(() => useViewPreference());
    
    expect(result2.current[0]).toBe('list');
  });

  test('should toggle between views correctly', () => {
    const { result } = renderHook(() => useViewPreference());
    
    expect(result.current[0]).toBe('grid');
    
    act(() => {
      result.current[1](); // Toggle to list
    });
    expect(result.current[0]).toBe('list');
    
    act(() => {
      result.current[1](); // Toggle back to grid
    });
    expect(result.current[0]).toBe('grid');
  });
});

describe('View Preference Persistence (Property 8)', () => {
  test('preference should persist across multiple sessions', () => {
    // Session 1
    localStorage.setItem('jobViewPreference', 'list');
    const { result: session1 } = renderHook(() => useViewPreference());
    expect(session1.current[0]).toBe('list');
    
    // Session 2 (simulate new page load)
    const { result: session2 } = renderHook(() => useViewPreference());
    expect(session2.current[0]).toBe('list');
    
    // Session 3 (simulate another page load)
    const { result: session3 } = renderHook(() => useViewPreference());
    expect(session3.current[0]).toBe('list');
  });

  test('should handle invalid localStorage values', () => {
    localStorage.setItem('jobViewPreference', 'invalid');
    
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe('grid'); // Should default to grid
  });

  test('should handle missing localStorage', () => {
    // Don't set anything in localStorage
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe('grid'); // Should default to grid
  });
});

describe('View Toggle Integration', () => {
  test('should work with JobPostingsPage', () => {
    render(<JobPostingsPage />);
    
    // Should default to grid view
    expect(screen.getByTestId('jobs-grid')).toBeInTheDocument();
    
    // Click list toggle
    const listButton = screen.getByLabelText(/list/i);
    fireEvent.click(listButton);
    
    // Should switch to list view
    waitFor(() => {
      expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
    });
  });

  test('should maintain view preference when navigating', () => {
    const { unmount } = render(<JobPostingsPage />);
    
    // Toggle to list view
    const listButton = screen.getByLabelText(/list/i);
    fireEvent.click(listButton);
    
    // Unmount (simulate navigation away)
    unmount();
    
    // Remount (simulate navigation back)
    render(<JobPostingsPage />);
    
    // Should still be in list view
    expect(screen.getByTestId('jobs-list')).toBeInTheDocument();
  });
});
