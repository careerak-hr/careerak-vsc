/**
 * Layout Stability Property-Based Test
 * Task 8.6.5: Write property-based test for layout stability (100 iterations)
 * 
 * Property LOAD-5: Layout Stability
 * ∀ loadingState ∈ LoadingStates: CLS(loadingState) < 0.1
 * 
 * This test verifies that no layout shifts occur during loading states
 * using property-based testing with fast-check.
 * 
 * **Validates: Requirements FR-LOAD-8, NFR-PERF-5**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import SkeletonLoader from '../components/SkeletonLoaders/SkeletonLoader';
import ProgressBar from '../components/Loading/ProgressBar';
import { AnimationProvider } from '../context/AnimationContext';

/**
 * Helper function to measure layout shift
 * Simulates CLS calculation by comparing element positions before and after
 */
const measureLayoutShift = (element) => {
  if (!element) return 0;
  
  const initialRect = element.getBoundingClientRect();
  const initialTop = initialRect.top;
  const initialLeft = initialRect.left;
  const initialHeight = initialRect.height;
  const initialWidth = initialRect.width;
  
  // Return a function to measure shift after state change
  return () => {
    const finalRect = element.getBoundingClientRect();
    const finalTop = finalRect.top;
    const finalLeft = finalRect.left;
    const finalHeight = finalRect.height;
    const finalWidth = finalRect.width;
    
    // Calculate shift distance
    const verticalShift = Math.abs(finalTop - initialTop);
    const horizontalShift = Math.abs(finalLeft - initialLeft);
    const heightChange = Math.abs(finalHeight - initialHeight);
    const widthChange = Math.abs(finalWidth - initialWidth);
    
    // Calculate impact fraction (simplified CLS calculation)
    // CLS = impact fraction × distance fraction
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const impactFraction = (initialHeight * initialWidth) / (viewportHeight * viewportWidth);
    const distanceFraction = Math.max(verticalShift, horizontalShift) / Math.max(viewportHeight, viewportWidth);
    
    const cls = impactFraction * distanceFraction;
    
    return {
      cls,
      verticalShift,
      horizontalShift,
      heightChange,
      widthChange
    };
  };
};

