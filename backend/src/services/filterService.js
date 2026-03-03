const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');

/**
 * خدمة الفلترة المتقدمة
 * تدعم جميع أنواع الفلاتر للوظائف والدورات
 */
class FilterService {
  /**
   * تطبيق جميع الفلاتر على الاستعلام
   * @param {Object} baseQuery - الاستعلام الأساسي
   * @param {Object} filters - الفلاتر المطلوبة
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @returns {Object} - الاستعلام المحدث
   */
  applyFilters(baseQuery, filters = {}, type = 'jobs') {
    let query = { ...baseQuery };

    // فلترة حسب الراتب (للوظائف فقط)
    if (type === 'jobs' && (filters.salaryMin || filters.salaryMax)) {
      query = this.filterBySalary(query, filters.salaryMin, filters.salaryMax);
    }

    // فلترة حسب الموقع
    if (filters.location) {
      query = this.filterByLocation(query, filters.location);
    }

    // فلترة حسب نوع العمل (للوظائف فقط)
    if (type === 'jobs' && filters.workType && filters.workType.length > 0) {
      query = this.filterByWorkType(query, filters.workType);
    }

    // فلترة حسب مستوى الخبرة (للوظائف فقط)
    if (type === 'jobs' && filters.experienceLevel && filters.experienceLevel.length > 0) {
      query = this.filterByExperienceLevel(query, filters.experienceLevel);
    }

    // فلترة حسب المهارات
    if (filters.skills && filters.skills.length > 0) {
      query = this.filterBySkills(
        query,
        filters.skills,
        filters.skillsLogic || 'OR'
      );
    }

    // فلترة حسب تاريخ النشر
    if (filters.datePosted) {
      query = this.filterByDate(query, filters.datePosted);
    }

    // فلترة حسب حجم الشركة (للوظائف فقط)
    if (type === 'jobs' && filters.companySize && filters.companySize.length > 0) {
      query = this.filterByCompanySize(query, filters.companySize);
    }

    return query;
  }

  /**
   * فلترة حسب الراتب (نطاق من-إلى)
   * @param {Object} query - الاستعلام الحالي
   * @param {number} min - الحد الأدنى للراتب
   * @param {number} max - الحد الأقصى للراتب
   * @returns {Object} - الاستعلام المحدث
   */
  filterBySalary(query, min, max) {
    const salaryFilter = {};

    if (min !== undefined && min !== null && min >= 0) {
      salaryFilter.$gte = min;
    }

    if (max !== undefined && max !== null && max >= 0) {
      salaryFilter.$lte = max;
    }

    // التحقق من صحة النطاق - إذا كان متناقض، أرجع query يطابق لا شيء
    if (min !== undefined && max !== undefined && min > max) {
      // فلتر متناقض - لن يطابق أي شيء
      query._id = { $exists: false }; // query يطابق لا شيء
      return query;
    }

    if (Object.keys(salaryFilter).length > 0) {
      query['salary.min'] = salaryFilter;
    }

    return query;
  }

  /**
   * فلترة حسب الموقع (المدينة أو الدولة)
   * @param {Object} query - الاستعلام الحالي
   * @param {string} location - الموقع (مدينة أو دولة)
   * @returns {Object} - الاستعلام المحدث
   */
  filterByLocation(query, location) {
    if (!location || location.trim().length === 0) {
      return query;
    }

    const locationRegex = new RegExp(location.trim(), 'i');

    // البحث في المدينة أو الدولة
    query.$or = [
      { 'location.city': locationRegex },
      { 'location.country': locationRegex }
    ];

    return query;
  }

  /**
   * فلترة حسب نوع العمل
   * @param {Object} query - الاستعلام الحالي
   * @param {Array<string>} workTypes - أنواع العمل المطلوبة
   * @returns {Object} - الاستعلام المحدث
   */
  filterByWorkType(query, workTypes) {
    if (!Array.isArray(workTypes) || workTypes.length === 0) {
      return query;
    }

    // التحقق من القيم الصحيحة
    const validWorkTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Contract', 'Internship'];
    const filteredTypes = workTypes.filter(type => validWorkTypes.includes(type));

    if (filteredTypes.length > 0) {
      query.jobType = { $in: filteredTypes };
    }

    return query;
  }

