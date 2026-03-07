import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobCardGridSkeleton from '../JobCardGridSkeleton';
import JobCardListSkeleton from '../JobCardListSkeleton';

/**
 * Tests for Skeleton Count Consistency
 * 
 * Property 10: Skeleton Count Consistency
 * For any loading state, the number of skeleton items should match 
 * the expected number of jobs per page (6-9 items).
 * 
 * Validates: Requirements 7.4
 */
describe('Skeleton Count Consistency', () => {
  describe('JobCardGridSkeleton', () => {
    it('should display default 9 skeleton items', () => {
      const { container } = render(<JobCardGridSkeleton />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(9);
    });
    
    it('should display 6 skeleton items when count=6', () => {
      const { container } = render(<JobCardGridSkeleton count={6} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(6);
    });
    
    it('should display 7 skeleton items when count=7', () => {
      const { container } = render(<JobCardGridSkeleton count={7} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(7);
    });
    
    it('should display 8 skeleton items when count=8', () => {
      const { container } = render(<JobCardGridSkeleton count={8} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(8);
    });
    
    it('should display 9 skeleton items when count=9', () => {
      const { container } = render(<JobCardGridSkeleton count={9} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(9);
    });
    
    it('should have grid layout classes', () => {
      const { container } = render(<JobCardGridSkeleton />);
      const gridContainer = container.firstChild;
      expect(gridContainer.className).toContain('grid');
      expect(gridContainer.className).toContain('grid-cols-1');
      expect(gridContainer.className).toContain('md:grid-cols-2');
      expect(gridContainer.className).toContain('lg:grid-cols-3');
    });
    
    it('should have accessibility attributes', () => {
      const { container } = render(<JobCardGridSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading job card');
    });
  });
  
  describe('JobCardListSkeleton', () => {
    it('should display default 9 skeleton items', () => {
      const { container } = render(<JobCardListSkeleton />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(9);
    });
    
    it('should display 6 skeleton items when count=6', () => {
      const { container } = render(<JobCardListSkeleton count={6} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(6);
    });
    
    it('should display 7 skeleton items when count=7', () => {
      const { container } = render(<JobCardListSkeleton count={7} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(7);
    });
    
    it('should display 8 skeleton items when count=8', () => {
      const { container } = render(<JobCardListSkeleton count={8} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(8);
    });
    
    it('should display 9 skeleton items when count=9', () => {
      const { container } = render(<JobCardListSkeleton count={9} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons.length).toBe(9);
    });
    
    it('should have list layout classes', () => {
      const { container } = render(<JobCardListSkeleton />);
      const listContainer = container.firstChild;
      expect(listContainer.className).toContain('space-y-4');
    });
    
    it('should have accessibility attributes', () => {
      const { container } = render(<JobCardListSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading job card');
    });
  });
  
  describe('Skeleton Count Range Validation', () => {
    it('should accept count within 6-9 range for Grid', () => {
      for (let count = 6; count <= 9; count++) {
        const { container } = render(<JobCardGridSkeleton count={count} />);
        const skeletons = container.querySelectorAll('[role="status"]');
        expect(skeletons.length).toBe(count);
      }
    });
    
    it('should accept count within 6-9 range for List', () => {
      for (let count = 6; count <= 9; count++) {
        const { container } = render(<JobCardListSkeleton count={count} />);
        const skeletons = container.querySelectorAll('[role="status"]');
        expect(skeletons.length).toBe(count);
      }
    });
  });
  
  describe('Animation and Styling', () => {
    it('Grid skeletons should have animate-pulse class', () => {
      const { container } = render(<JobCardGridSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton.className).toContain('animate-pulse');
    });
    
    it('List skeletons should have animate-pulse class', () => {
      const { container } = render(<JobCardListSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton.className).toContain('animate-pulse');
    });
    
    it('Grid skeletons should have dark mode support', () => {
      const { container } = render(<JobCardGridSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton.className).toContain('dark:bg-gray-800');
    });
    
    it('List skeletons should have dark mode support', () => {
      const { container } = render(<JobCardListSkeleton count={1} />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton.className).toContain('dark:bg-gray-800');
    });
  });
});
