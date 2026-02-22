/**
 * ImagePlaceholder Component Tests
 * 
 * Tests for the ImagePlaceholder component that displays loading states for images.
 * Validates placeholder rendering, animations, accessibility, and dark mode support.
 * 
 * Task: 8.3.5 Test image loading states
 * Requirements: FR-LOAD-6
 * Design: Section 9.3 Suspense Fallbacks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImagePlaceholder from '../ImagePlaceholder';

describe('ImagePlaceholder Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render placeholder with default props', () => {
      const { container } = render(<ImagePlaceholder />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toBeTruthy();
      expect(placeholder).toHaveAttribute('role', 'img');
      expect(placeholder).toHaveAttribute('aria-label', 'Loading image');
    });

    it('should render with custom width and height', () => {
      const { container } = render(<ImagePlaceholder width={400} height={300} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('400px');
      expect(placeholder.style.height).toBe('300px');
    });

    it('should render with aspect ratio', () => {
      const { container } = render(<ImagePlaceholder aspectRatio="16/9" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.aspectRatio).toBe('16/9');
    });

    it('should render with preset dimensions', () => {
      const { container } = render(<ImagePlaceholder preset="PROFILE_MEDIUM" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      // PROFILE_MEDIUM is 200x200
      expect(placeholder.style.width).toBe('200px');
      expect(placeholder.style.height).toBe('200px');
    });

    it('should apply custom className', () => {
      const { container } = render(<ImagePlaceholder className="custom-class" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.classList.contains('custom-class')).toBe(true);
    });

    it('should apply custom inline styles', () => {
      const customStyle = { border: '2px solid red' };
      const { container } = render(<ImagePlaceholder style={customStyle} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.border).toBe('2px solid red');
    });
  });

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      const { container } = render(<ImagePlaceholder />);
      const icon = container.querySelector('span[aria-hidden="true"]');
      
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('🖼️');
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(<ImagePlaceholder showIcon={false} />);
      const icon = container.querySelector('span[aria-hidden="true"]');
      
      expect(icon).toBeNull();
    });

    it('should render icon with correct styling', () => {
      const { container } = render(<ImagePlaceholder />);
      const icon = container.querySelector('span[aria-hidden="true"]');
      
      expect(icon.style.fontSize).toBe('2rem');
      expect(icon.style.zIndex).toBe('1');
    });
  });

  describe('Rounded Placeholder', () => {
    it('should apply border-radius when rounded is true', () => {
      const { container } = render(<ImagePlaceholder rounded />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.borderRadius).toBe('50%');
    });

    it('should not apply border-radius when rounded is false', () => {
      const { container } = render(<ImagePlaceholder rounded={false} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.borderRadius).toBeFalsy();
    });

    it('should work with preset and rounded', () => {
      const { container } = render(
        <ImagePlaceholder preset="PROFILE_LARGE" rounded />
      );
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.borderRadius).toBe('50%');
      expect(placeholder.style.width).toBe('400px');
    });
  });

  describe('Animation', () => {
    it('should render pulse animation overlay', () => {
      const { container } = render(<ImagePlaceholder />);
      const pulse = container.querySelector('.image-placeholder-pulse');
      
      expect(pulse).toBeTruthy();
      expect(pulse.style.animation).toContain('shimmer');
    });

    it('should have correct animation properties', () => {
      const { container } = render(<ImagePlaceholder />);
      const pulse = container.querySelector('.image-placeholder-pulse');
      
      expect(pulse.style.position).toBe('absolute');
      expect(pulse.style.width).toBe('100%');
      expect(pulse.style.height).toBe('100%');
    });

    it('should include shimmer keyframes', () => {
      const { container } = render(<ImagePlaceholder />);
      const style = container.querySelector('style');
      
      expect(style.textContent).toContain('@keyframes shimmer');
      expect(style.textContent).toContain('translateX(-100%)');
      expect(style.textContent).toContain('translateX(100%)');
    });
  });

  describe('Accessibility', () => {
    it('should have role="img"', () => {
      const { container } = render(<ImagePlaceholder />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toHaveAttribute('role', 'img');
    });

    it('should have aria-label', () => {
      const { container } = render(<ImagePlaceholder />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toHaveAttribute('aria-label', 'Loading image');
    });

    it('should mark icon as aria-hidden', () => {
      const { container } = render(<ImagePlaceholder />);
      const icon = container.querySelector('span[aria-hidden="true"]');
      
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support reduced motion preference', () => {
      const { container } = render(<ImagePlaceholder />);
      const style = container.querySelector('style');
      
      expect(style.textContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(style.textContent).toContain('animation: none !important');
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode CSS variables', () => {
      const { container } = render(<ImagePlaceholder />);
      const style = container.querySelector('style');
      
      expect(style.textContent).toContain('@media (prefers-color-scheme: dark)');
      expect(style.textContent).toContain('--placeholder-bg: #374151');
      expect(style.textContent).toContain('--placeholder-icon: #6b7280');
    });

    it('should support explicit dark mode class', () => {
      const { container } = render(<ImagePlaceholder />);
      const style = container.querySelector('style');
      
      expect(style.textContent).toContain('.dark .image-placeholder');
    });
  });

  describe('Preset Support', () => {
    it('should work with PROFILE_SMALL preset', () => {
      const { container } = render(<ImagePlaceholder preset="PROFILE_SMALL" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('100px');
      expect(placeholder.style.height).toBe('100px');
    });

    it('should work with PROFILE_MEDIUM preset', () => {
      const { container } = render(<ImagePlaceholder preset="PROFILE_MEDIUM" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('200px');
      expect(placeholder.style.height).toBe('200px');
    });

    it('should work with PROFILE_LARGE preset', () => {
      const { container } = render(<ImagePlaceholder preset="PROFILE_LARGE" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('400px');
      expect(placeholder.style.height).toBe('400px');
    });

    it('should work with LOGO_MEDIUM preset', () => {
      const { container } = render(<ImagePlaceholder preset="LOGO_MEDIUM" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('150px');
      expect(placeholder.style.height).toBe('150px');
    });

    it('should override preset with explicit dimensions', () => {
      const { container } = render(
        <ImagePlaceholder preset="PROFILE_SMALL" width={300} height={300} />
      );
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder.style.width).toBe('300px');
      expect(placeholder.style.height).toBe('300px');
    });
  });

  describe('Layout Stability', () => {
    it('should prevent layout shifts with fixed dimensions', () => {
      const { container } = render(<ImagePlaceholder width={400} height={300} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      // Fixed dimensions prevent CLS
      expect(placeholder.style.width).toBe('400px');
      expect(placeholder.style.height).toBe('300px');
    });

    it('should prevent layout shifts with aspect ratio', () => {
      const { container } = render(<ImagePlaceholder aspectRatio="16/9" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      // Aspect ratio maintains space
      expect(placeholder.style.aspectRatio).toBe('16/9');
    });

    it('should have minimum height when no dimensions provided', () => {
      const { container } = render(<ImagePlaceholder />);
      const placeholder = container.querySelector('.image-placeholder');
      
      // Minimum height prevents collapse
      expect(placeholder.style.minHeight).toBe('200px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing preset gracefully', () => {
      const { container } = render(<ImagePlaceholder preset="INVALID_PRESET" />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toBeTruthy();
    });

    it('should handle zero dimensions', () => {
      const { container } = render(<ImagePlaceholder width={0} height={0} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toBeTruthy();
    });

    it('should handle negative dimensions', () => {
      const { container } = render(<ImagePlaceholder width={-100} height={-100} />);
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toBeTruthy();
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <ImagePlaceholder data-testid="test-placeholder" />
      );
      const placeholder = container.querySelector('.image-placeholder');
      
      expect(placeholder).toHaveAttribute('data-testid', 'test-placeholder');
    });
  });

  describe('Performance', () => {
    it('should use CSS animations for GPU acceleration', () => {
      const { container } = render(<ImagePlaceholder />);
      const pulse = container.querySelector('.image-placeholder-pulse');
      
      // Transform is GPU-accelerated
      expect(pulse.style.animation).toContain('shimmer');
    });

    it('should have reasonable animation duration', () => {
      const { container } = render(<ImagePlaceholder />);
      const pulse = container.querySelector('.image-placeholder-pulse');
      
      // 2s is reasonable for shimmer effect
      expect(pulse.style.animation).toContain('shimmer 2s infinite');
    });
  });
});
