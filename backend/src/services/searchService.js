const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');
const SearchHistory = require('../models/SearchHistory');
const filterService = require('./jobFilterService'); // Updated to use jobFilterService
const MatchingEngine = require('./matchingEngine');
const cacheService = require('./cacheService');

class SearchService {
  constructor() {
    this.matchingEngine = new MatchingEngine();
    this.cacheEnabled = process.env.CACHE_ENABLED !== 'false'; // تفعيل cache افتراضياً
  }

  /**
   * الحصول على اقتراحات تلقائية للبحث
   * @param {string} query - النص المدخل (يجب أن يكون 3 أحرف على الأقل)
   * @param {string} type - نوع البحث ('jobs' أو 'courses')
   * @param {string} userId - معرف المستخدم (اختياري)
   * @param {number} limit - عدد الاقتراحات (افتراضي: 10)
   * @returns {Promise<Array<string>>} - قائمة الاقتراحات
   */
  async getAutocomplete(query, type = 'jobs', userId = null, limit = 10) {
    // التحقق من الحد الأدنى للأحرف (3 أحرف)
    if (!query || query.trim().length < 3) {
      return [];
    }

    const trimmedQuery = query.trim();
    const suggestions = new Set();

    try {
      // 1. الحصول على اقتراحات من سجل البحث (إذا كان المستخدم مسجل دخول)
      if (userId) {
        const historySuggestions = await this._getHistorySuggestions(
          trimmedQuery,
          type,
          userId,
          Math.ceil(limit / 2)
        );
        historySuggestions.forEach(s => suggestions.add(s));
      }

      // 2. الحصول على اقتراحات من قاعدة البيانات
      const dbSuggestions = await this._getDatabaseSuggestions(
        trimmedQuery,
        type,
        limit - suggestions.size
      );
      dbSuggestions.forEach(s => suggestions.add(s));

      // 3. ترتيب الاقتراحات حسب الشعبية
      const sortedSuggestions = await this._sortByPopularity(
        Array.from(suggestions),
        type
      );

      return sortedSuggestions.slice(0, limit);
    } catch (error) {
      console.error('Error in getAutocomplete:', error);
      return [];
    }
  }

  /**
   * الحصول على اقتراحات من سجل البحث الشخصي
   * @private
   */
  async _getHistorySuggestions(query, type, userId, limit) {
    try {
      const regex = new RegExp(query, 'i');
      
      const history = await SearchHistory.find({
        userId,
        searchType: type,
        query: regex
      })
        .sort({ timestamp: -1 })
        .limit(limit * 2)
        .select('query')
        .lean();

      return [...new Set(history.map(h => h.query))].slice(0, limit);
    } catch (error) {
      console.error('Error in _getHistorySuggestions:', error);
      return [];
    }
  }

