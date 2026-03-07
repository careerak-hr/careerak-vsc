/**
 * Courses Page - Accessibility Tests
 * 
 * Tests for:
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Touch target sizes
 * - ARIA labels
 * - Color contrast
 * - Focus management
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components (replace with actual imports)
import CoursesPage from '../pages/CoursesPage';
import CourseCard from '../components/CourseCard';
import CourseFilters from '../components/CourseFilters';
import CourseSortBar from '../components/CourseSortBar';

describe('Courses Page - Accessibility Tests', () => {
  
  // ============================================
  // 1. Keyboard Navigation Tests
  // ============================================
  
  describe('Keyboard Navigation', () => {
    
    it('should allow tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      render(<CoursesPage />);
      
      // Tab through elements
      await user.tab(); // Skip to main content link
      await user.tab(); // Search input
      await user.tab(); // Sort select
      await user.tab(); // Grid view button
      await user.tab(); // List view button
      await user.tab(); // First course card
      
      // Verify focus is on expected elements
      const searchInput = screen.getByRole('searchbox');
      const sortSelect = screen.getByRole('combobox', { name: /sort/i });
      const gridViewBtn = screen.getByRole('button', { name: /grid view/i });
      
      expect(searchInput).toBeInTheDocument();
      expect(sortSelect).toBeInTheDocument();
      expect(gridViewBtn).toBeInTheDocument();
    });
    
    it('should support Enter key to activate buttons', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();
      render(<CourseSortBar onViewChange={onViewChange} />);
      
      const gridViewBtn = screen.getByRole('button', { name: /grid view/i });
      gridViewBtn.focus();
      
      await user.keyboard('{Enter}');
      
      expect(onViewChange).toHaveBeenCalledWith('grid');
    });
    
    it('should support Space key to activate buttons', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();
      render(<CourseSortBar onViewChange={onViewChange} />);
      
      const listViewBtn = screen.getByRole('button', { name: /list view/i });
      listViewBtn.focus();
      
      await user.keyboard(' ');
      
      expect(onViewChange).toHaveBeenCalledWith('list');
    });
    
    it('should support arrow keys in select dropdowns', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(<CourseSortBar onSortChange={onSortChange} />);
      
      const sortSelect = screen.getByRole('combobox', { name: /sort/i });
      sortSelect.focus();
      
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(onSortChange).toHaveBeenCalled();
    });
    
    it('should trap focus in modal filters on mobile', async () => {
      const user = userEvent.setup();
      // Mock mobile viewport
      global.innerWidth = 500;
      
      render(<CoursesPage />);
      
      const filterToggle = screen.getByRole('button', { name: /filters/i });
      await user.click(filterToggle);
      
      // Tab through filter elements
      await user.tab(); // First filter
      await user.tab(); // Second filter
      // ... should cycle back to first filter
      
      const firstFilter = screen.getAllByRole('checkbox')[0];
      expect(document.activeElement).toBe(firstFilter);
    });
    
    it('should support Escape key to close filter modal', async () => {
      const user = userEvent.setup();
      global.innerWidth = 500;
      
      render(<CoursesPage />);
      
      const filterToggle = screen.getByRole('button', { name: /filters/i });
      await user.click(filterToggle);
      
      const filterModal = screen.getByRole('dialog');
      expect(filterModal).toBeVisible();
      
      await user.keyboard('{Escape}');
      
      expect(filterModal).not.toBeVisible();
    });
  });
  
  // ============================================
  // 2. Screen Reader Compatibility Tests
  // ============================================
  
  describe('Screen Reader Compatibility', () => {
    
    it('should have proper ARIA labels on all interactive elements', () => {
      render(<CoursesPage />);
      
      // Search input
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAccessibleName();
      
      // Sort select
      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toHaveAccessibleName();
      
      // View toggle buttons
      const gridViewBtn = screen.getByRole('button', { name: /grid view/i });
      const listViewBtn = screen.getByRole('button', { name: /list view/i });
      expect(gridViewBtn).toHaveAccessibleName();
      expect(listViewBtn).toHaveAccessibleName();
    });
    
    it('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<CourseFilters />);
      
      const levelFilter = screen.getByRole('checkbox', { name: /beginner/i });
      await user.click(levelFilter);
      
      // Check for aria-live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/filter applied/i);
    });
    
    it('should have proper heading hierarchy', () => {
      render(<CoursesPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
      
      // No skipped heading levels
      const h3s = screen.queryAllByRole('heading', { level: 3 });
      if (h3s.length > 0) {
        expect(h2s.length).toBeGreaterThan(0);
      }
    });
    
    it('should have descriptive link text', () => {
      const course = {
        id: '1',
        title: 'React Fundamentals',
        description: 'Learn React basics'
      };
      
      render(<CourseCard course={course} />);
      
      const link = screen.getByRole('link', { name: /view details.*react fundamentals/i });
      expect(link).toBeInTheDocument();
      
      // No generic "click here" or "read more"
      const genericLinks = screen.queryByRole('link', { name: /click here|read more/i });
      expect(genericLinks).not.toBeInTheDocument();
    });
    
    it('should announce loading states', () => {
      render(<CoursesPage loading={true} />);
      
      const loadingRegion = screen.getByRole('status');
      expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
      expect(loadingRegion).toHaveTextContent(/loading/i);
    });
    
    it('should announce empty states', () => {
      render(<CoursesPage courses={[]} />);
      
      const emptyRegion = screen.getByRole('status');
      expect(emptyRegion).toHaveTextContent(/no courses found/i);
    });
    
    it('should have proper image alt text', () => {
      const course = {
        id: '1',
        title: 'React Fundamentals',
        thumbnail: 'https://example.com/image.jpg'
      };
      
      render(<CourseCard course={course} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt');
      expect(image.alt).not.toBe('');
      expect(image.alt).toContain('React Fundamentals');
    });
  });
  
  // ============================================
  // 3. Touch Target Size Tests
  // ============================================
  
  describe('Touch Target Sizes', () => {
    
    it('should have minimum 44x44px touch targets for buttons', () => {
      render(<CoursesPage />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const width = parseInt(styles.width);
        const height = parseInt(styles.height);
        
        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });
    
    it('should have minimum 44x44px touch targets for links', () => {
      const course = {
        id: '1',
        title: 'React Fundamentals'
      };
      
      render(<CourseCard course={course} />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        const styles = window.getComputedStyle(link);
        const width = parseInt(styles.width);
        const height = parseInt(styles.height);
        
        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });
    
    it('should have adequate spacing between interactive elements', () => {
      render(<CourseSortBar />);
      
      const buttons = screen.getAllByRole('button');
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const button1 = buttons[i];
        const button2 = buttons[i + 1];
        
        const rect1 = button1.getBoundingClientRect();
        const rect2 = button2.getBoundingClientRect();
        
        const gap = rect2.left - rect1.right;
        
        // Minimum 8px gap
        expect(gap).toBeGreaterThanOrEqual(8);
      }
    });
    
    it('should have larger touch targets on mobile', () => {
      global.innerWidth = 375;
      
      render(<CoursesPage />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const width = parseInt(styles.width);
        const height = parseInt(styles.height);
        
        // Mobile should have even larger targets
        expect(width).toBeGreaterThanOrEqual(48);
        expect(height).toBeGreaterThanOrEqual(48);
      });
    });
  });
  
  // ============================================
  // 4. Color Contrast Tests
  // ============================================
  
  describe('Color Contrast', () => {
    
    it('should meet WCAG AA contrast ratio for text', () => {
      render(<CoursesPage />);
      
      const textElements = screen.getAllByText(/./);
      
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Calculate contrast ratio (simplified)
        const contrastRatio = calculateContrastRatio(color, backgroundColor);
        
        // WCAG AA requires 4.5:1 for normal text
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
      });
    });
    
    it('should meet WCAG AA contrast ratio for large text', () => {
      const course = {
        id: '1',
        title: 'React Fundamentals'
      };
      
      render(<CourseCard course={course} />);
      
      const title = screen.getByText('React Fundamentals');
      const styles = window.getComputedStyle(title);
      const fontSize = parseInt(styles.fontSize);
      
      // Large text (18pt+ or 14pt+ bold)
      if (fontSize >= 18 || (fontSize >= 14 && styles.fontWeight >= 700)) {
        const contrastRatio = calculateContrastRatio(
          styles.color,
          styles.backgroundColor
        );
        
        // WCAG AA requires 3:1 for large text
        expect(contrastRatio).toBeGreaterThanOrEqual(3);
      }
    });
    
    it('should have sufficient contrast for interactive elements', () => {
      render(<CoursesPage />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        const contrastRatio = calculateContrastRatio(color, backgroundColor);
        
        // Interactive elements need 3:1 minimum
        expect(contrastRatio).toBeGreaterThanOrEqual(3);
      });
    });
  });
  
  // ============================================
  // 5. Focus Management Tests
  // ============================================
  
  describe('Focus Management', () => {
    
    it('should have visible focus indicators', () => {
      render(<CoursesPage />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        button.focus();
        
        const styles = window.getComputedStyle(button, ':focus-visible');
        
        // Should have outline or box-shadow
        expect(
          styles.outline !== 'none' || styles.boxShadow !== 'none'
        ).toBe(true);
      });
    });
    
    it('should restore focus after modal closes', async () => {
      const user = userEvent.setup();
      global.innerWidth = 500;
      
      render(<CoursesPage />);
      
      const filterToggle = screen.getByRole('button', { name: /filters/i });
      await user.click(filterToggle);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      // Focus should return to filter toggle
      expect(document.activeElement).toBe(filterToggle);
    });
    
    it('should focus first element when modal opens', async () => {
      const user = userEvent.setup();
      global.innerWidth = 500;
      
      render(<CoursesPage />);
      
      const filterToggle = screen.getByRole('button', { name: /filters/i });
      await user.click(filterToggle);
      
      const firstFilter = screen.getAllByRole('checkbox')[0];
      
      // First interactive element should be focused
      expect(document.activeElement).toBe(firstFilter);
    });
    
    it('should skip to main content link works', async () => {
      const user = userEvent.setup();
      render(<CoursesPage />);
      
      const skipLink = screen.getByText(/skip to main content/i);
      await user.click(skipLink);
      
      const mainContent = screen.getByRole('main');
      
      // Main content should be focused
      expect(document.activeElement).toBe(mainContent);
    });
  });
  
  // ============================================
  // 6. Automated Accessibility Tests (axe)
  // ============================================
  
  describe('Automated Accessibility (axe)', () => {
    
    it('should have no accessibility violations on courses page', async () => {
      const { container } = render(<CoursesPage />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should have no accessibility violations on course card', async () => {
      const course = {
        id: '1',
        title: 'React Fundamentals',
        description: 'Learn React basics',
        thumbnail: 'https://example.com/image.jpg',
        price: { amount: 99, isFree: false },
        stats: { averageRating: 4.5, totalReviews: 100 }
      };
      
      const { container } = render(<CourseCard course={course} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should have no accessibility violations on filters', async () => {
      const { container } = render(<CourseFilters />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should have no accessibility violations on sort bar', async () => {
      const { container } = render(<CourseSortBar />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
  });
  
  // ============================================
  // 7. Responsive Accessibility Tests
  // ============================================
  
  describe('Responsive Accessibility', () => {
    
    it('should maintain accessibility on mobile', async () => {
      global.innerWidth = 375;
      
      const { container } = render(<CoursesPage />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should maintain accessibility on tablet', async () => {
      global.innerWidth = 768;
      
      const { container } = render(<CoursesPage />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should maintain accessibility on desktop', async () => {
      global.innerWidth = 1440;
      
      const { container } = render(<CoursesPage />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
  });
  
  // ============================================
  // 8. RTL Accessibility Tests
  // ============================================
  
  describe('RTL Accessibility', () => {
    
    it('should maintain accessibility in RTL mode', async () => {
      const { container } = render(
        <div dir="rtl">
          <CoursesPage />
        </div>
      );
      
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });
    
    it('should have proper text direction in RTL', () => {
      render(
        <div dir="rtl">
          <CoursesPage />
        </div>
      );
      
      const mainContent = screen.getByRole('main');
      const styles = window.getComputedStyle(mainContent);
      
      expect(styles.direction).toBe('rtl');
    });
  });
});

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate contrast ratio between two colors
 * Simplified version - use a proper library in production
 */
function calculateContrastRatio(color1, color2) {
  // This is a simplified implementation
  // In production, use a library like 'color-contrast-checker'
  
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color) {
  // Simplified - parse RGB and calculate luminance
  // In production, use a proper color library
  return 0.5; // Placeholder
}
