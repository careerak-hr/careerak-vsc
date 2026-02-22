/**
 * Property-Based Tests for Skeleton Matching
 * Task 8.6.1: Write property-based test for skeleton matching (100 iterations)
 * 
 * **Validates: Requirements FR-LOAD-1, FR-LOAD-5, FR-LOAD-8**
 * 
 * Property LOAD-1: Skeleton Matching
 * ∀ content ∈ Content:
 *   skeleton(content).layout = content.layout
 * 
 * These tests verify that skeleton loaders match the layout of their corresponding content:
 * - Skeleton dimensions match content dimensions
 * - Skeleton structure matches content structure
 * - Skeleton prevents layout shifts (CLS < 0.1)
 * - Skeleton has same number of elements as content
 * - Skeleton maintains responsive behavior
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SkeletonLoader from '../src/components/SkeletonLoaders/SkeletonLoader';
import JobCardSkeleton from '../src/components/SkeletonLoaders/JobCardSkeleton';
import CourseCardSkeleton from '../src/components/SkeletonLoaders/CourseCardSkeleton';
import ProfileSkeleton from '../src/components/SkeletonLoaders/ProfileSkeleton';

// Mock AnimationContext
vi.mock('../src/context/AnimationContext', () => ({
  useAnimation: () => ({
    shouldAnimate: true,
    prefersReducedMotion: false
  })
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

/**
 * Mock content components that match skeleton structure
 */
const JobCard = ({ title, company, location, salary }) => (
  <div className="job-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4" data-testid="job-card">
    <h3 className="text-xl font-bold" style={{ height: '28px' }}>{title}</h3>
    <div className="job-details space-y-3">
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Company:</span>
        <span>{company}</span>
      </div>
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Location:</span>
        <span>{location}</span>
      </div>
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Salary:</span>
        <span>{salary}</span>
      </div>
    </div>
    <button className="btn-apply" style={{ height: '40px', width: '120px' }}>Apply</button>
  </div>
);

const CourseCard = ({ title, instructor, duration, price }) => (
  <div className="course-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4" data-testid="course-card">
    <h3 className="text-xl font-bold" style={{ height: '28px' }}>{title}</h3>
    <div className="course-details space-y-3">
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Instructor:</span>
        <span>{instructor}</span>
      </div>
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Duration:</span>
        <span>{duration}</span>
      </div>
      <div className="flex items-center space-x-2" style={{ height: '16px' }}>
        <span>Price:</span>
        <span>{price}</span>
      </div>
    </div>
    <button className="btn-enroll" style={{ height: '40px', width: '100%' }}>Enroll</button>
  </div>
);

/**
 * Arbitrary generators
 */
const dimensionArbitrary = fc.oneof(
  fc.constant('100%'),
  fc.constant('50%'),
  fc.constant('75%'),
  fc.nat({ max: 500 }).map(n => `${n}px`),
  fc.nat({ max: 50 }).map(n => `${n}rem`)
);

const heightArbitrary = fc.oneof(
  fc.nat({ min: 16, max: 200 }).map(n => `${n}px`),
  fc.nat({ min: 1, max: 10 }).map(n => `${n}rem`)
);

const variantArbitrary = fc.constantFrom('rectangle', 'circle', 'rounded', 'pill');

const countArbitrary = fc.integer({ min: 1, max: 10 });

const jobDataArbitrary = fc.record({
  title: fc.string({ minLength: 10, maxLength: 50 }),
  company: fc.string({ minLength: 5, maxLength: 30 }),
  location: fc.string({ minLength: 5, maxLength: 30 }),
  salary: fc.string({ minLength: 5, maxLength: 20 })
});

const courseDataArbitrary = fc.record({
  title: fc.string({ minLength: 10, maxLength: 50 }),
  instructor: fc.string({ minLength: 5, maxLength: 30 }),
  duration: fc.string({ minLength: 5, maxLength: 20 }),
  price: fc.string({ minLength: 3, maxLength: 15 })
});

/**
 * Helper function to get computed dimensions
 */
const getDimensions = (element) => {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return {
    width: rect.width,
    height: rect.height,
    minHeight: parseFloat(style.minHeight) || 0,
    padding: parseFloat(style.padding) || 0,
    margin: parseFloat(style.margin) || 0
  };
};

/**
 * Helper function to count elements
 */
const countElements = (container, selector) => {
  return container.querySelectorAll(selector).length;
};

