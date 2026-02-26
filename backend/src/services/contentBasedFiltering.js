/**
 * 🤖 Content-Based Filtering Service
 * خدمة التصفية القائمة على المحتوى لتوصيات الوظائف
 * 
 * تنفذ خوارزمية Content-Based Filtering لحساب التشابه بين ملف المستخدم والوظائف
 * وتقديم توصيات مخصصة مع نسبة تطابق (0-100%)
 * 
 * المتطلبات: 1.1, 1.4 (توصيات مخصصة بناءً على: المهارات، الخبرة، التعليم، الموقع)
 */

class ContentBasedFiltering {
  constructor() {
    // أوزان المعايير للتوصيات
    this.matchingWeights = {
      skills: 0.35,      // المهارات (35%)
      experience: 0.25,  // الخبرة (25%)
      education: 0.15,   // التعليم (15%)
      location: 0.10,    // الموقع (10%)
      salary: 0.10,      // الراتب (10%)
      jobType: 0.05      // نوع العمل (5%)
    };
    
    // قاموس المهارات والمرادفات
    this.skillsSynonyms = {
      'javascript': ['js', 'جافاسكريبت', 'جافا سكريبت'],
      'python': ['بايثون', 'python3'],
      'react': ['reactjs', 'ريأكت'],
      'nodejs': ['node.js', 'نود جي اس'],
      'database': ['قاعدة بيانات', 'قواعد البيانات', 'db'],
      'frontend': ['واجهة أمامية', 'front-end'],
      'backend': ['واجهة خلفية', 'back-end'],
      'mobile': ['تطبيقات الجوال', 'موبايل'],
      'design': ['تصميم', 'ديزاين'],
      'marketing': ['تسويق', 'تسويق رقمي']
    };
  }
  
  /**
   * استخراج الميزات (Features) من ملف المستخدم
   * @param {Object} user - بيانات المستخدم
   * @returns {Object} - الميزات المستخرجة
   */
  extractUserFeatures(user) {
    return {
      skills: this.extractUserSkills(user),
      experience: this.extractUserExperience(user),
      education: this.extractUserEducation(user),
      location: this.extractUserLocation(user),
      preferences: this.extractUserPreferences(user)
    };
  }
  
  /**
   * استخراج الميزات من الوظيفة
   * @param {Object} job - بيانات الوظيفة
   * @returns {Object} - الميزات المستخرجة
   */
  extractJobFeatures(job) {
    return {
      requiredSkills: this.extractJobSkills(job),
      experienceLevel: this.extractJobExperience(job),
      educationRequirements: this.extractJobEducation(job),
      location: this.extractJobLocation(job),
      salary: this.extractJobSalary(job),
      jobType: this.extractJobType(job)
    };
  }
  
  /**
   * حساب التشابه بين المستخدم والوظيفة
   * @param {Object} userFeatures - ميزات المستخدم
   * @param {Object} jobFeatures - ميزات الوظيفة
   * @returns {Object} - درجات التطابق والنسبة الإجمالية (0-100%)
   */
  calculateSimilarity(userFeatures, jobFeatures) {
    const scores = {
      skills: this.calculateSkillsSimilarity(userFeatures.skills, jobFeatures.requiredSkills),
      experience: this.calculateExperienceSimilarity(userFeatures.experience, jobFeatures.experienceLevel),
      education: this.calculateEducationSimilarity(userFeatures.education, jobFeatures.educationRequirements),
      location: this.calculateLocationSimilarity(userFeatures.location, jobFeatures.location),
      salary: this.calculateSalarySimilarity(userFeatures.preferences, jobFeatures.salary),
      jobType: this.calculateJobTypeSimilarity(userFeatures.preferences, jobFeatures.jobType)
    };
    
    // حساب النسبة الإجمالية (0-100%)
    const overallScore = this.calculateOverallScore(scores);
    
    return {
      scores,
      overall: overallScore,
      percentage: Math.round(overallScore * 100)
    };
  }
  
