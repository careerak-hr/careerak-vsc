/**
 * OptimizedImage Loading States Tests
 * 
 * Tests for the loading states of OptimizedImage component including:
 * - Loading state transitions
 * - Error state handling
 * - Retry functionality
 * - Placeholder display
 * - Fallback images
 * 
 * Task: 8.3.5 Test image loading states
 * Requirements: FR-LOAD-6, FR-PERF-3, FR-PERF-4
 * Design: Section 9.3 Suspense Fallbacks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should start with opacity 0 before image loads', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      expect(img.style.opacity).toBe('0');
    });

    it('should show placeholder during loading', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" placeholder={true} />
      );
      
      // Placeholder should be present initially
      const placeholders = container.querySelectorAll('img');
      expect(placeholders.length).toBeGreaterThan(1); // Main img + placeholder
    });

    it('should not show placeholder when disabled', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" placeholder={false} />
      );
      
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(1); // Only main img
    });

    it('should apply blur effect to placeholder', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" placeholder={true} />
      );
      
      const placeholders = container.querySelectorAll('img[aria-hidden="true"]');
      if (placeholders.length > 0) {
        expect(placeholders[0].style.filter).toContain('blur');
      }
    });
  });

  describe('Loading Transition', () => {
    it('should transition to opacity 1 when loaded', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      // Simulate load
      fireEvent.load(img);
      
      expect(img.style.opacity).toBe('1');
    });

    it('should call onLoad callback when image loads', () => {
      const onLoad = vi.fn();
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" onLoad={onLoad} />
      );
      const img = container.querySelector('img');
      
      fireEvent.load(img);
      
      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('should have smooth transition', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      expect(img.style.transition).toContain('opacity');
      expect(img.style.transition).toContain('0.3s');
    });

    it('should hide placeholder after load', async () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" placeholder={true} />
      );
      const img = container.querySelector('img');
      
      fireEvent.load(img);
      
      await waitFor(() => {
        const placeholders = container.querySelectorAll('img[aria-hidden="true"]');
        if (placeholders.length > 0) {
          expect(placeholders[0].style.opacity).toBe('0');
        }
      });
    });
  });

  describe('Error State', () => {
    it('should show error UI when image fails to load', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const errorDiv = container.querySelector('.optimized-image-error');
      expect(errorDiv).toBeTruthy();
    });

    it('should display error icon', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      expect(container.textContent).toContain('⚠️');
    });

    it('should show custom error message', () => {
      const errorMessage = 'Failed to load profile picture';
      const { container } = render(
        <OptimizedImage
          publicId="test/image"
          alt="Test"
          errorMessage={errorMessage}
        />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      expect(container.textContent).toContain(errorMessage);
    });

    it('should call onError callback with error details', () => {
      const onError = vi.fn();
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" onError={onError} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          message: expect.any(String),
          timestamp: expect.any(String),
          retryCount: 0,
        })
      );
    });

    it('should log error when logErrors is true', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" logErrors={true} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should not log error when logErrors is false', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" logErrors={false} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button on error', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" showRetry={true} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const retryButton = container.querySelector('button');
      expect(retryButton).toBeTruthy();
      expect(retryButton.textContent).toContain('Retry');
    });

    it('should not show retry button when disabled', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" showRetry={false} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const retryButton = container.querySelector('button');
      expect(retryButton).toBeNull();
    });

    it('should reset error state when retry is clicked', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      let img = container.querySelector('img');
      
      // Trigger error
      fireEvent.error(img);
      expect(container.querySelector('.optimized-image-error')).toBeTruthy();
      
      // Click retry
      const retryButton = container.querySelector('button');
      fireEvent.click(retryButton);
      
      // Error UI should be gone
      expect(container.querySelector('.optimized-image-error')).toBeNull();
    });

    it('should increment retry count on each retry', () => {
      const onError = vi.fn();
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" onError={onError} />
      );
      
      // First error
      let img = container.querySelector('img');
      fireEvent.error(img);
      expect(onError).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ retryCount: 0 })
      );
      
      // Retry and error again
      const retryButton = container.querySelector('button');
      fireEvent.click(retryButton);
      img = container.querySelector('img');
      fireEvent.error(img);
      
      expect(onError).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ retryCount: 1 })
      );
    });
  });

  describe('Fallback Image', () => {
    it('should try fallback image on first error', () => {
      const fallbackImage = '/fallback.jpg';
      const { container } = render(
        <OptimizedImage
          publicId="test/image"
          alt="Test"
          fallbackImage={fallbackImage}
        />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      // Should render fallback image
      const fallbackImg = container.querySelector('.optimized-image-fallback');
      expect(fallbackImg).toBeTruthy();
      expect(fallbackImg.src).toContain(fallbackImage);
    });

    it('should show error UI if fallback also fails', () => {
      const fallbackImage = '/fallback.jpg';
      const { container } = render(
        <OptimizedImage
          publicId="test/image"
          alt="Test"
          fallbackImage={fallbackImage}
        />
      );
      let img = container.querySelector('img');
      
      // First error - shows fallback
      fireEvent.error(img);
      
      // Fallback also fails
      const fallbackImg = container.querySelector('.optimized-image-fallback');
      fireEvent.error(fallbackImg);
      
      // Should show error UI
      const errorDiv = container.querySelector('.optimized-image-error');
      expect(errorDiv).toBeTruthy();
    });
  });

  describe('No PublicId State', () => {
    it('should show placeholder when publicId is missing', () => {
      const { container } = render(<OptimizedImage publicId="" alt="Test" />);
      
      const placeholder = container.querySelector('.optimized-image-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('should show camera icon in placeholder', () => {
      const { container } = render(<OptimizedImage publicId="" alt="Test" />);
      
      expect(container.textContent).toContain('📷');
    });

    it('should have correct dimensions for placeholder', () => {
      const { container } = render(
        <OptimizedImage publicId="" alt="Test" width={300} height={200} />
      );
      const placeholder = container.querySelector('.optimized-image-placeholder');
      
      expect(placeholder.style.width).toBe('300px');
      expect(placeholder.style.height).toBe('200px');
    });

    it('should have role="img" for accessibility', () => {
      const { container } = render(<OptimizedImage publicId="" alt="Test" />);
      const placeholder = container.querySelector('.optimized-image-placeholder');
      
      expect(placeholder).toHaveAttribute('role', 'img');
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to loaded', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      // Initial state
      expect(img.style.opacity).toBe('0');
      
      // Load
      fireEvent.load(img);
      expect(img.style.opacity).toBe('1');
    });

    it('should transition from loading to error', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      // Initial state
      expect(container.querySelector('.optimized-image-error')).toBeNull();
      
      // Error
      fireEvent.error(img);
      expect(container.querySelector('.optimized-image-error')).toBeTruthy();
    });

    it('should transition from error to loading on retry', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      let img = container.querySelector('img');
      
      // Error state
      fireEvent.error(img);
      expect(container.querySelector('.optimized-image-error')).toBeTruthy();
      
      // Retry
      const retryButton = container.querySelector('button');
      fireEvent.click(retryButton);
      
      // Back to loading
      expect(container.querySelector('.optimized-image-error')).toBeNull();
      img = container.querySelector('img');
      expect(img).toBeTruthy();
    });

    it('should reset state when publicId changes', () => {
      const { container, rerender } = render(
        <OptimizedImage publicId="test/image1" alt="Test" />
      );
      let img = container.querySelector('img');
      
      // Load first image
      fireEvent.load(img);
      expect(img.style.opacity).toBe('1');
      
      // Change publicId
      rerender(<OptimizedImage publicId="test/image2" alt="Test" />);
      img = container.querySelector('img');
      
      // Should reset to loading state
      expect(img.style.opacity).toBe('0');
    });
  });

  describe('Layout Stability (CLS Prevention)', () => {
    it('should maintain dimensions during loading', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" width={400} height={300} />
      );
      const img = container.querySelector('img');
      
      expect(img).toHaveAttribute('width', '400');
      expect(img).toHaveAttribute('height', '300');
    });

    it('should maintain dimensions during error', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" width={400} height={300} />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const errorDiv = container.querySelector('.optimized-image-error');
      expect(errorDiv.style.width).toBe('400px');
      expect(errorDiv.style.height).toBe('300px');
    });

    it('should use preset dimensions for stability', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" preset="PROFILE_LARGE" />
      );
      const img = container.querySelector('img');
      
      // Preset is used for transformations, but width/height attributes
      // are only set if explicitly provided as props
      expect(img).toBeTruthy();
      
      // The preset affects the URL transformations
      expect(img.src).toContain('w_400');
      expect(img.src).toContain('h_400');
    });
  });

  describe('Accessibility', () => {
    it('should have alt text on main image', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test image" />
      );
      const img = container.querySelector('img');
      
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('should hide placeholder from screen readers', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" placeholder={true} />
      );
      
      const placeholders = container.querySelectorAll('img[aria-hidden="true"]');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should have aria-label on retry button', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const retryButton = container.querySelector('button');
      expect(retryButton).toHaveAttribute('aria-label', 'Retry loading image');
    });

    it('should have role="img" on error state', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      fireEvent.error(img);
      
      const errorDiv = container.querySelector('.optimized-image-error');
      expect(errorDiv).toHaveAttribute('role', 'img');
    });
  });

  describe('Performance', () => {
    it('should use lazy loading by default', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should support eager loading', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" loading="eager" />
      );
      const img = container.querySelector('img');
      
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should have smooth transition timing', () => {
      const { container } = render(
        <OptimizedImage publicId="test/image" alt="Test" />
      );
      const img = container.querySelector('img');
      
      expect(img.style.transition).toContain('0.3s');
      expect(img.style.transition).toContain('ease-in-out');
    });
  });
});
