/**
 * 🤖 Data Collection Service
 * خدمة جمع البيانات لنظام التوصيات الذكية
 * 
 * تجمع البيانات من قاعدة البيانات لاستخدامها في نماذج التعلم الآلي
 * - بيانات المستخدمين (الملفات الشخصية)
 * - بيانات الوظائف
 * - بيانات الدورات التعليمية
 * - بيانات التفاعلات
 * 
 * المتطلبات: Requirements 6.1 (جمع البيانات)
 */

const { User, Individual, Company } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');
const UserInteraction = require('../models/UserInteraction');

class DataCollectionService {
  /**
   * جمع بيانات المستخدمين (الباحثين عن عمل)
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Array>} قائمة المستخدمين
   */
  async collectUserData(options = {}) {
    try {
      const {
        limit = 1000,
        skip = 0,
        includeInactive = false,
        minCompleteness = 0
      } = options;

      // بناء الاستعلام
      const query = { userType: 'Employee' };
      
      if (!includeInactive) {
        query.accountDisabled = { $ne: true };
      }

      // جلب المستخدمين
      const users = await Individual.find(query)
        .select('-password -otp -emailVerificationToken -twoFactorSecret -backupCodes')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // معالجة البيانات
      const processedUsers = users.map(user => this._processUserData(user));

      // فلترة حسب اكتمال الملف
      const filteredUsers = processedUsers.filter(user => 
        user.completeness >= minCompleteness
      );

      return filteredUsers;
    } catch (error) {
      console.error('Error collecting user data:', error);
      throw new Error(`Failed to collect user data: ${error.message}`);
    }
  }

  /**
   * جمع بيانات الوظائف
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Array>} قائمة الوظائف
   */
  async collectJobData(options = {}) {
    try {
      const {
        limit = 1000,
        skip = 0,
        status = 'Open',
        includeExpired = false
      } = options;

      // بناء الاستعلام
      const query = {};
      
      if (status) {
        query.status = status;
      }

      if (!includeExpired) {
        query.createdAt = { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }; // آخر 90 يوم
      }

      // جلب الوظائف
      const jobs = await JobPosting.find(query)
        .populate('postedBy', 'companyName companyIndustry')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // معالجة البيانات
      const processedJobs = jobs.map(job => this._processJobData(job));

      return processedJobs;
    } catch (error) {
      console.error('Error collecting job data:', error);
      throw new Error(`Failed to collect job data: ${error.message}`);
    }
  }

  /**
   * جمع بيانات الدورات التعليمية
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Array>} قائمة الدورات
   */
  async collectCourseData(options = {}) {
    try {
      const {
        limit = 1000,
        skip = 0,
        status = 'Published',
        includeExpired = false
      } = options;

      // بناء الاستعلام
      const query = {};
      
      if (status) {
        query.status = status;
      }

      if (!includeExpired) {
        const now = new Date();
        query.$or = [
          { endDate: { $gte: now } },
          { endDate: { $exists: false } }
        ];
      }

      // جلب الدورات
      const courses = await EducationalCourse.find(query)
        .populate('instructor', 'firstName lastName companyName')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // معالجة البيانات
      const processedCourses = courses.map(course => this._processCourseData(course));

      return processedCourses;
    } catch (error) {
      console.error('Error collecting course data:', error);
      throw new Error(`Failed to collect course data: ${error.message}`);
    }
  }

  /**
   * جمع بيانات التفاعلات
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Array>} قائمة التفاعلات
   */
  async collectInteractionData(options = {}) {
    try {
      const {
        limit = 10000,
        skip = 0,
        userId = null,
        itemType = null,
        action = null,
        startDate = null,
        endDate = null
      } = options;

      // بناء الاستعلام
      const query = {};
      
      if (userId) {
        query.userId = userId;
      }

      if (itemType) {
        query.itemType = itemType;
      }

      if (action) {
        query.action = action;
      }

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // جلب التفاعلات
      const interactions = await UserInteraction.find(query)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // معالجة البيانات
      const processedInteractions = interactions.map(interaction => 
        this._processInteractionData(interaction)
      );

      return processedInteractions;
    } catch (error) {
      console.error('Error collecting interaction data:', error);
      throw new Error(`Failed to collect interaction data: ${error.message}`);
    }
  }

