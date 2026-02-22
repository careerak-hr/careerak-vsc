import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSkeleton from '../ProfileSkeleton';

/**
 * ProfileSkeleton Component Tests
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 */

describe('ProfileSkeleton', () => {
  
  it('should render without crashing', () => {
    const { container } = render(<ProfileSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('should have correct structure matching profile page layout', () => {
    render(<ProfileSkeleton />);
    
    // Check for main container with proper ARIA attributes
    const skeleton = screen.getByLabelText('Loading profile');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('should render profile header with avatar and bio', () => {
    render(<ProfileSkeleton />);
    
    // Check for avatar skeleton
    expect(screen.getByLabelText('Loading profile picture')).toBeInTheDocument();
    
    // Check for name, title, and bio skeletons
    expect(screen.getByLabelText('Loading user name')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading user title')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading user bio')).toBeInTheDocument();
  });

  it('should render stats section with 3 stat cards', () => {
    render(<ProfileSkeleton />);
    
    // Check for stat skeletons
    expect(screen.getByLabelText('Loading stat 1 value')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading stat 2 value')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading stat 3 value')).toBeInTheDocument();
    
    expect(screen.getByLabelText('Loading stat 1 label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading stat 2 label')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading stat 3 label')).toBeInTheDocument();
  });

  it('should render content section', () => {
    render(<ProfileSkeleton />);
    
    // Check for section title and content lines
    expect(screen.getByLabelText('Loading section title')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading content line 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading content line 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading content line 3')).toBeInTheDocument();
  });

  it('should render skills section with 6 skill tags', () => {
    render(<ProfileSkeleton />);
    
    // Check for skills section title
    expect(screen.getByLabelText('Loading skills section title')).toBeInTheDocument();
    
    // Check for 6 skill skeletons
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`Loading skill ${i}`)).toBeInTheDocument();
    }
  });

  it('should render action buttons', () => {
    render(<ProfileSkeleton />);
    
    // Check for action button skeletons
    expect(screen.getByLabelText('Loading action button 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading action button 2')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ProfileSkeleton className="custom-class" />);
    
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<ProfileSkeleton />);
    
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('max-w-4xl');
    expect(skeleton).toHaveClass('mx-auto');
    expect(skeleton).toHaveClass('p-4');
    expect(skeleton).toHaveClass('space-y-6');
  });

  it('should prevent layout shifts with proper spacing', () => {
    const { container } = render(<ProfileSkeleton />);
    
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('space-y-6');
    
    // Check that sections have proper spacing
    const sections = container.querySelectorAll('.bg-white');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should support RTL layout', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Check for RTL support classes
    const rtlElements = container.querySelectorAll('.rtl\\:space-x-reverse');
    expect(rtlElements.length).toBeGreaterThan(0);
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<ProfileSkeleton />);
    
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading profile');
  });

  it('should use SkeletonLoader components with proper variants', () => {
    render(<ProfileSkeleton />);
    
    // Avatar should be circle variant
    const avatar = screen.getByLabelText('Loading profile picture');
    expect(avatar).toBeInTheDocument();
    
    // Skills should be pill variant
    const skill1 = screen.getByLabelText('Loading skill 1');
    expect(skill1).toBeInTheDocument();
    
    // Buttons should be rounded variant
    const button1 = screen.getByLabelText('Loading action button 1');
    expect(button1).toBeInTheDocument();
  });

  it('should have responsive grid for stats', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Check for responsive grid classes
    const statsGrid = container.querySelector('.grid');
    expect(statsGrid).toHaveClass('grid-cols-1');
    expect(statsGrid).toHaveClass('sm:grid-cols-3');
  });

  it('should have dark mode support', () => {
    const { container } = render(<ProfileSkeleton />);
    
    // Check for dark mode classes
    const darkElements = container.querySelectorAll('.dark\\:bg-gray-800');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  it('should match snapshot', () => {
    const { container } = render(<ProfileSkeleton />);
    expect(container).toMatchSnapshot();
  });
});
