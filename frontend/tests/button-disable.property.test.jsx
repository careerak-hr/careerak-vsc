/**
 * Button Disable Property-Based Test
 * Task 8.6.3: Write property-based test for button disable (100 iterations)
 * 
 * This test suite validates button disable behavior during loading states
 * using property-based testing to ensure buttons are always disabled when loading.
 * 
 * Requirements:
 * - FR-LOAD-3: Button spinner shown during processing and button disabled
 * - Property LOAD-3: button.loading = true → button.disabled = true
 * 
 * **Validates: Requirements FR-LOAD-3, Property LOAD-3**
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import LoadingButton from '../src/components/common/LoadingButton';

/**
 * Arbitrary generators for property-based testing
 */

// Generate loading state (true/false)
const loadingStateArbitrary = fc.boolean();

// Generate disabled state (true/false)
const disabledStateArbitrary = fc.boolean();

// Generate button text
const buttonTextArbitrary = fc.string({ minLength: 1, maxLength: 50 });

// Generate loading text
const loadingTextArbitrary = fc.string({ minLength: 1, maxLength: 50 });

// Generate button variants
const buttonVariantArbitrary = fc.constantFrom('primary', 'secondary', 'danger', 'success');

// Generate button types
const buttonTypeArbitrary = fc.constantFrom('button', 'submit', 'reset');

// Generate multiple button states for coordination testing
const multipleButtonStatesArbitrary = fc.array(
  fc.record({
    loading: fc.boolean(),
    disabled: fc.boolean()
  }),
  { minLength: 2, maxLength: 5 }
);

/**
 * Helper function to check if button is disabled
 */
const isButtonDisabled = (button) => {
  return button.disabled === true || button.hasAttribute('disabled');
};

/**
 * Helper function to check if button has disabled class
 */
const hasDisabledClass = (button) => {
  return button.className.includes('loading-button-disabled');
};

