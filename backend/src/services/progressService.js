/**
 * Progress Service for Course Enrollments
 * Handles progress tracking, lesson completion, and certificate generation
 */

class ProgressService {
  constructor(CourseEnrollment, EducationalCourse, CourseLesson, certificateService, notificationService) {
    this.CourseEnrollment = CourseEnrollment;
    this.EducationalCourse = EducationalCourse;
    this.CourseLesson = CourseLesson;
    this.certificateService = certificateService;
    this.notificationService = notificationService;
  }

  /**
   * Calculate progress percentage for an enrollment
   * @param {Object} enrollment - Course enrollment
   * @param {Object} course - Course object
   * @returns {Number} Progress percentage (0-100)
   */
  calculateProgress(enrollment, course) {
    if (!course.totalLessons || course.totalLessons === 0) {
      return 0;
    }

    const completedLessons = enrollment.progress.completedLessons.length;
    const percentage = Math.round((completedLessons / course.totalLessons) * 100);
    
    return Math.min(percentage, 100); // Cap at 100%
  }

  /**
   * Mark a lesson as complete and update enrollment progress
   * @param {String} enrollmentId - Enrollment ID
   * @param {String} lessonId - Lesson ID
   * @returns {Object} Updated enrollment
   */
  async markLessonComplete(enrollmentId, lessonId) {
    try {
      const enrollment = await this.CourseEnrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Check if lesson already completed
      if (enrollment.progress.completedLessons.includes(lessonId)) {
        return enrollment; // Already completed
      }

      // Add lesson to completed list
      enrollment.progress.completedLessons.push(lessonId);
      enrollment.progress.currentLesson = lessonId;
      enrollment.progress.lastAccessedAt = new Date();

      // Get course to calculate progress
      const course = await this.EducationalCourse.findById(enrollment.course);
      if (!course) {
        throw new Error('Course not found');
      }

      // Calculate new progress percentage
      enrollment.progress.percentageComplete = this.calculateProgress(enrollment, course);

      // Check if course is now completed (100%)
      if (enrollment.progress.percentageComplete === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();

        // Generate certificate if enabled
        if (course.settings.certificateEnabled) {
          await this.issueCertificate(enrollment);
        }

        // Send completion notification
        if (this.notificationService) {
          await this.notificationService.sendCourseCompletionNotification(enrollment);
        }
      }

      await enrollment.save();

      // Update course completion rate
      await this.updateCourseCompletionRate(course._id);

      return enrollment;
    } catch (error) {
      throw new Error(`Failed to mark lesson complete: ${error.message}`);
    }
  }

  /**
   * Issue certificate for completed course
   * @param {Object} enrollment - Course enrollment
   * @returns {Object} Certificate details
   */
  async issueCertificate(enrollment) {
    try {
      // Check if certificate already issued
      if (enrollment.certificateIssued.issued) {
        return enrollment.certificateIssued;
      }

      // Generate certificate using certificate service
      const certificate = await this.certificateService.generateCertificate(enrollment);

      // Update enrollment with certificate details
      enrollment.certificateIssued = {
        issued: true,
        issuedAt: new Date(),
        certificateUrl: certificate.certificateUrl,
        certificateId: certificate.certificateId
      };

      await enrollment.save();

      return enrollment.certificateIssued;
    } catch (error) {
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  /**
   * Update course completion rate based on all enrollments
   * @param {String} courseId - Course ID
   * @returns {Number} Updated completion rate
   */
  async updateCourseCompletionRate(courseId) {
    try {
      const course = await this.EducationalCourse.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Initialize stats if not exists
      if (!course.stats) {
        course.stats = {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completionRate: 0,
          averageRating: 0,
          totalReviews: 0,
          previewViews: 0
        };
      }

      // Get all enrollments for this course
      const enrollments = await this.CourseEnrollment.find({ 
        course: courseId,
        status: { $in: ['active', 'completed'] }
      });

      // Handle case where enrollments is undefined or empty
      if (!enrollments || enrollments.length === 0) {
        course.stats.completionRate = 0;
      } else {
        // Count completed enrollments
        const completedCount = enrollments.filter(e => e.status === 'completed').length;
        const completionRate = Math.round((completedCount / enrollments.length) * 100);
        course.stats.completionRate = completionRate;
      }

      await course.save();

      return course.stats.completionRate;
    } catch (error) {
      throw new Error(`Failed to update completion rate: ${error.message}`);
    }
  }

  /**
   * Get next lesson for student
   * @param {String} enrollmentId - Enrollment ID
   * @returns {Object} Next lesson
   */
  async getNextLesson(enrollmentId) {
    try {
      const enrollment = await this.CourseEnrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Get all lessons for the course, sorted by order
      const lessons = await this.CourseLesson.find({ 
        course: enrollment.course 
      }).sort({ order: 1 });

      // Find first lesson not completed
      const nextLesson = lessons.find(lesson => 
        !enrollment.progress.completedLessons.includes(lesson._id)
      );

      return nextLesson || null;
    } catch (error) {
      throw new Error(`Failed to get next lesson: ${error.message}`);
    }
  }

  /**
   * Reset progress for an enrollment
   * @param {String} enrollmentId - Enrollment ID
   * @returns {Object} Updated enrollment
   */
  async resetProgress(enrollmentId) {
    try {
      const enrollment = await this.CourseEnrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      enrollment.progress.completedLessons = [];
      enrollment.progress.currentLesson = null;
      enrollment.progress.percentageComplete = 0;
      enrollment.progress.lastAccessedAt = new Date();
      enrollment.status = 'active';
      enrollment.completedAt = null;

      await enrollment.save();

      return enrollment;
    } catch (error) {
      throw new Error(`Failed to reset progress: ${error.message}`);
    }
  }

  /**
   * Get progress statistics for a course
   * @param {String} courseId - Course ID
   * @returns {Object} Progress statistics
   */
  async getCourseProgressStats(courseId) {
    try {
      const enrollments = await this.CourseEnrollment.find({ 
        course: courseId,
        status: { $in: ['active', 'completed'] }
      });

      const stats = {
        totalEnrollments: enrollments.length,
        completed: 0,
        inProgress: 0,
        averageProgress: 0,
        completionRate: 0
      };

      if (enrollments.length === 0) {
        return stats;
      }

      let totalProgress = 0;
      enrollments.forEach(enrollment => {
        if (enrollment.status === 'completed') {
          stats.completed++;
        } else {
          stats.inProgress++;
        }
        totalProgress += enrollment.progress.percentageComplete;
      });

      stats.averageProgress = Math.round(totalProgress / enrollments.length);
      stats.completionRate = Math.round((stats.completed / enrollments.length) * 100);

      return stats;
    } catch (error) {
      throw new Error(`Failed to get progress stats: ${error.message}`);
    }
  }
}

module.exports = ProgressService;
