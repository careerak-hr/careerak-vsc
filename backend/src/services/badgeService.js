/**
 * Badge Service for Educational Courses
 * Handles automatic badge assignment based on course performance and criteria
 */

class BadgeService {
  constructor(EducationalCourse) {
    this.EducationalCourse = EducationalCourse;
  }

  /**
   * Update badges for a specific course
   * @param {String} courseId - Course ID
   * @returns {Array} Updated badges
   */
  async updateCourseBadges(courseId) {
    try {
      const course = await this.EducationalCourse.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const badges = [];
      const now = new Date();

      // Check for "Most Popular" badge
      const topEnrollment = await this.getTopEnrollmentInCategory(course.category);
      if (topEnrollment && topEnrollment._id.equals(courseId)) {
        badges.push({ type: 'most_popular', awardedAt: now });
      }

      // Check for "New" badge (published within last 30 days)
      if (course.publishedAt) {
        const daysSincePublish = (now - course.publishedAt) / (1000 * 60 * 60 * 24);
        if (daysSincePublish <= 30) {
          badges.push({ type: 'new', awardedAt: now });
        }
      }

      // Check for "Recommended" badge (rating >= 4.5 and completion rate >= 70%)
      if (course.stats.averageRating >= 4.5 && course.stats.completionRate >= 70) {
        badges.push({ type: 'recommended', awardedAt: now });
      }

      // Check for "Top Rated" badge
      const topRated = await this.getTopRatedInCategory(course.category);
      if (topRated && topRated._id.equals(courseId)) {
        badges.push({ type: 'top_rated', awardedAt: now });
      }

      // Update course with new badges
      course.badges = badges;
      await course.save();

      return badges;
    } catch (error) {
      throw new Error(`Failed to update course badges: ${error.message}`);
    }
  }

  /**
   * Get course with highest enrollment in category
   * @param {String} category - Course category
   * @returns {Object} Course with highest enrollment
   */
  async getTopEnrollmentInCategory(category) {
    try {
      const topCourse = await this.EducationalCourse
        .findOne({ 
          category, 
          status: 'Published',
          'stats.totalEnrollments': { $gt: 0 }
        })
        .sort({ 'stats.totalEnrollments': -1 })
        .limit(1);

      return topCourse;
    } catch (error) {
      throw new Error(`Failed to get top enrollment: ${error.message}`);
    }
  }

  /**
   * Get course with highest rating in category
   * @param {String} category - Course category
   * @returns {Object} Course with highest rating
   */
  async getTopRatedInCategory(category) {
    try {
      const topCourse = await this.EducationalCourse
        .findOne({ 
          category, 
          status: 'Published',
          'stats.totalReviews': { $gte: 5 }, // Minimum 5 reviews for credibility
          'stats.averageRating': { $gt: 0 }
        })
        .sort({ 'stats.averageRating': -1, 'stats.totalReviews': -1 })
        .limit(1);

      return topCourse;
    } catch (error) {
      throw new Error(`Failed to get top rated: ${error.message}`);
    }
  }

  /**
   * Update badges for all courses in a category
   * @param {String} category - Course category
   * @returns {Number} Number of courses updated
   */
  async updateCategoryBadges(category) {
    try {
      const courses = await this.EducationalCourse.find({ 
        category, 
        status: 'Published' 
      });

      let updatedCount = 0;
      for (const course of courses) {
        await this.updateCourseBadges(course._id);
        updatedCount++;
      }

      return updatedCount;
    } catch (error) {
      throw new Error(`Failed to update category badges: ${error.message}`);
    }
  }

  /**
   * Update badges for all published courses
   * @returns {Number} Number of courses updated
   */
  async updateAllBadges() {
    try {
      const courses = await this.EducationalCourse.find({ status: 'Published' });

      let updatedCount = 0;
      for (const course of courses) {
        await this.updateCourseBadges(course._id);
        updatedCount++;
      }

      return updatedCount;
    } catch (error) {
      throw new Error(`Failed to update all badges: ${error.message}`);
    }
  }

  /**
   * Remove specific badge from course
   * @param {String} courseId - Course ID
   * @param {String} badgeType - Badge type to remove
   * @returns {Boolean} Success status
   */
  async removeBadge(courseId, badgeType) {
    try {
      const course = await this.EducationalCourse.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      course.badges = course.badges.filter(badge => badge.type !== badgeType);
      await course.save();

      return true;
    } catch (error) {
      throw new Error(`Failed to remove badge: ${error.message}`);
    }
  }

  /**
   * Get badge statistics
   * @returns {Object} Badge statistics
   */
  async getBadgeStatistics() {
    try {
      const stats = await this.EducationalCourse.aggregate([
        { $match: { status: 'Published' } },
        { $unwind: '$badges' },
        { $group: { _id: '$badges.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});
    } catch (error) {
      throw new Error(`Failed to get badge statistics: ${error.message}`);
    }
  }
}

module.exports = BadgeService;
