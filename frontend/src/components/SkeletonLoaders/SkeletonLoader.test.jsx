import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonLoader from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('applies custom width and height', () => {
    render(<SkeletonLoader width="200px" height="50px" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('renders circle variant', () => {
    render(<SkeletonLoader variant="circle" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders rounded variant', () => {
    render(<SkeletonLoader variant="rounded" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('rounded-lg');
  });

  it('renders rectangle variant (default)', () => {
    render(<SkeletonLoader variant="rectangle" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('rounded');
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-class" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('has pulse animation class', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('has dark mode support classes', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('dark:bg-gray-700');
  });

  it('has transition classes for smooth loading', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('transition-opacity');
    expect(skeleton).toHaveClass('duration-200');
  });

  it('applies custom aria-label', () => {
    render(<SkeletonLoader ariaLabel="Loading user profile" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
  });

  it('applies custom inline styles', () => {
    render(<SkeletonLoader style={{ marginTop: '10px' }} />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ marginTop: '10px' });
  });

  it('prevents layout shift with minHeight', () => {
    render(<SkeletonLoader height="100px" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ minHeight: '100px' });
  });
});