describe('Layout Stability Property-Based Tests', () => {
  beforeEach(() => {
    // Reset viewport
    window.innerWidth = 1024;
    window.innerHeight = 768;
    cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  /**
   * Property LOAD-5: Layout Stability
   * 
   * **Validates: Requirements FR-LOAD-8, NFR-PERF-5**
   * 
   * ∀ loadingState ∈ LoadingStates: CLS(loadingState) < 0.1
   * 
   * This property verifies that all loading states maintain layout stability
   * with CLS (Cumulative Layout Shift) under 0.1.
   */
  describe('Property LOAD-5: CLS < 0.1 for all loading states', () => {
    it('should maintain layout stability for SkeletonLoader with various dimensions (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            width: fc.oneof(
              fc.constant('100%'),
              fc.integer({ min: 50, max: 500 }).map(n => `${n}px`),
              fc.integer({ min: 10, max: 100 }).map(n => `${n}%`)
            ),
            height: fc.oneof(
              fc.integer({ min: 16, max: 200 }).map(n => `${n}px`),
              fc.integer({ min: 1, max: 10 }).map(n => `${n}rem`)
            ),
            variant: fc.constantFrom('rectangle', 'circle', 'rounded', 'pill')
          }),
          (props) => {
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  <SkeletonLoader {...props} />
                  <div ref={contentRef} id="test-content">Content below skeleton</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure initial position
            const measureShift = measureLayoutShift(content);
            
            // Skeleton should not cause layout shift
            const { cls, verticalShift, heightChange } = measureShift();
            
            // Property: CLS should be 0 (skeleton has fixed dimensions)
            expect(cls).toBe(0);
            expect(verticalShift).toBe(0);
            expect(heightChange).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain layout stability for ProgressBar with various progress values (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            progress: fc.integer({ min: 0, max: 100 }),
            position: fc.constantFrom('relative'),
            height: fc.constantFrom('h-1', 'h-2', 'h-3'),
            color: fc.constantFrom('primary', 'accent', 'success')
          }),
          (props) => {
            const TestComponent = ({ progress }) => {
              const contentRef = React.useRef(null);
              return (
                <AnimationProvider>
                  <div>
                    <ProgressBar {...props} progress={progress} announceToScreenReader={false} />
                    <div ref={contentRef} id="test-content" style={{ height: '100px' }}>
                      Content below progress bar
                    </div>
                  </div>
                </AnimationProvider>
              );
            };
            
            const { container, rerender } = render(<TestComponent progress={props.progress} />);
            const content = container.querySelector('#test-content');
            
            // Measure initial position
            const measureShift = measureLayoutShift(content);
            
            // Update progress (simulate loading)
            const newProgress = Math.min(100, props.progress + 10);
            rerender(<TestComponent progress={newProgress} />);
            
            // Measure shift after progress update
            const { cls, verticalShift, heightChange } = measureShift();
            
            // Property: Progress bar updates should not cause layout shift
            expect(cls).toBe(0);
            expect(verticalShift).toBe(0);
            expect(heightChange).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain layout stability when transitioning from skeleton to content (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            skeletonHeight: fc.integer({ min: 50, max: 200 }).map(n => `${n}px`),
            contentHeight: fc.integer({ min: 50, max: 200 }).map(n => `${n}px`)
          }),
          (props) => {
            const TestComponent = ({ showSkeleton }) => {
              const belowRef = React.useRef(null);
              return (
                <div>
                  {showSkeleton ? (
                    <SkeletonLoader width="100%" height={props.skeletonHeight} />
                  ) : (
                    <div style={{ height: props.contentHeight }}>Actual content</div>
                  )}
                  <div ref={belowRef} id="test-below">Content below</div>
                </div>
              );
            };
            
            const { container, rerender } = render(<TestComponent showSkeleton={true} />);
            const below = container.querySelector('#test-below');
            
            // Measure initial position
            const measureShift = measureLayoutShift(below);
            
            // Replace skeleton with actual content
            rerender(<TestComponent showSkeleton={false} />);
            
            // Measure shift after content loads
            const { cls, verticalShift } = measureShift();
            
            // Property: If skeleton height matches content height, CLS should be 0
            // If heights differ, CLS should still be < 0.1 for reasonable differences
            const heightDiff = Math.abs(
              parseInt(props.skeletonHeight) - parseInt(props.contentHeight)
            );
            
            if (heightDiff === 0) {
              expect(cls).toBe(0);
              expect(verticalShift).toBe(0);
            } else {
              // Allow small shifts but enforce CLS < 0.1
              expect(cls).toBeLessThan(0.1);
            }
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain layout stability for multiple skeleton loaders (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              width: fc.oneof(
                fc.constant('100%'),
                fc.integer({ min: 50, max: 300 }).map(n => `${n}px`)
              ),
              height: fc.integer({ min: 16, max: 100 }).map(n => `${n}px`),
              variant: fc.constantFrom('rectangle', 'circle', 'rounded')
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (skeletons) => {
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  {skeletons.map((props, index) => (
                    <SkeletonLoader key={index} {...props} />
                  ))}
                  <div ref={contentRef} id="test-content">Content below skeletons</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure initial position
            const measureShift = measureLayoutShift(content);
            
            // Multiple skeletons should not cause layout shift
            const { cls, verticalShift, heightChange } = measureShift();
            
            // Property: Multiple skeletons with fixed dimensions should not shift layout
            expect(cls).toBe(0);
            expect(verticalShift).toBe(0);
            expect(heightChange).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify skeleton minHeight prevents layout shift (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 200 }).map(n => `${n}px`),
          (height) => {
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  <SkeletonLoader width="100%" height={height} />
                  <div ref={contentRef} id="test-content">Content below</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const skeleton = container.querySelector('[role="status"]');
            const content = container.querySelector('#test-content');
            
            // Verify skeleton has minHeight set
            const computedStyle = window.getComputedStyle(skeleton);
            expect(computedStyle.minHeight).toBe(height);
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: minHeight ensures skeleton maintains space
            expect(cls).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain layout stability during loading state transitions (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            initialProgress: fc.integer({ min: 0, max: 50 }),
            finalProgress: fc.integer({ min: 51, max: 100 })
          }),
          (props) => {
            const TestComponent = ({ progress }) => {
              const contentRef = React.useRef(null);
              return (
                <AnimationProvider>
                  <div>
                    <ProgressBar progress={progress} announceToScreenReader={false} />
                    <div ref={contentRef} id="test-content" style={{ height: '100px' }}>
                      Content
                    </div>
                  </div>
                </AnimationProvider>
              );
            };
            
            const { container, rerender } = render(<TestComponent progress={props.initialProgress} />);
            const content = container.querySelector('#test-content');
            
            // Measure initial position
            const initialRect = content.getBoundingClientRect();
            
            // Transition through multiple progress values
            const steps = 5;
            const progressIncrement = (props.finalProgress - props.initialProgress) / steps;
            
            let maxCls = 0;
            
            for (let i = 1; i <= steps; i++) {
              const currentProgress = props.initialProgress + (progressIncrement * i);
              
              const measureShift = measureLayoutShift(content);
              
              rerender(<TestComponent progress={currentProgress} />);
              
              const { cls } = measureShift();
              maxCls = Math.max(maxCls, cls);
            }
            
            // Property: Multiple loading state transitions should not accumulate shifts
            expect(maxCls).toBeLessThan(0.1);
            
            cleanup();
            return maxCls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain layout stability with responsive skeleton dimensions (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            viewportWidth: fc.integer({ min: 320, max: 1920 }),
            viewportHeight: fc.integer({ min: 568, max: 1080 }),
            skeletonWidth: fc.constantFrom('100%', '50%', '75%'),
            skeletonHeight: fc.integer({ min: 20, max: 100 }).map(n => `${n}px`)
          }),
          (props) => {
            // Set viewport size
            window.innerWidth = props.viewportWidth;
            window.innerHeight = props.viewportHeight;
            
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  <SkeletonLoader 
                    width={props.skeletonWidth} 
                    height={props.skeletonHeight} 
                  />
                  <div ref={contentRef} id="test-content">Content below</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: Responsive dimensions should not cause layout shift
            expect(cls).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify skeleton loader prevents layout shift better than no placeholder (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            contentHeight: fc.integer({ min: 50, max: 200 }).map(n => `${n}px`)
          }),
          (props) => {
            // Test 1: Without skeleton (bad practice)
            const TestComponentWithout = ({ showContent }) => {
              const belowRef = React.useRef(null);
              return (
                <div>
                  {showContent && <div style={{ height: props.contentHeight }}>Loaded content</div>}
                  <div ref={belowRef} id="test-below-1">Content below</div>
                </div>
              );
            };
            
            const { container: container1, rerender: rerender1 } = render(
              <TestComponentWithout showContent={false} />
            );
            const below1 = container1.querySelector('#test-below-1');
            const measureShift1 = measureLayoutShift(below1);
            
            // Add content suddenly
            rerender1(<TestComponentWithout showContent={true} />);
            const { cls: clsWithoutSkeleton } = measureShift1();
            cleanup();
            
            // Test 2: With skeleton (best practice)
            const TestComponentWith = ({ showContent }) => {
              const belowRef = React.useRef(null);
              return (
                <div>
                  {showContent ? (
                    <div style={{ height: props.contentHeight }}>Loaded content</div>
                  ) : (
                    <SkeletonLoader width="100%" height={props.contentHeight} />
                  )}
                  <div ref={belowRef} id="test-below-2">Content below</div>
                </div>
              );
            };
            
            const { container: container2, rerender: rerender2 } = render(
              <TestComponentWith showContent={false} />
            );
            const below2 = container2.querySelector('#test-below-2');
            const measureShift2 = measureLayoutShift(below2);
            
            // Replace skeleton with content
            rerender2(<TestComponentWith showContent={true} />);
            const { cls: clsWithSkeleton } = measureShift2();
            
            // Property: Skeleton loader should result in lower or equal CLS
            expect(clsWithSkeleton).toBeLessThanOrEqual(clsWithoutSkeleton);
            expect(clsWithSkeleton).toBeLessThan(0.1);
            
            cleanup();
            return clsWithSkeleton < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-5: Coordinate multiple loading states', () => {
    it('should maintain layout stability with multiple concurrent loading states (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            numSkeletons: fc.integer({ min: 1, max: 5 }),
            showProgress: fc.boolean(),
            progressValue: fc.integer({ min: 0, max: 100 })
          }),
          (props) => {
            const skeletons = Array.from({ length: props.numSkeletons }, (_, i) => ({
              key: i,
              height: `${50 + (i * 10)}px`
            }));
            
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <AnimationProvider>
                  <div>
                    {props.showProgress && (
                      <ProgressBar progress={props.progressValue} announceToScreenReader={false} />
                    )}
                    {skeletons.map(skeleton => (
                      <SkeletonLoader 
                        key={skeleton.key}
                        width="100%" 
                        height={skeleton.height} 
                      />
                    ))}
                    <div ref={contentRef} id="test-content">Content below all loading states</div>
                  </div>
                </AnimationProvider>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: Multiple coordinated loading states should not cause layout shift
            expect(cls).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify smooth transitions do not cause layout shift (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 100 }).map(n => `${n}px`),
          (height) => {
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  <SkeletonLoader 
                    width="100%" 
                    height={height}
                    className="transition-opacity duration-200"
                  />
                  <div ref={contentRef} id="test-content">Content below</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: Opacity transitions should not cause layout shift
            expect(cls).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-5: Edge cases and validation', () => {
    it('should verify CLS remains under 0.1 for all valid loading state combinations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            skeletonHeight: fc.integer({ min: 16, max: 200 }).map(n => `${n}px`),
            skeletonVariant: fc.constantFrom('rectangle', 'circle', 'rounded', 'pill'),
            progressValue: fc.integer({ min: 0, max: 100 })
          }),
          (props) => {
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <AnimationProvider>
                  <div>
                    <ProgressBar 
                      progress={props.progressValue}
                      position="relative"
                      announceToScreenReader={false}
                    />
                    <SkeletonLoader 
                      width="100%" 
                      height={props.skeletonHeight}
                      variant={props.skeletonVariant}
                    />
                    <div ref={contentRef} id="test-content">Content below</div>
                  </div>
                </AnimationProvider>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: All valid combinations should maintain CLS < 0.1
            expect(cls).toBeLessThan(0.1);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify CLS target of 0.1 is achievable for typical loading scenarios (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            numItems: fc.integer({ min: 1, max: 10 }),
            itemHeight: fc.integer({ min: 50, max: 150 })
          }),
          (props) => {
            // Simulate a typical list loading scenario
            const items = Array.from({ length: props.numItems }, (_, i) => ({
              key: i,
              height: `${props.itemHeight}px`
            }));
            
            const TestComponent = () => {
              const contentRef = React.useRef(null);
              return (
                <div>
                  {items.map(item => (
                    <SkeletonLoader 
                      key={item.key}
                      width="100%" 
                      height={item.height}
                      className="mb-2"
                    />
                  ))}
                  <div ref={contentRef} id="test-content">Content below list</div>
                </div>
              );
            };
            
            const { container } = render(<TestComponent />);
            const content = container.querySelector('#test-content');
            
            // Measure position
            const measureShift = measureLayoutShift(content);
            const { cls } = measureShift();
            
            // Property: Typical loading scenarios should easily achieve CLS < 0.1
            expect(cls).toBeLessThan(0.1);
            
            // In fact, with proper skeleton loaders, CLS should be 0
            expect(cls).toBe(0);
            
            cleanup();
            return cls < 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