  /**
   * ترتيب الوظائف حسب التطابق مع المستخدم وحفظ التوصيات
   * @param {Object} user - بيانات المستخدم
   * @param {Array} jobs - قائمة الوظائف
   * @param {Object} options - خيارات إضافية
   * @returns {Array} - الوظائف المرتبة مع نسب التطابق وأسباب التوصية
   */
  async rankJobsByMatch(user, jobs, options = {}) {
    const userFeatures = this.extractUserFeatures(user);
    const rankedJobs = [];
    
    for (const job of jobs) {
      const jobFeatures = this.extractJobFeatures(job);
      const similarity = this.calculateSimilarity(userFeatures, jobFeatures);
      
      // تصفية حسب الحد الأدنى للتطابق إذا تم تحديده
      if (options.minScore && similarity.overall < options.minScore) {
        continue;
      }
      
      // توليد أسباب التوصية
      const reasons = this.generateMatchReasons(userFeatures, jobFeatures, similarity.scores);
      
      // التأكد من وجود سبب واحد على الأقل (Property 3: Explanation Completeness)
      if (reasons.length === 0) {
        let message = 'هذه الوظيفة قد تكون مناسبة لملفك الشخصي';
        let strength = 'low';
        
        if (similarity.overall > 0.5) {
          message = 'هذه الوظيفة تتوافق مع ملفك الشخصي بشكل جيد';
          strength = 'medium';
        } else if (similarity.overall > 0.3) {
          message = 'هذه الوظيفة تتوافق مع ملفك الشخصي بشكل عام';
          strength = 'low';
        } else {
          message = 'هذه الوظيفة قد تكون فرصة لتطوير مهاراتك';
          strength = 'low';
        }
        
        reasons.push({
          type: 'general',
          message,
          strength,
          details: {
            overallScore: similarity.overall,
            matchPercentage: similarity.percentage
          }
        });
      }
      
      rankedJobs.push({
        job,
        matchScore: similarity,
        reasons,
        features: {
          user: userFeatures,
          job: jobFeatures
        }
      });
    }
    
    // ترتيب تنازلي حسب نسبة التطابق
    rankedJobs.sort((a, b) => b.matchScore.overall - a.matchScore.overall);
    
    // تحديد الحد الأقصى إذا تم تحديده
    const limitedJobs = options.limit ? rankedJobs.slice(0, options.limit) : rankedJobs;
    
    // حفظ التوصيات في قاعدة البيانات إذا طُلب ذلك
    if (options.saveToDB && user._id) {
      await this.saveRecommendationsToDB(user._id, limitedJobs, options);
    }
    
    return limitedJobs;
  }
  
