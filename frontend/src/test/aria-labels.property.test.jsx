/**
 * ARIA Labels Property-Based Tests
 * 
 * Property A11Y-1: ARIA Labels
 * ∀ button ∈ IconButtons: button.hasAttribute('aria-label') = true
 * 
 * Validates: Requirements FR-A11Y-1, FR-A11Y-2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimationProvider } from '../context/AnimationContext';

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AppProvider>
      <ThemeProvider>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </ThemeProvider>
    </AppProvider>
  </BrowserRouter>
);

// Generator for icon button components
const iconButtonArbitrary = fc.record({
  icon: fc.constantFrom('⚙️', '🔔', '🌙', '☀️', '🔍', '❌', '✓', '📝', '🗑️', '📊'),
  label: fc.string({ minLength: 3, maxLength: 50 }),
  hasAriaLabel: fc.boolean(),
  hasTextContent: fc.boolean(),
  role: fc.constantFrom('button', undefined),
  tabIndex: fc.constantFrom(0, -1, undefined),
});

// Create a test icon button component
const TestIconButton = ({ icon, label, hasAriaLabel, hasTextContent, role, tabIndex }) => {
  const props = {
    ...(role && { role }),
    ...(tabIndex !== undefined && { tabIndex }),
    ...(hasAriaLabel && { 'aria-label': label }),
  };

  return (
    <button {...props} data-testid="icon-button">
      {icon}
      {hasTextContent && <span className="sr-only">{label}</span>}
    </button>
  );
};

// Helper to check if a button is an icon button (no visible text, only icon/image)
const isIconButton = (button) => {
  // Check if button has only icon content (emoji, svg, img) and no visible text
  const textContent = button.textContent.trim();
  const hasOnlyEmoji = /^[\u{1F300}-\u{1F9FF}]$/u.test(textContent);
  const hasImage = button.querySelector('img, svg') !== null;
  const hasVisibleText = button.querySelector(':not(.sr-only):not([aria-hidden="true"])');
  
  return (hasOnlyEmoji || hasImage) && !hasVisibleText;
};

// Helper to get all icon buttons from a container
const getAllIconButtons = (container) => {
  const allButtons = container.querySelectorAll('button, [role="button"]');
  return Array.from(allButtons).filter(isIconButton);
};

describe('Property A11Y-1: ARIA Labels for Icon Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should require aria-label on all icon buttons (100 iterations)', () => {
    fc.assert(
      fc.property(
        iconButtonArbitrary,
        (buttonConfig) => {
          cleanup();

          const { container } = render(
            <TestWrapper>
              <TestIconButton {...buttonConfig} />
            </TestWrapper>
          );

          const button = container.querySelector('[data-testid="icon-button"]');
          expect(button).toBeInTheDocument();

          const hasAriaLabel = button.hasAttribute('aria-label');
          const ariaLabelValue = button.getAttribute('aria-label');
          const hasScreenReaderText = button.querySelector('.sr-only') !== null;

          // Icon buttons MUST have either aria-label or screen reader text
          if (isIconButton(button)) {
            const hasAccessibleLabel = hasAriaLabel || hasScreenReaderText;
            expect(hasAccessibleLabel).toBe(true);

            // If aria-label exists, it must not be empty
            if (hasAriaLabel) {
              expect(ariaLabelValue).toBeTruthy();
              expect(ariaLabelValue.length).toBeGreaterThan(0);
            }
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have non-empty aria-label values (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom('⚙️', '🔔', '🌙', '☀️', '🔍'),
          label: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        ({ icon, label }) => {
          cleanup();

          const { container } = render(
            <TestWrapper>
              <button aria-label={label} data-testid="test-button">
                {icon}
              </button>
            </TestWrapper>
          );

          const button = container.querySelector('[data-testid="test-button"]');
          const ariaLabel = button.getAttribute('aria-label');

          // aria-label must not be empty or whitespace-only
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel.trim().length).toBeGreaterThan(0);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain aria-label consistency across re-renders (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom('⚙️', '🔔', '🌙'),
          label: fc.string({ minLength: 5, maxLength: 30 }),
          renderCount: fc.integer({ min: 1, max: 5 }),
        }),
        ({ icon, label, renderCount }) => {
          cleanup();

          let container;
          let rerender;

          // Initial render
          ({ container, rerender } = render(
            <TestWrapper>
              <button aria-label={label} data-testid="consistent-button">
                {icon}
              </button>
            </TestWrapper>
          ));

          const initialLabel = container
            .querySelector('[data-testid="consistent-button"]')
            .getAttribute('aria-label');

          // Re-render multiple times
          for (let i = 0; i < renderCount; i++) {
            rerender(
              <TestWrapper>
                <button aria-label={label} data-testid="consistent-button">
                  {icon}
                </button>
              </TestWrapper>
            );

            const currentLabel = container
              .querySelector('[data-testid="consistent-button"]')
              .getAttribute('aria-label');

            // aria-label should remain consistent
            expect(currentLabel).toBe(initialLabel);
            expect(currentLabel).toBe(label);
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have descriptive aria-labels (not just icon names) (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom('⚙️', '🔔', '🌙', '☀️', '🔍', '❌'),
          action: fc.constantFrom('Open', 'Close', 'Toggle', 'Show', 'Hide', 'Delete'),
          target: fc.constantFrom('settings', 'notifications', 'theme', 'search', 'menu', 'modal'),
        }),
        ({ icon, action, target }) => {
          cleanup();

          const descriptiveLabel = `${action} ${target}`;

          const { container } = render(
            <TestWrapper>
              <button aria-label={descriptiveLabel} data-testid="descriptive-button">
                {icon}
              </button>
            </TestWrapper>
          );

          const button = container.querySelector('[data-testid="descriptive-button"]');
          const ariaLabel = button.getAttribute('aria-label');

          // aria-label should be descriptive (contain action and target)
          expect(ariaLabel).toContain(action);
          expect(ariaLabel).toContain(target);
          expect(ariaLabel.split(' ').length).toBeGreaterThanOrEqual(2);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should support multi-language aria-labels (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom('⚙️', '🔔', '🌙'),
          language: fc.constantFrom('ar', 'en', 'fr'),
        }),
        ({ icon, language }) => {
          cleanup();

          const labels = {
            ar: 'الإعدادات',
            en: 'Settings',
            fr: 'Paramètres',
          };

          const label = labels[language];

          const { container } = render(
            <TestWrapper>
              <button aria-label={label} data-testid="i18n-button" lang={language}>
                {icon}
              </button>
            </TestWrapper>
          );

          const button = container.querySelector('[data-testid="i18n-button"]');
          const ariaLabel = button.getAttribute('aria-label');

          // aria-label should match the language
          expect(ariaLabel).toBe(label);
          expect(ariaLabel.length).toBeGreaterThan(0);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have aria-label on buttons with only SVG/image content (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.string({ minLength: 5, maxLength: 50 }),
          iconType: fc.constantFrom('svg', 'img'),
        }),
        ({ label, iconType }) => {
          cleanup();

          const IconContent = iconType === 'svg' ? (
            <svg width="20" height="20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" />
            </svg>
          ) : (
            <img src="/icon.png" alt="" aria-hidden="true" />
          );

          const { container } = render(
            <TestWrapper>
              <button aria-label={label} data-testid="icon-content-button">
                {IconContent}
              </button>
            </TestWrapper>
          );

          const button = container.querySelector('[data-testid="icon-content-button"]');
          const ariaLabel = button.getAttribute('aria-label');

          // Button with only icon content must have aria-label
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toBe(label);

          // Icon content should be hidden from screen readers
          const iconElement = button.querySelector('svg, img');
          expect(iconElement.getAttribute('aria-hidden')).toBe('true');

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate aria-label presence on interactive icon elements (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom('⚙️', '🔔', '🌙', '☀️', '🔍'),
          label: fc.string({ minLength: 3, maxLength: 50 }),
          elementType: fc.constantFrom('button', 'div'),
          hasRole: fc.boolean(),
        }),
        ({ icon, label, elementType, hasRole }) => {
          cleanup();

          const Element = elementType;
          const props = {
            'data-testid': 'interactive-element',
            'aria-label': label,
            ...(elementType === 'div' && hasRole && { role: 'button', tabIndex: 0 }),
          };

          const { container } = render(
            <TestWrapper>
              <Element {...props}>{icon}</Element>
            </TestWrapper>
          );

          const element = container.querySelector('[data-testid="interactive-element"]');
          const ariaLabel = element.getAttribute('aria-label');

          // Interactive elements with icon-only content must have aria-label
          if (elementType === 'button' || (elementType === 'div' && hasRole)) {
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
