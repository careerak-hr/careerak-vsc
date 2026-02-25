import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChartWidget from '../ChartWidget';

/**
 * Unit Tests for Chart Components
 * 
 * Tests specific examples and edge cases:
 * - Chart with single data point
 * - Chart with maximum data points
 * - Invalid time range handling
 * 
 * Validates: Requirements 1.1-1.8
 */

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  ),
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  ),
  Pie: ({ data, options }) => (
    <div data-testid="pie-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  ),
  Doughnut: ({ data, options }) => (
    <div data-testid="doughnut-chart" data-options={JSON.stringify(options)}>
      {JSON.stringify(data)}
    </div>
  )
}));

describe('ChartWidget - Unit Tests', () => {
  describe('Single Data Point', () => {
    it('should render chart with single data point correctly', () => {
      const singlePointData = {
        labels: ['January'],
        datasets: [{
          label: 'Users',
          data: [150],
          backgroundColor: '#D48161',
          borderColor: '#D48161',
          borderWidth: 2
        }]
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={singlePointData}
          title="Single Point Test"
          showTimeRangeSelector={false}
        />
      );

      // Verify chart is rendered
      const chartElement = screen.getByTestId('line-chart');
      expect(chartElement).toBeTruthy();

      // Verify data
      const renderedData = JSON.parse(chartElement.textContent);
      expect(renderedData.labels).toEqual(['January']);
      expect(renderedData.datasets[0].data).toEqual([150]);
      expect(renderedData.datasets[0].label).toBe('Users');
    });

    it('should handle single data point in pie chart', () => {
      const singlePointData = {
        labels: ['Category A'],
        datasets: [{
          label: 'Distribution',
          data: [100],
          backgroundColor: ['#D48161'],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      };

      const { container } = render(
        <ChartWidget
          type="pie"
          data={singlePointData}
          title="Single Category Pie"
          showTimeRangeSelector={false}
        />
      );

      const chartElement = screen.getByTestId('pie-chart');
      const renderedData = JSON.parse(chartElement.textContent);
      
      expect(renderedData.labels).toEqual(['Category A']);
      expect(renderedData.datasets[0].data).toEqual([100]);
    });
  });

  describe('Maximum Data Points', () => {
    it('should render chart with 30 data points (maximum)', () => {
      const maxPointsData = {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [{
          label: 'Daily Users',
          data: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 1000)),
          backgroundColor: 'rgba(212, 129, 97, 0.1)',
          borderColor: '#D48161',
          borderWidth: 2
        }]
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={maxPointsData}
          title="30 Days Chart"
          showTimeRangeSelector={false}
        />
      );

      const chartElement = screen.getByTestId('line-chart');
      const renderedData = JSON.parse(chartElement.textContent);
      
      expect(renderedData.labels.length).toBe(30);
      expect(renderedData.datasets[0].data.length).toBe(30);
    });

    it('should handle multiple datasets with maximum points', () => {
      const maxPointsData = {
        labels: Array.from({ length: 30 }, (_, i) => `Point ${i + 1}`),
        datasets: [
          {
            label: 'Dataset 1',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: 'rgba(212, 129, 97, 0.1)',
            borderColor: '#D48161'
          },
          {
            label: 'Dataset 2',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: 'rgba(48, 75, 96, 0.1)',
            borderColor: '#304B60'
          },
          {
            label: 'Dataset 3',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: 'rgba(227, 218, 209, 0.1)',
            borderColor: '#E3DAD1'
          }
        ]
      };

      const { container } = render(
        <ChartWidget
          type="bar"
          data={maxPointsData}
          title="Multiple Datasets"
          showTimeRangeSelector={false}
        />
      );

      const chartElement = screen.getByTestId('bar-chart');
      const renderedData = JSON.parse(chartElement.textContent);
      
      expect(renderedData.datasets.length).toBe(3);
      renderedData.datasets.forEach(dataset => {
        expect(dataset.data.length).toBe(30);
      });
    });
  });

  describe('Invalid Time Range Handling', () => {
    it('should handle invalid time range gracefully', async () => {
      const user = userEvent.setup();
      const onTimeRangeChange = vi.fn();
      const validData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      const { rerender } = render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange="daily"
          onTimeRangeChange={onTimeRangeChange}
        />
      );

      // Verify initial render with valid time range
      expect(screen.getByText(/يومي/)).toBeTruthy();

      // Try to set invalid time range (should default to valid one)
      rerender(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange="invalid"
          onTimeRangeChange={onTimeRangeChange}
        />
      );

      // Component should still render without crashing
      const chartElement = screen.getByTestId('line-chart');
      expect(chartElement).toBeTruthy();
    });

    it('should validate time range prop type', () => {
      const validData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Data',
          data: [1, 2, 3],
          backgroundColor: '#D48161'
        }]
      };

      // Should not crash with undefined time range
      const { container } = render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange={undefined}
          onTimeRangeChange={vi.fn()}
        />
      );

      expect(container.querySelector('[data-testid="line-chart"]')).toBeTruthy();
    });

    it('should handle time range change with null callback', async () => {
      const user = userEvent.setup();
      const validData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange="daily"
          onTimeRangeChange={null}
        />
      );

      // Should render without time range selector if callback is null
      const chartElement = screen.getByTestId('line-chart');
      expect(chartElement).toBeTruthy();
    });
  });

  describe('Chart Type Switching', () => {
    it('should switch between all chart types correctly', () => {
      const testData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
          label: 'Test Data',
          data: [10, 20, 30, 40],
          backgroundColor: ['#D48161', '#304B60', '#E3DAD1', '#D48161'],
          borderColor: '#304B60'
        }]
      };

      const chartTypes = ['line', 'bar', 'pie', 'doughnut'];

      chartTypes.forEach(type => {
        const { container } = render(
          <ChartWidget
            type={type}
            data={testData}
            title={`${type} Chart`}
            showTimeRangeSelector={false}
          />
        );

        const chartElement = container.querySelector(`[data-testid="${type}-chart"]`);
        expect(chartElement).toBeTruthy();
        
        const renderedData = JSON.parse(chartElement.textContent);
        expect(renderedData.labels).toEqual(testData.labels);
      });
    });
  });

  describe('Empty Data Handling', () => {
    it('should show no data message when data is null', () => {
      const { container } = render(
        <ChartWidget
          type="line"
          data={null}
          title="Empty Chart"
          showTimeRangeSelector={false}
        />
      );

      const noDataElement = container.querySelector('.chart-no-data');
      expect(noDataElement).toBeTruthy();
      expect(noDataElement.textContent).toContain('لا توجد بيانات');
    });

    it('should show no data message when labels are empty', () => {
      const emptyData = {
        labels: [],
        datasets: []
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={emptyData}
          title="Empty Chart"
          showTimeRangeSelector={false}
        />
      );

      const noDataElement = container.querySelector('.chart-no-data');
      expect(noDataElement).toBeTruthy();
    });

    it('should show no data message when datasets are empty', () => {
      const emptyData = {
        labels: ['A', 'B', 'C'],
        datasets: []
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={emptyData}
          title="Empty Chart"
          showTimeRangeSelector={false}
        />
      );

      const noDataElement = container.querySelector('.chart-no-data');
      expect(noDataElement).toBeTruthy();
    });
  });

  describe('Time Range Selector', () => {
    it('should show time range selector when enabled', () => {
      const validData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange="daily"
          onTimeRangeChange={vi.fn()}
          showTimeRangeSelector={true}
        />
      );

      expect(screen.getByText(/يومي/)).toBeTruthy();
      expect(screen.getByText(/أسبوعي/)).toBeTruthy();
      expect(screen.getByText(/شهري/)).toBeTruthy();
    });

    it('should hide time range selector when disabled', () => {
      const validData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          showTimeRangeSelector={false}
        />
      );

      const selector = container.querySelector('.chart-time-range-selector');
      expect(selector).toBeFalsy();
    });

    it('should call onTimeRangeChange when clicking time range buttons', async () => {
      const user = userEvent.setup();
      const onTimeRangeChange = vi.fn();
      const validData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          timeRange="daily"
          onTimeRangeChange={onTimeRangeChange}
        />
      );

      const weeklyButton = screen.getByText(/أسبوعي/);
      await user.click(weeklyButton);

      await waitFor(() => {
        expect(onTimeRangeChange).toHaveBeenCalledWith('weekly');
      });
    });
  });

  describe('Custom Options', () => {
    it('should merge custom options with default options', () => {
      const validData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Data',
          data: [10, 20, 30],
          backgroundColor: '#D48161'
        }]
      };

      const customOptions = {
        plugins: {
          title: {
            display: true,
            text: 'Custom Title'
          }
        }
      };

      const { container } = render(
        <ChartWidget
          type="line"
          data={validData}
          title="Test Chart"
          showTimeRangeSelector={false}
          options={customOptions}
        />
      );

      const chartElement = screen.getByTestId('line-chart');
      const options = JSON.parse(chartElement.getAttribute('data-options'));
      
      // Should have both default and custom options
      expect(options.responsive).toBe(true); // default
      expect(options.plugins.title.display).toBe(true); // custom
      expect(options.plugins.title.text).toBe('Custom Title'); // custom
    });
  });
});