  /**
   * حفظ التوصيات في قاعدة البيانات
   * @param {string} userId - معرف المستخدم
   * @param {Array} recommendations - قائمة التوصيات
   * @param {Object} options - خيارات إضافية
   */
  async saveRecommendationsToDB(userId, recommendations, options = {}) {
    try {
      // استيراد ديناميكي لتجنب مشاكل التبعية الدائرية
      let Recommendation;
      try {
        Recommendation = require('../models/Recommendation');
      } catch (error) {
        console.warn('⚠️ Recommendation model not available, skipping save to DB');
        return;
      }
      
      const recommendationDocs = recommendations.map((rec, index) => ({
        userId,
        itemType: 'job',
        itemId: rec.job._id,
        score: rec.matchScore.percentage,
        confidence: rec.matchScore.overall,
        reasons: rec.reasons.map(reason => ({
          type: reason.type,
          message: reason.message,
          strength: reason.strength,
          details: reason.details || {}
        })),
        features: rec.features,
        modelVersion: '1.0',
        metadata: {
          algorithm: 'content_based',
          ranking: index + 1,
          seen: false,
          clicked: false,
          applied: false
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // أسبوع واحد
      }));
      
      // حذف التوصيات القديمة للمستخدم
      await Recommendation.deleteMany({ userId, itemType: 'job' });
      
      // حفظ التوصيات الجديدة
      await Recommendation.insertMany(recommendationDocs);
      
      console.log(`✅ تم حفظ ${recommendationDocs.length} توصية للمستخدم ${userId}`);
      
    } catch (error) {
      console.error('❌ خطأ في حفظ التوصيات:', error.message);
      // لا نرمي الخطأ حتى لا نؤثر على تجربة المستخدم
    }
  }
  
  /**
   * جلب التوصيات المحفوظة من قاعدة البيانات
   * @param {string} userId - معرف المستخدم
   * @param {Object} options - خيارات إضافية
   * @returns {Array} - التوصيات المحفوظة
   */
  async getSavedRecommendations(userId, options = {}) {
    try {
      // استيراد ديناميكي لتجنب مشاكل التبعية الدائرية
      let Recommendation;
      try {
        Recommendation = require('../models/Recommendation');
      } catch (error) {
        console.warn('⚠️ Recommendation model not available, returning empty array');
        return [];
      }
      
      const query = {
        userId,
        itemType: 'job',
        expiresAt: { $gt: new Date() }
      };
      
      if (options.minScore) {
        query.score = { $gte: options.minScore };
      }
      
      if (options.excludeSeen) {
        query['metadata.seen'] = false;
      }
      
      const recommendations = await Recommendation.find(query)
        .sort({ score: -1, 'metadata.ranking': 1 })
        .limit(options.limit || 20)
        .populate('itemId')
        .exec();
      
      // تحويل إلى تنسيق متوافق مع rankJobsByMatch
      return recommendations.map(rec => ({
        job: rec.itemId,
        matchScore: {
          percentage: rec.score,
          overall: rec.confidence,
          scores: rec.features?.similarity || {}
        },
        reasons: rec.reasons,
        features: rec.features,
        savedAt: rec.createdAt
      }));
      
    } catch (error) {
      console.error('❌ خطأ في جلب التوصيات المحفوظة:', error.message);
      return [];
    }
  }
  
  /**
   * حساب النسبة الإجمالية باستخدام الأوزان
   * @param {Object} scores - درجات المكونات
   * @returns {number} - النسبة الإجمالية (0-1)
   */
  calculateOverallScore(scores) {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [component, score] of Object.entries(scores)) {
      const weight = this.matchingWeights[component] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
  
  /**
   * توليد أسباب التطابق (مُحسّن)
   * @param {Object} userFeatures - ميزات المستخدم
   * @param {Object} jobFeatures - ميزات الوظيفة
   * @param {Object} scores - درجات المكونات
   * @returns {Array} - قائمة أسباب التطابق مع تفاصيل
   */
  generateMatchReasons(userFeatures, jobFeatures, scores) {
    const reasons = [];
    
    // 1. أسباب المهارات (مفصلة)
    if (scores.skills > 0) {
      const skillReasons = this.generateSkillReasons(userFeatures.skills, jobFeatures.requiredSkills, scores.skills);
      reasons.push(...skillReasons);
    }
    
    // 2. أسباب الخبرة (مفصلة)
    if (scores.experience > 0) {
      const experienceReasons = this.generateExperienceReasons(userFeatures.experience, jobFeatures.experienceLevel, scores.experience);
      reasons.push(...experienceReasons);
    }
    
    // 3. أسباب التعليم (مفصلة)
    if (scores.education > 0) {
      const educationReasons = this.generateEducationReasons(userFeatures.education, jobFeatures.educationRequirements, scores.education);
      reasons.push(...educationReasons);
    }
    
    // 4. أسباب الموقع (مفصلة)
    if (scores.location > 0) {
      const locationReasons = this.generateLocationReasons(userFeatures.location, jobFeatures.location, scores.location);
      reasons.push(...locationReasons);
    }
    
    // 5. أسباب الراتب (إذا كانت البيانات متوفرة)
    if (scores.salary > 0.5 && jobFeatures.salary.min) {
      reasons.push({
        type: 'salary',
        message: `الراتب المقدم (${jobFeatures.salary.min}-${jobFeatures.salary.max}) مناسب لمستوى الوظيفة`,
        strength: 'medium',
        details: {
          minSalary: jobFeatures.salary.min,
          maxSalary: jobFeatures.salary.max
        }
      });
    }
    
    // 6. أسباب نوع العمل
    if (scores.jobType > 0.7) {
      reasons.push({
        type: 'jobType',
        message: `نوع العمل (${jobFeatures.jobType}) يتناسب مع تفضيلاتك`,
        strength: 'medium',
        details: {
          jobType: jobFeatures.jobType
        }
      });
    }
    
    // 7. إذا لم يكن هناك أسباب، نقدم سبب عام (حتى مع درجات منخفضة)
    if (reasons.length === 0) {
      let message = 'هذه الوظيفة قد تكون مناسبة لملفك الشخصي';
      let strength = 'low';
      
      if (scores.overall > 0.5) {
        message = 'هذه الوظيفة تتوافق مع ملفك الشخصي بشكل جيد';
        strength = 'medium';
      } else if (scores.overall > 0.3) {
        message = 'هذه الوظيفة تتوافق مع ملفك الشخصي بشكل عام';
        strength = 'low';
      } else {
        message = 'هذه الوظيفة قد تكون فرصة لتطوير مهاراتك';
        strength = 'low';
      }
      
      reasons.push({
        type: 'general',
        message,
        strength,
        details: {
          overallScore: scores.overall,
          matchPercentage: Math.round(scores.overall * 100)
        }
      });
    }
    
    // 8. ترتيب الأسباب حسب القوة
    return reasons.sort((a, b) => {
      const strengthOrder = { high: 3, medium: 2, low: 1 };
      return (strengthOrder[b.strength] || 0) - (strengthOrder[a.strength] || 0);
    });
  }
  
  /**
   * توليد أسباب المهارات المفصلة
   */
  generateSkillReasons(userSkills, jobSkills, score) {
    const reasons = [];
    
    if (!jobSkills.length || !userSkills.length) return reasons;
    
    // إيجاد المهارات المتطابقة
    const matchedSkills = [];
    userSkills.forEach(userSkill => {
      jobSkills.forEach(jobSkill => {
        if (this.areSkillsSimilar(userSkill.name, jobSkill.name)) {
          matchedSkills.push({
            userSkill: userSkill.name,
            jobSkill: jobSkill.name,
            proficiency: userSkill.proficiency,
            importance: jobSkill.importance || 1
          });
        }
      });
    });
    
    if (matchedSkills.length > 0) {
      // تجميع المهارات حسب الفئة
      const skillsByCategory = {};
      matchedSkills.forEach(skill => {
        const category = this.getSkillCategory(skill.userSkill);
        if (!skillsByCategory[category]) skillsByCategory[category] = [];
        skillsByCategory[category].push(skill);
      });
      
      // إنشاء أسباب لكل فئة
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        const topSkills = skills.slice(0, 3).map(s => s.userSkill);
        const strength = score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low';
        
        reasons.push({
          type: 'skills',
          message: `مهارات ${category} (${topSkills.join('، ')}) تتطابق مع متطلبات الوظيفة`,
          strength,
          details: {
            category,
            matchedCount: skills.length,
            totalRequired: jobSkills.length,
            matchPercentage: Math.round((skills.length / jobSkills.length) * 100),
            topSkills
          }
        });
      });
    }
    
    return reasons;
  }
  