  /**
   * الحصول على اقتراحات من قاعدة البيانات
   * @private
   */
  async _getDatabaseSuggestions(query, type, limit) {
    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      const regex = new RegExp(query, 'i');
      
      const suggestions = [];

      // البحث في العناوين
      const titleMatches = await Model.find({
        title: regex,
        status: type === 'jobs' ? 'Open' : { $exists: true }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title')
        .lean();

      titleMatches.forEach(item => {
        if (item.title) suggestions.push(item.title);
      });

      // إذا لم نحصل على عدد كافٍ، نبحث في المهارات
      if (suggestions.length < limit && type === 'jobs') {
        const skillMatches = await Model.find({
          skills: regex,
          status: 'Open'
        })
          .sort({ createdAt: -1 })
          .limit(limit - suggestions.length)
          .select('skills')
          .lean();

        skillMatches.forEach(item => {
          if (item.skills && Array.isArray(item.skills)) {
            item.skills.forEach(skill => {
              if (skill.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push(skill);
              }
            });
          }
        });
      }

      // إذا لم نحصل على عدد كافٍ، نبحث في أسماء الشركات
      if (suggestions.length < limit && type === 'jobs') {
        const companyMatches = await Model.find({
          'company.name': regex,
          status: 'Open'
        })
          .sort({ createdAt: -1 })
          .limit(limit - suggestions.length)
          .select('company.name')
          .lean();

        companyMatches.forEach(item => {
          if (item.company && item.company.name) {
            suggestions.push(item.company.name);
          }
        });
      }

      return [...new Set(suggestions)];
    } catch (error) {
      console.error('Error in _getDatabaseSuggestions:', error);
      return [];
    }
  }

  /**
   * ترتيب الاقتراحات حسب الشعبية
   * @private
   */
  async _sortByPopularity(suggestions, type) {
    try {
      // حساب عدد مرات البحث لكل اقتراح
      const popularityMap = {};

      for (const suggestion of suggestions) {
        const count = await SearchHistory.countDocuments({
          query: suggestion,
          searchType: type
        });
        popularityMap[suggestion] = count;
      }

      // ترتيب حسب الشعبية
      return suggestions.sort((a, b) => {
        return (popularityMap[b] || 0) - (popularityMap[a] || 0);
      });
    } catch (error) {
      console.error('Error in _sortByPopularity:', error);
      return suggestions;
    }
  }

  /**
   * حفظ عملية بحث في السجل
   * @param {string} userId - معرف المستخدم
   * @param {string} query - نص البحث
   * @param {string} type - نوع البحث
   * @param {Object} filters - الفلاتر المطبقة
   * @param {number} resultCount - عدد النتائج
   */
  async saveSearchHistory(userId, query, type, filters = {}, resultCount = 0) {
    try {
      // لا نحفظ إذا كان النص أقل من 3 أحرف
      if (!query || query.trim().length < 3) {
        return;
      }

      await SearchHistory.create({
        userId,
        query: query.trim(),
        searchType: type,
        filters,
        resultCount
      });
    } catch (error) {
      console.error('Error in saveSearchHistory:', error);
      // لا نرمي خطأ لأن هذا ليس حرجاً
    }
  }

  /**
   * البحث النصي الأساسي مع الفلترة المتقدمة
   * @param {string} query - نص البحث
   * @param {Object} options - خيارات البحث
   * @returns {Promise<Object>} - نتائج البحث
   */
  async textSearch(query, options = {}) {
    const {
      type = 'jobs',
      page = 1,
      limit = 20,
      sort = 'relevance',
      filters = {}
    } = options;

    // التحقق من صحة الاستعلام
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    // التحقق من صحة الفلاتر
    const validation = filterService.validateFilters(filters, type);
    if (!validation.valid) {
      throw new Error(`Invalid filters: ${validation.errors.join(', ')}`);
    }

    // محاولة الحصول على النتائج من cache
    if (this.cacheEnabled) {
      const cacheKey = cacheService.generateCacheKey(query, { type, page, limit, sort, filters });
      const cachedResults = await cacheService.get(cacheKey);
      
      if (cachedResults) {
        console.log(`✅ Cache hit for: ${cacheKey}`);
        return cachedResults;
      }
      console.log(`⚠️  Cache miss for: ${cacheKey}`);
    }

    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      const skip = (page - 1) * limit;

      // بناء استعلام البحث النصي
      let searchQuery = {
        $text: { $search: query.trim() }
      };

      // إضافة فلتر الحالة
      if (type === 'jobs') {
        searchQuery.status = 'Open';
      }

      // تطبيق الفلاتر المتقدمة
      searchQuery = filterService.applyFilters(searchQuery, filters, type);

      // تحديد الترتيب
      let sortOption = {};
      if (sort === 'relevance') {
        sortOption = { score: { $meta: 'textScore' } };
      } else if (sort === 'date') {
        sortOption = { createdAt: -1 };
      } else if (sort === 'salary' && type === 'jobs') {
        sortOption = { 'salary.min': -1 };
      }

      // تنفيذ البحث مع تحسينات الأداء
      const results = await Model.find(searchQuery)
        .select('title description skills company location salary jobType experienceLevel createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(); // استخدام lean() لتحسين الأداء

      // حساب العدد الكلي
      const total = await Model.countDocuments(searchQuery);

      // حساب عدد النتائج لكل فلتر (للعرض في UI)
      const filterCounts = await filterService.getFilterCounts(
        { $text: { $search: query.trim() }, status: type === 'jobs' ? 'Open' : { $exists: true } },
        filters,
        type
      );

      // الحصول على الفلاتر المتاحة
      const availableFilters = await filterService.getAvailableFilters(type, filters);

      const searchResults = {
        results,
        total,
        page,
        pages: Math.ceil(total / limit),
        filters: {
          applied: filters,
          available: availableFilters,
          counts: filterCounts
        }
      };

      // حفظ النتائج في cache
      if (this.cacheEnabled) {
        const cacheKey = cacheService.generateCacheKey(query, { type, page, limit, sort, filters });
        await cacheService.set(cacheKey, searchResults);
      }

      return searchResults;
    } catch (error) {
      console.error('Error in textSearch:', error);
      throw error;
    }
  }

  /**
   * البحث بدون نص (فلترة فقط)
   * @param {Object} options - خيارات البحث والفلترة
   * @returns {Promise<Object>} - نتائج البحث
   */
  async filterOnly(options = {}) {
    const {
      type = 'jobs',
      page = 1,
      limit = 20,
      sort = 'date',
      filters = {}
    } = options;

    // التحقق من صحة الفلاتر
    const validation = filterService.validateFilters(filters, type);
    if (!validation.valid) {
      throw new Error(`Invalid filters: ${validation.errors.join(', ')}`);
    }

    try {
      const Model = type === 'jobs' ? JobPosting : EducationalCourse;
      const skip = (page - 1) * limit;

      // بناء استعلام أساسي
      let searchQuery = {};

      // إضافة فلتر الحالة
      if (type === 'jobs') {
        searchQuery.status = 'Open';
      }

      // تطبيق الفلاتر المتقدمة
      searchQuery = filterService.applyFilters(searchQuery, filters, type);

      // تحديد الترتيب
      let sortOption = {};
      if (sort === 'date') {
        sortOption = { createdAt: -1 };
      } else if (sort === 'salary' && type === 'jobs') {
        sortOption = { 'salary.min': -1 };
      }

      // تنفيذ البحث
      const results = await Model.find(searchQuery)
        .select('title description skills company location salary jobType experienceLevel createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();

      // حساب العدد الكلي
      const total = await Model.countDocuments(searchQuery);

      // حساب عدد النتائج لكل فلتر (للعرض في UI)
      const baseQuery = type === 'jobs' ? { status: 'Open' } : {};
      const filterCounts = await filterService.getFilterCounts(
        baseQuery,
        filters,
        type
      );

      // الحصول على الفلاتر المتاحة
      const availableFilters = await filterService.getAvailableFilters(type, filters);

      return {
        results,
        total,
        page,
        pages: Math.ceil(total / limit),
        filters: {
          applied: filters,
          available: availableFilters,
          counts: filterCounts
        }
      };
    } catch (error) {
      console.error('Error in filterOnly:', error);
      throw error;
    }
  }

  /**
   * البحث عن الوظائف في حدود جغرافية محددة
   * @param {Object} bounds - الحدود الجغرافية {north, south, east, west}
   * @param {Object} filters - فلاتر إضافية
   * @returns {Promise<Array>} - قائمة العلامات على الخريطة
   */
  async searchJobsInBounds(bounds, filters = {}) {
    try {
      const JobPosting = require('../models/JobPosting');

      // بناء استعلام أساسي
      let searchQuery = {
        status: 'Open',
        'location.coordinates.coordinates': {
          $exists: true,
          $ne: null
        }
      };

      // إضافة البحث الجغرافي
      // دعم نوعين من البحث: مستطيل (box) أو دائرة (circle)
      if (bounds.type === 'circle') {
        // البحث في دائرة باستخدام $centerSphere
        // radius بالكيلومتر، نحوله إلى radians (km / 6378.1)
        const radiusInRadians = (bounds.radius || 10) / 6378.1;
        
        searchQuery['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [
              [bounds.lng, bounds.lat], // مركز الدائرة [longitude, latitude]
              radiusInRadians
            ]
          }
        };
      } else {
        // البحث في مستطيل (الافتراضي)
        // MongoDB $geoWithin مع $box للبحث في مستطيل
        searchQuery['location.coordinates'] = {
          $geoWithin: {
            $box: [
              [bounds.west, bounds.south], // نقطة الجنوب الغربي [longitude, latitude]
              [bounds.east, bounds.north]  // نقطة الشمال الشرقي [longitude, latitude]
            ]
          }
        };
      }

      // تطبيق الفلاتر الإضافية
      if (filters.salary) {
        if (filters.salary.$gte) {
          searchQuery['salary.min'] = { $gte: filters.salary.$gte };
        }
        if (filters.salary.$lte) {
          searchQuery['salary.max'] = { $lte: filters.salary.$lte };
        }
      }

      if (filters.jobType) {
        searchQuery.jobType = filters.jobType;
      }

      if (filters.experienceLevel) {
        searchQuery.experienceLevel = filters.experienceLevel;
      }

      if (filters.skills) {
        searchQuery.skills = filters.skills;
      }

      if (filters['company.size']) {
        searchQuery['company.size'] = filters['company.size'];
      }

      if (filters.createdAt) {
        searchQuery.createdAt = filters.createdAt;
      }

      // تنفيذ البحث
      const jobs = await JobPosting.find(searchQuery)
        .select('_id title company location salary jobType experienceLevel')
        .lean();

      // تحويل النتائج إلى علامات للخريطة
      const markers = jobs.map(job => {
        // التأكد من وجود coordinates
        const coords = job.location?.coordinates?.coordinates;
        if (!coords || coords.length < 2) {
          return null;
        }

        return {
          id: job._id.toString(),
          position: {
            lat: coords[1], // latitude
            lng: coords[0]  // longitude
          },
          title: job.title,
          company: job.company?.name || 'شركة غير محددة',
          location: job.location?.city || job.location?.type || 'غير محدد',
          salary: job.salary ? `${job.salary.min} - ${job.salary.max}` : 'غير محدد',
          jobType: job.jobType,
          experienceLevel: job.experienceLevel
        };
      }).filter(marker => marker !== null); // إزالة null values

      return markers;
    } catch (error) {
      console.error('Error in searchJobsInBounds:', error);
      throw error;
    }
  }

