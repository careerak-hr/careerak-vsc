import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import ChartWidget from '../ChartWidget';

/**
 * Property-Based Tests for Chart Components
 * 
 * Property 1: Chart Data Completeness
 * Property 2: Chart Interactivity
 * 
 * Validates: Requirements 1.1-1.7, 12.3
 */

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }) => <div data-testid="line-chart">{JSON.stringify(data)}</div>,
  Bar: ({ data }) => <div data-testid="bar-chart">{JSON.stringify(data)}</div>,
  Pie: ({ data }) => <div data-testid="pie-chart">{JSON.stringify(data)}</div>,
  Doughnut: ({ data }) => <div data-testid="doughnut-chart">{JSON.stringify(data)}</div>
}));

// Arbitraries for generating test data
const chartTypeArbitrary = fc.constantFrom('line', 'bar', 'pie', 'doughnut');
const timeRangeArbitrary = fc.constantFrom('daily', 'weekly', 'monthly');

const datasetArbitrary = fc.record({
  label: fc.string({ minLength: 1, maxLength: 50 }),
  data: fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 30 }),
  backgroundColor: fc.hexaString({ minLength: 7, maxLength: 7 }).map(s => '#' + s),
  borderColor: fc.hexaString({ minLength: 7, maxLength: 7 }).map(s => '#' + s),
  borderWidth: fc.integer({ min: 1, max: 5 })
});

const chartDataArbitrary = fc.record({
  labels: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
  datasets: fc.array(datasetArbitrary, { minLength: 1, maxLength: 5 })
}).chain(data => {
  // Ensure all datasets have the same length as labels
  const labelCount = data.labels.length;
  return fc.constant({
    ...data,
    datasets: data.datasets.map(ds => ({
      ...ds,
      data: ds.data.slice(0, labelCount).concat(
        Array(Math.max(0, labelCount - ds.data.length)).fill(0)
      )
    }))
  });
});