  /**
   * توليد أسباب الخبرة المفصلة
   */
  generateExperienceReasons(userExperience, jobExperience, score) {
    const reasons = [];
    
    if (userExperience.totalYears >= jobExperience.minYears) {
      const strength = score > 0.9 ? 'high' : 'medium';
      reasons.push({
        type: 'experience',
        message: `خبرتك (${userExperience.totalYears} سنوات) ${userExperience.totalYears > jobExperience.minYears ? 'تتجاوز' : 'تتوافق مع'} المتطلبات (${jobExperience.minYears} سنوات)`,
        strength,
        details: {
          userYears: userExperience.totalYears,
          requiredYears: jobExperience.minYears,
          difference: userExperience.totalYears - jobExperience.minYears,
          level: jobExperience.level
        }
      });
    } else if (userExperience.totalYears > 0) {
      reasons.push({
        type: 'experience',
        message: `لديك ${userExperience.totalYears} سنوات خبرة من أصل ${jobExperience.minYears} سنة مطلوبة`,
        strength: 'low',
        details: {
          userYears: userExperience.totalYears,
          requiredYears: jobExperience.minYears,
          percentage: Math.round((userExperience.totalYears / jobExperience.minYears) * 100),
          gap: jobExperience.minYears - userExperience.totalYears
        }
      });
    }
    
    // أسباب إضافية للصناعة أو المنصب
    if (userExperience.industries.length > 0) {
      reasons.push({
        type: 'industry',
        message: `خبرتك في ${userExperience.industries.slice(0, 2).join('، ')} تضيف قيمة لهذا المنصب`,
        strength: 'medium',
        details: {
          industries: userExperience.industries,
          positions: userExperience.positions
        }
      });
    }
    
    return reasons;
  }
  
