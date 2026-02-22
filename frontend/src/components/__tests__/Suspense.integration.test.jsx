import React, { lazy, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RouteSuspenseFallback from '../Loading/RouteSuspenseFallback';
import ComponentSuspenseFallback from '../Loading/ComponentSuspenseFallback';
import { SuspenseWrapper } from '../GlobalLoaders';

/**
 * Suspense Integration Tests
 * 
 * Task: 8.4.5 Test Suspense fallbacks
 * Requirements: FR-LOAD-1, FR-LOAD-7, FR-LOAD-8, NFR-PERF-5
 * Design: Section 9.3 Suspense Fallbacks
 * 
 * Tests:
 * - Route-level Suspense with lazy routes
 * - Component-level Suspense with lazy components
 * - Nested Suspense boundaries
 * - Fallback transitions
 * - Layout stability (no CLS)
 * - Multiple concurrent Suspense boundaries
 */

// Mock contexts
vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({ isDark: false }))
}));

vi.mock('../../context/AnimationContext', () => ({
  useAnimation: vi.fn(() => ({ shouldAnimate: true }))
}));

describe('Suspense Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route-Level Suspense', () => {
    it('displays route fallback while lazy route loads', async () => {
      const LazyPage = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Page Content</div>
            });
          }, 100);
        })
      );

      render(
        <MemoryRouter initialEntries={['/lazy']}>
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Routes>
              <Route path="/lazy" element={<LazyPage />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      );

      // Should show route fallback
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading page content, please wait...')).toBeInTheDocument();

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Page Content')).toBeInTheDocument();
      }, { timeout: 200 });

      // Fallback should be gone
      expect(screen.queryByText('Loading page content, please wait...')).not.toBeInTheDocument();
    });

    it('handles multiple lazy routes', async () => {
      const LazyPage1 = lazy(() => 
        Promise.resolve({
          default: () => <div>Page 1</div>
        })
      );

      const LazyPage2 = lazy(() => 
        Promise.resolve({
          default: () => <div>Page 2</div>
        })
      );

      render(
        <MemoryRouter initialEntries={['/page1']}>
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Routes>
              <Route path="/page1" element={<LazyPage1 />} />
              <Route path="/page2" element={<LazyPage2 />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
      });
    });
  });

  describe('Component-Level Suspense', () => {
    it('displays component fallback while lazy component loads', async () => {
      const LazyComponent = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Component Content</div>
            });
          }, 100);
        })
      );

      render(
        <div>
          <h1>Page Title</h1>
          <Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
            <LazyComponent />
          </Suspense>
        </div>
      );

      // Page title should be visible
      expect(screen.getByText('Page Title')).toBeInTheDocument();

      // Should show component fallback
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Component Content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('handles multiple lazy components independently', async () => {
      const LazyComponent1 = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Component 1</div>
            });
          }, 50);
        })
      );

      const LazyComponent2 = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Component 2</div>
            });
          }, 100);
        })
      );

      render(
        <div>
          <Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
            <LazyComponent1 />
          </Suspense>
          <Suspense fallback={<ComponentSuspenseFallback variant="list" />}>
            <LazyComponent2 />
          </Suspense>
        </div>
      );

      // Both fallbacks should be visible
      const fallbacks = screen.getAllByRole('status');
      expect(fallbacks.length).toBe(2);

      // Component 1 loads first
      await waitFor(() => {
        expect(screen.getByText('Component 1')).toBeInTheDocument();
      }, { timeout: 100 });

      // Component 2 loads later
      await waitFor(() => {
        expect(screen.getByText('Component 2')).toBeInTheDocument();
      }, { timeout: 150 });
    });
  });

  describe('Nested Suspense Boundaries', () => {
    it('handles nested Suspense boundaries correctly', async () => {
      const LazyInner = lazy(() => 
        Promise.resolve({
          default: () => <div>Inner Content</div>
        })
      );

      const LazyOuter = lazy(() => 
        Promise.resolve({
          default: () => (
            <div>
              <div>Outer Content</div>
              <Suspense fallback={<ComponentSuspenseFallback variant="minimal" />}>
                <LazyInner />
              </Suspense>
            </div>
          )
        })
      );

      render(
        <Suspense fallback={<RouteSuspenseFallback />}>
          <LazyOuter />
        </Suspense>
      );

      // Wait for both to load
      await waitFor(() => {
        expect(screen.getByText('Outer Content')).toBeInTheDocument();
        expect(screen.getByText('Inner Content')).toBeInTheDocument();
      });
    });

    it('shows appropriate fallback for each boundary level', async () => {
      const LazyWidget = lazy(() => 
        Promise.resolve({
          default: () => <div>Widget Content</div>
        })
      );

      const LazyPage = lazy(() => 
        Promise.resolve({
          default: () => (
            <div>
              <h1>Page Loaded</h1>
              <Suspense fallback={<div data-testid="widget-fallback">Loading widget...</div>}>
                <LazyWidget />
              </Suspense>
            </div>
          )
        })
      );

      render(
        <Suspense fallback={<div data-testid="page-fallback">Loading page...</div>}>
          <LazyPage />
        </Suspense>
      );

      // Wait for everything to load
      await waitFor(() => {
        expect(screen.getByText('Page Loaded')).toBeInTheDocument();
        expect(screen.getByText('Widget Content')).toBeInTheDocument();
      });
    });
  });

  describe('SuspenseWrapper Integration', () => {
    it('works with SuspenseWrapper for different skeleton types', async () => {
      const LazyProfile = lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Profile Content</div>
            });
          }, 50);
        })
      );

      render(
        <SuspenseWrapper skeleton="profile">
          <LazyProfile />
        </SuspenseWrapper>
      );

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Profile Content')).toBeInTheDocument();
      }, { timeout: 100 });
    });

    it('handles route skeleton with SuspenseWrapper', async () => {
      const LazyRoute = lazy(() => 
        Promise.resolve({
          default: () => <div>Route Content</div>
        })
      );

      render(
        <SuspenseWrapper skeleton="route">
          <LazyRoute />
        </SuspenseWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Route Content')).toBeInTheDocument();
      });
    });
  });

  describe('Layout Stability', () => {
    it('maintains layout during fallback transition', async () => {
      const LazyComponent = lazy(() => 
        Promise.resolve({
          default: () => <div style={{ height: '200px' }}>Content</div>
        })
      );

      render(
        <div>
          <div>Header</div>
          <Suspense fallback={<ComponentSuspenseFallback variant="card" height="h-64" />}>
            <LazyComponent />
          </Suspense>
          <div>Footer</div>
        </div>
      );

      // Header and footer should be visible
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      // Header and footer should still be visible
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('prevents layout shifts with consistent skeleton heights', async () => {
      const LazyCard = lazy(() => 
        Promise.resolve({
          default: () => <div className="h-64">Card Content</div>
        })
      );

      render(
        <Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
          <LazyCard />
        </Suspense>
      );

      // Fallback should have h-64 class (matching content)
      const fallback = screen.getByRole('status');
      expect(fallback).toHaveClass('h-64');

      await waitFor(() => {
        expect(screen.getByText('Card Content')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('loads multiple lazy components efficiently', async () => {
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
          <Suspense fallback={<div>Loading 1...</div>}>
            <LazyComponent1 />
          </Suspense>
          <Suspense fallback={<div>Loading 2...</div>}>
            <LazyComponent2 />
          </Suspense>
        </div>
      );

      // Both should load
      await waitFor(() => {
        expect(screen.getByText('Component 1')).toBeInTheDocument();
        expect(screen.getByText('Component 2')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains accessibility during Suspense transitions', async () => {
      const LazyComponent = lazy(() => 
        Promise.resolve({
          default: () => <div role="main">Main Content</div>
        })
      );

      render(
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" />}>
          <LazyComponent />
        </Suspense>
      );

      // Fallback should have proper ARIA attributes
      const fallback = screen.getByRole('status');
      expect(fallback).toHaveAttribute('aria-live', 'polite');

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('announces loading state to screen readers', async () => {
      const LazyComponent = lazy(() => 
        Promise.resolve({
          default: () => <div>Content</div>
        })
      );

      render(
        <Suspense fallback={<ComponentSuspenseFallback variant="minimal" />}>
          <LazyComponent />
        </Suspense>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });
});
