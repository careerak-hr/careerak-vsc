const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * تنظيف وتعقيم المدخلات من NoSQL Injection
 */
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized input detected: ${key} in ${req.path}`);
  }
});

/**
 * التحقق من صحة معاملات البحث
 */
const validateSearchParams = (req, res, next) => {
  const { q, page, limit, sort } = req.query;

  const errors = [];

  // التحقق من نص البحث
  if (q) {
    // تنظيف النص من HTML tags
    const cleanQuery = validator.escape(q);
    
    // التحقق من الطول
    if (cleanQuery.length > 200) {
      errors.push('نص البحث طويل جداً (الحد الأقصى 200 حرف)');
    }

    // التحقق من الأحرف الخاصة الخطرة
    if (/[<>{}[\]\\]/.test(q)) {
      errors.push('نص البحث يحتوي على أحرف غير مسموح بها');
    }

    // تحديث query بالنص المنظف
    req.query.q = cleanQuery;
  }

  // التحقق من رقم الصفحة
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
      errors.push('رقم الصفحة غير صحيح (يجب أن يكون بين 1 و 10000)');
    }
  }

  // التحقق من عدد النتائج
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('عدد النتائج غير صحيح (يجب أن يكون بين 1 و 100)');
    }
  }

  // التحقق من نوع الترتيب
  if (sort && !['relevance', 'date', 'salary'].includes(sort)) {
    errors.push('نوع الترتيب غير صحيح (relevance, date, salary)');
  }

  // إذا كانت هناك أخطاء، نرجع 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صحيحة',
        details: errors
      }
    });
  }

  next();
};

/**
 * التحقق من صحة معاملات الفلترة
 */
const validateFilterParams = (req, res, next) => {
  const {
    location,
    salaryMin,
    salaryMax,
    jobType,
    experienceLevel,
    skills,
    companySize,
    datePosted
  } = req.query;

  const errors = [];

  // التحقق من الموقع
  if (location) {
    const cleanLocation = validator.escape(location);
    if (cleanLocation.length > 100) {
      errors.push('الموقع طويل جداً (الحد الأقصى 100 حرف)');
    }
    req.query.location = cleanLocation;
  }

  // التحقق من الراتب
  if (salaryMin) {
    const salary = parseInt(salaryMin);
    if (isNaN(salary) || salary < 0 || salary > 1000000) {
      errors.push('الحد الأدنى للراتب غير صحيح (يجب أن يكون بين 0 و 1,000,000)');
    }
  }

  if (salaryMax) {
    const salary = parseInt(salaryMax);
    if (isNaN(salary) || salary < 0 || salary > 1000000) {
      errors.push('الحد الأقصى للراتب غير صحيح (يجب أن يكون بين 0 و 1,000,000)');
    }
  }

  if (salaryMin && salaryMax) {
    const min = parseInt(salaryMin);
    const max = parseInt(salaryMax);
    if (min > max) {
      errors.push('الحد الأدنى للراتب يجب أن يكون أقل من الحد الأقصى');
    }
  }

  // التحقق من نوع العمل
  const validJobTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Contract', 'Internship'];
  if (jobType && !validJobTypes.includes(jobType)) {
    errors.push(`نوع العمل غير صحيح (${validJobTypes.join(', ')})`);
  }

  // التحقق من مستوى الخبرة
  const validExperienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
  if (experienceLevel && !validExperienceLevels.includes(experienceLevel)) {
    errors.push(`مستوى الخبرة غير صحيح (${validExperienceLevels.join(', ')})`);
  }

  // التحقق من المهارات
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    
    // التحقق من عدد المهارات
    if (skillsArray.length > 20) {
      errors.push('عدد المهارات كبير جداً (الحد الأقصى 20 مهارة)');
    }

    // تنظيف كل مهارة
    const cleanSkills = skillsArray.map(skill => {
      const clean = validator.escape(skill);
      if (clean.length > 50) {
        errors.push('اسم المهارة طويل جداً (الحد الأقصى 50 حرف)');
      }
      return clean;
    });

    req.query.skills = cleanSkills;
  }

  // التحقق من حجم الشركة
  const validCompanySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  if (companySize && !validCompanySizes.includes(companySize)) {
    errors.push(`حجم الشركة غير صحيح (${validCompanySizes.join(', ')})`);
  }

  // التحقق من تاريخ النشر
  const validDatePosted = ['today', 'week', 'month', 'all'];
  if (datePosted && !validDatePosted.includes(datePosted)) {
    errors.push(`تاريخ النشر غير صحيح (${validDatePosted.join(', ')})`);
  }

  // إذا كانت هناك أخطاء، نرجع 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صحيحة',
        details: errors
      }
    });
  }

  next();
};

/**
 * التحقق من صحة معاملات الخريطة
 */
const validateMapParams = (req, res, next) => {
  const { north, south, east, west, lat, lng, radius, type } = req.query;

  const errors = [];

  // تحديد نوع البحث
  if (type === 'circle' || (lat && lng)) {
    // البحث في دائرة
    if (!lat || !lng) {
      errors.push('يرجى تحديد مركز الدائرة (lat, lng)');
    } else {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        errors.push('خط العرض (lat) غير صحيح (يجب أن يكون بين -90 و 90)');
      }

      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.push('خط الطول (lng) غير صحيح (يجب أن يكون بين -180 و 180)');
      }

      if (radius) {
        const radiusNum = parseFloat(radius);
        if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 500) {
          errors.push('نصف القطر غير صحيح (يجب أن يكون بين 0 و 500 كيلومتر)');
        }
      }
    }
  } else {
    // البحث في مستطيل
    if (!north || !south || !east || !west) {
      errors.push('يرجى تحديد الحدود الجغرافية (north, south, east, west)');
    } else {
      const northNum = parseFloat(north);
      const southNum = parseFloat(south);
      const eastNum = parseFloat(east);
      const westNum = parseFloat(west);

      if (isNaN(northNum) || northNum < -90 || northNum > 90) {
        errors.push('الحد الشمالي (north) غير صحيح');
      }

      if (isNaN(southNum) || southNum < -90 || southNum > 90) {
        errors.push('الحد الجنوبي (south) غير صحيح');
      }

      if (isNaN(eastNum) || eastNum < -180 || eastNum > 180) {
        errors.push('الحد الشرقي (east) غير صحيح');
      }

      if (isNaN(westNum) || westNum < -180 || westNum > 180) {
        errors.push('الحد الغربي (west) غير صحيح');
      }

      if (northNum <= southNum) {
        errors.push('الحد الشمالي يجب أن يكون أكبر من الحد الجنوبي');
      }

      if (eastNum <= westNum) {
        errors.push('الحد الشرقي يجب أن يكون أكبر من الحد الغربي');
      }
    }
  }

  // إذا كانت هناك أخطاء، نرجع 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صحيحة',
        details: errors
      }
    });
  }

  next();
};

/**
 * التحقق من صحة معاملات الـ Autocomplete
 */
const validateAutocompleteParams = (req, res, next) => {
  const { q, type, limit } = req.query;

  const errors = [];

  // التحقق من نص البحث
  if (!q) {
    errors.push('يرجى إدخال نص البحث');
  } else {
    const cleanQuery = validator.escape(q);
    
    if (cleanQuery.length > 100) {
      errors.push('نص البحث طويل جداً (الحد الأقصى 100 حرف)');
    }

    if (/[<>{}[\]\\]/.test(q)) {
      errors.push('نص البحث يحتوي على أحرف غير مسموح بها');
    }

    req.query.q = cleanQuery;
  }

  // التحقق من نوع البحث
  if (type && !['jobs', 'courses'].includes(type)) {
    errors.push('نوع البحث غير صحيح (jobs, courses)');
  }

  // التحقق من عدد الاقتراحات
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
      errors.push('عدد الاقتراحات غير صحيح (يجب أن يكون بين 1 و 20)');
    }
  }

  // إذا كانت هناك أخطاء، نرجع 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'بيانات غير صحيحة',
        details: errors
      }
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  validateSearchParams,
  validateFilterParams,
  validateMapParams,
  validateAutocompleteParams
};
