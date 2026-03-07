const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');

/**
 * Job Filter Service
 * Handles building MongoDB queries and calculating filter counts for job postings
 */
class JobFilterService {
  /**
   * Apply filters to a base query
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Object} filters - Filter parameters
   * @param {String} type - Type of search ('jobs' or 'courses')
   * @returns {Object} MongoDB query with filters applied
   */
  applyFilters(baseQuery, filters = {}, type = 'jobs') {
    const query = { ...baseQuery };

    if (type === 'jobs') {
      // Salary filter
      if (filters.salaryMin || filters.salaryMax) {
        query['salary.min'] = {};
        if (filters.salaryMin) {
          query['salary.min'].$gte = parseInt(filters.salaryMin);
        }
        if (filters.salaryMax) {
          query['salary.min'].$lte = parseInt(filters.salaryMax);
        }
      }

      // Location filter
      if (filters.location && filters.location.trim()) {
        query.$or = [
          { 'location.city': { $regex: filters.location.trim(), $options: 'i' } },
          { 'location.country': { $regex: filters.location.trim(), $options: 'i' } }
        ];
      }

      // Work Type filter (array)
      if (filters.workType && filters.workType.length > 0) {
        query.workType = { $in: filters.workType };
      }

      // Experience Level filter (array)
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        query.experienceLevel = { $in: filters.experienceLevel };
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const skillsLogic = filters.skillsLogic || 'OR';
        if (skillsLogic === 'AND') {
          query.requiredSkills = { $all: filters.skills };
        } else {
          query.requiredSkills = { $in: filters.skills };
        }
      }

      // Date Posted filter
      if (filters.datePosted && filters.datePosted !== 'all') {
        const now = new Date();
        let startDate;

        switch (filters.datePosted) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }

        if (startDate) {
          query.createdAt = { $gte: startDate };
        }
      }

      // Company Size filter (array)
      if (filters.companySize && filters.companySize.length > 0) {
        query['company.size'] = { $in: filters.companySize };
      }
    }

    return query;
  }

  /**
   * Get count of results for each filter option
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Object} filters - Current filters
   * @param {String} type - Type of search ('jobs' or 'courses')
   * @returns {Promise<Object>} Filter counts
   */
  async getFilterCounts(baseQuery, filters, type = 'jobs') {
    const Model = type === 'jobs' ? JobPosting : EducationalCourse;
    const counts = {};

    try {
      // Total count without filters
      counts.total = await Model.countDocuments(baseQuery);

      // Count with all filters applied
      const fullQuery = this.applyFilters(baseQuery, filters, type);
      counts.withFilters = await Model.countDocuments(fullQuery);

      if (type === 'jobs') {
        // Work Type counts
        counts.workType = {};
        const workTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Contract', 'Internship'];
        for (const wt of workTypes) {
          const tempFilters = { ...filters, workType: [wt] };
          const query = this.applyFilters(baseQuery, tempFilters, type);
          counts.workType[wt] = await Model.countDocuments(query);
        }

        // Experience Level counts
        counts.experienceLevel = {};
        const levels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
        for (const level of levels) {
          const tempFilters = { ...filters, experienceLevel: [level] };
          const query = this.applyFilters(baseQuery, tempFilters, type);
          counts.experienceLevel[level] = await Model.countDocuments(query);
        }

        // Company Size counts
        counts.companySize = {};
        const sizes = ['Small', 'Medium', 'Large', 'Enterprise'];
        for (const size of sizes) {
          const tempFilters = { ...filters, companySize: [size] };
          const query = this.applyFilters(baseQuery, tempFilters, type);
          counts.companySize[size] = await Model.countDocuments(query);
        }

        // Date Posted counts
        counts.datePosted = {};
        const dateRanges = ['today', 'week', 'month', 'all'];
        for (const range of dateRanges) {
          const tempFilters = { ...filters, datePosted: range };
          const query = this.applyFilters(baseQuery, tempFilters, type);
          counts.datePosted[range] = await Model.countDocuments(query);
        }
      }

      return counts;
    } catch (error) {
      console.error('Error calculating filter counts:', error);
      return {
        total: 0,
        withFilters: 0
      };
    }
  }

  /**
   * Get result count with filters applied
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Object} filters - Filter parameters
   * @param {String} type - Type of search ('jobs' or 'courses')
   * @returns {Promise<Number>} Result count
   */
  async getResultCount(baseQuery, filters, type = 'jobs') {
    const Model = type === 'jobs' ? JobPosting : EducationalCourse;
    const query = this.applyFilters(baseQuery, filters, type);
    return await Model.countDocuments(query);
  }

  /**
   * Get available filter options from database
   * @param {String} type - Type of search ('jobs' or 'courses')
   * @returns {Promise<Object>} Available filter options
   */
  async getAvailableFilters(type = 'jobs') {
    const Model = type === 'jobs' ? JobPosting : EducationalCourse;
    const baseQuery = type === 'jobs' ? { status: 'Open' } : { status: 'Published' };

    try {
      if (type === 'jobs') {
        const [workTypes, experienceLevels, companySizes, skills] = await Promise.all([
          Model.distinct('workType', baseQuery),
          Model.distinct('experienceLevel', baseQuery),
          Model.distinct('company.size', baseQuery),
          Model.distinct('requiredSkills', baseQuery)
        ]);

        return {
          workTypes: workTypes.sort(),
          experienceLevels: experienceLevels.sort(),
          companySizes: companySizes.sort(),
          skills: skills.sort()
        };
      }

      return {};
    } catch (error) {
      console.error('Error getting available filters:', error);
      return {};
    }
  }

  /**
   * Validate filter parameters
   * @param {Object} filters - Filter parameters to validate
   * @param {String} type - Type of search ('jobs' or 'courses')
   * @returns {Object} Validation result { valid: boolean, errors: Array }
   */
  validateFilters(filters = {}, type = 'jobs') {
    const errors = [];

    if (type === 'jobs') {
      // Validate salary
      if (filters.salaryMin && isNaN(parseInt(filters.salaryMin))) {
        errors.push('salaryMin must be a number');
      }
      if (filters.salaryMax && isNaN(parseInt(filters.salaryMax))) {
        errors.push('salaryMax must be a number');
      }
      if (filters.salaryMin && filters.salaryMax && 
          parseInt(filters.salaryMin) > parseInt(filters.salaryMax)) {
        errors.push('salaryMin cannot be greater than salaryMax');
      }

      // Validate work type
      if (filters.workType && !Array.isArray(filters.workType)) {
        errors.push('workType must be an array');
      }

      // Validate experience level
      if (filters.experienceLevel && !Array.isArray(filters.experienceLevel)) {
        errors.push('experienceLevel must be an array');
      }

      // Validate skills
      if (filters.skills && !Array.isArray(filters.skills)) {
        errors.push('skills must be an array');
      }

      // Validate skills logic
      if (filters.skillsLogic && !['AND', 'OR'].includes(filters.skillsLogic)) {
        errors.push('skillsLogic must be either AND or OR');
      }

      // Validate date posted
      if (filters.datePosted && !['today', 'week', 'month', 'all'].includes(filters.datePosted)) {
        errors.push('datePosted must be one of: today, week, month, all');
      }

      // Validate company size
      if (filters.companySize && !Array.isArray(filters.companySize)) {
        errors.push('companySize must be an array');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new JobFilterService();
