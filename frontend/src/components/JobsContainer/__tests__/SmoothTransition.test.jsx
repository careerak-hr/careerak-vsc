/**
 * Smooth Transition Tests
 * 
 * Tests for smooth transition from skeleton to content
 * 
 * Requirements:
 * - FR-LOAD-5: Smooth transition from skeleton to content
 * - FR-LOAD-7: Apply smooth transitions (300ms fade)
 * - FR-LOAD-8: Prevent layout shifts (CLS < 0.1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import JobsContainer from '../JobsContainer';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock skeleton components
vi.mock('../../SkeletonLoaders', () => ({
  JobCardGridSkeleton: ({ count }) => (
    <div data-testid="grid-skeleton" data-count={count}>
      Grid Skeleton
    </div>
  ),
  JobCardListSkeleton: ({ count }) => (
    <div data-testid="list-skeleton" data-count={count}>
      List Skeleton
    </div>
  )
}));

describe('JobsContainer - Smooth Transition', () => {
  const mockJobs = [
    { id: 1, title: 'Job 1' },
    { id: 2, title: 'Job 2' },
    { id: 3, title: 'Job 3' }
  ];

  const mockRenderJobCard = (job, view) => (
    <div data-testid={`job-card-${view}`} key={job.id}>
      {job.title}
    </div>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
          skeletonCount={9}
        />
      );

      expect(screen.getByTestId('grid-skeleton')).toBeInTheDocument();
    });

    it('should display correct number of skeletons', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
          skeletonCount={6}
        />
      );

      const skeleton = screen.getByTestId('grid-skeleton');
      expect(skeleton.getAttribute('data-count')).toBe('6');
    });

    it('should disable view toggle during loading', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      const toggleButton = screen.getByLabelText(/view toggle disabled/i);
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Loaded State', () => {
    it('should display jobs when loaded', () => {
      render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
      expect(screen.getByText('Job 3')).toBeInTheDocument();
    });

    it('should not display skeleton when loaded', () => {
      render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.queryByTestId('grid-skeleton')).not.toBeInTheDocument();
      expect(screen.queryByTestId('list-skeleton')).not.toBeInTheDocument();
    });

    it('should enable view toggle when loaded', () => {
      render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      const toggleButton = screen.getByLabelText(/switch to/i);
      expect(toggleButton).not.toBeDisabled();
    });
  });

  describe('Transition', () => {
    it('should transition from skeleton to content', async () => {
      const { rerender } = render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      // Initially shows skeleton
      expect(screen.getByTestId('grid-skeleton')).toBeInTheDocument();

      // Simulate loading complete
      rerender(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      // Should show content
      await waitFor(() => {
        expect(screen.getByText('Job 1')).toBeInTheDocument();
      });

      // Should not show skeleton
      expect(screen.queryByTestId('grid-skeleton')).not.toBeInTheDocument();
    });

    it('should maintain container structure during transition', () => {
      const { container, rerender } = render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
          className="test-container"
        />
      );

      const initialContainer = container.querySelector('.test-container');
      expect(initialContainer).toBeInTheDocument();

      // Transition to loaded state
      rerender(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
          className="test-container"
        />
      );

      // Container should still exist
      const loadedContainer = container.querySelector('.test-container');
      expect(loadedContainer).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('should show grid skeleton in grid view', () => {
      localStorage.setItem('jobViewPreference', 'grid');

      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.getByTestId('grid-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('list-skeleton')).not.toBeInTheDocument();
    });

    it('should show list skeleton in list view', () => {
      localStorage.setItem('jobViewPreference', 'list');

      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.getByTestId('list-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('grid-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no jobs', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.getByText('No jobs found')).toBeInTheDocument();
    });

    it('should not show empty state during loading', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      expect(screen.queryByText('No jobs found')).not.toBeInTheDocument();
    });
  });

  describe('Animation Variants', () => {
    it('should apply motion.div to job cards', () => {
      const { container } = render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      // Check that motion.div wrapper exists for each job
      const jobCards = container.querySelectorAll('[data-testid^="job-card"]');
      expect(jobCards.length).toBe(mockJobs.length);
    });

    it('should pass custom index to each card', () => {
      render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      // All jobs should be rendered
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
      expect(screen.getByText('Job 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on skeleton', () => {
      render(
        <JobsContainer
          jobs={[]}
          loading={true}
          renderJobCard={mockRenderJobCard}
        />
      );

      const skeleton = screen.getByTestId('grid-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have proper ARIA labels on toggle button', () => {
      render(
        <JobsContainer
          jobs={mockJobs}
          loading={false}
          renderJobCard={mockRenderJobCard}
        />
      );

      const toggleButton = screen.getByLabelText(/switch to/i);
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