  /**
   * جمع جميع البيانات دفعة واحدة
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Object>} كائن يحتوي على جميع البيانات
   */
  async collectAllData(options = {}) {
    try {
      const [users, jobs, courses, interactions] = await Promise.all([
        this.collectUserData(options.users || {}),
        this.collectJobData(options.jobs || {}),
        this.collectCourseData(options.courses || {}),
        this.collectInteractionData(options.interactions || {})
      ]);

      return {
        users,
        jobs,
        courses,
        interactions,
        metadata: {
          collectedAt: new Date(),
          counts: {
            users: users.length,
            jobs: jobs.length,
            courses: courses.length,
            interactions: interactions.length
          }
        }
      };
    } catch (error) {
      console.error('Error collecting all data:', error);
      throw new Error(`Failed to collect all data: ${error.message}`);
    }
  }

  /**
   * جمع بيانات User-Item Matrix
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Object>} مصفوفة User-Item
   */
  async collectUserItemMatrix(options = {}) {
    try {
      const { itemType = 'job' } = options;

      // جلب جميع التفاعلات الإيجابية
      const interactions = await this.collectInteractionData({
        itemType,
        action: { $in: ['like', 'apply', 'save'] },
        ...options
      });

      // بناء المصفوفة
      const matrix = {};
      
      interactions.forEach(interaction => {
        const userId = interaction.userId.toString();
        const itemId = interaction.itemId.toString();
        
        if (!matrix[userId]) {
          matrix[userId] = {};
        }
        
        // حساب الوزن بناءً على نوع التفاعل
        const weight = this._getInteractionWeight(interaction.action);
        matrix[userId][itemId] = (matrix[userId][itemId] || 0) + weight;
      });

      return {
        matrix,
        metadata: {
          itemType,
          totalUsers: Object.keys(matrix).length,
          totalItems: new Set(
            Object.values(matrix).flatMap(items => Object.keys(items))
          ).size,
          totalInteractions: interactions.length,
          collectedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error collecting user-item matrix:', error);
      throw new Error(`Failed to collect user-item matrix: ${error.message}`);
    }
  }

  /**
   * جمع إحصائيات البيانات
   * @returns {Promise<Object>} إحصائيات شاملة
   */
  async collectDataStatistics() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalJobs,
        openJobs,
        totalCourses,
        publishedCourses,
        totalInteractions,
        recentInteractions
      ] = await Promise.all([
        Individual.countDocuments(),
        Individual.countDocuments({ accountDisabled: { $ne: true } }),
        JobPosting.countDocuments(),
        JobPosting.countDocuments({ status: 'Open' }),
        EducationalCourse.countDocuments(),
        EducationalCourse.countDocuments({ status: 'Published' }),
        UserInteraction.countDocuments(),
        UserInteraction.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          closed: totalJobs - openJobs
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          unpublished: totalCourses - publishedCourses
        },
        interactions: {
          total: totalInteractions,
          recent: recentInteractions,
          old: totalInteractions - recentInteractions
        },
        collectedAt: new Date()
      };
    } catch (error) {
      console.error('Error collecting data statistics:', error);
      throw new Error(`Failed to collect data statistics: ${error.message}`);
    }
  }

  // ==================== Private Methods ====================

  /**
   * معالجة بيانات المستخدم
   * @private
   */
  _processUserData(user) {
    // استخراج المهارات
    const skills = [
      ...(user.computerSkills || []).map(s => s.skill),
      ...(user.softwareSkills || []).map(s => s.software),
      ...(user.otherSkills || [])
    ].filter(Boolean);

    // استخراج الخبرات
    const experiences = (user.experienceList || []).map(exp => ({
      company: exp.company,
      position: exp.position,
      duration: this._calculateDuration(exp.from, exp.to),
      workType: exp.workType,
      jobLevel: exp.jobLevel
    }));

    // استخراج التعليم
    const education = (user.educationList || []).map(edu => ({
      level: edu.level,
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year
    }));

    // حساب اكتمال الملف
    const completeness = this._calculateProfileCompleteness(user);

    return {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      city: user.city,
      specialization: user.specialization,
      interests: user.interests || [],
      bio: user.bio,
      skills,
      experiences,
      education,
      languages: user.languages || [],
      completeness,
      createdAt: user.createdAt
    };
  }

  /**
   * معالجة بيانات الوظيفة
   * @private
   */
  _processJobData(job) {
    // استخراج المهارات المطلوبة من الوصف والمتطلبات
    const requiredSkills = this._extractSkillsFromText(
      `${job.title} ${job.description} ${job.requirements}`
    );

    return {
      jobId: job._id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      postingType: job.postingType,
      priceType: job.priceType,
      salary: job.salary,
      location: job.location,
      jobType: job.jobType,
      status: job.status,
      company: job.postedBy ? {
        id: job.postedBy._id,
        name: job.postedBy.companyName,
        industry: job.postedBy.companyIndustry
      } : null,
      requiredSkills,
      createdAt: job.createdAt
    };
  }

  /**
   * معالجة بيانات الدورة
   * @private
   */
  _processCourseData(course) {
    // استخراج المهارات من المحتوى
    const skills = this._extractSkillsFromText(
      `${course.title} ${course.description} ${course.content || ''}`
    );

    return {
      courseId: course._id,
      title: course.title,
      description: course.description,
      content: course.content,
      category: course.category,
      duration: course.duration,
      level: course.level,
      instructor: course.instructor ? {
        id: course.instructor._id,
        name: course.instructor.firstName 
          ? `${course.instructor.firstName} ${course.instructor.lastName}`
          : course.instructor.companyName
      } : null,
      skills,
      maxParticipants: course.maxParticipants,
      enrolledCount: course.enrolledParticipants?.length || 0,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
      createdAt: course.createdAt
    };
  }

  /**
   * معالجة بيانات التفاعل
   * @private
   */
  _processInteractionData(interaction) {
    return {
      interactionId: interaction._id,
      userId: interaction.userId,
      itemType: interaction.itemType,
      itemId: interaction.itemId,
      action: interaction.action,
      duration: interaction.duration,
      timestamp: interaction.timestamp,
      context: {
        sourcePage: interaction.context?.sourcePage,
        displayType: interaction.context?.displayType,
        position: interaction.context?.position,
        originalScore: interaction.context?.originalScore
      },
      weight: this._getInteractionWeight(interaction.action)
    };
  }

  /**
   * حساب مدة الخبرة
   * @private
   */
  _calculateDuration(from, to) {
    if (!from) return 0;
    
    const start = new Date(from);
    const end = to ? new Date(to) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 
                  + (end.getMonth() - start.getMonth());
    
    return Math.max(0, months);
  }

  /**
   * حساب اكتمال الملف الشخصي
   * @private
   */
  _calculateProfileCompleteness(user) {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'country',
      'city',
      'specialization',
      'bio',
      'profileImage'
    ];

    const arrayFields = [
      'interests',
      'educationList',
      'experienceList',
      'trainingList',
      'languages',
      'computerSkills',
      'softwareSkills',
      'otherSkills'
    ];

    let filledCount = 0;
    const totalCount = fields.length + arrayFields.length;

    // فحص الحقول العادية
    fields.forEach(field => {
      if (user[field]) filledCount++;
    });

    // فحص الحقول المصفوفة
    arrayFields.forEach(field => {
      if (user[field] && user[field].length > 0) filledCount++;
    });

    return Math.round((filledCount / totalCount) * 100);
  }

  /**
   * استخراج المهارات من النص
   * @private
   */
  _extractSkillsFromText(text) {
    if (!text) return [];

    // قائمة مهارات شائعة (يمكن توسيعها)
    const commonSkills = [
      // Programming
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin',
      'typescript', 'go', 'rust', 'scala', 'r', 'matlab',
      
      // Web Development
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django',
      'flask', 'spring', 'laravel', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
      
      // Mobile Development
      'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
      
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite',
      'cassandra', 'elasticsearch',
      
      // DevOps & Cloud
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git', 'ci/cd',
      'terraform', 'ansible',
      
      // Data Science & AI
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
      'pandas', 'numpy', 'data analysis', 'statistics', 'nlp', 'computer vision',
      
      // Design
      'photoshop', 'illustrator', 'figma', 'sketch', 'adobe xd', 'ui/ux',
      
      // Office & Business
      'excel', 'word', 'powerpoint', 'outlook', 'project management', 'agile',
      'scrum', 'jira', 'trello',
      
      // Soft Skills
      'communication', 'leadership', 'teamwork', 'problem solving', 'time management',
      'critical thinking', 'creativity'
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = commonSkills.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );

    return [...new Set(foundSkills)]; // إزالة التكرار
  }

  /**
   * حساب وزن التفاعل
   * @private
   */
  _getInteractionWeight(action) {
    const weights = {
      'apply': 2.0,  // تقديم = وزن عالي
      'like': 1.5,   // إعجاب = وزن متوسط
      'save': 1.2,   // حفظ = وزن متوسط منخفض
      'view': 0.5,   // مشاهدة = وزن منخفض
      'ignore': -1.0 // تجاهل = وزن سلبي
    };

    return weights[action] || 0;
  }
}

// تصدير instance واحد من الخدمة
module.exports = new DataCollectionService();
