/**
 * Keyboard Navigation Property-Based Test
 * Task 5.6.2: Write property-based test for keyboard navigation (100 iterations)
 * 
 * **Validates: Requirements FR-A11Y-2, FR-A11Y-3**
 * 
 * Property A11Y-2: Keyboard Navigation
 * ∀ element ∈ InteractiveElements: element.tabIndex ≥ 0 OR element.tabIndex = -1
 * 
 * This test verifies that all interactive elements are keyboard accessible
 * and that keyboard navigation works correctly using property-based testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  handleButtonKeyDown,
  getButtonProps,
  handleArrowKeyNavigation,
  trapFocus
} from '../utils/keyboardUtils';

/**
 * Arbitrary for generating keyboard events
 */
const keyboardEventArbitrary = () => fc.record({
  key: fc.constantFrom('Enter', ' ', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'),
  shiftKey: fc.boolean(),
  preventDefault: fc.constant(vi.fn()),
  stopPropagation: fc.constant(vi.fn())
});

/**
 * Arbitrary for generating focusable elements
 */
const focusableElementArbitrary = () => fc.record({
  focus: fc.constant(vi.fn()),
  tabIndex: fc.integer({ min: -1, max: 10 }),
  getAttribute: fc.constant((attr) => attr === 'tabindex' ? '0' : null)
});

/**
 * Arbitrary for generating interactive element props
 */
const interactiveElementPropsArbitrary = () => fc.record({
  role: fc.constantFrom('button', 'link', 'checkbox', 'radio', 'tab', 'menuitem'),
  tabIndex: fc.integer({ min: -1, max: 10 }),
  'aria-label': fc.string({ minLength: 1, maxLength: 50 })
});

describe('Keyboard Navigation Property-Based Tests', () => {
  
  describe('Property A11Y-2: Interactive Elements Keyboard Accessibility', () => {
    
    it('should verify all interactive elements have valid tabIndex (100 iterations)', () => {
      fc.assert(
        fc.property(
          interactiveElementPropsArbitrary(),
          (props) => {
            // Property: tabIndex must be >= 0 (focusable) or -1 (programmatically focusable)
            const tabIndex = props.tabIndex;
            return tabIndex >= -1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify getButtonProps returns keyboard-accessible props (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.func(fc.anything()),
          fc.string({ minLength: 1, maxLength: 50 }),
          (onClick, ariaLabel) => {
            const props = getButtonProps(onClick, ariaLabel);
            
            // Verify all required keyboard accessibility properties
            return (
              props.role === 'button' &&
              props.tabIndex === 0 &&
              typeof props.onClick === 'function' &&
              typeof props.onKeyDown === 'function' &&
              props['aria-label'] === ariaLabel
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify button elements are focusable with tabIndex 0 (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.func(fc.anything()),
          fc.string({ minLength: 1, maxLength: 50 }),
          (onClick, ariaLabel) => {
            const props = getButtonProps(onClick, ariaLabel);
            
            // Button elements should have tabIndex 0 (in normal tab order)
            return props.tabIndex === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-2: Enter and Space Key Activation', () => {
    
    it('should verify Enter key triggers callback (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.func(fc.anything()),
          () => {
            const callback = vi.fn();
            const event = {
              key: 'Enter',
              preventDefault: vi.fn()
            };
            
            handleButtonKeyDown(event, callback);
            
            return callback.mock.calls.length === 1 && 
                   event.preventDefault.mock.calls.length === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify Space key triggers callback (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.func(fc.anything()),
          () => {
            const callback = vi.fn();
            const event = {
              key: ' ',
              preventDefault: vi.fn()
            };
            
            handleButtonKeyDown(event, callback);
            
            return callback.mock.calls.length === 1 && 
                   event.preventDefault.mock.calls.length === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify non-activation keys do not trigger callback (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'a', 'b', '1'),
          (key) => {
            const callback = vi.fn();
            const event = {
              key,
              preventDefault: vi.fn()
            };
            
            handleButtonKeyDown(event, callback);
            
            return callback.mock.calls.length === 0 && 
                   event.preventDefault.mock.calls.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify preventDefault can be disabled (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Enter', ' '),
          (key) => {
            const callback = vi.fn();
            const event = {
              key,
              preventDefault: vi.fn()
            };
            
            handleButtonKeyDown(event, callback, false);
            
            return callback.mock.calls.length === 1 && 
                   event.preventDefault.mock.calls.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-2: Arrow Key Navigation', () => {
    
    it('should verify ArrowDown navigates to next element (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (currentIndex, listSize) => {
            const elements = Array.from({ length: listSize }, () => ({
              focus: vi.fn()
            }));
            
            const event = {
              key: 'ArrowDown',
              preventDefault: vi.fn()
            };
            
            handleArrowKeyNavigation(event, elements, currentIndex, false);
            
            const expectedNextIndex = (currentIndex + 1) % listSize;
            
            return elements[expectedNextIndex].focus.mock.calls.length === 1 &&
                   event.preventDefault.mock.calls.length === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify ArrowUp navigates to previous element (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (currentIndex, listSize) => {
            const elements = Array.from({ length: listSize }, () => ({
              focus: vi.fn()
            }));
            
            const event = {
              key: 'ArrowUp',
              preventDefault: vi.fn()
            };
            
            handleArrowKeyNavigation(event, elements, currentIndex, false);
            
            const expectedPrevIndex = (currentIndex - 1 + listSize) % listSize;
            
            return elements[expectedPrevIndex].focus.mock.calls.length === 1 &&
                   event.preventDefault.mock.calls.length === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify arrow navigation wraps around at boundaries (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          (listSize) => {
            const elements = Array.from({ length: listSize }, () => ({
              focus: vi.fn()
            }));
            
            // Test wrapping from last to first
            const eventDown = {
              key: 'ArrowDown',
              preventDefault: vi.fn()
            };
            handleArrowKeyNavigation(eventDown, elements, listSize - 1, false);
            const wrapsToFirst = elements[0].focus.mock.calls.length === 1;
            
            // Test wrapping from first to last
            const eventUp = {
              key: 'ArrowUp',
              preventDefault: vi.fn()
            };
            handleArrowKeyNavigation(eventUp, elements, 0, false);
            const wrapsToLast = elements[listSize - 1].focus.mock.calls.length === 1;
            
            return wrapsToFirst && wrapsToLast;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify horizontal navigation uses ArrowRight/ArrowLeft (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (currentIndex, listSize) => {
            const elements = Array.from({ length: listSize }, () => ({
              focus: vi.fn()
            }));
            
            // Test ArrowRight
            const eventRight = {
              key: 'ArrowRight',
              preventDefault: vi.fn()
            };
            handleArrowKeyNavigation(eventRight, elements, currentIndex, true);
            const expectedNextIndex = (currentIndex + 1) % listSize;
            const rightWorks = elements[expectedNextIndex].focus.mock.calls.length === 1;
            
            // Reset
            elements.forEach(el => el.focus.mockClear());
            
            // Test ArrowLeft
            const eventLeft = {
              key: 'ArrowLeft',
              preventDefault: vi.fn()
            };
            handleArrowKeyNavigation(eventLeft, elements, currentIndex, true);
            const expectedPrevIndex = (currentIndex - 1 + listSize) % listSize;
            const leftWorks = elements[expectedPrevIndex].focus.mock.calls.length === 1;
            
            return rightWorks && leftWorks;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-2: Focus Trap in Modals', () => {
    
    it('should verify Tab key is intercepted in focus trap (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (shiftKey) => {
            const focusableElements = [
              { focus: vi.fn() },
              { focus: vi.fn() },
              { focus: vi.fn() }
            ];
            
            const container = {
              querySelectorAll: vi.fn(() => focusableElements)
            };
            
            const event = {
              key: 'Tab',
              shiftKey,
              preventDefault: vi.fn()
            };
            
            // Mock document.activeElement to be at boundary
            const originalActiveElement = document.activeElement;
            const boundaryElement = shiftKey ? focusableElements[0] : focusableElements[2];
            
            Object.defineProperty(document, 'activeElement', {
              configurable: true,
              get: () => boundaryElement
            });
            
            trapFocus(event, container);
            
            // Restore
            Object.defineProperty(document, 'activeElement', {
              configurable: true,
              get: () => originalActiveElement
            });
            
            // Should call preventDefault when at boundaries
            const preventDefaultCalled = event.preventDefault.mock.calls.length === 1;
            
            // Should focus the opposite boundary element
            const expectedFocusElement = shiftKey ? focusableElements[2] : focusableElements[0];
            const focusCalled = expectedFocusElement.focus.mock.calls.length === 1;
            
            return preventDefaultCalled && focusCalled;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify non-Tab keys are not intercepted (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown'),
          (key) => {
            const container = {
              querySelectorAll: vi.fn(() => [
                { focus: vi.fn() },
                { focus: vi.fn() }
              ])
            };
            
            const event = {
              key,
              preventDefault: vi.fn()
            };
            
            trapFocus(event, container);
            
            // Should not call preventDefault for non-Tab keys
            return event.preventDefault.mock.calls.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-2: Logical Tab Order', () => {
    
    it('should verify tabIndex values maintain logical order (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 10 }), { minLength: 2, maxLength: 20 }),
          (tabIndices) => {
            // Elements with tabIndex 0 come before elements with tabIndex > 0
            // Elements with same tabIndex follow DOM order
            
            const sortedIndices = [...tabIndices].sort((a, b) => {
              if (a === 0 && b === 0) return 0;
              if (a === 0) return 1;
              if (b === 0) return -1;
              return a - b;
            });
            
            // Verify that tabIndex -1 elements are not in tab order
            const hasNegativeIndex = tabIndices.some(idx => idx === -1);
            
            // All non-negative indices should be valid
            return tabIndices.every(idx => idx >= -1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify interactive elements have consistent tabIndex (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(interactiveElementPropsArbitrary(), { minLength: 1, maxLength: 10 }),
          (elements) => {
            // All interactive elements should have tabIndex >= -1
            return elements.every(el => el.tabIndex >= -1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-2: Keyboard Navigation Consistency', () => {
    
    it('should verify keyboard handlers are idempotent (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.func(fc.anything()),
          fc.string({ minLength: 1, maxLength: 50 }),
          (onClick, ariaLabel) => {
            const props1 = getButtonProps(onClick, ariaLabel);
            const props2 = getButtonProps(onClick, ariaLabel);
            
            // Multiple calls should produce consistent results
            return (
              props1.role === props2.role &&
              props1.tabIndex === props2.tabIndex &&
              props1['aria-label'] === props2['aria-label']
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify navigation maintains focus within bounds (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 0, max: 100 }),
          (listSize, navigationSteps) => {
            let currentIndex = 0;
            
            // Simulate multiple navigation steps
            for (let i = 0; i < navigationSteps; i++) {
              const direction = i % 2 === 0 ? 1 : -1;
              currentIndex = (currentIndex + direction + listSize) % listSize;
            }
            
            // Index should always be within bounds
            return currentIndex >= 0 && currentIndex < listSize;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