  /**
   * فلترة حسب مستوى الخبرة
   * @param {Object} query - الاستعلام الحالي
   * @param {Array<string>} levels - مستويات الخبرة المطلوبة
   * @returns {Object} - الاستعلام المحدث
   */
  filterByExperienceLevel(query, levels) {
    if (!Array.isArray(levels) || levels.length === 0) {
      return query;
    }

    // التحقق من القيم الصحيحة
    const validLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
    const filteredLevels = levels.filter(level => validLevels.includes(level));

    if (filteredLevels.length > 0) {
      query.experienceLevel = { $in: filteredLevels };
    }

    return query;
  }

  /**
   * فلترة حسب المهارات مع منطق AND/OR
   * @param {Object} query - الاستعلام الحالي
   * @param {Array<string>} skills - المهارات المطلوبة
   * @param {string} logic - منطق المطابقة ('AND' أو 'OR')
   * @returns {Object} - الاستعلام المحدث
   */
  filterBySkills(query, skills, logic = 'OR') {
    if (!Array.isArray(skills) || skills.length === 0) {
      return query;
    }

    // تنظيف المهارات
    const cleanedSkills = skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    if (cleanedSkills.length === 0) {
      return query;
    }

    if (logic === 'AND') {
      // يجب توفر جميع المهارات
      query.skills = { $all: cleanedSkills };
    } else {
      // يكفي توفر أي مهارة
      query.skills = { $in: cleanedSkills };
    }

    return query;
  }

  /**
   * فلترة حسب تاريخ النشر
   * @param {Object} query - الاستعلام الحالي
   * @param {string} dateRange - نطاق التاريخ ('today', 'week', 'month', 'all')
   * @returns {Object} - الاستعلام المحدث
   */
  filterByDate(query, dateRange) {
    if (!dateRange || dateRange === 'all') {
      return query;
    }

    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return query;
    }

    query.createdAt = { $gte: startDate };