  /**
   * توليد أسباب التعليم المفصلة
   */
  generateEducationReasons(userEducation, jobEducation, score) {
    const reasons = [];
    
    const degreeHierarchy = {
      'دكتوراه': 5, 'ماجستير': 4, 'بكالوريوس': 3, 'دبلوم': 2, 'ثانوية': 1, 'none': 0
    };
    
    const userScore = degreeHierarchy[userEducation.highestDegree] || 0;
    const jobScore = degreeHierarchy[jobEducation.requiredDegree] || 0;
    
    if (userScore >= jobScore && userScore > 0) {
      const strength = userScore > jobScore ? 'high' : 'medium';
      reasons.push({
        type: 'education',
        message: `مؤهلك (${userEducation.highestDegree}) ${userScore > jobScore ? 'يتجاوز' : 'يتوافق مع'} المتطلبات (${jobEducation.requiredDegree})`,
        strength,
        details: {
          userDegree: userEducation.highestDegree,
          requiredDegree: jobEducation.requiredDegree,
          fields: userEducation.fields
        }
      });
    } else if (userScore > 0) {
      reasons.push({
        type: 'education',
        message: `مؤهلك (${userEducation.highestDegree}) قريب من المتطلبات (${jobEducation.requiredDegree})`,
        strength: 'low',
        details: {
          userDegree: userEducation.highestDegree,
          requiredDegree: jobEducation.requiredDegree,
          gap: jobScore - userScore
        }
      });
    }
    
    return reasons;
  }
  
  /**
   * توليد أسباب الموقع المفصلة
   */
  generateLocationReasons(userLocation, jobLocation, score) {
    const reasons = [];
    
    if (userLocation.city && jobLocation.city && userLocation.city === jobLocation.city) {
      reasons.push({
        type: 'location',
        message: `الوظيفة في ${userLocation.city}، نفس مدينتك`,
        strength: 'high',
        details: {
          matchType: 'exact_city',
          userCity: userLocation.city,
          jobCity: jobLocation.city,
          userCountry: userLocation.country,
          jobCountry: jobLocation.country
        }
      });
    } else if (userLocation.country && jobLocation.country && userLocation.country === jobLocation.country) {
      reasons.push({
        type: 'location',
        message: `الوظيفة في ${jobLocation.country}، نفس بلدك`,
        strength: 'medium',
        details: {
          matchType: 'same_country',
          userCity: userLocation.city,
          jobCity: jobLocation.city,
          userCountry: userLocation.country,
          jobCountry: jobLocation.country
        }
      });
    } else if (score > 0.3) {
      reasons.push({
        type: 'location',
        message: `الموقع الجغرافي للوظيفة قد يكون مناسباً لتفضيلاتك`,
        strength: 'low',
        details: {
          matchType: 'partial',
          userCity: userLocation.city,
          jobCity: jobLocation.city,
          userCountry: userLocation.country,
          jobCountry: jobLocation.country
        }
      });
    }
    
    return reasons;
  }
  
  // ===== طرق مساعدة لاستخراج الميزات =====
  
  /**
   * استخراج مهارات المستخدم
   */
  extractUserSkills(user) {
    const skills = [];
    
    // مهارات الحاسوب
    if (user.computerSkills && Array.isArray(user.computerSkills)) {
      skills.push(...user.computerSkills.map(skill => ({
        name: skill.skill,
        proficiency: skill.proficiency,
        category: 'computer'
      })));
    }
    
    // مهارات البرامج
    if (user.softwareSkills && Array.isArray(user.softwareSkills)) {
      skills.push(...user.softwareSkills.map(skill => ({
        name: skill.software,
        proficiency: skill.proficiency,
        category: 'software'
      })));
    }
    
    // مهارات أخرى
    if (user.otherSkills && Array.isArray(user.otherSkills)) {
      skills.push(...user.otherSkills.map(skill => ({
        name: skill,
        proficiency: 'intermediate', // قيمة افتراضية
        category: 'other'
      })));
    }
    
    return skills;
  }
  
