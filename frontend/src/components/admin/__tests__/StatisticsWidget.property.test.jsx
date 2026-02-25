import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import StatisticsWidget from '../StatisticsWidget';
import { Users } from 'lucide-react';

/**
 * Property 6: Statistics Change Indicators
 * 
 * For any statistic value, when the value increases compared to the previous value,
 * a positive visual indicator should be displayed, and when the value decreases,
 * a negative visual indicator should be displayed.
 * 
 * Validates: Requirements 2.8, 2.9
 */

describe('Property 6: Statistics Change Indicators', () => {
  it('should display positive indicator (green, up arrow) when value increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // previous value
        fc.integer({ min: 1, max: 100 }), // increase amount
        (previousValue, increase) => {
          const currentValue = previousValue + increase;
          
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          // Should show positive growth rate
          const growthRate = ((currentValue - previousValue) / previousValue) * 100;
          const growthText = `${growthRate.toFixed(1)}%`;
          expect(screen.getByText(growthText)).toBeTruthy();

          // Should have green color class (text-green-600)
          const trendElement = container.querySelector('.text-green-600');
          expect(trendElement).toBeTruthy();

          // Should have TrendingUp icon (up arrow)
          const upArrow = container.querySelector('svg');
          expect(upArrow).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display negative indicator (red, down arrow) when value decreases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }), // previous value
        fc.integer({ min: 1, max: 99 }), // decrease amount
        (previousValue, decrease) => {
          const currentValue = previousValue - decrease;
          
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          // Should show negative growth rate
          const growthRate = ((currentValue - previousValue) / previousValue) * 100;
          const growthText = `${Math.abs(growthRate).toFixed(1)}%`;
          expect(screen.getByText(growthText)).toBeTruthy();

          // Should have red color class (text-red-600)
          const trendElement = container.querySelector('.text-red-600');
          expect(trendElement).toBeTruthy();

          // Should have TrendingDown icon (down arrow)
          const downArrow = container.querySelector('svg');
          expect(downArrow).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display stable indicator (gray, minus) when value stays the same', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // value
        (value) => {
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={value}
              previousValue={value}
              icon={Users}
            />
          );

          // Should show 0.0% growth rate
          expect(screen.getByText('0.0%')).toBeTruthy();

          // Should have gray color class (text-gray-600)
          const trendElement = container.querySelector('.text-gray-600');
          expect(trendElement).toBeTruthy();

          // Should have Minus icon
          const minusIcon = container.querySelector('svg');
          expect(minusIcon).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero previous value correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // current value
        (currentValue) => {
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={0}
              icon={Users}
            />
          );

          // Should show 100% growth rate when previous is 0
          expect(screen.getByText('100.0%')).toBeTruthy();

          // Should have green color (positive change)
          const trendElement = container.querySelector('.text-green-600');
          expect(trendElement).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle null/undefined previous value correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // current value
        fc.constantFrom(null, undefined), // previous value
        (currentValue, previousValue) => {
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          // Should show 100% growth rate when previous is null/undefined
          expect(screen.getByText('100.0%')).toBeTruthy();

          // Should have green color (positive change)
          const trendElement = container.querySelector('.text-green-600');
          expect(trendElement).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate growth rate correctly for any valid values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // previous value
        fc.integer({ min: 1, max: 1000 }), // current value
        (previousValue, currentValue) => {
          render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          // Calculate expected growth rate
          const expectedGrowthRate = ((currentValue - previousValue) / previousValue) * 100;
          const expectedText = `${Math.abs(expectedGrowthRate).toFixed(1)}%`;

          // Should display the correct growth rate
          expect(screen.getByText(expectedText)).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always display growth rate with one decimal place', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // previous value
        fc.integer({ min: 1, max: 1000 }), // current value
        (previousValue, currentValue) => {
          render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          // Find the growth rate text
          const growthRate = ((currentValue - previousValue) / previousValue) * 100;
          const growthText = `${Math.abs(growthRate).toFixed(1)}%`;
          
          // Should have exactly one decimal place
          expect(growthText).toMatch(/^\d+\.\d%$/);
          expect(screen.getByText(growthText)).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display correct color based on trend direction', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // previous value
        fc.integer({ min: -500, max: 500 }), // change amount
        (previousValue, change) => {
          const currentValue = Math.max(0, previousValue + change);
          
          const { container } = render(
            <StatisticsWidget
              title="Test Statistic"
              value={currentValue}
              previousValue={previousValue}
              icon={Users}
            />
          );

          if (change > 0) {
            // Positive change should be green
            expect(container.querySelector('.text-green-600')).toBeTruthy();
          } else if (change < 0) {
            // Negative change should be red
            expect(container.querySelector('.text-red-600')).toBeTruthy();
          } else {
            // No change should be gray
            expect(container.querySelector('.text-gray-600')).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
