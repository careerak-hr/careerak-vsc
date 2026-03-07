const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');
const realtimeNotificationService = require('../services/realtimeRecommendationNotificationService');
const alertService = require('../services/alertService');
const { addComputedFields } = require('../utils/jobHelpers');

exports.createJobPosting = async (req, res) => {
  try {
    const { title, description, requirements, salary, location, jobType, department } = req.body;
    
    const jobPosting = new JobPosting({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      department,
      postedBy: req.user.id
    });

    await jobPosting.save();
    
    // إرسال إشعارات فورية للمستخدمين المناسبين (بشكل غير متزامن)
    // استخدام الخدمة الجديدة للإشعارات الفورية
    realtimeNotificationService.notifyUsersForNewJob(jobPosting._id)
      .then(result => {
        if (result.success) {
          console.log(`✅ Sent ${result.notified} real-time notifications for job: ${result.jobTitle}`);
          console.log(`📊 Matching users: ${result.matchingUsers}, Average match: ${result.averageMatchScore?.toFixed(1)}%`);
        } else {
          console.error('❌ Failed to send job match notifications:', result.error);
        }
      })
      .catch(err => console.error('❌ Error sending job match notifications:', err));
    
    // معالجة التنبيهات للبحث المحفوظ (بشكل غير متزامن)
    alertService.processNewJob(jobPosting)
      .then(() => {
        console.log(`✅ Processed saved search alerts for job: ${jobPosting.title}`);
      })
      .catch(err => console.error('❌ Error processing saved search alerts:', err));
    
    res.status(201).json({ 
      message: 'Job posting created successfully', 
      data: jobPosting,
      notificationsQueued: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobPostings = async (req, res) => {
  try {
    // استخراج معاملات الفلترة من query parameters
    const {
      search,           // البحث النصي
      field,            // المجال (postingType)
      location,         // الموقع (city أو country)
      jobType,          // نوع العمل
      experienceLevel,  // مستوى الخبرة
      minSalary,        // الحد الأدنى للراتب
      maxSalary,        // الحد الأقصى للراتب
      skills,           // المهارات (مفصولة بفواصل)
      companySize,      // حجم الشركة
      status,           // حالة الوظيفة (Open/Closed)
      page = 1,         // رقم الصفحة
      limit = 10,       // عدد النتائج في الصفحة
      sortBy = 'createdAt', // الترتيب حسب
      sortOrder = 'desc'    // اتجاه الترتيب
    } = req.query;

    // بناء query الفلترة
    const query = {};

    // فلتر الحالة (افتراضياً فقط الوظائف المفتوحة)
    query.status = status || 'Open';

    // البحث النصي
    if (search) {
      query.$text = { $search: search };
    }

    // فلتر المجال (postingType)
    if (field) {
      query.postingType = field;
    }

    // فلتر الموقع
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
        { 'location.type': { $regex: location, $options: 'i' } }
      ];
    }

    // فلتر نوع العمل
    if (jobType) {
      query.jobType = jobType;
    }

    // فلتر مستوى الخبرة
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // فلتر الراتب
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) {
        query.salary.$gte = { min: parseInt(minSalary) };
      }
      if (maxSalary) {
        query.salary.$lte = { max: parseInt(maxSalary) };
      }
    }

    // فلتر المهارات
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    // فلتر حجم الشركة
    if (companySize) {
      query['company.size'] = companySize;
    }

    // حساب pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // بناء sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // إذا كان هناك بحث نصي، أضف score للترتيب
    if (search) {
      sort.score = { $meta: 'textScore' };
    }

    // تنفيذ الاستعلام
    const jobPostings = await JobPosting.find(query)
      .populate('postedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // إضافة الحقول المحسوبة (isNew, timeSincePosted)
    const jobPostingsWithComputed = jobPostings.map(job => addComputedFields(job));

    // حساب العدد الكلي للنتائج
    const total = await JobPosting.countDocuments(query);

    // إرجاع النتائج مع metadata
    res.status(200).json({
      data: jobPostingsWithComputed,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        search,
        field,
        location,
        jobType,
        experienceLevel,
        minSalary,
        maxSalary,
        skills,
        companySize,
        status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobPostingById = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id).populate('postedBy').populate('applicants');
    if (!jobPosting) return res.status(404).json({ error: 'Job posting not found' });
    
    // إضافة الحقول المحسوبة
    const jobWithComputed = addComputedFields(jobPosting);
    
    res.status(200).json(jobWithComputed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJobPosting = async (req, res) => {
  try {
    // جلب الوظيفة القديمة للتحقق من تغيير الحالة
    const oldJob = await JobPosting.findById(req.params.id);
    
    const jobPosting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    // إذا تم تغيير الحالة إلى Closed، إرسال إشعارات للمستخدمين الذين حفظوا الوظيفة
    if (oldJob && oldJob.status !== 'Closed' && req.body.status === 'Closed') {
      notificationService.notifyBookmarkedUsersJobClosed(jobPosting._id)
        .then(result => {
          if (result.success) {
            console.log(`✅ Sent ${result.notified} job closed notifications for: ${result.jobTitle}`);
          } else {
            console.error('❌ Failed to send job closed notifications:', result.error);
          }
        })
        .catch(err => console.error('❌ Error sending job closed notifications:', err));
    }
    
    res.status(200).json({ message: 'Job posting updated', data: jobPosting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJobPosting = async (req, res) => {
  try {
    await JobPosting.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// الحصول على قيم الفلاتر المتاحة
exports.getFilterOptions = async (req, res) => {
  try {
    // جلب القيم الفريدة لكل فلتر
    const [
      postingTypes,
      jobTypes,
      experienceLevels,
      cities,
      countries,
      companySizes,
      skills
    ] = await Promise.all([
      JobPosting.distinct('postingType'),
      JobPosting.distinct('jobType'),
      JobPosting.distinct('experienceLevel'),
      JobPosting.distinct('location.city'),
      JobPosting.distinct('location.country'),
      JobPosting.distinct('company.size'),
      JobPosting.distinct('skills')
    ]);

    // حساب نطاق الرواتب
    const salaryRange = await JobPosting.aggregate([
      {
        $match: {
          'salary.min': { $exists: true, $ne: null },
          'salary.max': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          minSalary: { $min: '$salary.min' },
          maxSalary: { $max: '$salary.max' }
        }
      }
    ]);

    res.status(200).json({
      postingTypes: postingTypes.filter(Boolean),
      jobTypes: jobTypes.filter(Boolean),
      experienceLevels: experienceLevels.filter(Boolean),
      locations: {
        cities: cities.filter(Boolean),
        countries: countries.filter(Boolean)
      },
      companySizes: companySizes.filter(Boolean),
      skills: skills.filter(Boolean).slice(0, 50), // أول 50 مهارة
      salaryRange: salaryRange.length > 0 ? {
        min: salaryRange[0].minSalary,
        max: salaryRange[0].maxSalary
      } : { min: 0, max: 100000 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get applicant count for a job posting
 * GET /api/job-postings/:id/applicant-count
 * Requirements: 9.2 (عداد المتقدمين)
 */
exports.getApplicantCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobPosting = await JobPosting.findById(id).select('applicantCount showApplicantCount');
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job posting not found'
        }
      });
    }
    
    // إذا كانت الشركة لا تريد إظهار العدد، نرجع null
    if (!jobPosting.showApplicantCount) {
      return res.status(200).json({
        success: true,
        data: {
          applicantCount: null,
          visible: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        applicantCount: jobPosting.applicantCount,
        visible: true
      }
    });
    
  } catch (error) {
    console.error('Error getting applicant count:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get applicant count',
        details: error.message
      }
    });
  }
};

/**
 * Toggle applicant count visibility (company only)
 * PATCH /api/job-postings/:id/applicant-count-visibility
 * Requirements: 9.2 (عداد المتقدمين)
 */
exports.toggleApplicantCountVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { showApplicantCount } = req.body;
    
    const jobPosting = await JobPosting.findById(id);
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job posting not found'
        }
      });
    }
    
    // التحقق من أن المستخدم هو صاحب الوظيفة
    if (jobPosting.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to modify this job posting'
        }
      });
    }
    
    jobPosting.showApplicantCount = showApplicantCount;
    await jobPosting.save();
    
    res.status(200).json({
      success: true,
      data: {
        showApplicantCount: jobPosting.showApplicantCount
      },
      message: 'Applicant count visibility updated successfully'
    });
    
  } catch (error) {
    console.error('Error toggling applicant count visibility:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update visibility',
        details: error.message
      }
    });
  }
};
