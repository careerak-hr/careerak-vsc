import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatisticsWidget from '../StatisticsWidget';
import { Users } from 'lucide-react';

/**
 * Unit Tests for StatisticsWidget
 * 
 * Tests:
 * - Zero values
 * - Negative growth rate
 * - Loading state
 * - Error state
 * - Different formats
 * 
 * Requirements: 2.1-2.9
 */

describe('StatisticsWidget', () => {
  describe('Zero Values', () => {
    it('should handle zero current value', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={0}
          previousValue={100}
          icon={Users}
        />
      );

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('100.0%')).toBeTruthy(); // -100% shown as 100%
    });

    it('should handle zero previous value', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={50}
          previousValue={0}
          icon={Users}
        />
      );

      expect(screen.getByText('50')).toBeTruthy();
      expect(screen.getByText('100.0%')).toBeTruthy(); // Special case: 100% growth
    });

    it('should handle both values as zero', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={0}
          previousValue={0}
          icon={Users}
        />
      );

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('0.0%')).toBeTruthy(); // No change
    });
  });

  describe('Negative Growth Rate', () => {
    it('should display negative growth rate correctly', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={50}
          previousValue={100}
          icon={Users}
        />
      );

      // Should show 50% decrease
      expect(screen.getByText('50.0%')).toBeTruthy();
      
      // Should have red color
      expect(container.querySelector('.text-red-600')).toBeTruthy();
    });

    it('should handle large negative growth rate', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={10}
          previousValue={1000}
          icon={Users}
        />
      );

      // Should show 99% decrease
      expect(screen.getByText('99.0%')).toBeTruthy();
      
      // Should have red color
      expect(container.querySelector('.text-red-600')).toBeTruthy();
    });

    it('should handle small negative growth rate', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={99}
          previousValue={100}
          icon={Users}
        />
      );

      // Should show 1% decrease
      expect(screen.getByText('1.0%')).toBeTruthy();
      
      // Should have red color
      expect(container.querySelector('.text-red-600')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          loading={true}
        />
      );

      // Should have animate-pulse class
      expect(container.querySelector('.animate-pulse')).toBeTruthy();
      
      // Should not display actual values
      expect(screen.queryByText('100')).toBeFalsy();
    });

    it('should display loading state without error', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          loading={true}
          error="Some error"
        />
      );

      // Loading takes precedence over error
      expect(container.querySelector('.animate-pulse')).toBeTruthy();
      expect(screen.queryByText('Some error')).toBeFalsy();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          error="Failed to load data"
        />
      );

      expect(screen.getByText('خطأ في تحميل البيانات')).toBeTruthy();
      expect(screen.getByText('Failed to load data')).toBeTruthy();
    });

    it('should not display values when error occurs', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          error="Error"
        />
      );

      expect(screen.queryByText('100')).toBeFalsy();
      expect(screen.queryByText('11.1%')).toBeFalsy();
    });

    it('should display icon even in error state', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          error="Error"
        />
      );

      // Icon should still be present
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Value Formatting', () => {
    it('should format number with commas', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={1234567}
          previousValue={1000000}
          icon={Users}
          format="number"
        />
      );

      expect(screen.getByText('1,234,567')).toBeTruthy();
    });

    it('should format percentage', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={45.678}
          previousValue={40}
          icon={Users}
          format="percentage"
        />
      );

      expect(screen.getByText('45.7%')).toBeTruthy();
    });

    it('should format currency', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={1234.56}
          previousValue={1000}
          icon={Users}
          format="currency"
        />
      );

      expect(screen.getByText('$1,234.56')).toBeTruthy();
    });

    it('should handle null value', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={null}
          previousValue={100}
          icon={Users}
        />
      );

      expect(screen.getByText('—')).toBeTruthy();
    });

    it('should handle undefined value', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={undefined}
          previousValue={100}
          icon={Users}
        />
      );

      expect(screen.getByText('—')).toBeTruthy();
    });
  });

  describe('Visual Elements', () => {
    it('should display title', () => {
      render(
        <StatisticsWidget
          title="Active Users"
          value={100}
          previousValue={90}
          icon={Users}
        />
      );

      expect(screen.getByText('Active Users')).toBeTruthy();
    });

    it('should display icon with custom color', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          color="#FF0000"
        />
      );

      const iconContainer = container.querySelector('[style*="background-color"]');
      expect(iconContainer).toBeTruthy();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('should display comparison text', () => {
      render(
        <StatisticsWidget
          title="Test Statistic"
          value={100}
          previousValue={90}
          icon={Users}
        />
      );

      expect(screen.getByText('مقارنة بالفترة السابقة')).toBeTruthy();
    });
  });
});
