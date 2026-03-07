/**
 * Filter Service for Educational Courses
 * Handles building MongoDB queries and sort objects for course filtering
 */

class FilterService {
  /**
   * Build MongoDB query from filter parameters
   * @param {Object} filters - Filter parameters
   * @returns {Object} MongoDB query object
   */
  buildFilterQuery(filters = {}) {
    const query = { status: 'Published' };

    // Level filter (beginner/intermediate/advanced)
    if (filters.level) {
      query.level = filters.level;
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Duration range filter (in hours)
    if (filters.minDuration || filters.maxDuration) {
      query.totalDuration = {};
      if (filters.minDuration) {
        query.totalDuration.$gte = parseFloat(filters.minDuration);
      }
      if (filters.maxDuration) {
        query.totalDuration.$lte = parseFloat(filters.maxDuration);
      }
    }

    // Price filter (free/paid)
    if (filters.isFree !== undefined) {
      const isFreeValue = filters.isFree === 'true' || filters.isFree === true;
      query['price.isFree'] = isFreeValue;
    }

    // Minimum rating filter
    if (filters.minRating) {
      query['stats.averageRating'] = { $gte: parseFloat(filters.minRating) };
    }

    // Search filter (text search across title, description, topics)
    if (filters.search && filters.search.trim()) {
      query.$text = { $search: filters.search.trim() };
    }

    return query;
  }

  /**
   * Build sort object for MongoDB query
   * @param {String} sortOption - Sort option (newest/popular/rating/price_low/price_high)
   * @returns {Object} MongoDB sort object
   */
  buildSortObject(sortOption = 'newest') {
    const sortMap = {
      newest: { publishedAt: -1 },
      popular: { 'stats.totalEnrollments': -1 },
      rating: { 'stats.averageRating': -1 },
      price_low: { 'price.amount': 1 },
      price_high: { 'price.amount': -1 }
    };

    return sortMap[sortOption] || sortMap.newest;
  }

  /**
   * Validate filter parameters
   * @param {Object} filters - Filter parameters to validate
   * @returns {Object} Validation result { valid: boolean, errors: Array }
   */
  validateFilters(filters = {}) {
    const errors = [];

    // Validate level
    if (filters.level && !['Beginner', 'Intermediate', 'Advanced'].includes(filters.level)) {
      errors.push('Invalid level. Must be Beginner, Intermediate, or Advanced');
    }

    // Validate duration
    if (filters.minDuration && isNaN(parseFloat(filters.minDuration))) {
      errors.push('minDuration must be a number');
    }
    if (filters.maxDuration && isNaN(parseFloat(filters.maxDuration))) {
      errors.push('maxDuration must be a number');
    }
    if (filters.minDuration && filters.maxDuration && 
        parseFloat(filters.minDuration) > parseFloat(filters.maxDuration)) {
      errors.push('minDuration cannot be greater than maxDuration');
    }

    // Validate rating
    if (filters.minRating) {
      const rating = parseFloat(filters.minRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push('minRating must be a number between 0 and 5');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available filter options from database
   * @param {Object} EducationalCourse - Mongoose model
   * @returns {Object} Available filter options
   */
  async getAvailableFilters(EducationalCourse) {
    try {
      const [categories, levels] = await Promise.all([
        EducationalCourse.distinct('category', { status: 'Published' }),
        EducationalCourse.distinct('level', { status: 'Published' })
      ]);

      return {
        categories: categories.sort(),
        levels: levels.sort(),
        sortOptions: ['newest', 'popular', 'rating', 'price_low', 'price_high']
      };
    } catch (error) {
      throw new Error(`Failed to get available filters: ${error.message}`);
    }
  }
}

module.exports = FilterService;