describe('Button Disable Property-Based Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Button should always be disabled when loading is true
   * Validates: Property LOAD-3 (button.loading = true → button.disabled = true)
   */
  it('should always disable button when loading is true (100 iterations)', () => {
    fc.assert(
      fc.property(
        disabledStateArbitrary,
        buttonTextArbitrary,
        (disabled, text) => {
          const { container, unmount } = render(
            <LoadingButton loading={true} disabled={disabled}>
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(button).toBeTruthy();
            expect(isButtonDisabled(button)).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Button disabled state should match loading OR disabled prop
   * Validates: Property LOAD-3
   */
  it('should disable button when loading OR disabled is true (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        buttonTextArbitrary,
        (loading, disabled, text) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const expectedDisabled = loading || disabled;
            expect(isButtonDisabled(button)).toBe(expectedDisabled);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Button should have disabled class when disabled
   * Validates: FR-LOAD-3
   */
  it('should apply disabled class when button is disabled (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        (loading, disabled) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              Click Me
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const expectedDisabled = loading || disabled;
            expect(hasDisabledClass(button)).toBe(expectedDisabled);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Disabled button should not trigger onClick
   * Validates: Property LOAD-3
   */
  it('should not trigger onClick when button is disabled (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        (loading, disabled) => {
          const onClick = vi.fn();
          const { container, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled} onClick={onClick}>
              Click Me
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            fireEvent.click(button);
            
            const expectedDisabled = loading || disabled;
            if (expectedDisabled) {
              expect(onClick).not.toHaveBeenCalled();
            } else {
              expect(onClick).toHaveBeenCalledTimes(1);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Loading button should show loading text
   * Validates: FR-LOAD-3
   */
  it('should show loading text when loading is true (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingTextArbitrary,
        buttonTextArbitrary,
        (loadingText, buttonText) => {
          const { container, unmount } = render(
            <LoadingButton loading={true} loadingText={loadingText}>
              {buttonText}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(button.textContent).toContain(loadingText);
            expect(button.textContent).not.toContain(buttonText);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Non-loading button should show children
   * Validates: FR-LOAD-3
   */
  it('should show children when loading is false (100 iterations)', () => {
    fc.assert(
      fc.property(
        buttonTextArbitrary,
        loadingTextArbitrary,
        (buttonText, loadingText) => {
          const { container, unmount } = render(
            <LoadingButton loading={false} loadingText={loadingText}>
              {buttonText}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            // Check that button text equals children (not loading text)
            expect(button.textContent).toBe(buttonText);
            // Should not show loading spinner
            const spinner = container.querySelector('.loading-spinner');
            expect(spinner).toBeFalsy();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Loading button should show spinner
   * Validates: FR-LOAD-3
   */
  it('should show spinner when loading is true (100 iterations)', () => {
    fc.assert(
      fc.property(
        buttonTextArbitrary,
        (text) => {
          const { container, unmount } = render(
            <LoadingButton loading={true}>
              {text}
            </LoadingButton>
          );
          
          try {
            const spinner = container.querySelector('.loading-spinner');
            expect(spinner).toBeTruthy();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Non-loading button should not show spinner
   * Validates: FR-LOAD-3
   */
  it('should not show spinner when loading is false (100 iterations)', () => {
    fc.assert(
      fc.property(
        buttonTextArbitrary,
        (text) => {
          const { container, unmount } = render(
            <LoadingButton loading={false}>
              {text}
            </LoadingButton>
          );
          
          try {
            const spinner = container.querySelector('.loading-spinner');
            expect(spinner).toBeFalsy();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Button variant should not affect disable behavior
   * Validates: Property LOAD-3
   */
  it('should disable button regardless of variant (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        buttonVariantArbitrary,
        (loading, variant) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} variant={variant}>
              Click Me
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(isButtonDisabled(button)).toBe(loading);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Button type should not affect disable behavior
   * Validates: Property LOAD-3
   */
  it('should disable button regardless of type (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        buttonTypeArbitrary,
        (loading, type) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} type={type}>
              Click Me
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(isButtonDisabled(button)).toBe(loading);
            expect(button.type).toBe(type);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Multiple buttons should have independent disable states
   * Validates: Property LOAD-3
   */
  it('should handle multiple independent button states (100 iterations)', () => {
    fc.assert(
      fc.property(
        multipleButtonStatesArbitrary,
        (buttonStates) => {
          const { container, unmount } = render(
            <div>
              {buttonStates.map((state, index) => (
                <LoadingButton
                  key={index}
                  loading={state.loading}
                  disabled={state.disabled}
                  data-testid={`button-${index}`}
                >
                  Button {index}
                </LoadingButton>
              ))}
            </div>
          );
          
          try {
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBe(buttonStates.length);
            
            buttons.forEach((button, index) => {
              const expectedDisabled = buttonStates[index].loading || buttonStates[index].disabled;
              expect(isButtonDisabled(button)).toBe(expectedDisabled);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Button disable state should be idempotent
   * Validates: Property LOAD-3
   */
  it('should produce consistent disable state for same inputs (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        (loading, disabled) => {
          const { container: container1, unmount: unmount1 } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              Test
            </LoadingButton>
          );
          
          const { container: container2, unmount: unmount2 } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              Test
            </LoadingButton>
          );
          
          try {
            const button1 = container1.querySelector('button');
            const button2 = container2.querySelector('button');
            
            expect(isButtonDisabled(button1)).toBe(isButtonDisabled(button2));
            expect(hasDisabledClass(button1)).toBe(hasDisabledClass(button2));
          } finally {
            unmount1();
            unmount2();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Rapid loading state changes should maintain disable consistency
   * Validates: Property LOAD-3
   */
  it('should handle rapid loading state changes correctly (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(loadingStateArbitrary, { minLength: 2, maxLength: 10 }),
        (loadingStates) => {
          // Test each state in sequence
          loadingStates.forEach(loading => {
            const { container, unmount } = render(
              <LoadingButton loading={loading}>
                Test
              </LoadingButton>
            );
            
            try {
              const button = container.querySelector('button');
              expect(isButtonDisabled(button)).toBe(loading);
            } finally {
              unmount();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Button should maintain disabled state during re-renders
   * Validates: Property LOAD-3
   */
  it('should maintain disabled state across re-renders (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        buttonTextArbitrary,
        (loading, disabled, text) => {
          const { container, rerender, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const initialDisabled = isButtonDisabled(button);
            
            // Re-render with same props
            rerender(
              <LoadingButton loading={loading} disabled={disabled}>
                {text}
              </LoadingButton>
            );
            
            const afterRerender = isButtonDisabled(button);
            expect(afterRerender).toBe(initialDisabled);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Button disabled attribute should match DOM disabled property
   * Validates: Property LOAD-3
   */
  it('should have consistent disabled attribute and property (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        (loading, disabled) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              Test
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const expectedDisabled = loading || disabled;
            
            // Check both property and attribute
            expect(button.disabled).toBe(expectedDisabled);
            expect(button.hasAttribute('disabled')).toBe(expectedDisabled);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Loading state transition should immediately disable button
   * Validates: Property LOAD-3
   */
  it('should immediately disable button when loading becomes true (100 iterations)', () => {
    fc.assert(
      fc.property(
        buttonTextArbitrary,
        (text) => {
          const { container, rerender, unmount } = render(
            <LoadingButton loading={false}>
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(isButtonDisabled(button)).toBe(false);
            
            // Change to loading
            rerender(
              <LoadingButton loading={true}>
                {text}
              </LoadingButton>
            );
            
            expect(isButtonDisabled(button)).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Button should enable when both loading and disabled are false
   * Validates: Property LOAD-3
   */
  it('should enable button only when both loading and disabled are false (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        (loading, disabled) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} disabled={disabled}>
              Test
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const shouldBeEnabled = !loading && !disabled;
            expect(!isButtonDisabled(button)).toBe(shouldBeEnabled);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Custom className should not affect disable behavior
   * Validates: Property LOAD-3
   */
  it('should disable button regardless of custom className (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        fc.string({ minLength: 1, maxLength: 30 }),
        (loading, customClass) => {
          const { container, unmount } = render(
            <LoadingButton loading={loading} className={customClass}>
              Test
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            expect(isButtonDisabled(button)).toBe(loading);
            expect(button.className).toContain(customClass);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 19: Button should be disabled during form submission
   * Validates: FR-LOAD-3
   */
  it('should remain disabled during entire loading period (100 iterations)', () => {
    fc.assert(
      fc.property(
        buttonTextArbitrary,
        (text) => {
          const { container, rerender, unmount } = render(
            <LoadingButton loading={true}>
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            
            // Should be disabled initially
            expect(isButtonDisabled(button)).toBe(true);
            
            // Re-render multiple times while loading
            for (let i = 0; i < 5; i++) {
              rerender(
                <LoadingButton loading={true}>
                  {text}
                </LoadingButton>
              );
              expect(isButtonDisabled(button)).toBe(true);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 20: Button disable state should work with all prop combinations
   * Validates: Property LOAD-3
   */
  it('should handle all prop combinations correctly (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        disabledStateArbitrary,
        buttonVariantArbitrary,
        buttonTypeArbitrary,
        buttonTextArbitrary,
        loadingTextArbitrary,
        (loading, disabled, variant, type, text, loadingText) => {
          const onClick = vi.fn();
          const { container, unmount } = render(
            <LoadingButton
              loading={loading}
              disabled={disabled}
              variant={variant}
              type={type}
              loadingText={loadingText}
              onClick={onClick}
            >
              {text}
            </LoadingButton>
          );
          
          try {
            const button = container.querySelector('button');
            const expectedDisabled = loading || disabled;
            
            // Verify disabled state
            expect(isButtonDisabled(button)).toBe(expectedDisabled);
            
            // Verify other props are applied
            expect(button.type).toBe(type);
            expect(button.className).toContain(`loading-button-${variant}`);
            
            // Verify onClick behavior
            fireEvent.click(button);
            if (expectedDisabled) {
              expect(onClick).not.toHaveBeenCalled();
            } else {
              expect(onClick).toHaveBeenCalledTimes(1);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Summary of Properties Tested:
 * 
 * 1. Button always disabled when loading is true
 * 2. Button disabled when loading OR disabled is true
 * 3. Disabled class applied when disabled
 * 4. onClick not triggered when disabled
 * 5. Loading text shown when loading
 * 6. Children shown when not loading
 * 7. Spinner shown when loading
 * 8. Spinner not shown when not loading
 * 9. Variant doesn't affect disable behavior
 * 10. Type doesn't affect disable behavior
 * 11. Multiple buttons have independent states
 * 12. Disable state is idempotent
 * 13. Rapid state changes handled correctly
 * 14. State maintained across re-renders
 * 15. Disabled attribute matches property
 * 16. Immediate disable on loading transition
 * 17. Enable only when both false
 * 18. Custom className doesn't affect disable
 * 19. Disabled during entire loading period
 * 20. All prop combinations work correctly
 * 
 * All properties validate:
 * - FR-LOAD-3: Button spinner shown during processing and button disabled
 * - Property LOAD-3: button.loading = true → button.disabled = true
 */