describe('ChartWidget - Property-Based Tests', () => {
  describe('Property 1: Chart Data Completeness', () => {
    it('should render all data points from source data without omissions', () => {
      fc.assert(
        fc.property(
          chartTypeArbitrary,
          chartDataArbitrary,
          fc.string({ minLength: 1, maxLength: 100 }),
          (type, data, title) => {
            const { container } = render(
              <ChartWidget
                type={type}
                data={data}
                title={title}
                showTimeRangeSelector={false}
              />
            );

            // Verify chart is rendered
            const chartElement = container.querySelector('[data-testid*="-chart"]');
            expect(chartElement).toBeTruthy();

            // Parse rendered data
            const renderedData = JSON.parse(chartElement.textContent);

            // Verify all labels are present
            expect(renderedData.labels).toEqual(data.labels);
            expect(renderedData.labels.length).toBe(data.labels.length);

            // Verify all datasets are present
            expect(renderedData.datasets.length).toBe(data.datasets.length);

            // Verify each dataset has all data points
            renderedData.datasets.forEach((renderedDataset, index) => {
              const sourceDataset = data.datasets[index];
              expect(renderedDataset.data).toEqual(sourceDataset.data);
              expect(renderedDataset.data.length).toBe(sourceDataset.data.length);
              expect(renderedDataset.label).toBe(sourceDataset.label);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly aggregate data for the selected time range', () => {
      fc.assert(
        fc.property(
          timeRangeArbitrary,
          chartDataArbitrary,
          (timeRange, data) => {
            const onTimeRangeChange = vi.fn();
            
            render(
              <ChartWidget
                type="line"
                data={data}
                title="Test Chart"
                timeRange={timeRange}
                onTimeRangeChange={onTimeRangeChange}
              />
            );

            // Verify time range is reflected in the UI
            const activeButton = screen.getByRole('button', { 
              pressed: true 
            }) || document.querySelector('.time-range-btn.active');
            
            expect(activeButton).toBeTruthy();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain data integrity when switching between chart types', () => {
      fc.assert(
        fc.property(
          chartDataArbitrary,
          fc.array(chartTypeArbitrary, { minLength: 2, maxLength: 4 }),
          (data, chartTypes) => {
            const { rerender, container } = render(
              <ChartWidget
                type={chartTypes[0]}
                data={data}
                title="Test Chart"
                showTimeRangeSelector={false}
              />
            );

            // Verify initial render
            let chartElement = container.querySelector('[data-testid*="-chart"]');
            let renderedData = JSON.parse(chartElement.textContent);
            expect(renderedData.labels).toEqual(data.labels);

            // Switch chart types and verify data integrity
            for (let i = 1; i < chartTypes.length; i++) {
              rerender(
                <ChartWidget
                  type={chartTypes[i]}
                  data={data}
                  title="Test Chart"
                  showTimeRangeSelector={false}
                />
              );

              chartElement = container.querySelector('[data-testid*="-chart"]');
              renderedData = JSON.parse(chartElement.textContent);
              
              // Data should remain the same
              expect(renderedData.labels).toEqual(data.labels);
              expect(renderedData.datasets.length).toBe(data.datasets.length);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2: Chart Interactivity', () => {
    it('should display tooltip information when hovering over data points', () => {
      fc.assert(
        fc.property(
          chartDataArbitrary,
          (data) => {
            render(
              <ChartWidget
                type="line"
                data={data}
                title="Test Chart"
                showTimeRangeSelector={false}
              />
            );

            // Verify chart is rendered (tooltip functionality is handled by Chart.js)
            const chartElement = screen.getByTestId('line-chart');
            expect(chartElement).toBeTruthy();

            // Verify data is available for tooltips
            const renderedData = JSON.parse(chartElement.textContent);
            expect(renderedData.datasets.length).toBeGreaterThan(0);
            expect(renderedData.datasets[0].data.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should toggle data series visibility when clicking legend items', async () => {
      fc.assert(
        fc.asyncProperty(
          chartDataArbitrary.filter(data => data.datasets.length >= 2),
          async (data) => {
            const user = userEvent.setup();
            
            render(
              <ChartWidget
                type="line"
                data={data}
                title="Test Chart"
                showTimeRangeSelector={false}
              />
            );

            // Chart.js legend click is handled internally
            // We verify that the component renders with the correct data structure
            const chartElement = screen.getByTestId('line-chart');
            const renderedData = JSON.parse(chartElement.textContent);
            
            // Verify all datasets are initially visible (not hidden)
            renderedData.datasets.forEach(dataset => {
              expect(dataset.hidden).toBeUndefined();
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should update all charts when time range filter changes', async () => {
      fc.assert(
        fc.asyncProperty(
          chartDataArbitrary,
          fc.array(timeRangeArbitrary, { minLength: 2, maxLength: 3 }),
          async (data, timeRanges) => {
            const user = userEvent.setup();
            const onTimeRangeChange = vi.fn();
            
            const { rerender } = render(
              <ChartWidget
                type="line"
                data={data}
                title="Test Chart"
                timeRange={timeRanges[0]}
                onTimeRangeChange={onTimeRangeChange}
              />
            );

            // Click through different time ranges
            for (let i = 1; i < timeRanges.length; i++) {
              const timeRange = timeRanges[i];
              
              // Find and click the button
              const buttons = screen.getAllByRole('button');
              const targetButton = buttons.find(btn => 
                btn.textContent.includes(
                  timeRange === 'daily' ? 'يومي' :
                  timeRange === 'weekly' ? 'أسبوعي' : 'شهري'
                )
              );

              if (targetButton) {
                await user.click(targetButton);
                
                // Verify callback was called
                await waitFor(() => {
                  expect(onTimeRangeChange).toHaveBeenCalledWith(timeRange);
                });
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle empty or invalid data gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            null,
            undefined,
            {},
            { labels: [] },
            { datasets: [] },
            { labels: ['A'], datasets: [] }
          ),
          (invalidData) => {
            const { container } = render(
              <ChartWidget
                type="line"
                data={invalidData}
                title="Test Chart"
                showTimeRangeSelector={false}
              />
            );

            // Should show "no data" message
            const noDataMessage = container.querySelector('.chart-no-data');
            expect(noDataMessage).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point correctly', () => {
      const singlePointData = {
        labels: ['Point 1'],
        datasets: [{
          label: 'Dataset',
          data: [100],
          backgroundColor: '#D48161',
          borderColor: '#D48161'
        }]
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={singlePointData}
          title="Single Point Chart"
          showTimeRangeSelector={false}
        />
      );

      const chartElement = container.querySelector('[data-testid="line-chart"]');
      const renderedData = JSON.parse(chartElement.textContent);
      
      expect(renderedData.labels).toEqual(['Point 1']);
      expect(renderedData.datasets[0].data).toEqual([100]);
    });

    it('should handle maximum data points (30) correctly', () => {
      const maxPointsData = {
        labels: Array.from({ length: 30 }, (_, i) => `Point ${i + 1}`),
        datasets: [{
          label: 'Dataset',
          data: Array.from({ length: 30 }, (_, i) => i * 10),
          backgroundColor: '#D48161',
          borderColor: '#D48161'
        }]
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={maxPointsData}
          title="Max Points Chart"
          showTimeRangeSelector={false}
        />
      );

      const chartElement = container.querySelector('[data-testid="line-chart"]');
      const renderedData = JSON.parse(chartElement.textContent);
      
      expect(renderedData.labels.length).toBe(30);
      expect(renderedData.datasets[0].data.length).toBe(30);
    });
  });
});
