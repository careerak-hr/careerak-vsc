import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, beforeEach, expect } from 'vitest';
import CourseRecommendationsDashboard from '../components/CourseRecommendationsDashboard';

// Mock the useApp hook
const mockApi = {
  get: vi.fn()
};

vi.mock('../context/AppContext', () => ({
  useApp: vi.fn(() => ({
    language: 'en',
    user: { id: 'test-user' },
    api: mockApi
  }))
}));

// Import the mocked module
import { useApp } from '../context/AppContext';

describe('CourseRecommendationsDashboard Component', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Learn React basics',
      level: 'beginner',
      matchScore: 85,
      employmentImprovement: { percentage: 30 },
      skills: ['JavaScript', 'React', 'HTML'],
      duration: '4 weeks',
      priority: 'high',
      category: 'Web Development'
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns',
      level: 'advanced',
      matchScore: 75,
      employmentImprovement: { percentage: 40 },
      skills: ['React', 'TypeScript', 'State Management'],
      duration: '6 weeks',
      priority: 'medium',
      category: 'Web Development'
    },
    {
      id: '3',
      title: 'Intermediate JavaScript',
      description: 'Deep dive into JavaScript',
      level: 'intermediate',
      matchScore: 90,
      employmentImprovement: { percentage: 35 },
      skills: ['JavaScript', 'ES6+', 'Async Programming'],
      duration: '5 weeks',
      priority: 'high',
      category: 'Programming'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  test('renders component with title', () => {
    render(<CourseRecommendationsDashboard />);
    expect(screen.getByText('Recommended Courses for Skill Development')).toBeInTheDocument();
  });

  test('displays level filter buttons', () => {
    render(<CourseRecommendationsDashboard />);
    expect(screen.getByText('Filter by Level')).toBeInTheDocument();
    expect(screen.getByText('All Levels')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  test('filters courses by beginner level', async () => {
    // Setup mock response
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        courseRecommendations: mockCourses
      }
    });

    render(<CourseRecommendationsDashboard />);
    
    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    // Click beginner filter
    const beginnerButton = screen.getByText('Beginner');
    fireEvent.click(beginnerButton);

    // Should show only beginner courses
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.queryByText('Advanced React Patterns')).not.toBeInTheDocument();
    expect(screen.queryByText('Intermediate JavaScript')).not.toBeInTheDocument();
  });

  test('shows level distribution stats', async () => {
    // Setup mock response
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        courseRecommendations: mockCourses
      }
    });

    render(<CourseRecommendationsDashboard />);
    
    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('3 all levels')).toBeInTheDocument();
      expect(screen.getByText('1 beginner')).toBeInTheDocument();
      expect(screen.getByText('1 intermediate')).toBeInTheDocument();
      expect(screen.getByText('1 advanced')).toBeInTheDocument();
    });
  });

  test('resets filters when reset button is clicked', async () => {
    // Setup mock response
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        courseRecommendations: mockCourses
      }
    });

    render(<CourseRecommendationsDashboard />);
    
    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    // Click beginner filter
    const beginnerButton = screen.getByText('Beginner');
    fireEvent.click(beginnerButton);

    // Verify filter is active
    expect(screen.getByText('Showing courses: Beginner (1 course)')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);

    // Should show all courses again
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Intermediate JavaScript')).toBeInTheDocument();
  });

  test('shows empty state when no courses match filter', async () => {
    // Setup mock response with only advanced course
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        courseRecommendations: [mockCourses[1]] // Only advanced course
      }
    });

    render(<CourseRecommendationsDashboard />);
    
    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    });

    // Click beginner filter (no beginner courses)
    const beginnerButton = screen.getByText('Beginner');
    fireEvent.click(beginnerButton);

    // Should show empty state
    expect(screen.getByText('No courses for this level (Beginner). Reset Filters')).toBeInTheDocument();
  });
});