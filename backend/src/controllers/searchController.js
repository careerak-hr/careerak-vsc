const searchService = require('../services/searchService');

class SearchController {
  /**
   * GET /api/search/autocomplete
   * الحصول على اقتراحات تلقائية للبحث
   */
  async getAutocomplete(req, res) {
    try {
      const { q, type = 'jobs', limit = 10 } = req.query;

      // التحقق من وجود النص
      if (!q) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'يرجى إدخال نص البحث'
          }
        });
      }

      // التحقق من الحد الأدنى للأحرف (3 أحرف)
      if (q.trim().length < 3) {
        return res.json({
          success: true,
          data: {
            suggestions: [],
            message: 'يرجى إدخال 3 أحرف على الأقل'
          }
        });
      }

      // التحقق من نوع البحث
      if (!['jobs', 'courses'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'نوع البحث غير صحيح. يجب أن يكون jobs أو courses'
          }
        });
      }

      // الحصول على معرف المستخدم (إذا كان مسجل دخول)
      const userId = req.user ? req.user._id : null;

      // الحصول على الاقتراحات
      const suggestions = await searchService.getAutocomplete(
        q,
        type,
        userId,
        parseInt(limit) || 10
      );

      res.json({
        success: true,
        data: {
          suggestions,
          query: q,
          type
        }
      });
    } catch (error) {
      console.error('Error in getAutocomplete:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'حدث خطأ أثناء الحصول على الاقتراحات'
        }
      });
    }
  }

  /**
   * GET /api/search/jobs
   * البحث عن الوظائف
   */
  async searchJobs(req, res) {
    try {
      const {
        q,
        page = 1,
        limit = 20,
        sort = 'relevance',
        location,
        salaryMin,
        salaryMax,
        jobType,
        experienceLevel,
        skills,
        companySize,
        datePosted
      } = req.query;

      // التحقق من وجود نص البحث
      if (!q || q.trim().length === 0) {
        return res.json({
          success: true,
          data: {
            results: [],
            total: 0,
            page: 1,
            pages: 0,
            message: 'يرجى إدخال نص البحث'
          }
        });
      }

      // بناء الفلاتر
      const filters = {};

      if (location) {
        filters.location = new RegExp(location, 'i');
      }

      if (salaryMin || salaryMax) {
        filters.salary = {};
        if (salaryMin) filters.salary.$gte = parseInt(salaryMin);
        if (salaryMax) filters.salary.$lte = parseInt(salaryMax);
      }

      if (jobType) {
        filters.jobType = jobType;
      }

      if (experienceLevel) {
        filters.experienceLevel = experienceLevel;
      }

      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        filters.skills = { $in: skillsArray };
      }

      if (companySize) {
        filters['company.size'] = companySize;
      }

      if (datePosted) {
        const now = new Date();
        let dateFilter;

        switch (datePosted) {
          case 'today':
            dateFilter = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateFilter = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateFilter = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            dateFilter = null;
        }

        if (dateFilter) {
          filters.createdAt = { $gte: dateFilter };
        }
      }

      // تنفيذ البحث
      const results = await searchService.textSearch(q, {
        type: 'jobs',
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        filters
      });

      // حفظ في سجل البحث (إذا كان المستخدم مسجل دخول)
      if (req.user) {
        await searchService.saveSearchHistory(
          req.user._id,
          q,
          'jobs',
          filters,
          results.total
        );
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error in searchJobs:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'حدث خطأ أثناء البحث'
        }
      });
    }
  }

  /**
   * GET /api/search/courses
   * البحث عن الدورات
   */
  async searchCourses(req, res) {
    try {
      const {
        q,
        page = 1,
        limit = 20,
        sort = 'relevance'
      } = req.query;

      // التحقق من وجود نص البحث
      if (!q || q.trim().length === 0) {
        return res.json({
          success: true,
          data: {
            results: [],
            total: 0,
            page: 1,
            pages: 0,
            message: 'يرجى إدخال نص البحث'
          }
        });
      }

      // تنفيذ البحث
      const results = await searchService.textSearch(q, {
        type: 'courses',
        page: parseInt(page),
        limit: parseInt(limit),
        sort
      });

      // حفظ في سجل البحث (إذا كان المستخدم مسجل دخول)
      if (req.user) {
        await searchService.saveSearchHistory(
          req.user._id,
          q,
          'courses',
          {},
          results.total
        );
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error in searchCourses:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'حدث خطأ أثناء البحث'
        }
      });
    }
  }


  /**
   * GET /api/search/map
   * البحث عن الوظائف على الخريطة بناءً على حدود جغرافية
   * يدعم نوعين من البحث:
   * 1. مستطيل (box): north, south, east, west
   * 2. دائرة (circle): lat, lng, radius
   */
  async searchJobsOnMap(req, res) {
    try {
      const {
        // للبحث في مستطيل
        north,
        south,
        east,
        west,
        // للبحث في دائرة
        lat,
        lng,
        radius,
        type, // 'box' أو 'circle'
        // فلاتر إضافية
        salaryMin,
        salaryMax,
        jobType,
        experienceLevel,
        skills,
        companySize,
        datePosted
      } = req.query;

      let bounds;

      // تحديد نوع البحث
      if (type === 'circle' || (lat && lng)) {
        // البحث في دائرة
        if (!lat || !lng) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_CIRCLE_PARAMS',
              message: 'يرجى تحديد مركز الدائرة (lat, lng)'
            }
          });
        }

        bounds = {
          type: 'circle',
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: radius ? parseFloat(radius) : 10 // نصف القطر بالكيلومتر (افتراضي 10 كم)
        };

        // التحقق من صحة القيم
        if (isNaN(bounds.lat) || isNaN(bounds.lng) || bounds.lat < -90 || bounds.lat > 90 || bounds.lng < -180 || bounds.lng > 180) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_COORDINATES',
              message: 'الإحداثيات غير صحيحة'
            }
          });
        }

        if (bounds.radius <= 0 || bounds.radius > 500) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_RADIUS',
              message: 'نصف القطر يجب أن يكون بين 0 و 500 كيلومتر'
            }
          });
        }
      } else {
        // البحث في مستطيل (الافتراضي)
        if (!north || !south || !east || !west) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_BOUNDS',
              message: 'يرجى تحديد الحدود الجغرافية (north, south, east, west) أو مركز الدائرة (lat, lng, radius)'
            }
          });
        }

        bounds = {
          type: 'box',
          north: parseFloat(north),
          south: parseFloat(south),
          east: parseFloat(east),
          west: parseFloat(west)
        };

        // التحقق من صحة الحدود
        if (bounds.north <= bounds.south || bounds.east <= bounds.west) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_BOUNDS',
              message: 'الحدود الجغرافية غير صحيحة'
            }
          });
        }
      }

      // بناء الفلاتر
      const filters = {};

      if (salaryMin || salaryMax) {
        filters.salary = {};
        if (salaryMin) filters.salary.$gte = parseInt(salaryMin);
        if (salaryMax) filters.salary.$lte = parseInt(salaryMax);
      }

      if (jobType) {
        filters.jobType = jobType;
      }

      if (experienceLevel) {
        filters.experienceLevel = experienceLevel;
      }

      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        filters.skills = { $in: skillsArray };
      }

      if (companySize) {
        filters['company.size'] = companySize;
      }

      if (datePosted) {
        const now = new Date();
        let dateFilter;

        switch (datePosted) {
          case 'today':
            dateFilter = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateFilter = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateFilter = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            dateFilter = null;
        }

        if (dateFilter) {
          filters.createdAt = { $gte: dateFilter };
        }
      }

      // البحث الجغرافي
      const markers = await searchService.searchJobsInBounds(bounds, filters);

      res.json({
        success: true,
        data: {
          markers,
          bounds
        }
      });
    } catch (error) {
      console.error('Error in searchJobsOnMap:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'حدث خطأ أثناء البحث على الخريطة'
        }
      });
    }
  }

}

module.exports = new SearchController();