  /**
   * استخراج خبرة المستخدم
   */
  extractUserExperience(user) {
    if (!user.experienceList || !Array.isArray(user.experienceList)) {
      return {
        totalYears: 0,
        industries: [],
        positions: [],
        companies: []
      };
    }
    
    let totalYears = 0;
    const industries = new Set();
    const positions = new Set();
    const companies = new Set();
    
    user.experienceList.forEach(exp => {
      // حساب سنوات الخبرة
      if (exp.from && exp.to) {
        const from = new Date(exp.from);
        const to = new Date(exp.to);
        const years = (to - from) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += Math.max(0, years);
      }
      
      // جمع الصناعات والمناصب والشركات
      if (exp.position) positions.add(exp.position);
      if (exp.company) companies.add(exp.company);
      // يمكن إضافة استخراج الصناعة من الوصف لاحقاً
    });
    
    return {
      totalYears: Math.round(totalYears * 10) / 10, // تقريب لأقرب عشر
      industries: Array.from(industries),
      positions: Array.from(positions),
      companies: Array.from(companies)
    };
  }
  
  /**
   * استخراج تعليم المستخدم
   */
  extractUserEducation(user) {
    if (!user.educationList || !Array.isArray(user.educationList)) {
      return {
        highestDegree: 'none',
        fields: [],
        institutions: []
      };
    }
    
    const degrees = [];
    const fields = new Set();
    const institutions = new Set();
    
    user.educationList.forEach(edu => {
      if (edu.degree) degrees.push(edu.degree);
      if (edu.level) fields.add(edu.level);
      if (edu.institution) institutions.add(edu.institution);
    });
    
    // تحديد أعلى درجة تعليمية
    const degreeHierarchy = {
      'دكتوراه': 5,
      'ماجستير': 4,
      'بكالوريوس': 3,
      'دبلوم': 2,
      'ثانوية': 1,
      'إعدادية': 0
    };
    
    let highestDegree = 'none';
    let highestScore = -1;
    
    degrees.forEach(degree => {
      const score = degreeHierarchy[degree] || 0;
      if (score > highestScore) {
        highestScore = score;
        highestDegree = degree;
      }
    });
    
    return {
      highestDegree,
      fields: Array.from(fields),
      institutions: Array.from(institutions)
    };
  }
  
  /**
   * استخراج موقع المستخدم
   */
  extractUserLocation(user) {
    return {
      city: user.city || '',
      country: user.country || 'Egypt'
    };
  }
  
  /**
   * استخراج تفضيلات المستخدم
   */
  extractUserPreferences(user) {
    // يمكن توسيع هذا ليشمل تفضيلات الراتب ونوع العمل من بيانات المستخدم
    return {
      preferredSalary: null, // يمكن إضافته لاحقاً
      preferredJobType: null // يمكن إضافته لاحقاً
    };
  }
  
  /**
   * استخراج مهارات الوظيفة من الوصف والمتطلبات
   */
  extractJobSkills(job) {
    const text = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const extractedSkills = [];
    
    // البحث عن المهارات المعروفة
    Object.entries(this.skillsSynonyms).forEach(([skill, synonyms]) => {
      const allVariants = [skill, ...synonyms];
      
      if (allVariants.some(variant => text.includes(variant.toLowerCase()))) {
        extractedSkills.push({
          name: skill,
          importance: 1.0, // أهمية افتراضية
          category: this.getSkillCategory(skill)
        });
      }
    });
    
    return extractedSkills;
  }
  