  /**
   * البحث مع الترتيب حسب نسبة المطابقة
   * @param {string} query - نص البحث (اختياري)
   * @param {Object} userProfile - ملف المستخدم
   * @param {Object} options - خيارات البحث
   * @returns {Promise<Object>} - نتائج البحث مرتبة حسب المطابقة
   */
  async searchWithMatchScore(query, userProfile, options = {}) {
    const {
      type = 'jobs',
      page = 1,
      limit = 20,
      filters = {}
    } = options;

    try {
      // إذا كان هناك نص بحث، نستخدم textSearch
      // وإلا نستخدم filterOnly
      let searchResults;
      if (query && query.trim().length > 0) {
        searchResults = await this.textSearch(query, {
          type,
          page: 1, // نجلب كل النتائج أولاً
          limit: 1000, // حد أقصى للنتائج قبل الترتيب
          sort: 'relevance',
          filters
        });
      } else {
        searchResults = await this.filterOnly({
          type,
          page: 1,
          limit: 1000,
          sort: 'date',
          filters
        });
      }

      // إذا لم يكن هناك ملف مستخدم، نرجع النتائج كما هي
      if (!userProfile) {
        return {
          ...searchResults,
          page,
          pages: Math.ceil(searchResults.total / limit),
          results: searchResults.results.slice((page - 1) * limit, page * limit)
        };
      }

      // ترتيب النتائج حسب نسبة المطابقة
      const rankedResults = this.matchingEngine.rankByMatch(
        searchResults.results,
        userProfile
      );

      // تطبيق pagination على النتائج المرتبة
      const skip = (page - 1) * limit;
      const paginatedResults = rankedResults.slice(skip, skip + limit);

      return {
        results: paginatedResults,
        total: searchResults.total,
        page,
        pages: Math.ceil(searchResults.total / limit),
        filters: searchResults.filters,
        sortedBy: 'match' // إشارة إلى أن النتائج مرتبة حسب المطابقة
      };
    } catch (error) {
      console.error('Error in searchWithMatchScore:', error);
      throw error;
    }
  }

  /**
   * الحصول على MatchingEngine
   * @returns {MatchingEngine}
   */
  getMatchingEngine() {
    return this.matchingEngine;
  }
}

module.exports = new SearchService();
