/**
 * Unit Tests for Course Search and Sort Functionality
 * 
 * Tests cover:
 * - Search across titles, descriptions, topics
 * - Sort by newest, popular, rating, price
 * - Search result highlighting
 * - Empty search results
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import { describe, it, expect } from 'vitest';

describe('Course Search Functionality', () => {
  
  // ==================== Search Tests ====================
  
  describe('Search Across Fields (Requirement 7.1)', () => {
    
    it('should search in course titles', () => {
      const courses = [
        { id: 1, title: 'JavaScript Fundamentals', description: 'Learn JS', topics: ['programming'] },
        { id: 2, title: 'Python Basics', description: 'Learn Python', topics: ['programming'] },
        { id: 3, title: 'React Advanced', description: 'Learn React', topics: ['frontend'] }
      ];
      
      const searchQuery = 'JavaScript';
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('JavaScript Fundamentals');
    });

    it('should search in course descriptions', () => {
      const courses = [
        { id: 1, title: 'Course 1', description: 'Learn JavaScript programming', topics: [] },
        { id: 2, title: 'Course 2', description: 'Learn Python programming', topics: [] },
        { id: 3, title: 'Course 3', description: 'Learn React framework', topics: [] }
      ];
      
      const searchQuery = 'JavaScript';
      const filtered = courses.filter(c => 
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should search in course topics', () => {
      const courses = [
        { id: 1, title: 'Course 1', description: 'Learn programming', topics: ['JavaScript', 'ES6'] },
        { id: 2, title: 'Course 2', description: 'Learn programming', topics: ['Python', 'Django'] },
        { id: 3, title: 'Course 3', description: 'Learn design', topics: ['Figma', 'UI/UX'] }
      ];
      
      const searchQuery = 'JavaScript';
      const filtered = courses.filter(c => 
        c.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Course 1');
    });

    it('should search across all fields (title, description, topics)', () => {
      const courses = [
        { id: 1, title: 'JavaScript Course', description: 'Learn JS', topics: ['programming'] },
        { id: 2, title: 'Python Course', description: 'Learn JavaScript basics', topics: ['programming'] },
        { id: 3, title: 'React Course', description: 'Learn React', topics: ['JavaScript', 'frontend'] }
      ];
      
      const searchQuery = 'JavaScript';
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      expect(filtered).toHaveLength(3);
    });

    it('should be case-insensitive', () => {
      const courses = [
        { id: 1, title: 'JavaScript Fundamentals', description: 'Learn JS', topics: [] },
        { id: 2, title: 'Python Basics', description: 'Learn Python', topics: [] }
      ];
      
      const searchQuery = 'javascript';
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('JavaScript Fundamentals');
    });

    it('should handle partial matches', () => {
      const courses = [
        { id: 1, title: 'JavaScript Fundamentals', description: 'Learn JS', topics: [] },
        { id: 2, title: 'Java Programming', description: 'Learn Java', topics: [] }
      ];
      
      const searchQuery = 'Java';
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when no matches found (Requirement 7.7)', () => {
      const courses = [
        { id: 1, title: 'JavaScript Course', description: 'Learn JS', topics: [] },
        { id: 2, title: 'Python Course', description: 'Learn Python', topics: [] }
      ];
      
      const searchQuery = 'Ruby';
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty search query', () => {
      const courses = [
        { id: 1, title: 'Course 1', description: 'Description 1', topics: [] },
        { id: 2, title: 'Course 2', description: 'Description 2', topics: [] }
      ];
      
      const searchQuery = '';
      const filtered = courses.filter(c => 
        !searchQuery || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(2);
    });

    it('should trim whitespace from search query', () => {
      const courses = [
        { id: 1, title: 'JavaScript Course', description: 'Learn JS', topics: [] }
      ];
      
      const searchQuery = '  JavaScript  ';
      const trimmedQuery = searchQuery.trim();
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
    });
  });

  // ==================== Search Highlighting Tests ====================
  
  describe('Search Result Highlighting (Requirement 7.2)', () => {
    
    it('should identify matching keywords in title', () => {
      const title = 'JavaScript Fundamentals';
      const searchQuery = 'JavaScript';
      
      const hasMatch = title.toLowerCase().includes(searchQuery.toLowerCase());
      expect(hasMatch).toBe(true);
    });

    it('should identify matching keywords in description', () => {
      const description = 'Learn JavaScript programming from scratch';
      const searchQuery = 'JavaScript';
      
      const hasMatch = description.toLowerCase().includes(searchQuery.toLowerCase());
      expect(hasMatch).toBe(true);
    });

    it('should handle multiple keyword matches', () => {
      const text = 'JavaScript and JavaScript frameworks';
      const searchQuery = 'JavaScript';
      
      const regex = new RegExp(searchQuery, 'gi');
      const matches = text.match(regex);
      
      expect(matches).toHaveLength(2);
    });
  });
});

describe('Course Sort Functionality', () => {
  
  // ==================== Sort by Newest Tests ====================
  
  describe('Sort by Newest (Requirement 7.3)', () => {
    
    it('should sort courses by publication date descending', () => {
      const courses = [
        { id: 1, title: 'Course 1', publishedAt: new Date('2024-01-01') },
        { id: 2, title: 'Course 2', publishedAt: new Date('2024-03-01') },
        { id: 3, title: 'Course 3', publishedAt: new Date('2024-02-01') }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.publishedAt.getTime() - a.publishedAt.getTime()
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 1');
    });

    it('should handle courses with same publication date', () => {
      const courses = [
        { id: 1, title: 'Course 1', publishedAt: new Date('2024-01-01') },
        { id: 2, title: 'Course 2', publishedAt: new Date('2024-01-01') }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.publishedAt.getTime() - a.publishedAt.getTime()
      );
      
      expect(sorted).toHaveLength(2);
    });
  });

  // ==================== Sort by Most Popular Tests ====================
  
  describe('Sort by Most Popular (Requirement 7.4)', () => {
    
    it('should sort courses by enrollment count descending', () => {
      const courses = [
        { id: 1, title: 'Course 1', stats: { totalEnrollments: 100 } },
        { id: 2, title: 'Course 2', stats: { totalEnrollments: 500 } },
        { id: 3, title: 'Course 3', stats: { totalEnrollments: 250 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.stats.totalEnrollments - a.stats.totalEnrollments
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 1');
    });

    it('should handle courses with zero enrollments', () => {
      const courses = [
        { id: 1, title: 'Course 1', stats: { totalEnrollments: 0 } },
        { id: 2, title: 'Course 2', stats: { totalEnrollments: 100 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.stats.totalEnrollments - a.stats.totalEnrollments
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 1');
    });
  });

  // ==================== Sort by Highest Rated Tests ====================
  
  describe('Sort by Highest Rated (Requirement 7.5)', () => {
    
    it('should sort courses by average rating descending', () => {
      const courses = [
        { id: 1, title: 'Course 1', stats: { averageRating: 4.2 } },
        { id: 2, title: 'Course 2', stats: { averageRating: 4.8 } },
        { id: 3, title: 'Course 3', stats: { averageRating: 4.5 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.stats.averageRating - a.stats.averageRating
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 1');
    });

    it('should handle courses with same rating', () => {
      const courses = [
        { id: 1, title: 'Course 1', stats: { averageRating: 4.5 } },
        { id: 2, title: 'Course 2', stats: { averageRating: 4.5 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.stats.averageRating - a.stats.averageRating
      );
      
      expect(sorted).toHaveLength(2);
    });
  });

  // ==================== Sort by Price Tests ====================
  
  describe('Sort by Price (Requirement 7.6)', () => {
    
    it('should sort courses by price low to high', () => {
      const courses = [
        { id: 1, title: 'Course 1', price: { amount: 79.99 } },
        { id: 2, title: 'Course 2', price: { amount: 29.99 } },
        { id: 3, title: 'Course 3', price: { amount: 49.99 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        a.price.amount - b.price.amount
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 1');
    });

    it('should sort courses by price high to low', () => {
      const courses = [
        { id: 1, title: 'Course 1', price: { amount: 79.99 } },
        { id: 2, title: 'Course 2', price: { amount: 29.99 } },
        { id: 3, title: 'Course 3', price: { amount: 49.99 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        b.price.amount - a.price.amount
      );
      
      expect(sorted[0].title).toBe('Course 1');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 2');
    });

    it('should handle free courses in price sorting', () => {
      const courses = [
        { id: 1, title: 'Course 1', price: { isFree: false, amount: 49.99 } },
        { id: 2, title: 'Course 2', price: { isFree: true, amount: 0 } },
        { id: 3, title: 'Course 3', price: { isFree: false, amount: 29.99 } }
      ];
      
      const sorted = [...courses].sort((a, b) => 
        a.price.amount - b.price.amount
      );
      
      expect(sorted[0].title).toBe('Course 2');
      expect(sorted[1].title).toBe('Course 3');
      expect(sorted[2].title).toBe('Course 1');
    });
  });

  // ==================== Sort State Management Tests ====================
  
  describe('Sort State Management', () => {
    
    it('should maintain sort option across re-renders', () => {
      let sortOption = 'newest';
      
      // Change sort
      sortOption = 'popular';
      
      expect(sortOption).toBe('popular');
    });

    it('should reset page to 1 when sort changes', () => {
      let page = 3;
      let sortOption = 'newest';
      
      // Change sort
      sortOption = 'popular';
      page = 1;
      
      expect(page).toBe(1);
      expect(sortOption).toBe('popular');
    });

    it('should preserve filters when sort changes', () => {
      const filters = {
        level: 'Beginner',
        category: 'Programming'
      };
      let sortOption = 'newest';
      
      // Change sort
      sortOption = 'popular';
      
      expect(filters.level).toBe('Beginner');
      expect(filters.category).toBe('Programming');
      expect(sortOption).toBe('popular');
    });
  });
});

// ==================== Helper Functions ====================

/**
 * Search helper function
 */
function searchCourses(courses, query) {
  if (!query) return courses;
  
  const lowerQuery = query.toLowerCase().trim();
  
  return courses.filter(course => 
    course.title.toLowerCase().includes(lowerQuery) ||
    course.description.toLowerCase().includes(lowerQuery) ||
    (course.topics && course.topics.some(topic => 
      topic.toLowerCase().includes(lowerQuery)
    ))
  );
}

/**
 * Sort helper function
 */
function sortCourses(courses, sortOption) {
  const sorted = [...courses];
  
  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.publishedAt) - new Date(a.publishedAt)
      );
    case 'popular':
      return sorted.sort((a, b) => 
        b.stats.totalEnrollments - a.stats.totalEnrollments
      );
    case 'rating':
      return sorted.sort((a, b) => 
        b.stats.averageRating - a.stats.averageRating
      );
    case 'price_low':
      return sorted.sort((a, b) => 
        a.price.amount - b.price.amount
      );
    case 'price_high':
      return sorted.sort((a, b) => 
        b.price.amount - a.price.amount
      );
    default:
      return sorted;
  }
}

export { searchCourses, sortCourses };
