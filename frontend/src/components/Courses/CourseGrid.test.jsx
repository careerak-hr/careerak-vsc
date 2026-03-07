import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import CourseGrid from './CourseGrid';

// Mock CourseCard component
jest.mock('./CourseCard', () => {
  return function MockCourseCard({ course, view }) {
    return (
      <div data-testid={`course-card-${course._id}`} className={`course-card-${view}`}>
        {course.title}
      </div>
    );
  };
});

const mockCourses = [
  {
    _id: '1',
    title: 'JavaScript Basics',
    description: 'Learn JavaScript fundamentals',
    level: 'Beginner',
    totalDuration: 10,
    totalLessons: 20,
    thumbnail: 'course1.jpg',
    price: { isFree: true },
    stats: {
      averageRating: 4.5,
      totalReviews: 100,
      totalEnrollments: 500
    },
    badges: []
  },
  {
    _id: '2',
    title: 'React Advanced',
    description: 'Master React development',
    level: 'Advanced',
    totalDuration: 20,
    totalLessons: 40,
    thumbnail: 'course2.jpg',
    price: { isFree: false, amount: 99, currency: 'USD' },
    stats: {
      averageRating: 4.8,
      totalReviews: 200,
      totalEnrollments: 300
    },
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

describe('CourseGrid Component', () => {
  test('renders courses in grid view', () => {
    renderWithProviders(<CourseGrid courses={mockCourses} view="grid" />);
    
    expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('course-card-2')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    expect(screen.getByText('React Advanced')).toBeInTheDocument();
  });

  test('renders courses in list view', () => {
    renderWithProviders(<CourseGrid courses={mockCourses} view="list" />);
    
    const grid = screen.getByTestId('course-card-1').parentElement;
    expect(grid).toHaveClass('course-grid-list');
  });

  test('displays loading state', () => {
    renderWithProviders(<CourseGrid courses={[]} loading={true} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays empty state when no courses', () => {
    renderWithProviders(<CourseGrid courses={[]} />);
    
    expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any courses/i)).toBeInTheDocument();
  });

  test('clear filters button dispatches event', () => {
    const eventListener = jest.fn();
    window.addEventListener('clearFilters', eventListener);
    
    renderWithProviders(<CourseGrid courses={[]} />);
    
    const clearButton = screen.getByText(/clear all filters/i);
    fireEvent.click(clearButton);
    
    expect(eventListener).toHaveBeenCalled();
    
    window.removeEventListener('clearFilters', eventListener);
  });

  test('renders correct number of courses', () => {
    renderWithProviders(<CourseGrid courses={mockCourses} />);
    
    const courseCards = screen.getAllByTestId(/course-card-/);
    expect(courseCards).toHaveLength(2);
  });

  test('applies correct CSS class for grid view', () => {
    renderWithProviders(<CourseGrid courses={mockCourses} view="grid" />);
    
    const grid = screen.getByTestId('course-card-1').parentElement;
    expect(grid).toHaveClass('course-grid-grid');
  });

  test('applies correct CSS class for list view', () => {
    renderWithProviders(<CourseGrid courses={mockCourses} view="list" />);
    
    const grid = screen.getByTestId('course-card-1').parentElement;
    expect(grid).toHaveClass('course-grid-list');
  });
});