  /**
   * استخراج مستوى الخبرة المطلوب من الوظيفة
   */
  extractJobExperience(job) {
    const text = `${job.requirements || ''}`.toLowerCase();
    const experiencePatterns = [
      { pattern: /(\d+)\s*سنة/g, years: 1 },
      { pattern: /(\d+)\s*years?/gi, years: 1 },
      { pattern: /(\d+)\s*عام/g, years: 1 },
      { pattern: /خبرة/g, years: 2 }, // إذا ذكرت كلمة خبرة بدون سنوات
      { pattern: /experience/gi, years: 2 }
    ];
    
    let minExperience = 0;
    
    experiencePatterns.forEach(({ pattern, years }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const yearMatch = match.match(/\d+/);
          if (yearMatch) {
            const yearsNum = parseInt(yearMatch[0]);
            minExperience = Math.max(minExperience, yearsNum);
          } else {
            minExperience = Math.max(minExperience, years);
          }
        });
      }
    });
    
    return {
      minYears: minExperience,
      level: this.getExperienceLevel(minExperience)
    };
  }
  
  /**
   * استخراج متطلبات التعليم من الوظيفة
   */
  extractJobEducation(job) {
    const text = `${job.requirements || ''}`.toLowerCase();
    const educationKeywords = {
      'دكتوراه': 'دكتوراه',
      'ماجستير': 'ماجستير',
      'بكالوريوس': 'بكالوريوس',
      'دبلوم': 'دبلوم',
      'ثانوية': 'ثانوية',
      'phd': 'دكتوراه',
      'master': 'ماجستير',
      'bachelor': 'بكالوريوس',
      'diploma': 'دبلوم'
    };
    
    let requiredDegree = 'none';
    
    for (const [keyword, degree] of Object.entries(educationKeywords)) {
      if (text.includes(keyword.toLowerCase())) {
        requiredDegree = degree;
        break;
      }
    }
    
    return {
      requiredDegree,
      fields: [] // يمكن استخراج التخصصات لاحقاً
    };
  }
  
  /**
   * استخراج موقع الوظيفة
   */
  extractJobLocation(job) {
    return {
      city: this.extractCityFromText(job.location || ''),
      country: this.extractCountryFromText(job.location || '')
    };
  }
  
  /**
   * استخراج راتب الوظيفة
   */
  extractJobSalary(job) {
    if (!job.salary) {
      return { min: null, max: null };
    }
    
    return {
      min: job.salary.min || null,
      max: job.salary.max || null
    };
  }
  
  /**
   * استخراج نوع العمل
   */
  extractJobType(job) {
    return job.jobType || 'Full-time';
  }
  
  // ===== طرق مساعدة لحساب التشابه =====
  
  /**
   * حساب تشابه المهارات
   */
  calculateSkillsSimilarity(userSkills, jobSkills) {
    if (!jobSkills.length) return 0.5; // إذا لم تذكر مهارات مطلوبة
    
    let matchedSkills = 0;
    let totalWeight = 0;
    
    jobSkills.forEach(jobSkill => {
      const weight = jobSkill.importance || 1;
      totalWeight += weight;
      
      const match = userSkills.find(userSkill => 
        this.areSkillsSimilar(userSkill.name, jobSkill.name)
      );
      
      if (match) {
        // زيادة النقاط بناءً على مستوى الكفاءة
        const proficiencyScore = this.getProficiencyScore(match.proficiency);
        matchedSkills += weight * proficiencyScore;
      }
    });
    
    return totalWeight > 0 ? matchedSkills / totalWeight : 0;
  }
  
  /**
   * حساب تشابه الخبرة
   */
  calculateExperienceSimilarity(userExperience, jobExperience) {
    if (jobExperience.minYears === 0) return 0.5; // إذا لم تذكر خبرة مطلوبة
    
    const userYears = userExperience.totalYears || 0;
    const requiredYears = jobExperience.minYears || 0;
    
    if (userYears >= requiredYears) {
      return 1.0; // خبرة كافية أو أكثر
    } else if (userYears > 0) {
      return userYears / requiredYears; // نسبة الخبرة المتوفرة
    } else {
      return 0.1; // لا خبرة
    }
  }
  
  /**
   * حساب تشابه التعليم
   */
  calculateEducationSimilarity(userEducation, jobEducation) {
    if (jobEducation.requiredDegree === 'none') return 0.5;
    
    const degreeHierarchy = {
      'دكتوراه': 5,
      'ماجستير': 4,
      'بكالوريوس': 3,
      'دبلوم': 2,
      'ثانوية': 1,
      'إعدادية': 0,
      'none': -1
    };
    
    const userScore = degreeHierarchy[userEducation.highestDegree] || -1;
    const jobScore = degreeHierarchy[jobEducation.requiredDegree] || -1;
    
    if (userScore >= jobScore) {
      return 1.0; // مؤهل كافٍ أو أعلى
    } else if (userScore > 0) {
      return userScore / jobScore; // نسبة المؤهل المتوفر
    } else {
      return 0.1; // لا مؤهل
    }
  }
  
  /**
   * حساب تشابه الموقع
   */
  calculateLocationSimilarity(userLocation, jobLocation) {
    if (!userLocation.city && !userLocation.country) return 0.5;
    if (!jobLocation.city && !jobLocation.country) return 0.5;
    
    let score = 0;
    
    // مطابقة البلد
    if (userLocation.country && jobLocation.country) {
      if (userLocation.country.toLowerCase() === jobLocation.country.toLowerCase()) {
        score += 0.6;
      } else {
        score += 0.2; // بلد مختلف
      }
    }
    
    // مطابقة المدينة
    if (userLocation.city && jobLocation.city) {
      if (userLocation.city.toLowerCase() === jobLocation.city.toLowerCase()) {
        score += 0.4;
      }
    }
    
    return Math.min(score, 1.0);
  }
  
  /**
   * حساب تشابه الراتب
   */
  calculateSalarySimilarity(userPreferences, jobSalary) {
    // يمكن تطوير هذا ليشمل تفضيلات الراتب للمستخدم
    // حالياً نرجع قيمة متوسطة
    return 0.5;
  }
  
  /**
   * حساب تشابه نوع العمل
   */
  calculateJobTypeSimilarity(userPreferences, jobType) {
    // يمكن تطوير هذا ليشمل تفضيلات نوع العمل للمستخدم
    // حالياً نرجع قيمة متوسطة
    return 0.5;
  }
  
  // ===== طرق مساعدة عامة =====
  
  /**
   * التحقق من تشابه المهارات
   */
  areSkillsSimilar(skill1, skill2) {
    if (!skill1 || !skill2) return false;
    
    // تحقق من التطابق المباشر
    if (skill1.toLowerCase() === skill2.toLowerCase()) return true;
    
    // تحقق من المرادفات
    for (const [mainSkill, synonyms] of Object.entries(this.skillsSynonyms)) {
      const allVariants = [mainSkill, ...synonyms];
      if (allVariants.includes(skill1.toLowerCase()) && allVariants.includes(skill2.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * الحصول على تصنيف المهارة
   */
  getSkillCategory(skill) {
    const categories = {
      'javascript': 'programming',
      'python': 'programming',
      'react': 'frontend',
      'nodejs': 'backend',
      'database': 'data',
      'design': 'creative',
      'marketing': 'business'
    };
    
    return categories[skill] || 'general';
  }
  
  /**
   * الحصول على درجة الكفاءة
   */
  getProficiencyScore(proficiency) {
    const scores = {
      'expert': 1.0,
      'advanced': 0.8,
      'intermediate': 0.6,
      'beginner': 0.4,
      'native': 1.0
    };
    
    return scores[proficiency] || 0.5;
  }
  
  /**
   * الحصول على مستوى الخبرة
   */
  getExperienceLevel(years) {
    if (years >= 10) return 'خبير';
    if (years >= 5) return 'متقدم';
    if (years >= 2) return 'متوسط';
    if (years >= 1) return 'مبتدئ';
    return 'لا خبرة';
  }
  
  /**
   * استخراج المدينة من النص
   */
  extractCityFromText(text) {
    const cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'المنيا', 'أسيوط'];
    
    for (const city of cities) {
      if (text.includes(city)) {
        return city;
      }
    }
    
    return '';
  }
  
  /**
   * استخراج البلد من النص
   */
  extractCountryFromText(text) {
    const countries = ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'عمان', 'البحرين'];
    
    for (const country of countries) {
      if (text.includes(country)) {
        return country;
      }
    }
    
    return 'مصر'; // افتراضي
  }
}

module.exports = ContentBasedFiltering;