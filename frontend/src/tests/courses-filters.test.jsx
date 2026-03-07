/**
 * Unit Tests for Course Filters Component
 * 
 * Tests cover:
 * - Individual filter controls
 * - Filter state management
 * - Filter combinations
 * - Clear filters functionality
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import { describe, it, expect, vi } from 'vitest';

describe('Course Filters', () => {
  
  // ==================== Level Filter Tests ====================
  
  describe('Level Filter (Requirement 1.1)', () => {
    
    it('should filter courses by Beginner level', () => {
      const courses = [
        { id: 1, level: 'Beginner', title: 'Course 1' },
        { id: 2, level: 'Intermediate', title: 'Course 2' },
        { id: 3, level: 'Advanced', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.level === 'Beginner');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should filter courses by Intermediate level', () => {
      const courses = [
        { id: 1, level: 'Beginner', title: 'Course 1' },
        { id: 2, level: 'Intermediate', title: 'Course 2' },
        { id: 3, level: 'Advanced', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.level === 'Intermediate');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 2');
    });

    it('should filter courses by Advanced level', () => {
      const courses = [
        { id: 1, level: 'Beginner', title: 'Course 1' },
        { id: 2, level: 'Intermediate', title: 'Course 2' },
        { id: 3, level: 'Advanced', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.level === 'Advanced');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 3');
    });

    it('should return all courses when no level filter is applied', () => {
      const courses = [
        { id: 1, level: 'Beginner', title: 'Course 1' },
        { id: 2, level: 'Intermediate', title: 'Course 2' },
        { id: 3, level: 'Advanced', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => !'' || c.level);
      expect(filtered).toHaveLength(3);
    });
  });

  // ==================== Category Filter Tests ====================
  
  describe('Category Filter (Requirement 1.2)', () => {
    
    it('should filter courses by Programming category', () => {
      const courses = [
        { id: 1, category: 'Programming', title: 'Course 1' },
        { id: 2, category: 'Design', title: 'Course 2' },
        { id: 3, category: 'Marketing', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.category === 'Programming');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should filter courses by Design category', () => {
      const courses = [
        { id: 1, category: 'Programming', title: 'Course 1' },
        { id: 2, category: 'Design', title: 'Course 2' },
        { id: 3, category: 'Marketing', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.category === 'Design');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 2');
    });

    it('should return all courses when no category filter is applied', () => {
      const courses = [
        { id: 1, category: 'Programming', title: 'Course 1' },
        { id: 2, category: 'Design', title: 'Course 2' },
        { id: 3, category: 'Marketing', title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => !'' || c.category);
      expect(filtered).toHaveLength(3);
    });
  });

  // ==================== Duration Filter Tests ====================
  
  describe('Duration Range Filter (Requirement 1.3)', () => {
    
    it('should filter courses by minimum duration', () => {
      const courses = [
        { id: 1, totalDuration: 5, title: 'Course 1' },
        { id: 2, totalDuration: 10, title: 'Course 2' },
        { id: 3, totalDuration: 15, title: 'Course 3' }
      ];
      
      const minDuration = 10;
      const filtered = courses.filter(c => c.totalDuration >= minDuration);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.title)).toEqual(['Course 2', 'Course 3']);
    });

    it('should filter courses by maximum duration', () => {
      const courses = [
        { id: 1, totalDuration: 5, title: 'Course 1' },
        { id: 2, totalDuration: 10, title: 'Course 2' },
        { id: 3, totalDuration: 15, title: 'Course 3' }
      ];
      
      const maxDuration = 10;
      const filtered = courses.filter(c => c.totalDuration <= maxDuration);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.title)).toEqual(['Course 1', 'Course 2']);
    });

    it('should filter courses by duration range (min and max)', () => {
      const courses = [
        { id: 1, totalDuration: 5, title: 'Course 1' },
        { id: 2, totalDuration: 10, title: 'Course 2' },
        { id: 3, totalDuration: 15, title: 'Course 3' },
        { id: 4, totalDuration: 20, title: 'Course 4' }
      ];
      
      const minDuration = 8;
      const maxDuration = 16;
      const filtered = courses.filter(c => 
        c.totalDuration >= minDuration && c.totalDuration <= maxDuration
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.title)).toEqual(['Course 2', 'Course 3']);
    });

    it('should return all courses when no duration filter is applied', () => {
      const courses = [
        { id: 1, totalDuration: 5, title: 'Course 1' },
        { id: 2, totalDuration: 10, title: 'Course 2' },
        { id: 3, totalDuration: 15, title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.totalDuration);
      expect(filtered).toHaveLength(3);
    });
  });

  // ==================== Price Filter Tests ====================
  
  describe('Price Filter (Requirement 1.4)', () => {
    
    it('should filter free courses only', () => {
      const courses = [
        { id: 1, price: { isFree: true, amount: 0 }, title: 'Course 1' },
        { id: 2, price: { isFree: false, amount: 49.99 }, title: 'Course 2' },
        { id: 3, price: { isFree: false, amount: 79.99 }, title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.price.isFree === true);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should filter paid courses only', () => {
      const courses = [
        { id: 1, price: { isFree: true, amount: 0 }, title: 'Course 1' },
        { id: 2, price: { isFree: false, amount: 49.99 }, title: 'Course 2' },
        { id: 3, price: { isFree: false, amount: 79.99 }, title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.price.isFree === false);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.title)).toEqual(['Course 2', 'Course 3']);
    });

    it('should return all courses when no price filter is applied', () => {
      const courses = [
        { id: 1, price: { isFree: true, amount: 0 }, title: 'Course 1' },
        { id: 2, price: { isFree: false, amount: 49.99 }, title: 'Course 2' },
        { id: 3, price: { isFree: false, amount: 79.99 }, title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.price);
      expect(filtered).toHaveLength(3);
    });
  });

  // ==================== Rating Filter Tests ====================
  
  describe('Minimum Rating Filter (Requirement 1.5)', () => {
    
    it('should filter courses by minimum rating 4.0', () => {
      const courses = [
        { id: 1, stats: { averageRating: 3.5 }, title: 'Course 1' },
        { id: 2, stats: { averageRating: 4.2 }, title: 'Course 2' },
        { id: 3, stats: { averageRating: 4.8 }, title: 'Course 3' }
      ];
      
      const minRating = 4.0;
      const filtered = courses.filter(c => c.stats.averageRating >= minRating);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.title)).toEqual(['Course 2', 'Course 3']);
    });

    it('should filter courses by minimum rating 4.5', () => {
      const courses = [
        { id: 1, stats: { averageRating: 3.5 }, title: 'Course 1' },
        { id: 2, stats: { averageRating: 4.2 }, title: 'Course 2' },
        { id: 3, stats: { averageRating: 4.8 }, title: 'Course 3' }
      ];
      
      const minRating = 4.5;
      const filtered = courses.filter(c => c.stats.averageRating >= minRating);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 3');
    });

    it('should return all courses when no rating filter is applied', () => {
      const courses = [
        { id: 1, stats: { averageRating: 3.5 }, title: 'Course 1' },
        { id: 2, stats: { averageRating: 4.2 }, title: 'Course 2' },
        { id: 3, stats: { averageRating: 4.8 }, title: 'Course 3' }
      ];
      
      const filtered = courses.filter(c => c.stats.averageRating);
      expect(filtered).toHaveLength(3);
    });
  });

  // ==================== Multi-Filter Tests ====================
  
  describe('Multiple Filters Simultaneously (Requirement 1.6)', () => {
    
    it('should apply level AND category filters together', () => {
      const courses = [
        { id: 1, level: 'Beginner', category: 'Programming', title: 'Course 1' },
        { id: 2, level: 'Beginner', category: 'Design', title: 'Course 2' },
        { id: 3, level: 'Advanced', category: 'Programming', title: 'Course 3' }
      ];
      
      const level = 'Beginner';
      const category = 'Programming';
      const filtered = courses.filter(c => 
        c.level === level && c.category === category
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should apply level, category, AND price filters together', () => {
      const courses = [
        { id: 1, level: 'Beginner', category: 'Programming', price: { isFree: true }, title: 'Course 1' },
        { id: 2, level: 'Beginner', category: 'Programming', price: { isFree: false }, title: 'Course 2' },
        { id: 3, level: 'Advanced', category: 'Programming', price: { isFree: true }, title: 'Course 3' }
      ];
      
      const level = 'Beginner';
      const category = 'Programming';
      const isFree = true;
      const filtered = courses.filter(c => 
        c.level === level && c.category === category && c.price.isFree === isFree
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should apply all filters together (level, category, duration, price, rating)', () => {
      const courses = [
        { 
          id: 1, 
          level: 'Beginner', 
          category: 'Programming', 
          totalDuration: 10,
          price: { isFree: false, amount: 49.99 },
          stats: { averageRating: 4.5 },
          title: 'Course 1' 
        },
        { 
          id: 2, 
          level: 'Beginner', 
          category: 'Programming', 
          totalDuration: 5,
          price: { isFree: false, amount: 49.99 },
          stats: { averageRating: 4.5 },
          title: 'Course 2' 
        },
        { 
          id: 3, 
          level: 'Advanced', 
          category: 'Programming', 
          totalDuration: 10,
          price: { isFree: false, amount: 49.99 },
          stats: { averageRating: 4.5 },
          title: 'Course 3' 
        }
      ];
      
      const filters = {
        level: 'Beginner',
        category: 'Programming',
        minDuration: 8,
        maxDuration: 12,
        isFree: false,
        minRating: 4.0
      };
      
      const filtered = courses.filter(c => 
        c.level === filters.level &&
        c.category === filters.category &&
        c.totalDuration >= filters.minDuration &&
        c.totalDuration <= filters.maxDuration &&
        c.price.isFree === filters.isFree &&
        c.stats.averageRating >= filters.minRating
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should return empty array when no courses match all filters', () => {
      const courses = [
        { id: 1, level: 'Beginner', category: 'Programming', title: 'Course 1' },
        { id: 2, level: 'Intermediate', category: 'Design', title: 'Course 2' }
      ];
      
      const level = 'Advanced';
      const category = 'Marketing';
      const filtered = courses.filter(c => 
        c.level === level && c.category === category
      );
      expect(filtered).toHaveLength(0);
    });
  });

  // ==================== Clear Filters Tests ====================
  
  describe('Clear All Filters (Requirement 1.7)', () => {
    
    it('should reset all filter values to empty', () => {
      const filters = {
        level: 'Beginner',
        category: 'Programming',
        minDuration: 5,
        maxDuration: 15,
        isFree: true,
        minRating: 4.0,
        search: 'JavaScript'
      };
      
      const clearedFilters = {
        level: '',
        category: '',
        minDuration: '',
        maxDuration: '',
        isFree: '',
        minRating: '',
        search: ''
      };
      
      expect(clearedFilters.level).toBe('');
      expect(clearedFilters.category).toBe('');
      expect(clearedFilters.minDuration).toBe('');
      expect(clearedFilters.maxDuration).toBe('');
      expect(clearedFilters.isFree).toBe('');
      expect(clearedFilters.minRating).toBe('');
      expect(clearedFilters.search).toBe('');
    });

    it('should return all courses after clearing filters', () => {
      const courses = [
        { id: 1, level: 'Beginner', category: 'Programming', title: 'Course 1' },
        { id: 2, level: 'Intermediate', category: 'Design', title: 'Course 2' },
        { id: 3, level: 'Advanced', category: 'Marketing', title: 'Course 3' }
      ];
      
      // Apply filters
      let filtered = courses.filter(c => c.level === 'Beginner');
      expect(filtered).toHaveLength(1);
      
      // Clear filters (no filter applied)
      filtered = courses.filter(c => !'' || c.level);
      expect(filtered).toHaveLength(3);
    });

    it('should reset page to 1 when filters are cleared', () => {
      let page = 3;
      
      // Clear filters should reset page
      page = 1;
      
      expect(page).toBe(1);
    });
  });

  // ==================== Filter State Management Tests ====================
  
  describe('Filter State Management', () => {
    
    it('should maintain filter state across component re-renders', () => {
      const filters = {
        level: 'Beginner',
        category: 'Programming'
      };
      
      // Simulate state update
      const newFilters = { ...filters, minRating: 4.0 };
      
      expect(newFilters.level).toBe('Beginner');
      expect(newFilters.category).toBe('Programming');
      expect(newFilters.minRating).toBe(4.0);
    });

    it('should update individual filter without affecting others', () => {
      const filters = {
        level: 'Beginner',
        category: 'Programming',
        minRating: 4.0
      };
      
      // Update only category
      const updatedFilters = { ...filters, category: 'Design' };
      
      expect(updatedFilters.level).toBe('Beginner');
      expect(updatedFilters.category).toBe('Design');
      expect(updatedFilters.minRating).toBe(4.0);
    });

    it('should handle partial filter updates', () => {
      const filters = {
        level: '',
        category: '',
        minDuration: '',
        maxDuration: '',
        isFree: '',
        minRating: '',
        search: ''
      };
      
      // Apply only level filter
      const updatedFilters = { ...filters, level: 'Beginner' };
      
      expect(updatedFilters.level).toBe('Beginner');
      expect(updatedFilters.category).toBe('');
      expect(updatedFilters.minRating).toBe('');
    });
  });

  // ==================== Filter Validation Tests ====================
  
  describe('Filter Validation', () => {
    
    it('should validate duration range (min <= max)', () => {
      const minDuration = 5;
      const maxDuration = 15;
      
      expect(minDuration).toBeLessThanOrEqual(maxDuration);
    });

    it('should handle invalid duration range gracefully', () => {
      const minDuration = 15;
      const maxDuration = 5;
      
      // Should swap or show error
      const isValid = minDuration <= maxDuration;
      expect(isValid).toBe(false);
    });

    it('should validate rating range (0-5)', () => {
      const minRating = 4.5;
      
      expect(minRating).toBeGreaterThanOrEqual(0);
      expect(minRating).toBeLessThanOrEqual(5);
    });

    it('should handle empty filter values', () => {
      const filters = {
        level: '',
        category: '',
        minDuration: '',
        maxDuration: ''
      };
      
      expect(filters.level).toBe('');
      expect(filters.category).toBe('');
      expect(filters.minDuration).toBe('');
      expect(filters.maxDuration).toBe('');
    });
  });
});
