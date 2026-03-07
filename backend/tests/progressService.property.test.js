/**
 * Property-Based Tests for ProgressService
 * Tests progress tracking and certificate generation logic
 */

const fc = require('fast-check');
const ProgressService = require('../src/services/progressService');

describe('ProgressService - Property-Based Tests', () => {
  let progressService;
  let mockCourseEnrollment;
  let mockEducationalCourse;
  let mockCourseLesson;
  let mockCertificateService;
  let mockNotificationService;

  beforeEach(() => {
    // Mock models and services
    mockCourseEnrollment = {
      findById: jest.fn(),
      find: jest.fn()
    };

    mockEducationalCourse = {
      findById: jest.fn()
    };

    mockCourseLesson = {
      find: jest.fn()
    };

    mockCertificateService = {
      generateCertificate: jest.fn()
    };

    mockNotificationService = {
      sendCourseCompletionNotification: jest.fn()
    };

    progressService = new ProgressService(
      mockCourseEnrollment,
      mockEducationalCourse,
      mockCourseLesson,
      mockCertificateService,
      mockNotificationService
    );
  });

  /**
   * Property 19: Course Completion Status
   * When all lessons are completed, the course status should be 'completed'
   * and completedAt should be set
   */
  describe('Property 19: Course Completion Status', () => {
    it('should mark course as completed when all lessons done', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          async (totalLessons) => {
            const enrollmentId = 'enrollment123';
            const courseId = 'course123';
            const lessonIds = Array.from({ length: totalLessons }, (_, i) => `lesson${i}`);
            const lastLessonId = lessonIds[lessonIds.length - 1];

            const mockEnrollment = {
              _id: enrollmentId,
              course: courseId,
              status: 'active',
              progress: {
                completedLessons: lessonIds.slice(0, -1), // All but last
                currentLesson: null,
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              completedAt: null,
              certificateIssued: { issued: false },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCourse = {
              _id: courseId,
              totalLessons: totalLessons,
              settings: { certificateEnabled: true },
              stats: {
                totalEnrollments: 0,
                activeEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                totalReviews: 0,
                previewViews: 0
              },
              save: jest.fn().mockResolvedValue(true)
            };

            mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockCertificateService.generateCertificate.mockResolvedValue({
              certificateUrl: 'https://example.com/cert.pdf',
              certificateId: 'CERT-123'
            });

            const updatedEnrollment = await progressService.markLessonComplete(
              enrollmentId,
              lastLessonId
            );

            expect(updatedEnrollment.status).toBe('completed');
            expect(updatedEnrollment.completedAt).toBeDefined();
            expect(updatedEnrollment.progress.percentageComplete).toBe(100);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not mark as completed when lessons remain', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 50 }),
          fc.integer({ min: 1, max: 4 }),
          async (totalLessons, completedCount) => {
            fc.pre(completedCount < totalLessons);

            const enrollmentId = 'enrollment123';
            const courseId = 'course123';
            const lessonIds = Array.from({ length: totalLessons }, (_, i) => `lesson${i}`);

            const mockEnrollment = {
              _id: enrollmentId,
              course: courseId,
              status: 'active',
              progress: {
                completedLessons: lessonIds.slice(0, completedCount),
                currentLesson: null,
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              completedAt: null,
              certificateIssued: { issued: false },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCourse = {
              _id: courseId,
              totalLessons: totalLessons,
              settings: { certificateEnabled: true },
              stats: {
                totalEnrollments: 0,
                activeEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                totalReviews: 0,
                previewViews: 0
              },
              save: jest.fn().mockResolvedValue(true)
            };

            mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);

            const updatedEnrollment = await progressService.markLessonComplete(
              enrollmentId,
              lessonIds[completedCount]
            );

            expect(updatedEnrollment.status).toBe('active');
            expect(updatedEnrollment.completedAt).toBeNull();
            expect(updatedEnrollment.progress.percentageComplete).toBeLessThan(100);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should calculate correct progress percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (totalLessons, completedCount) => {
            fc.pre(completedCount <= totalLessons);

            const mockEnrollment = {
              progress: {
                completedLessons: Array(completedCount).fill('lessonId')
              }
            };

            const mockCourse = {
              totalLessons: totalLessons
            };

            const percentage = progressService.calculateProgress(mockEnrollment, mockCourse);

            const expected = Math.round((completedCount / totalLessons) * 100);
            expect(percentage).toBe(expected);
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 20: Certificate Generation
   * When a course is completed and certificates are enabled,
   * a certificate should be generated and stored
   */
  describe('Property 20: Certificate Generation', () => {
    it('should generate certificate on course completion', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          async (totalLessons) => {
            const enrollmentId = 'enrollment123';
            const courseId = 'course123';
            const lessonIds = Array.from({ length: totalLessons }, (_, i) => `lesson${i}`);
            const lastLessonId = lessonIds[lessonIds.length - 1];

            const mockEnrollment = {
              _id: enrollmentId,
              course: courseId,
              status: 'active',
              progress: {
                completedLessons: lessonIds.slice(0, -1),
                currentLesson: null,
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              completedAt: null,
              certificateIssued: { issued: false },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCourse = {
              _id: courseId,
              totalLessons: totalLessons,
              settings: { certificateEnabled: true },
              stats: {
                totalEnrollments: 0,
                activeEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                totalReviews: 0,
                previewViews: 0
              },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCertificate = {
              certificateUrl: 'https://example.com/cert.pdf',
              certificateId: 'CERT-123-456'
            };

            mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockCertificateService.generateCertificate.mockResolvedValue(mockCertificate);

            await progressService.markLessonComplete(enrollmentId, lastLessonId);

            expect(mockCertificateService.generateCertificate).toHaveBeenCalled();
            expect(mockEnrollment.certificateIssued.issued).toBe(true);
            expect(mockEnrollment.certificateIssued.certificateUrl).toBe(mockCertificate.certificateUrl);
            expect(mockEnrollment.certificateIssued.certificateId).toBe(mockCertificate.certificateId);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not generate certificate when disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 50 }),
          async (totalLessons) => {
            const enrollmentId = 'enrollment123';
            const courseId = 'course123';
            const lessonIds = Array.from({ length: totalLessons }, (_, i) => `lesson${i}`);
            const lastLessonId = lessonIds[lessonIds.length - 1];

            const mockEnrollment = {
              _id: enrollmentId,
              course: courseId,
              status: 'active',
              progress: {
                completedLessons: lessonIds.slice(0, -1),
                currentLesson: null,
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              completedAt: null,
              certificateIssued: { issued: false },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCourse = {
              _id: courseId,
              totalLessons: totalLessons,
              settings: { certificateEnabled: false }, // Disabled
              stats: {
                totalEnrollments: 0,
                activeEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                totalReviews: 0,
                previewViews: 0
              },
              save: jest.fn().mockResolvedValue(true)
            };

            mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);

            await progressService.markLessonComplete(enrollmentId, lastLessonId);

            expect(mockCertificateService.generateCertificate).not.toHaveBeenCalled();
            expect(mockEnrollment.certificateIssued.issued).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not regenerate certificate if already issued', async () => {
      const enrollmentId = 'enrollment123';

      const mockEnrollment = {
        _id: enrollmentId,
        course: 'course123',
        certificateIssued: {
          issued: true,
          issuedAt: new Date(),
          certificateUrl: 'https://example.com/existing-cert.pdf',
          certificateId: 'CERT-EXISTING'
        },
        save: jest.fn().mockResolvedValue(true)
      };

      mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);

      const result = await progressService.issueCertificate(mockEnrollment);

      expect(result.issued).toBe(true);
      expect(result.certificateId).toBe('CERT-EXISTING');
      expect(mockCertificateService.generateCertificate).not.toHaveBeenCalled();
    });
  });

  /**
   * Additional Property: Progress Idempotency
   * Marking the same lesson as complete multiple times should not change the result
   */
  describe('Additional Property: Progress Idempotency', () => {
    it('should handle duplicate lesson completion gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 20 }),
          fc.integer({ min: 0, max: 4 }),
          async (totalLessons, lessonIndex) => {
            const enrollmentId = 'enrollment123';
            const courseId = 'course123';
            const lessonId = `lesson${lessonIndex}`;

            const mockEnrollment = {
              _id: enrollmentId,
              course: courseId,
              status: 'active',
              progress: {
                completedLessons: [lessonId], // Already completed
                currentLesson: lessonId,
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              completedAt: null,
              certificateIssued: { issued: false },
              save: jest.fn().mockResolvedValue(true)
            };

            const mockCourse = {
              _id: courseId,
              totalLessons: totalLessons,
              settings: { certificateEnabled: true },
              stats: {
                totalEnrollments: 0,
                activeEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                totalReviews: 0,
                previewViews: 0
              },
              save: jest.fn().mockResolvedValue(true)
            };

            mockCourseEnrollment.findById.mockResolvedValue(mockEnrollment);
            mockEducationalCourse.findById.mockResolvedValue(mockCourse);

            const result = await progressService.markLessonComplete(enrollmentId, lessonId);

            // Should not add duplicate
            expect(result.progress.completedLessons.length).toBe(1);
            expect(result.progress.completedLessons[0]).toBe(lessonId);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Additional Property: Completion Rate Calculation
   * Course completion rate should accurately reflect the ratio of completed to total enrollments
   */
  describe('Additional Property: Completion Rate Calculation', () => {
    it('should calculate correct completion rate', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          async (totalEnrollments, completedCount) => {
            fc.pre(completedCount <= totalEnrollments);

            const courseId = 'course123';
            const enrollments = Array.from({ length: totalEnrollments }, (_, i) => ({
              _id: `enrollment${i}`,
              course: courseId,
              status: i < completedCount ? 'completed' : 'active'
            }));

            const mockCourse = {
              _id: courseId,
              stats: { completionRate: 0 },
              save: jest.fn().mockResolvedValue(true)
            };

            mockEducationalCourse.findById.mockResolvedValue(mockCourse);
            mockCourseEnrollment.find.mockResolvedValue(enrollments);

            const completionRate = await progressService.updateCourseCompletionRate(courseId);

            const expected = Math.round((completedCount / totalEnrollments) * 100);
            expect(completionRate).toBe(expected);
            expect(completionRate).toBeGreaterThanOrEqual(0);
            expect(completionRate).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
