import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobCardSkeleton from '../JobCardSkeleton';

/**
 * JobCardSkeleton Component Tests
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-5: Display skeleton cards matching list item layout
 * - FR-LOAD-8: Prevent layout shifts
 */

describe('JobCardSkeleton', () => {
  it('should render a single skeleton by default', () => {
    const { container } = render(<JobCardSkeleton />);
    
    // Check for the main container
    const skeleton = container.querySelector('.job-card-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading job posting');
  });

  it('should render multiple skeletons when count is specified', () => {
    const { container } = render(<JobCardSkeleton count={3} />);
    
    // Check for multiple skeleton containers
    const skeletons = container.querySelectorAll('.job-card-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should have correct structure matching job card layout', () => {
    render(<JobCardSkeleton />);
    
    // Check for all skeleton elements
    expect(screen.getByLabelText('Loading job title')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading company label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading company name')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading location label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading location')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading salary label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading salary range')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading apply button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<JobCardSkeleton className="custom-class" />);
    
    const skeleton = container.querySelector('.job-card-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<JobCardSkeleton />);
    
    const skeleton = container.querySelector('.job-card-skeleton');
    expect(skeleton).toHaveClass('bg-white');
    expect(skeleton).toHaveClass('dark:bg-gray-800');
    expect(skeleton).toHaveClass('p-6');
    expect(skeleton).toHaveClass('rounded-lg');
    expect(skeleton).toHaveClass('shadow-md');
  });

  it('should prevent layout shifts with proper spacing', () => {
    const { container } = render(<JobCardSkeleton />);
    
    const skeleton = container.querySelector('.job-card-skeleton');
    expect(skeleton).toHaveClass('space-y-4');
    
    const jobDetails = container.querySelector('.job-details');
    expect(jobDetails).toHaveClass('space-y-3');
  });

  it('should support RTL layout', () => {
    const { container } = render(<JobCardSkeleton />);
    
    // Check for RTL support classes
    const flexContainers = container.querySelectorAll('.space-x-2');
    flexContainers.forEach(element => {
      expect(element).toHaveClass('rtl:space-x-reverse');
    });
  });
});