    return query;
  }

  /**
   * فلترة حسب حجم الشركة
   * @param {Object} query - الاستعلام الحالي
   * @param {Array<string>} sizes - أحجام الشركات المطلوبة
   * @returns {Object} - الاستعلام المحدث
   */
  filterByCompanySize(query, sizes) {
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return query;
    }

    // التحقق من القيم الصحيحة
    const validSizes = ['Small', 'Medium', 'Large', 'Enterprise'];
    const filteredSizes = sizes.filter(size => validSizes.includes(size));

    if (filteredSizes.length > 0) {
      query['company.size'] = { $in: filteredSizes };
    }

    return query;
  }

  /**
   * الحصول على الفلاتر المتاحة بناءً على النتائج الحالية
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @param {Object} currentFilters - الفلاتر الحالية
   * @returns {Promise<Object>} - الفلاتر المتاحة
   */
  async getAvailableFilters(type = 'jobs', currentFilters = {}) {
    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      
      // بناء استعلام أساسي
      let baseQuery = {};
      if (type === 'jobs') {
        baseQuery.status = 'Open';
      }

      // تطبيق الفلاتر الحالية (ما عدا الفلتر الذي نريد الحصول على قيمه)
      const availableFilters = {};

      if (type === 'jobs') {
        // الحصول على نطاق الراتب
        const salaryRange = await Model.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              min: { $min: '$salary.min' },
              max: { $max: '$salary.max' }
            }
          }
        ]);

        availableFilters.salary = salaryRange[0] || { min: 0, max: 0 };

        // الحصول على أنواع العمل المتاحة
        const workTypes = await Model.distinct('jobType', baseQuery);
        availableFilters.workTypes = workTypes.filter(Boolean);

        // الحصول على مستويات الخبرة المتاحة
        const experienceLevels = await Model.distinct('experienceLevel', baseQuery);
        availableFilters.experienceLevels = experienceLevels.filter(Boolean);

        // الحصول على أحجام الشركات المتاحة
        const companySizes = await Model.distinct('company.size', baseQuery);
        availableFilters.companySizes = companySizes.filter(Boolean);
      }

      // الحصول على المواقع المتاحة
      const cities = await Model.distinct('location.city', baseQuery);
      const countries = await Model.distinct('location.country', baseQuery);
      availableFilters.locations = {
        cities: cities.filter(Boolean),
        countries: countries.filter(Boolean)
      };

      // الحصول على المهارات المتاحة (أكثر 50 مهارة شيوعاً)
      const skillsAgg = await Model.aggregate([
        { $match: baseQuery },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 }
      ]);

      availableFilters.skills = skillsAgg.map(s => s._id);

      return availableFilters;
    } catch (error) {
      console.error('Error in getAvailableFilters:', error);
      throw error;
    }
  }

  /**
   * حساب عدد النتائج لكل فلتر
   * @param {Object} baseQuery - الاستعلام الأساسي
   * @param {Object} filters - الفلاتر الحالية
   * @param {string} type - نوع البحث
   * @returns {Promise<Object>} - عدد النتائج لكل فلتر
   */
  async getFilterCounts(baseQuery, filters, type = 'jobs') {
    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      const counts = {};

      // عدد النتائج بدون فلاتر
      counts.total = await Model.countDocuments(baseQuery);

      // عدد النتائج مع جميع الفلاتر المطبقة
      const fullQuery = this.applyFilters(baseQuery, filters, type);
      counts.withFilters = await Model.countDocuments(fullQuery);

      // عدد النتائج مع كل فلتر
      if (type === 'jobs') {
        // عدد حسب نوع العمل
        if (filters.workType && filters.workType.length > 0) {
          counts.workType = {};
          for (const wt of filters.workType) {
            const query = this.applyFilters(baseQuery, { ...filters, workType: [wt] }, type);
            counts.workType[wt] = await Model.countDocuments(query);
          }
        }

        // عدد حسب مستوى الخبرة
        if (filters.experienceLevel && filters.experienceLevel.length > 0) {
          counts.experienceLevel = {};
          for (const level of filters.experienceLevel) {
            const query = this.applyFilters(baseQuery, { ...filters, experienceLevel: [level] }, type);
            counts.experienceLevel[level] = await Model.countDocuments(query);
          }
        }

        // عدد حسب حجم الشركة
        if (filters.companySize && filters.companySize.length > 0) {
          counts.companySize = {};
          for (const size of filters.companySize) {
            const query = this.applyFilters(baseQuery, { ...filters, companySize: [size] }, type);
            counts.companySize[size] = await Model.countDocuments(query);
          }
        }
      }

      // عدد حسب تاريخ النشر
      if (filters.datePosted) {
        counts.datePosted = {};
        const dateRanges = ['today', 'week', 'month', 'all'];
        for (const range of dateRanges) {
          const query = this.applyFilters(baseQuery, { ...filters, datePosted: range }, type);
          counts.datePosted[range] = await Model.countDocuments(query);
        }
      }

      return counts;
    } catch (error) {
      console.error('Error in getFilterCounts:', error);
      throw error;
    }
  }

  /**
   * حساب عدد النتائج مع الفلاتر المطبقة (سريع)
   * @param {Object} baseQuery - الاستعلام الأساسي
   * @param {Object} filters - الفلاتر المطلوبة
   * @param {string} type - نوع البحث
   * @returns {Promise<number>} - عدد النتائج
   */
  async getResultCount(baseQuery, filters, type = 'jobs') {
    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      const query = this.applyFilters(baseQuery, filters, type);
      return await Model.countDocuments(query);
    } catch (error) {
      console.error('Error in getResultCount:', error);
      throw error;
    }
  }

  /**
   * الحصول على الفلاتر الافتراضية (الحالة الأولية)
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @returns {Object} - الفلاتر الافتراضية
   */
  getDefaultFilters(type = 'jobs') {
    const defaultFilters = {
      query: '',
      location: '',
      skills: [],
      skillsLogic: 'OR',
      datePosted: 'all',
      page: 1,
      limit: 20,
      sort: 'relevance'
    };

    // إضافة فلاتر خاصة بالوظائف
    if (type === 'jobs') {
      defaultFilters.salaryMin = undefined;
      defaultFilters.salaryMax = undefined;
      defaultFilters.workType = [];
      defaultFilters.experienceLevel = [];
      defaultFilters.companySize = [];
    }

    // إضافة فلاتر خاصة بالدورات
    if (type === 'courses') {
      defaultFilters.level = [];
      defaultFilters.duration = undefined;
      defaultFilters.price = undefined;
    }

    return defaultFilters;
  }

  /**
   * مسح جميع الفلاتر وإعادتها للوضع الافتراضي
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @returns {Object} - الفلاتر الافتراضية
   */
  clearFilters(type = 'jobs') {
    return this.getDefaultFilters(type);
  }

  /**
   * التحقق من وجود فلاتر مطبقة
   * @param {Object} filters - الفلاتر الحالية
   * @param {string} type - نوع البحث
   * @returns {boolean} - true إذا كانت هناك فلاتر مطبقة
   */
  hasActiveFilters(filters, type = 'jobs') {
    const defaultFilters = this.getDefaultFilters(type);
    
    // التحقق من كل فلتر
    for (const key in filters) {
      // تجاهل الحقول التي لا تعتبر فلاتر
      if (['page', 'limit', 'sort'].includes(key)) {
        continue;
      }

      const currentValue = filters[key];
      const defaultValue = defaultFilters[key];

      // التحقق من القيم المختلفة
      if (Array.isArray(currentValue)) {
        if (currentValue.length > 0) {
          return true;
        }
      } else if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
        if (currentValue !== defaultValue) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * التحقق من صحة الفلاتر
   * @param {Object} filters - الفلاتر المطلوبة
   * @param {string} type - نوع البحث
   * @returns {Object} - نتيجة التحقق
   */
  validateFilters(filters, type = 'jobs') {
    const errors = [];

    // التحقق من الراتب
    if (filters.salaryMin !== undefined && filters.salaryMin < 0) {
      errors.push('Minimum salary cannot be negative');
    }

    if (filters.salaryMax !== undefined && filters.salaryMax < 0) {
      errors.push('Maximum salary cannot be negative');
    }

    if (
      filters.salaryMin !== undefined &&
      filters.salaryMax !== undefined &&
      filters.salaryMin > filters.salaryMax
    ) {
      errors.push('Minimum salary cannot be greater than maximum salary');
    }

    // التحقق من المهارات
    if (filters.skills && !Array.isArray(filters.skills)) {
      errors.push('Skills must be an array');
    }

    if (filters.skills && filters.skills.length > 20) {
      errors.push('Maximum 20 skills allowed');
    }

    // التحقق من منطق المهارات
    if (filters.skillsLogic && !['AND', 'OR'].includes(filters.skillsLogic)) {
      errors.push('Skills logic must be either AND or OR');
    }

    // التحقق من تاريخ النشر
    if (filters.datePosted && !['today', 'week', 'month', 'all'].includes(filters.datePosted)) {
      errors.push('Invalid date range');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * الحصول على الفلاتر الافتراضية (الحالة الأولية)
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @returns {Object} - الفلاتر الافتراضية
   */
  getDefaultFilters(type = 'jobs') {
    const defaultFilters = {
      query: '',
      location: '',
      skills: [],
      skillsLogic: 'OR',
      datePosted: 'all',
      page: 1,
      limit: 20,
      sort: 'relevance'
    };

    // إضافة فلاتر خاصة بالوظائف
    if (type === 'jobs') {
      defaultFilters.salaryMin = undefined;
      defaultFilters.salaryMax = undefined;
      defaultFilters.workType = [];
      defaultFilters.experienceLevel = [];
      defaultFilters.companySize = [];
    }

    // إضافة فلاتر خاصة بالدورات
    if (type === 'courses') {
      defaultFilters.level = [];
      defaultFilters.duration = undefined;
      defaultFilters.price = undefined;
    }

    return defaultFilters;
  }

  /**
   * مسح جميع الفلاتر وإعادتها للوضع الافتراضي
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @returns {Object} - الفلاتر الافتراضية
   */
  clearFilters(type = 'jobs') {
    return this.getDefaultFilters(type);
  }

  /**
   * التحقق من وجود فلاتر مطبقة
   * @param {Object} filters - الفلاتر الحالية
   * @param {string} type - نوع البحث
   * @returns {boolean} - true إذا كانت هناك فلاتر مطبقة
   */
  hasActiveFilters(filters, type = 'jobs') {
    const defaultFilters = this.getDefaultFilters(type);

    // التحقق من كل فلتر
    for (const key in filters) {
      // تجاهل الحقول التي لا تعتبر فلاتر
      if (['page', 'limit', 'sort'].includes(key)) {
        continue;
      }

      const currentValue = filters[key];
      const defaultValue = defaultFilters[key];

      // التحقق من القيم المختلفة
      if (Array.isArray(currentValue)) {
        if (currentValue.length > 0) {
          return true;
        }
      } else if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
        if (currentValue !== defaultValue) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * التحقق من صحة الفلاتر
   * @param {Object} filters - الفلاتر المطلوبة
   * @param {string} type - نوع البحث
   * @returns {Object} - نتيجة التحقق
   */
}

module.exports = new FilterService();
