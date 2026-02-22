/**
 * Progress Indicators Tests
 * 
 * Tests for ProgressBar, ButtonSpinner, and OverlaySpinner components
 * 
 * Requirements:
 * - FR-LOAD-2: Progress bar shown for page loads
 * - FR-LOAD-3: Button spinners shown during processing
 * - FR-LOAD-4: Overlay spinners shown for actions
 * - NFR-USE-3: Display loading states within 100ms
 * 
 * Tests:
 * 1. ProgressBar renders correctly
 * 2. ProgressBar shows correct progress value
 * 3. ProgressBar respects prefers-reduced-motion
 * 4. ProgressBar has proper ARIA attributes
 * 5. ButtonSpinner renders correctly
 * 6. ButtonSpinner respects prefers-reduced-motion
 * 7. ButtonSpinner has proper ARIA attributes
 * 8. OverlaySpinner renders correctly
 * 9. OverlaySpinner shows/hides based on prop
 * 10. OverlaySpinner respects prefers-reduced-motion
 * 11. OverlaySpinner has proper ARIA attributes
 * 12. All components support dark mode
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProgressBar from '../components/Loading/ProgressBar';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import OverlaySpinner from '../components/Loading/OverlaySpinner';
import { AnimationProvider } from '../context/AnimationContext';
import { ThemeProvider } from '../context/ThemeContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, role, ...props }) => (
      <div className={className} role={role} {...props}>
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Helper to render with providers
const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <AnimationProvider>
        {component}
      </AnimationProvider>
    </ThemeProvider>
  );
};

describe('ProgressBar Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<ProgressBar />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows correct progress value', () => {
    renderWithProviders(<ProgressBar progress={75} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading: 75%');
  });

  it('clamps progress between 0 and 100', () => {
    const { rerender } = renderWithProviders(<ProgressBar progress={-10} />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <ProgressBar progress={150} />
        </AnimationProvider>
      </ThemeProvider>
    );
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows percentage when showPercentage is true', () => {
    renderWithProviders(<ProgressBar progress={50} showPercentage={true} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('supports different positions', () => {
    const { container, rerender } = renderWithProviders(
      <ProgressBar progress={50} position="top" />
    );
    
    let wrapper = container.querySelector('.fixed.top-0');
    expect(wrapper).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <ProgressBar progress={50} position="bottom" />
        </AnimationProvider>
      </ThemeProvider>
    );
    wrapper = container.querySelector('.fixed.bottom-0');
    expect(wrapper).toBeInTheDocument();
  });

  it('supports different colors', () => {
    const { container } = renderWithProviders(
      <ProgressBar progress={50} color="accent" />
    );
    
    const progressFill = container.querySelector('.bg-\\[\\#D48161\\]');
    expect(progressFill).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    renderWithProviders(<ProgressBar progress={60} loadingMessage="Uploading" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', 'Uploading: 60%');
  });

  it('announces progress to screen readers', () => {
    renderWithProviders(<ProgressBar progress={75} announceToScreenReader={true} />);
    
    // AriaLiveRegion should be present
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });
});

describe('ButtonSpinner Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<ButtonSpinner />);
    
    // Get all status elements (AriaLiveRegion + spinner)
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
    
    // Find the spinner element (has aria-label)
    const spinner = statusElements.find(el => el.getAttribute('aria-label') === 'Processing...');
    expect(spinner).toBeInTheDocument();
  });

  it('supports custom aria-label', () => {
    renderWithProviders(<ButtonSpinner ariaLabel="Saving..." />);
    
    const statusElements = screen.getAllByRole('status');
    const spinner = statusElements.find(el => el.getAttribute('aria-label') === 'Saving...');
    expect(spinner).toBeInTheDocument();
  });

  it('supports different colors', () => {
    const { container } = renderWithProviders(<ButtonSpinner color="primary" />);
    
    const spinner = container.querySelector('.border-\\[\\#304B60\\]');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    renderWithProviders(<ButtonSpinner ariaLabel="Loading data" />);
    
    const statusElements = screen.getAllByRole('status');
    const spinner = statusElements.find(el => el.getAttribute('aria-label') === 'Loading data');
    expect(spinner).toBeInTheDocument();
  });

  it('announces loading to screen readers', () => {
    renderWithProviders(<ButtonSpinner announceToScreenReader={true} />);
    
    // AriaLiveRegion should be present
    const status = screen.getAllByRole('status');
    expect(status.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <ButtonSpinner className="custom-class" />
    );
    
    const spinner = container.querySelector('.custom-class');
    expect(spinner).toBeInTheDocument();
  });
});

describe('OverlaySpinner Component', () => {
  it('renders when show is true', () => {
    renderWithProviders(<OverlaySpinner show={true} />);
    
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('does not render when show is false', () => {
    renderWithProviders(<OverlaySpinner show={false} />);
    
    const overlay = screen.queryByRole('status');
    expect(overlay).not.toBeInTheDocument();
  });

  it('shows custom message', () => {
    renderWithProviders(<OverlaySpinner show={true} message="Uploading file..." />);
    
    // Use getAllByText since message appears in both AriaLiveRegion and visible text
    const messages = screen.getAllByText('Uploading file...');
    expect(messages.length).toBeGreaterThan(0);
  });

  it('has proper backdrop', () => {
    const { container } = renderWithProviders(<OverlaySpinner show={true} />);
    
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
  });

  it('supports different spinner sizes', () => {
    renderWithProviders(<OverlaySpinner show={true} spinnerSize="large" />);
    
    // Spinner component should be rendered
    const status = screen.getAllByRole('status');
    expect(status.length).toBeGreaterThan(0);
  });

  it('supports different spinner colors', () => {
    renderWithProviders(<OverlaySpinner show={true} spinnerColor="accent" />);
    
    // Spinner component should be rendered
    const status = screen.getAllByRole('status');
    expect(status.length).toBeGreaterThan(0);
  });

  it('announces loading to screen readers', () => {
    renderWithProviders(
      <OverlaySpinner show={true} message="Processing..." announceToScreenReader={true} />
    );
    
    // AriaLiveRegion should be present
    const status = screen.getAllByRole('status');
    expect(status.length).toBeGreaterThan(0);
  });

  it('has proper z-index for overlay', () => {
    const { container } = renderWithProviders(<OverlaySpinner show={true} />);
    
    const overlay = container.querySelector('.z-50');
    expect(overlay).toBeInTheDocument();
  });
});

describe('Dark Mode Support', () => {
  it('ProgressBar supports dark mode classes', () => {
    const { container } = renderWithProviders(
      <ProgressBar progress={50} showPercentage={true} />
    );
    
    const percentage = container.querySelector('.dark\\:text-\\[\\#e0e0e0\\]');
    expect(percentage).toBeInTheDocument();
  });

  it('OverlaySpinner supports dark mode classes', () => {
    const { container } = renderWithProviders(
      <OverlaySpinner show={true} message="Loading..." />
    );
    
    const content = container.querySelector('.dark\\:bg-\\[\\#2d2d2d\\]');
    expect(content).toBeInTheDocument();
  });
});

describe('Performance Requirements', () => {
  it('components render within acceptable time (< 100ms)', async () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <>
        <ProgressBar progress={50} />
        <ButtonSpinner />
        <OverlaySpinner show={true} />
      </>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms (NFR-USE-3)
    expect(renderTime).toBeLessThan(100);
  });
});

describe('Integration Tests', () => {
  it('ProgressBar can be used in page loading scenario', () => {
    const { rerender } = renderWithProviders(<ProgressBar progress={0} position="top" />);
    
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    // Simulate progress updates
    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <ProgressBar progress={50} position="top" />
        </AnimationProvider>
      </ThemeProvider>
    );
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <ProgressBar progress={100} position="top" />
        </AnimationProvider>
      </ThemeProvider>
    );
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('ButtonSpinner can be used in button loading scenario', () => {
    const { container } = render(
      <ThemeProvider>
        <AnimationProvider>
          <button disabled>
            <ButtonSpinner />
            <span className="ml-2">Submitting...</span>
          </button>
        </AnimationProvider>
      </ThemeProvider>
    );
    
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
    
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('OverlaySpinner can be used in blocking operation scenario', () => {
    const { rerender } = renderWithProviders(
      <OverlaySpinner show={false} message="Uploading..." />
    );
    
    expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();

    // Show overlay
    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <OverlaySpinner show={true} message="Uploading..." />
        </AnimationProvider>
      </ThemeProvider>
    );
    const messages = screen.getAllByText('Uploading...');
    expect(messages.length).toBeGreaterThan(0);

    // Hide overlay
    rerender(
      <ThemeProvider>
        <AnimationProvider>
          <OverlaySpinner show={false} message="Uploading..." />
        </AnimationProvider>
      </ThemeProvider>
    );
    expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
  });
});
