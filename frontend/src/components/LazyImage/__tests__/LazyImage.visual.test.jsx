/**
 * Visual Test for LazyImage Placeholders
 * 
 * This test demonstrates that image placeholders are shown during loading.
 * 
 * **Validates: Requirements FR-LOAD-6**
 * 
 * FR-LOAD-6: When images are loading, the system shall display a placeholder with loading animation.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
    MockIntersectionObserver.instances.push(this);
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  triggerIntersection(isIntersecting) {
    this.elements.forEach((element) => {
      this.callback([
        {
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        },
      ]);
    });
  }

  static instances = [];

  static reset() {
    MockIntersectionObserver.instances = [];
  }

  static getLastInstance() {
    return MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
  }
}

describe('LazyImage Placeholder Visual Tests', () => {
  beforeEach(() => {
    global.IntersectionObserver = MockIntersectionObserver;
    MockIntersectionObserver.reset();
  });

  describe('FR-LOAD-6: Image Placeholders', () => {
    it('should show placeholder before image enters viewport', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
          placeholder={true}
        />
      );

      // Verify placeholder is shown
      const notLoadedDiv = container.querySelector('.lazy-image-not-loaded');
      expect(notLoadedDiv).not.toBeNull();
      expect(notLoadedDiv).toBeInTheDocument();

      // Verify actual image is NOT loaded yet
      const picture = container.querySelector('picture');
      expect(picture).toBeNull();
    });

    it('should show blur-up placeholder when enabled', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
          placeholder={true}
        />
      );

      // Trigger intersection to start loading
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify blur-up placeholder is shown during loading
      const blurPlaceholder = container.querySelector('.lazy-image-placeholder-blur');
      expect(blurPlaceholder).not.toBeNull();
    });

    it('should show loading spinner during image load', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
          showSpinner={true}
        />
      );

      // Trigger intersection to start loading
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify spinner is shown
      const spinner = container.querySelector('.lazy-image-spinner');
      expect(spinner).not.toBeNull();
      expect(spinner).toBeInTheDocument();

      // Verify spinner has animation
      const spinnerElement = container.querySelector('.spinner');
      expect(spinnerElement).not.toBeNull();
    });

    it('should show placeholder with icon when no publicId', () => {
      const { container } = render(
        <LazyImage
          publicId=""
          alt="Empty image"
          width={400}
          height={300}
        />
      );

      // Verify placeholder is shown
      const placeholder = container.querySelector('.lazy-image-placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder).toBeInTheDocument();

      // Verify placeholder has icon
      expect(placeholder.textContent).toContain('📷');
    });

    it('should show error placeholder when image fails to load', () => {
      const { container } = render(
        <LazyImage
          publicId="test/nonexistent"
          alt="Failed image"
          width={400}
          height={300}
        />
      );

      // Trigger intersection
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Get the image element
      const img = container.querySelector('img.lazy-image');
      expect(img).not.toBeNull();

      // Simulate image load error
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);

      // Verify error placeholder is shown
      const errorPlaceholder = container.querySelector('.lazy-image-error');
      expect(errorPlaceholder).not.toBeNull();
      expect(errorPlaceholder).toBeInTheDocument();

      // Verify error icon is shown
      expect(errorPlaceholder.textContent).toContain('⚠️');
    });

    it('should show retry button in error placeholder', () => {
      const { container } = render(
        <LazyImage
          publicId="test/nonexistent"
          alt="Failed image"
          width={400}
          height={300}
          showRetry={true}
        />
      );

      // Trigger intersection and error
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);
      
      const img = container.querySelector('img.lazy-image');
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);

      // Verify retry button is shown
      const retryButton = container.querySelector('button');
      expect(retryButton).not.toBeNull();
      expect(retryButton.textContent).toContain('Retry');
    });

    it('should apply smooth transitions to placeholders', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
          placeholder={true}
        />
      );

      // Trigger intersection
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify blur placeholder has transition
      const blurPlaceholder = container.querySelector('.lazy-image-placeholder-blur');
      expect(blurPlaceholder).not.toBeNull();
      
      const styles = window.getComputedStyle(blurPlaceholder);
      expect(styles.transition).toContain('opacity');
    });

    it('should show placeholder with custom background color', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
          placeholder={true}
        />
      );

      // Verify placeholder has background
      const notLoadedDiv = container.querySelector('.lazy-image-not-loaded');
      expect(notLoadedDiv).not.toBeNull();
      
      const styles = window.getComputedStyle(notLoadedDiv);
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('should maintain placeholder aspect ratio', () => {
      const width = 400;
      const height = 300;
      
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={width}
          height={height}
          placeholder={true}
        />
      );

      // Verify container maintains dimensions
      const containerDiv = container.querySelector('.lazy-image-container');
      expect(containerDiv).not.toBeNull();
      
      const styles = window.getComputedStyle(containerDiv);
      expect(styles.width).toBeTruthy();
      expect(styles.height).toBeTruthy();
    });

    it('should show loading animation on container', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          width={400}
          height={300}
        />
      );

      // Trigger intersection to start loading
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify container has loading class
      const containerDiv = container.querySelector('.lazy-image-container');
      expect(containerDiv).not.toBeNull();
      expect(containerDiv.classList.contains('loading')).toBe(true);
    });
  });

  describe('Placeholder Accessibility', () => {
    it('should have proper ARIA labels on placeholders', () => {
      const altText = 'Test image description';
      
      const { container } = render(
        <LazyImage
          publicId=""
          alt={altText}
          width={400}
          height={300}
        />
      );

      // Verify placeholder has role and aria-label
      const placeholder = container.querySelector('.lazy-image-placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder.getAttribute('role')).toBe('img');
      expect(placeholder.getAttribute('aria-label')).toContain(altText);
    });

    it('should have aria-label on loading spinner', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          showSpinner={true}
        />
      );

      // Trigger intersection
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify spinner has aria-label
      const spinner = container.querySelector('.spinner');
      expect(spinner).not.toBeNull();
      expect(spinner.getAttribute('aria-label')).toBe('Loading image');
    });

    it('should hide blur placeholder from screen readers', () => {
      const { container } = render(
        <LazyImage
          publicId="test/image123"
          alt="Test image"
          placeholder={true}
        />
      );

      // Trigger intersection
      const observer = MockIntersectionObserver.getLastInstance();
      observer.triggerIntersection(true);

      // Verify blur placeholder is hidden from screen readers
      const blurPlaceholder = container.querySelector('.lazy-image-placeholder-blur');
      expect(blurPlaceholder).not.toBeNull();
      expect(blurPlaceholder.getAttribute('aria-hidden')).toBe('true');
      expect(blurPlaceholder.getAttribute('alt')).toBe('');
    });
  });
});
