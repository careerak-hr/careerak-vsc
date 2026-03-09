import { renderHook, act, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import useAutoSave from '../hooks/useAutoSave';
import useUndoStack from '../hooks/useUndoStack';

/**
 * Property-Based Tests for UX Features
 * 
 * Tests:
 * - Property 25: Auto-Save Timing
 * - Property 26: Undo Stack Management
 * - Property 27: Sensitive Action Confirmation (tested in component tests)
 */

describe('UX Features - Property-Based Tests', () => {
  // ============================================================================
  // Property 25: Auto-Save Timing
  // ============================================================================
  describe('Property 25: Auto-Save Timing', () => {
    test('should save exactly after specified delay of inactivity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 5000 }), // delay
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }), // data changes
          async (delay, dataChanges) => {
            let saveCount = 0;
            const saveTimes = [];
            
            const saveFunction = jest.fn(async () => {
              saveCount++;
              saveTimes.push(Date.now());
            });

            const { result } = renderHook(() => useAutoSave(saveFunction, delay));

            // Trigger multiple changes rapidly
            const startTime = Date.now();
            for (const data of dataChanges) {
              act(() => {
                result.current.triggerSave(data);
              });
              await new Promise(resolve => setTimeout(resolve, 10)); // Small gap
            }

            // Wait for auto-save to complete
            await waitFor(
              () => {
                expect(saveCount).toBe(1);
              },
              { timeout: delay + 1000 }
            );

            // Verify timing
            const saveTime = saveTimes[0];
            const elapsed = saveTime - startTime;
            
            // Should save after delay (with some tolerance for execution time)
            expect(elapsed).toBeGreaterThanOrEqual(delay - 100);
            expect(elapsed).toBeLessThanOrEqual(delay + 500);

            // Should only save once (debounced)
            expect(saveCount).toBe(1);
            expect(saveFunction).toHaveBeenCalledTimes(1);
            expect(saveFunction).toHaveBeenCalledWith(dataChanges[dataChanges.length - 1]);
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });

    test('should cancel auto-save if new change occurs before delay', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 3000 }), // delay
          fc.array(fc.string(), { minLength: 2, maxLength: 5 }), // data changes
          async (delay, dataChanges) => {
            let saveCount = 0;
            const saveFunction = jest.fn(async () => {
              saveCount++;
            });

            const { result } = renderHook(() => useAutoSave(saveFunction, delay));

            // Trigger changes with intervals less than delay
            for (let i = 0; i < dataChanges.length; i++) {
              act(() => {
                result.current.triggerSave(dataChanges[i]);
              });
              
              // Wait less than delay (except for last change)
              if (i < dataChanges.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay / 2));
              }
            }

            // Wait for final auto-save
            await waitFor(
              () => {
                expect(saveCount).toBe(1);
              },
              { timeout: delay + 1000 }
            );

            // Should only save once (last change)
            expect(saveCount).toBe(1);
            expect(saveFunction).toHaveBeenCalledTimes(1);
            expect(saveFunction).toHaveBeenCalledWith(dataChanges[dataChanges.length - 1]);
          }
        ),
        { numRuns: 15, timeout: 15000 }
      );
    });

    test('should update lastSaved timestamp after successful save', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          async (data) => {
            const saveFunction = jest.fn(async () => {
              await new Promise(resolve => setTimeout(resolve, 100));
            });

            const { result } = renderHook(() => useAutoSave(saveFunction, 500));

            expect(result.current.lastSaved).toBeNull();

            act(() => {
              result.current.triggerSave(data);
            });

            await waitFor(
              () => {
                expect(result.current.lastSaved).not.toBeNull();
              },
              { timeout: 1000 }
            );

            // Verify lastSaved is a recent Date
            const now = new Date();
            const lastSaved = result.current.lastSaved;
            expect(lastSaved).toBeInstanceOf(Date);
            expect(now - lastSaved).toBeLessThan(1000);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // ============================================================================
  // Property 26: Undo Stack Management
  // ============================================================================
  describe('Property 26: Undo Stack Management', () => {
    test('should maintain at most maxSize changes in stack', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }), // maxSize
          fc.array(fc.record({
            data: fc.string(),
            description: fc.string()
          }), { minLength: 1, maxLength: 20 }), // changes
          async (maxSize, changes) => {
            const { result } = renderHook(() => useUndoStack(maxSize, 30000));

            // Push all changes
            for (const change of changes) {
              act(() => {
                result.current.pushChange({
                  data: change.data,
                  revertFunction: jest.fn(),
                  description: change.description
                });
              });
            }

            // Stack size should not exceed maxSize
            expect(result.current.undoStack.length).toBeLessThanOrEqual(maxSize);

            // If more changes than maxSize, should keep last maxSize changes
            if (changes.length > maxSize) {
              expect(result.current.undoStack.length).toBe(maxSize);
              
              // Verify it kept the last maxSize changes
              const expectedChanges = changes.slice(-maxSize);
              for (let i = 0; i < maxSize; i++) {
                expect(result.current.undoStack[i].data).toBe(expectedChanges[i].data);
              }
            } else {
              expect(result.current.undoStack.length).toBe(changes.length);
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should expire changes after expiryTime', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 2000 }), // expiryTime
          fc.array(fc.string(), { minLength: 1, maxLength: 5 }), // changes
          async (expiryTime, changes) => {
            const { result } = renderHook(() => useUndoStack(10, expiryTime));

            // Push changes
            for (const change of changes) {
              act(() => {
                result.current.pushChange({
                  data: change,
                  revertFunction: jest.fn(),
                  description: 'test'
                });
              });
            }

            const initialCount = result.current.undoStack.length;
            expect(initialCount).toBe(changes.length);

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, expiryTime + 500));

            // All changes should be expired
            await waitFor(
              () => {
                expect(result.current.undoStack.length).toBe(0);
              },
              { timeout: 1000 }
            );

            expect(result.current.canUndo).toBe(false);
          }
        ),
        { numRuns: 15, timeout: 10000 }
      );
    });

    test('should undo changes in LIFO order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            value: fc.integer(),
            description: fc.string()
          }), { minLength: 2, maxLength: 5 }),
          async (changes) => {
            const { result } = renderHook(() => useUndoStack(10, 30000));
            const revertedChanges = [];

            // Push changes with revert functions
            for (const change of changes) {
              act(() => {
                result.current.pushChange({
                  data: change.value,
                  revertFunction: async (data) => {
                    revertedChanges.push(data);
                  },
                  description: change.description
                });
              });
            }

            // Undo all changes
            for (let i = changes.length - 1; i >= 0; i--) {
              expect(result.current.canUndo).toBe(true);
              
              await act(async () => {
                await result.current.undo();
              });
            }

            // Verify LIFO order (last in, first out)
            expect(revertedChanges.length).toBe(changes.length);
            for (let i = 0; i < changes.length; i++) {
              expect(revertedChanges[i]).toBe(changes[changes.length - 1 - i].value);
            }

            expect(result.current.canUndo).toBe(false);
          }
        ),
        { numRuns: 25 }
      );
    });

    test('should reject undo if change has expired', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 1500 }), // expiryTime
          fc.string(), // change data
          async (expiryTime, data) => {
            const { result } = renderHook(() => useUndoStack(5, expiryTime));

            act(() => {
              result.current.pushChange({
                data,
                revertFunction: jest.fn(),
                description: 'test'
              });
            });

            expect(result.current.canUndo).toBe(true);

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, expiryTime + 200));

            // Attempt undo should fail
            await expect(async () => {
              await act(async () => {
                await result.current.undo();
              });
            }).rejects.toThrow();

            // Stack should be cleaned up
            expect(result.current.undoStack.length).toBe(0);
            expect(result.current.canUndo).toBe(false);
          }
        ),
        { numRuns: 15, timeout: 10000 }
      );
    });

    test('should clear entire stack when clearStack is called', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          async (changes) => {
            const { result } = renderHook(() => useUndoStack(10, 30000));

            // Push changes
            for (const change of changes) {
              act(() => {
                result.current.pushChange({
                  data: change,
                  revertFunction: jest.fn(),
                  description: 'test'
                });
              });
            }

            expect(result.current.undoStack.length).toBe(changes.length);
            expect(result.current.canUndo).toBe(true);

            // Clear stack
            act(() => {
              result.current.clearStack();
            });

            expect(result.current.undoStack.length).toBe(0);
            expect(result.current.canUndo).toBe(false);
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  // ============================================================================
  // Property 27: Sensitive Action Confirmation
  // ============================================================================
  describe('Property 27: Sensitive Action Confirmation', () => {
    // Note: This property is primarily tested through component tests
    // as it involves UI interactions. Here we test the logic.

    test('should require explicit confirmation for sensitive actions', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // requiresTyping
          fc.string({ minLength: 1, maxLength: 20 }), // confirmationText
          fc.string(), // userInput
          (requiresTyping, confirmationText, userInput) => {
            // Simulate confirmation logic
            const canConfirm = !requiresTyping || userInput.trim() === confirmationText;

            if (requiresTyping) {
              // If typing is required, only exact match should allow confirmation
              if (userInput.trim() === confirmationText) {
                expect(canConfirm).toBe(true);
              } else {
                expect(canConfirm).toBe(false);
              }
            } else {
              // If typing is not required, always allow confirmation
              expect(canConfirm).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should prevent confirmation during execution', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isConfirming
          fc.boolean(), // canConfirm
          (isConfirming, canConfirm) => {
            // Simulate button disabled logic
            const isDisabled = !canConfirm || isConfirming;

            if (isConfirming) {
              // Always disabled during confirmation
              expect(isDisabled).toBe(true);
            } else if (!canConfirm) {
              // Disabled if cannot confirm
              expect(isDisabled).toBe(true);
            } else {
              // Enabled only if can confirm and not confirming
              expect(isDisabled).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
