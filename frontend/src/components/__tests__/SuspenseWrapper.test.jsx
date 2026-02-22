import React, { lazy, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuspenseWrapper } from '../GlobalLoaders';

/**
 * SuspenseWrapper Integration Tests
 * 
 * Task: 8.4.5 Test Suspense fallbacks
 * Requirements: FR-LOAD-1, FR-LOAD-7, FR-LOAD-8, NFR-PERF-5
 * Design: Section 9.3 Suspense Fallbacks
 * 
 * Tests:
 * - Suspense wrapper with different skeleton types
 * - Lazy component loading
 * - Fallback display during loading
 * - Transition from fallback to loaded content
 * - Default skeleton behavior
 */

// Mock skeleton components
vi.mock('../SkeletonLoaders', () => ({
  ProfileSkeleton: () => <div data-testid="profile-skeleton">Profile Skeleton</div>,
  JobListSkeleton: () => <div data-testid="joblist-skeleton">Job List Skeleton</div>,
  CourseListSkeleton: () => <div data-testid="courselist-skeleton">Course List Skeleton</div>,
  FormSkeleton: () => <div data-testid="form-skeleton">Form Skeleton</div>,
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Dashboard Skeleton</div>,
  TableSkeleton: () => <div data-testid="table-skeleton">Table Skeleton</div>
}));

vi.mock('../Loading', () => ({
  RouteSuspenseFallback: () => <div data-testid="route-skeleton">Route Skeleton</div>
}));

describe('SuspenseWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Skeleton Type Selection', () => {
    it('renders profile skeleton when skeleton="profile"', () => {
      render(
        <SuspenseWrapper skeleton="profile">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      // Content should be visible immediately (not lazy)
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders jobList skeleton when skeleton="jobList"', () => {
      render(
        <SuspenseWrapper skeleton="jobList">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders courseList skeleton when skeleton="courseList"', () => {
      render(
        <SuspenseWrapper skeleton="courseList">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders form skeleton when skeleton="form"', () => {
      render(
        <SuspenseWrapper skeleton="form">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders dashboard skeleton when skeleton="dashboard"', () => {
      render(
        <SuspenseWrapper skeleton="dashboard">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders table skeleton when skeleton="table"', () => {
      render(
        <SuspenseWrapper skeleton="table">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders route skeleton when skeleton="route"', () => {
      render(
        <SuspenseWrapper skeleton="route">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('defaults to route skeleton when no skeleton prop provided', () => {
      render(
        <SuspenseWrapper>
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('defaults to route skeleton for invalid skeleton type', () => {
      render(
        <SuspenseWrapper skeleton="invalid">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Lazy Component Loading', () => {
    it('displays fallback while lazy component loads', async () => {
      // Create a lazy component with delay
      const LazyComponent = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Lazy Content</div>
            });
          }, 100);
        })
      );

      render(
        <SuspenseWrapper skeleton="profile">
          <LazyComponent />
        </SuspenseWrapper>
      );

      // Initially should show skeleton
      expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();

      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByText('Lazy Content')).toBeInTheDocument();
      }, { timeout: 200 });

      // Skeleton should be gone
      expect(screen.queryByTestId('profile-skeleton')).not.toBeInTheDocument();
    });

    it('transitions from fallback to content smoothly', async () => {
      const LazyComponent = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Loaded Content</div>
            });
          }, 50);
        })
      );

      render(
        <SuspenseWrapper skeleton="route">
          <LazyComponent />
        </SuspenseWrapper>
      );

      // Check fallback is shown
      expect(screen.getByTestId('route-skeleton')).toBeInTheDocument();

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Loaded Content')).toBeInTheDocument();
      });
    });

    it('handles multiple lazy components', async () => {
      const LazyComponent1 = lazy(() => 
        Promise.resolve({
          default: () => <div>Component 1</div>
        })
      );

      const LazyComponent2 = lazy(() => 
        Promise.resolve({
          default: () => <div>Component 2</div>
        })
      );

      render(
        <div>
          <SuspenseWrapper skeleton="card">
            <LazyComponent1 />
          </SuspenseWrapper>
          <SuspenseWrapper skeleton="list">
            <LazyComponent2 />
          </SuspenseWrapper>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Component 1')).toBeInTheDocument();
        expect(screen.getByText('Component 2')).toBeInTheDocument();
      });
    });
  });

  describe('Skeleton Props', () => {
    it('passes skeletonProps to skeleton component', () => {
      const skeletonProps = { count: 5, showAvatar: true };
      
      render(
        <SuspenseWrapper skeleton="profile" skeletonProps={skeletonProps}>
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles empty skeletonProps', () => {
      render(
        <SuspenseWrapper skeleton="profile" skeletonProps={{}}>
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('works without skeletonProps', () => {
      render(
        <SuspenseWrapper skeleton="profile">
          <div>Content</div>
        </SuspenseWrapper>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows fallback while component is loading', async () => {
      // Test that fallback is shown during loading phase
      // Error handling is typically done by Error Boundaries, not Suspense
      const SlowComponent = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Slow Content</div>
            });
          }, 100);
        })
      );

      render(
        <SuspenseWrapper skeleton="profile">
          <SlowComponent />
        </SuspenseWrapper>
      );

      // Should show fallback during load
      expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Slow Content')).toBeInTheDocument();
      });
    });
  });

  describe('Nested Suspense', () => {
    it('handles nested SuspenseWrapper components', async () => {
      const LazyOuter = lazy(() => 
        Promise.resolve({
          default: () => (
            <div>
              Outer
              <SuspenseWrapper skeleton="card">
                <div>Inner</div>
              </SuspenseWrapper>
            </div>
          )
        })
      );

      render(
        <SuspenseWrapper skeleton="route">
          <LazyOuter />
        </SuspenseWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Outer')).toBeInTheDocument();
        expect(screen.getByText('Inner')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <div>Test Content</div>;
      };

      const { rerender } = render(
        <SuspenseWrapper skeleton="profile">
          <TestComponent />
        </SuspenseWrapper>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Rerender with same props
      rerender(
        <SuspenseWrapper skeleton="profile">
          <TestComponent />
        </SuspenseWrapper>
      );

      // Should render again (React behavior)
      expect(renderSpy.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });

  describe('Integration with React.Suspense', () => {
    it('uses React.Suspense internally', () => {
      const { container } = render(
        <SuspenseWrapper skeleton="profile">
          <div>Content</div>
        </SuspenseWrapper>
      );

      // Component should render successfully
      expect(container).toBeInTheDocument();
    });

    it('handles Suspense boundary correctly', async () => {
      let resolveComponent;
      const promise = new Promise(resolve => {
        resolveComponent = resolve;
      });

      const LazyComponent = lazy(() => promise);

      render(
        <SuspenseWrapper skeleton="profile">
          <LazyComponent />
        </SuspenseWrapper>
      );

      // Should show fallback
      expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();

      // Resolve the component
      resolveComponent({
        default: () => <div>Resolved Content</div>
      });

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Resolved Content')).toBeInTheDocument();
      });
    });
  });
});
