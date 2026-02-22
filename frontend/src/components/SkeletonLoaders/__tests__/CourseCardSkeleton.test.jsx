import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseCardSkeleton from '../CourseCardSkeleton';

/**
 * CourseCardSkeleton Component Tests
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-5: Display skeleton cards matching list item layout
 */

describe('CourseCardSkeleton', () => {
  
  it('should render a single skeleton by default', () => {
    const { container } = render(<CourseCardSkeleton />);
    
    // Check for the main container
    const skeleton = container.querySelector('.course-card-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render multiple skeletons when count is specified', () => {
    const { container } = render(<CourseCardSkeleton count={3} />);
    
    // Check for multiple skeleton containers
    const skeletons = container.querySelectorAll('.course-card-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should have correct structure matching course card layout', () => {
    render(<CourseCardSkeleton />);
    
    // Check for all skeleton elements
    expect(screen.getByLabelText('Loading course')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading course title')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading instructor label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading instructor name')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading duration label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading duration')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading price label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading price')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading enroll button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<CourseCardSkeleton className="custom-class" />);
    
    const skeleton = container.querySelector('.course-card-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CourseCardSkeleton />);
    
    const skeleton = container.querySelector('.course-card-skeleton');
    expect(skeleton).toHaveClass('bg-white');
    expect(skeleton).toHaveClass('dark:bg-gray-800');
    expect(skeleton).toHaveClass('p-6');
    expect(skeleton).toHaveClass('rounded-lg');
    expect(skeleton).toHaveClass('shadow-md');
  });

  it('should prevent layout shifts with proper spacing', () => {
    const { container } = render(<CourseCardSkeleton />);
    
    const skeleton = container.querySelector('.course-card-skeleton');
    expect(skeleton).toHaveClass('space-y-4');
    
    // Check for course details spacing
    const courseDetails = skeleton.querySelector('.course-details');
    expect(courseDetails).toHaveClass('space-y-3');
  });

  it('should support RTL layout', () => {
    const { container } = render(<CourseCardSkeleton />);
    
    // Check for RTL support classes
    const rtlElements = container.querySelectorAll('.rtl\\:space-x-reverse');
    expect(rtlElements.length).toBeGreaterThan(0);
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<CourseCardSkeleton />);
    
    const skeleton = container.querySelector('.course-card-skeleton');
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading course');
  });

  it('should render enroll button skeleton with full width', () => {
    render(<CourseCardSkeleton />);
    
    const enrollButton = screen.getByLabelText('Loading enroll button');
    expect(enrollButton).toBeInTheDocument();
    
    // Check that button skeleton has proper styling
    expect(enrollButton).toHaveStyle({ width: '100%' });
  });
});
