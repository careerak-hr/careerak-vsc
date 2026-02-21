/**
 * Loading Announcements with aria-live Tests
 * 
 * Tests task 5.4.4: Add loading announcements with aria-live
 * 
 * Tests FR-A11Y-12: When displaying dynamic content, the system shall announce 
 * changes to screen readers using aria-live="polite".
 * 
 * Validates:
 * - Loading states are announced with aria-live
 * - Correct politeness level (polite for loading)
 * - All loading components support announcements
 * - Multi-language support
 * - Announcements can be disabled when needed
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import OverlaySpinner from '../components/Loading/OverlaySpinner';
import ProgressBar from '../components/Loading/ProgressBar';
import Spinner from '../components/Loading/Spinner';
import DotsLoader from '../components/Loading/DotsLoader';
import PulseLoader from '../components/Loading/PulseLoader';
import SkeletonCard from '../components/Loading/SkeletonCard';
import { AnimationProvider } from '../context/AnimationContext';

// Mock AnimationContext
vi.mock('../context/AnimationContext', () => ({
  AnimationProvider: ({ children }) => <div>{children}</div>,
  useAnimation: () => ({
    shouldAnimate: true,
    variants: {}
  })
}));

describe('Loading Announcements with aria-live', () => {
  describe('ButtonSpinner Component', () => {
    it('should render with aria-live="polite" by default', () => {
      const { container } = render(
        <AnimationProvider>
          <ButtonSpinner ariaLabel="Processing request" />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Processing request');
    });

    it('should have role="status" for loading announcements', () => {
      const { container } = render(
        <AnimationProvider>
          <ButtonSpinner ariaLabel="Saving..." />
        </AnimationProvider>
      );
      
      const status = container.querySelector('[role="status"]');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
    });

    it('should be visually hidden but accessible to screen readers', () => {
      const { container } = render(
        <AnimationProvider>
          <ButtonSpinner />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.className).toContain('sr-only');
    });

    it('should allow disabling screen reader announcements', () => {
      const { container } = render(
        <AnimationProvider>
          <ButtonSpinner announceToScreenReader={false} />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
    });
  });

  describe('OverlaySpinner Component', () => {
    it('should announce loading message with aria-live', () => {
      const { container } = render(
        <AnimationProvider>
          <OverlaySpinner show={true} message="Uploading file..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Uploading file...');
    });

    it('should use default message when none provided', () => {
      const { container } = render(
        <AnimationProvider>
          <OverlaySpinner show={true} />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading...');
    });

    it('should not announce when not shown', () => {
      const { container } = render(
        <AnimationProvider>
          <OverlaySpinner show={false} message="Test" />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
    });
  });

  describe('ProgressBar Component', () => {
    it('should announce progress percentage', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} loadingMessage="Downloading" />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('Downloading');
      expect(liveRegion.textContent).toContain('50%');
    });

    it('should have progressbar role with aria attributes', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={75} />
        </AnimationProvider>
      );
      
      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeTruthy();
      expect(progressbar.getAttribute('aria-valuenow')).toBe('75');
      expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
      expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should update announcement when progress changes', async () => {
      const { container, rerender } = render(
        <AnimationProvider>
          <ProgressBar progress={25} />
        </AnimationProvider>
      );
      
      let liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.textContent).toContain('25%');
      
      rerender(
        <AnimationProvider>
          <ProgressBar progress={75} />
        </AnimationProvider>
      );
      
      await waitFor(() => {
        liveRegion = container.querySelector('[aria-live]');
        expect(liveRegion.textContent).toContain('75%');
      });
    });
  });

  describe('Spinner Component', () => {
    it('should announce loading with aria-live', () => {
      const { container } = render(
        <AnimationProvider>
          <Spinner ariaLabel="Loading data..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading data...');
    });

    it('should use default aria label', () => {
      const { container } = render(
        <AnimationProvider>
          <Spinner />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading...');
    });
  });

  describe('DotsLoader Component', () => {
    it('should announce loading with aria-live', () => {
      const { container } = render(
        <AnimationProvider>
          <DotsLoader ariaLabel="Processing..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Processing...');
    });
  });

  describe('PulseLoader Component', () => {
    it('should announce loading with aria-live', () => {
      const { container } = render(
        <AnimationProvider>
          <PulseLoader ariaLabel="Loading content..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading content...');
    });
  });

  describe('SkeletonCard Component', () => {
    it('should announce loading with aria-live', () => {
      const { container } = render(
        <AnimationProvider>
          <SkeletonCard ariaLabel="Loading job listing..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading job listing...');
    });

    it('should use default aria label', () => {
      const { container } = render(
        <AnimationProvider>
          <SkeletonCard />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Loading content...');
    });
  });

  describe('Accessibility Requirements', () => {
    it('should meet FR-A11Y-12: announce loading with aria-live="polite"', () => {
      const { container } = render(
        <AnimationProvider>
          <Spinner ariaLabel="Loading..." />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.getAttribute('role')).toBe('status');
    });

    it('should be accessible to screen readers but visually hidden', () => {
      const { container } = render(
        <AnimationProvider>
          <ButtonSpinner />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.hasAttribute('aria-live')).toBe(true);
      expect(liveRegion.className).toContain('sr-only');
    });

    it('should support multi-language announcements', () => {
      const arabicMessage = 'جاري التحميل...';
      const { container } = render(
        <AnimationProvider>
          <Spinner ariaLabel={arabicMessage} />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe(arabicMessage);
    });

    it('should allow disabling announcements when needed', () => {
      const { container } = render(
        <AnimationProvider>
          <Spinner announceToScreenReader={false} />
        </AnimationProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
    });
  });
});