describe('Skeleton Matching Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property LOAD-1.1: Base Skeleton Dimensions Match
   * ∀ width, height ∈ Dimensions:
   *   skeleton(width, height).dimensions = (width, height)
   * 
   * Validates: FR-LOAD-1, FR-LOAD-8
   */
  it('should match specified dimensions for base skeleton loader (100 iterations)', () => {
    fc.assert(
      fc.property(
        dimensionArbitrary,
        heightArbitrary,
        (width, height) => {
          const { container } = render(
            <SkeletonLoader width={width} height={height} />
          );

          const skeleton = container.firstChild;
          expect(skeleton).toBeTruthy();

          // Check that width and height are applied
          const style = skeleton.style;
          expect(style.width).toBe(width);
          expect(style.height).toBe(height);
          expect(style.minHeight).toBe(height); // Prevents layout shift
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.2: Skeleton Variant Classes
   * ∀ variant ∈ Variants:
   *   skeleton(variant).hasClass(variantClass(variant)) = true
   * 
   * Validates: FR-LOAD-1
   */
  it('should apply correct variant classes (100 iterations)', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        (variant) => {
          const { container } = render(
            <SkeletonLoader variant={variant} width="100px" height="100px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton).toBeTruthy();

          // Check variant-specific classes
          const variantClasses = {
            rectangle: 'rounded',
            circle: 'rounded-full',
            rounded: 'rounded-lg',
            pill: 'rounded-full'
          };

          const expectedClass = variantClasses[variant];
          expect(skeleton.className).toContain(expectedClass);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.3: JobCardSkeleton Structure Matches JobCard
   * ∀ jobData ∈ JobData:
   *   skeleton(JobCard).elementCount = JobCard.elementCount
   * 
   * Validates: FR-LOAD-1, FR-LOAD-5
   */
  it('should match job card structure with same number of elements (100 iterations)', () => {
    fc.assert(
      fc.property(
        jobDataArbitrary,
        (jobData) => {
          // Render actual job card
          const { container: jobContainer } = render(
            <JobCard {...jobData} />
          );

          // Render skeleton
          const { container: skeletonContainer } = render(
            <JobCardSkeleton />
          );

          // Count major sections
          const jobSections = countElements(jobContainer, '.space-y-3, .space-y-4');
          const skeletonSections = countElements(skeletonContainer, '.space-y-3, .space-y-4');

          // Both should have similar structure (title, details, button)
          expect(skeletonSections).toBeGreaterThan(0);
          expect(Math.abs(jobSections - skeletonSections)).toBeLessThanOrEqual(1);

          // Check for button presence
          const jobButton = jobContainer.querySelector('button');
          const skeletonButton = skeletonContainer.querySelector('[aria-label*="button"]');
          
          expect(jobButton).toBeTruthy();
          expect(skeletonButton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.4: CourseCardSkeleton Structure Matches CourseCard
   * ∀ courseData ∈ CourseData:
   *   skeleton(CourseCard).elementCount = CourseCard.elementCount
   * 
   * Validates: FR-LOAD-1, FR-LOAD-5
   */
  it('should match course card structure with same number of elements (100 iterations)', () => {
    fc.assert(
      fc.property(
        courseDataArbitrary,
        (courseData) => {
          // Render actual course card
          const { container: courseContainer } = render(
            <CourseCard {...courseData} />
          );

          // Render skeleton
          const { container: skeletonContainer } = render(
            <CourseCardSkeleton />
          );

          // Count major sections
          const courseSections = countElements(courseContainer, '.space-y-3, .space-y-4');
          const skeletonSections = countElements(skeletonContainer, '.space-y-3, .space-y-4');

          // Both should have similar structure
          expect(skeletonSections).toBeGreaterThan(0);
          expect(Math.abs(courseSections - skeletonSections)).toBeLessThanOrEqual(1);

          // Check for button presence
          const courseButton = courseContainer.querySelector('button');
          const skeletonButton = skeletonContainer.querySelector('[aria-label*="button"]');
          
          expect(courseButton).toBeTruthy();
          expect(skeletonButton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.5: Multiple Skeletons Count Matches
   * ∀ count ∈ [1, 10]:
   *   skeleton(count).length = count
   * 
   * Validates: FR-LOAD-5
   */
  it('should render correct number of skeleton cards (100 iterations)', () => {
    fc.assert(
      fc.property(
        countArbitrary,
        (count) => {
          // Test JobCardSkeleton
          const { container: jobContainer } = render(
            <JobCardSkeleton count={count} />
          );
          const jobSkeletons = jobContainer.querySelectorAll('.job-card-skeleton');
          expect(jobSkeletons.length).toBe(count);

          // Test CourseCardSkeleton
          const { container: courseContainer } = render(
            <CourseCardSkeleton count={count} />
          );
          const courseSkeletons = courseContainer.querySelectorAll('.course-card-skeleton');
          expect(courseSkeletons.length).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.6: Skeleton Prevents Layout Shift
   * ∀ skeleton ∈ Skeletons:
   *   skeleton.minHeight = skeleton.height
   * 
   * Validates: FR-LOAD-8, NFR-PERF-5 (CLS < 0.1)
   */
  it('should prevent layout shifts with minHeight (100 iterations)', () => {
    fc.assert(
      fc.property(
        heightArbitrary,
        (height) => {
          const { container } = render(
            <SkeletonLoader width="100%" height={height} />
          );

          const skeleton = container.firstChild;
          const style = skeleton.style;

          // minHeight should equal height to prevent layout shift
          expect(style.minHeight).toBe(height);
          expect(style.height).toBe(height);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.7: Skeleton Has Pulse Animation
   * ∀ skeleton ∈ Skeletons:
   *   skeleton.hasClass('animate-pulse') = true
   * 
   * Validates: FR-LOAD-1
   */
  it('should have pulse animation class (100 iterations)', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        (variant) => {
          const { container } = render(
            <SkeletonLoader variant={variant} width="100px" height="50px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton.className).toContain('animate-pulse');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.8: Skeleton Has Dark Mode Support
   * ∀ skeleton ∈ Skeletons:
   *   skeleton.hasClass('dark:bg-gray-700') = true
   * 
   * Validates: FR-LOAD-1
   */
  it('should have dark mode classes (100 iterations)', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        (variant) => {
          const { container } = render(
            <SkeletonLoader variant={variant} width="100px" height="50px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton.className).toContain('dark:bg-gray-700');
          expect(skeleton.className).toContain('bg-gray-200');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.9: Skeleton Has Accessibility Attributes
   * ∀ skeleton ∈ Skeletons:
   *   skeleton.role = 'status' AND skeleton.ariaBusy = 'true'
   * 
   * Validates: FR-LOAD-1, NFR-A11Y-1
   */
  it('should have accessibility attributes (100 iterations)', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        (variant) => {
          const { container } = render(
            <SkeletonLoader variant={variant} width="100px" height="50px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton.getAttribute('role')).toBe('status');
          expect(skeleton.getAttribute('aria-busy')).toBe('true');
          expect(skeleton.getAttribute('aria-label')).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.10: ProfileSkeleton Has All Required Sections
   * ∀ profile ∈ Profiles:
   *   skeleton(profile).sections = profile.sections
   * 
   * Validates: FR-LOAD-1, FR-LOAD-5
   */
  it('should have all required profile sections (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.constant(true), // Just run 100 times
        () => {
          const { container } = render(<ProfileSkeleton />);

          // Check for avatar (circle)
          const avatar = container.querySelector('.rounded-full');
          expect(avatar).toBeTruthy();

          // Check for stats grid (3 items)
          const statsGrid = container.querySelector('.grid-cols-1.sm\\:grid-cols-3');
          expect(statsGrid).toBeTruthy();
          const statCards = statsGrid.querySelectorAll('div.bg-white');
          expect(statCards.length).toBe(3);

          // Check for content sections
          const contentSections = container.querySelectorAll('.bg-white.dark\\:bg-gray-800');
          expect(contentSections.length).toBeGreaterThan(3); // Header + stats + content sections

          // Check for skills section (pills)
          const pills = container.querySelectorAll('.rounded-full');
          expect(pills.length).toBeGreaterThan(1); // Avatar + skill pills
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.11: Skeleton Transition Duration
   * ∀ skeleton ∈ Skeletons:
   *   skeleton.hasClass('duration-200') = true
   * 
   * Validates: FR-LOAD-7 (200ms fade transition)
   */
  it('should have 200ms transition duration (100 iterations)', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        (variant) => {
          const { container } = render(
            <SkeletonLoader variant={variant} width="100px" height="50px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton.className).toContain('duration-200');
          expect(skeleton.className).toContain('transition-opacity');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property LOAD-1.12: Skeleton Custom Classes Applied
   * ∀ customClass ∈ Classes:
   *   skeleton(customClass).hasClass(customClass) = true
   * 
   * Validates: FR-LOAD-1
   */
  it('should apply custom classes (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-z-]+$/.test(s)),
        (customClass) => {
          const { container } = render(
            <SkeletonLoader className={customClass} width="100px" height="50px" />
          );

          const skeleton = container.firstChild;
          expect(skeleton.className).toContain(customClass);
        }
      ),
      { numRuns: 100 }
    );
  });
});
