/**
 * Property-Based Tests for BadgeService
 * Tests badge assignment logic with multiple iterations
 */

const fc = require('fast-check');
const BadgeService = require('../src/services/badgeService');

describe('BadgeService - Property-Based Tests', () => {
  let badgeService;
  let mockEducationalCourse;

  beforeEach(() => {
    // Mock EducationalCourse model
    mockEducationalCourse = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      distinct: jest.fn(),
      aggregate: jest.fn()
    };

    badgeService = new BadgeService(mockEducationalCourse);
  });

  /**
   * Property 12: Badge Assignment - Most Popular
   * The course with the highest enrollment count in a category
   * should have the "Most Popular" badge
   */
  describe('Property 12: Badge Assignment - Most Popular', () => {
    it('should assign most_popular badge to top enrollment course', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 1000 }),
          fc.integer({ min: 1, max: 99 }),
          async (topEnrollment, otherEnrollment) => {
            const courseId = 'course123';
            const category = 'Programming';

            // Mock course
            const mockCourse = {
              _id: courseId,
              category,
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
              stats: {
                totalEnrollments: topEnrollment,
                averageRating: 4.0,
                completionRate: 50
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            // Mock top enrollment course (same course)
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(mockCourse);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasMostPopular = badges.some(b => b.type === 'most_popular');
            expect(hasMostPopular).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not assign most_popular badge to non-top course', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 99 }),
          fc.integer({ min: 100, max: 1000 }),
          async (currentEnrollment, topEnrollment) => {
            const courseId = 'course123';
            const topCourseId = 'topCourse456';
            const category = 'Programming';

            const mockCourse = {
              _id: courseId,
              category,
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: currentEnrollment,
                averageRating: 4.0,
                completionRate: 50
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            const mockTopCourse = {
              _id: topCourseId,
              stats: { totalEnrollments: topEnrollment }
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(mockTopCourse);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasMostPopular = badges.some(b => b.type === 'most_popular');
            expect(hasMostPopular).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 13: Badge Assignment - New
   * Courses published within the last 30 days should have the "New" badge
   */
  describe('Property 13: Badge Assignment - New', () => {
    it('should assign new badge to recently published courses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 30 }),
          async (daysAgo) => {
            const courseId = 'course123';
            const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt,
              stats: {
                totalEnrollments: 50,
                averageRating: 4.0,
                completionRate: 50
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasNew = badges.some(b => b.type === 'new');
            expect(hasNew).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not assign new badge to old courses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 31, max: 365 }),
          async (daysAgo) => {
            const courseId = 'course123';
            const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt,
              stats: {
                totalEnrollments: 50,
                averageRating: 4.0,
                completionRate: 50
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasNew = badges.some(b => b.type === 'new');
            expect(hasNew).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 14: Badge Assignment - Recommended
   * Courses with rating >= 4.5 and completion rate >= 70% should have "Recommended" badge
   */
  describe('Property 14: Badge Assignment - Recommended', () => {
    it('should assign recommended badge when criteria met', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 4.5, max: 5.0 }),
          fc.integer({ min: 70, max: 100 }),
          async (rating, completionRate) => {
            const courseId = 'course123';

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: 50,
                averageRating: rating,
                completionRate: completionRate
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasRecommended = badges.some(b => b.type === 'recommended');
            expect(hasRecommended).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not assign recommended badge when rating too low', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0, max: 4.4 }),
          fc.integer({ min: 70, max: 100 }),
          async (rating, completionRate) => {
            const courseId = 'course123';

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: 50,
                averageRating: rating,
                completionRate: completionRate
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasRecommended = badges.some(b => b.type === 'recommended');
            expect(hasRecommended).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not assign recommended badge when completion rate too low', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 4.5, max: 5.0 }),
          fc.integer({ min: 0, max: 69 }),
          async (rating, completionRate) => {
            const courseId = 'course123';

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: 50,
                averageRating: rating,
                completionRate: completionRate
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasRecommended = badges.some(b => b.type === 'recommended');
            expect(hasRecommended).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 15: Badge Assignment - Top Rated
   * The course with the highest rating in a category should have "Top Rated" badge
   */
  describe('Property 15: Badge Assignment - Top Rated', () => {
    it('should assign top_rated badge to highest rated course', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 4.5, max: 5.0 }),
          async (topRating) => {
            const courseId = 'course123';

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: 50,
                averageRating: topRating,
                totalReviews: 10,
                completionRate: 50
              },
              badges: [],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne
              .mockResolvedValueOnce(null) // most popular
              .mockResolvedValueOnce(mockCourse); // top rated

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasTopRated = badges.some(b => b.type === 'top_rated');
            expect(hasTopRated).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 16: Badge Accumulation
   * A course can have multiple badges simultaneously if it meets multiple criteria
   */
  describe('Property 16: Badge Accumulation', () => {
    it('should assign multiple badges when all criteria met', async () => {
      const courseId = 'course123';
      const now = new Date();

      const mockCourse = {
        _id: courseId,
        category: 'Programming',
        status: 'Published',
        publishedAt: new Date(now - 15 * 24 * 60 * 60 * 1000), // 15 days ago (new)
        stats: {
          totalEnrollments: 1000,
          averageRating: 4.8, // recommended
          totalReviews: 50,
          completionRate: 85 // recommended
        },
        badges: [],
        save: jest.fn().mockResolvedValue(true)
      };

      mockEducationalCourse.findById.mockResolvedValue(mockCourse);
      mockEducationalCourse.findOne
        .mockResolvedValueOnce(mockCourse) // most popular
        .mockResolvedValueOnce(mockCourse); // top rated

      const badges = await badgeService.updateCourseBadges(courseId);

      // Should have: new, recommended, most_popular, top_rated
      expect(badges.length).toBeGreaterThanOrEqual(3);
      expect(badges.some(b => b.type === 'new')).toBe(true);
      expect(badges.some(b => b.type === 'recommended')).toBe(true);
    });
  });

  /**
   * Property 17: Badge Removal
   * When criteria are no longer met, badges should be removed
   */
  describe('Property 17: Badge Removal', () => {
    it('should remove new badge after 30 days', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 31, max: 100 }),
          async (daysAgo) => {
            const courseId = 'course123';
            const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt,
              stats: {
                totalEnrollments: 50,
                averageRating: 4.0,
                completionRate: 50
              },
              badges: [{ type: 'new', awardedAt: publishedAt }],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasNew = badges.some(b => b.type === 'new');
            expect(hasNew).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should remove recommended badge when rating drops', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0, max: 4.4 }),
          async (lowRating) => {
            const courseId = 'course123';

            const mockCourse = {
              _id: courseId,
              category: 'Programming',
              status: 'Published',
              publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              stats: {
                totalEnrollments: 50,
                averageRating: lowRating,
                completionRate: 80
              },
              badges: [{ type: 'recommended', awardedAt: new Date() }],
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockEducationalCourse.findOne.mockResolvedValue(null);

            const badges = await badgeService.updateCourseBadges(courseId);

            const hasRecommended = badges.some(b => b.type === 'recommended');
            expect(hasRecommended).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
