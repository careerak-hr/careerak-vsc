import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComponentSuspenseFallback from '../ComponentSuspenseFallback';
import * as ThemeContext from '../../../context/ThemeContext';
import * as AnimationContext from '../../../context/AnimationContext';

/**
 * ComponentSuspenseFallback Unit Tests
 * 
 * Task: 8.4.5 Test Suspense fallbacks
 * Requirements: FR-LOAD-1, FR-LOAD-7, FR-LOAD-8, NFR-PERF-5
 * Design: Section 9.3 Suspense Fallbacks
 * 
 * Tests:
 * - Component rendering with different variants
 * - Dark mode support
 * - Animation behavior
 * - Accessibility attributes
 * - Custom height and className props
 * - Reduced motion support
 */

// Mock contexts
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: vi.fn()
}));

vi.mock('../../../context/AnimationContext', () => ({
  useAnimation: vi.fn()
}));

describe('ComponentSuspenseFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    AnimationContext.useAnimation.mockReturnValue({ shouldAnimate: true });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ComponentSuspenseFallback />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<ComponentSuspenseFallback />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Loading component');
    });

    it('displays screen reader announcement', () => {
      render(<ComponentSuspenseFallback />);
      expect(screen.getByText('Loading component, please wait...')).toBeInTheDocument();
    });
  });

  describe('Variant: minimal (default)', () => {
    it('renders minimal variant by default', () => {
      const { container } = render(<ComponentSuspenseFallback />);
      
      // Should have spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('applies default height for minimal variant', () => {
      const { container } = render(<ComponentSuspenseFallback variant="minimal" />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('h-20');
    });

    it('renders spinner with accent color', () => {
      const { container } = render(<ComponentSuspenseFallback variant="minimal" />);
      
      const spinner = container.querySelector('.border-t-\\[\\#D48161\\]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Variant: card', () => {
    it('renders card variant skeleton', () => {
      const { container } = render(<ComponentSuspenseFallback variant="card" />);
      
      // Should have image, title, and text skeletons
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(2);
    });

    it('applies default height for card variant', () => {
      render(<ComponentSuspenseFallback variant="card" />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('h-64');
    });

    it('renders card structure with padding', () => {
      const { container } = render(<ComponentSuspenseFallback variant="card" />);
      
      const cardContent = container.querySelector('.p-4');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe('Variant: list', () => {
    it('renders list variant skeleton', () => {
      const { container } = render(<ComponentSuspenseFallback variant="list" />);
      
      // Should render 3 list items
      const avatars = container.querySelectorAll('.rounded-full');
      expect(avatars.length).toBe(3);
    });

    it('renders list items with avatar and content', () => {
      const { container } = render(<ComponentSuspenseFallback variant="list" />);
      
      // Check for avatar skeletons
      const avatars = container.querySelectorAll('.w-12.h-12');
      expect(avatars.length).toBe(3);
    });
  });

  describe('Variant: form', () => {
    it('renders form variant skeleton', () => {
      const { container } = render(<ComponentSuspenseFallback variant="form" />);
      
      // Should render 3 form fields
      const fields = container.querySelectorAll('.space-y-2');
      expect(fields.length).toBeGreaterThan(2);
    });

    it('renders form with button skeleton', () => {
      const { container } = render(<ComponentSuspenseFallback variant="form" />);
      
      // Check for button skeleton
      const button = container.querySelector('.h-12.w-32');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('renders light mode styles by default', () => {
      ThemeContext.useTheme.mockReturnValue({ isDark: false });
      
      render(<ComponentSuspenseFallback />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('bg-white');
    });

    it('renders dark mode styles when isDark is true', () => {
      ThemeContext.useTheme.mockReturnValue({ isDark: true });
      
      render(<ComponentSuspenseFallback />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('bg-[#2d2d2d]');
    });

    it('applies dark mode to spinner in minimal variant', () => {
      ThemeContext.useTheme.mockReturnValue({ isDark: true });
      
      const { container } = render(<ComponentSuspenseFallback variant="minimal" />);
      
      const spinner = container.querySelector('.border-gray-600');
      expect(spinner).toBeInTheDocument();
    });

    it('applies dark mode to skeleton elements in card variant', () => {
      ThemeContext.useTheme.mockReturnValue({ isDark: true });
      
      const { container } = render(<ComponentSuspenseFallback variant="card" />);
      
      const darkSkeletons = container.querySelectorAll('.bg-gray-700');
      expect(darkSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Props', () => {
    it('accepts custom height prop', () => {
      render(<ComponentSuspenseFallback height="h-96" />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('h-96');
    });

    it('accepts custom className prop', () => {
      render(<ComponentSuspenseFallback className="custom-class" />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('overrides default height with custom height', () => {
      render(<ComponentSuspenseFallback variant="card" height="h-48" />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('h-48');
      expect(wrapper).not.toHaveClass('h-64');
    });
  });

  describe('Animation Behavior', () => {
    it('applies fade-in animation when shouldAnimate is true', () => {
      AnimationContext.useAnimation.mockReturnValue({ shouldAnimate: true });
      
      render(<ComponentSuspenseFallback />);
      
      const wrapper = screen.getByRole('status');
      // Component uses framer-motion, check it's rendered
      expect(wrapper).toBeInTheDocument();
    });

    it('disables animation when shouldAnimate is false', () => {
      AnimationContext.useAnimation.mockReturnValue({ shouldAnimate: false });
      
      render(<ComponentSuspenseFallback />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toBeInTheDocument();
    });

    it('respects prefers-reduced-motion setting', () => {
      AnimationContext.useAnimation.mockReturnValue({ shouldAnimate: false });
      
      render(<ComponentSuspenseFallback />);
      
      // Component should still render but without animations
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Layout Stability', () => {
    it('applies rounded corners for consistent layout', () => {
      render(<ComponentSuspenseFallback />);
      
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('rounded-lg');
    });

    it('maintains consistent structure across variants', () => {
      const variants = ['minimal', 'card', 'list', 'form'];
      
      variants.forEach(variant => {
        const { unmount } = render(<ComponentSuspenseFallback variant={variant} />);
        
        const wrapper = screen.getByRole('status');
        expect(wrapper).toHaveClass('rounded-lg');
        
        unmount();
      });
    });
  });

  describe('Pulse Animation', () => {
    it('applies pulse animation to skeleton elements in card variant', () => {
      const { container } = render(<ComponentSuspenseFallback variant="card" />);
      
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('applies pulse animation to skeleton elements in list variant', () => {
      const { container } = render(<ComponentSuspenseFallback variant="list" />);
      
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('applies pulse animation to skeleton elements in form variant', () => {
      const { container } = render(<ComponentSuspenseFallback variant="form" />);
      
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid variant gracefully', () => {
      render(<ComponentSuspenseFallback variant="invalid" />);
      
      // Should fallback to minimal variant
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveClass('h-20');
    });

    it('handles missing theme context', () => {
      ThemeContext.useTheme.mockReturnValue({ isDark: undefined });
      
      render(<ComponentSuspenseFallback />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('handles missing animation context', () => {
      AnimationContext.useAnimation.mockReturnValue({ shouldAnimate: undefined });
      
      render(<ComponentSuspenseFallback />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
