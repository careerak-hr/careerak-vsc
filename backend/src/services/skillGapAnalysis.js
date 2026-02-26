/**
 * 🤖 Skill Gap Analysis Service
 * خدمة تحليل فجوات المهارات
 * 
 * تحليل فجوات المهارات بين ملف المستخدم ومتطلبات الوظائف
 * لتحديد المهارات المفقودة وتوصيات الدورات المناسبة
 * 
 * المتطلبات: 2.1 (توصيات الدورات لسد الفجوات في مهاراتي)
 * Property 8: Skill Gap Identification
 */

class SkillGapAnalysis {
  constructor() {
    // قاموس المهارات والمرادفات (موسع)
    this.skillsSynonyms = {
      // مهارات البرمجة
      'javascript': ['js', 'جافاسكريبت', 'جافا سكريبت', 'javascript es6', 'es6'],
      'python': ['بايثون', 'python3', 'python 3'],
      'react': ['reactjs', 'ريأكت', 'react.js'],
      'nodejs': ['node.js', 'نود جي اس', 'node'],
      'typescript': ['ts', 'تايب سكريبت'],
      'java': ['جافا'],
      'c++': ['سي بلس بلس'],
      'php': ['بي إتش بي'],
      
      // قواعد البيانات
      'database': ['قاعدة بيانات', 'قواعد البيانات', 'db'],
      'mongodb': ['mongo', 'مونجو دي بي'],
      'mysql': ['ماي إس كيو إل'],
      'postgresql': ['postgres', 'بوستجرس'],
      'sql': ['إس كيو إل'],
      
      // تطوير الويب
      'frontend': ['واجهة أمامية', 'front-end', 'تطوير واجهة'],
      'backend': ['واجهة خلفية', 'back-end', 'تطوير خلفية'],
      'fullstack': ['فول ستاك', 'تطوير كامل'],
      'html': ['إتش تي إم إل'],
      'css': ['سي إس إس'],
      'bootstrap': ['بوتستراب'],
      'tailwind': ['تيل ويند'],
      
      // تطوير الموبايل
      'mobile': ['تطبيقات الجوال', 'موبايل'],
      'react native': ['ريأكت نيتيف'],
      'flutter': ['فلاتر'],
      'android': ['أندرويد'],
      'ios': ['آي أو إس'],
      
      // التصميم
      'design': ['تصميم', 'ديزاين'],
      'ui': ['واجهة المستخدم', 'user interface'],
      'ux': ['تجربة المستخدم', 'user experience'],
      'figma': ['فيجما'],
      'adobe xd': ['أدوبي إكس دي'],
      'photoshop': ['فوتوشوب'],
      
      // التسويق
      'marketing': ['تسويق', 'تسويق رقمي'],
      'digital marketing': ['تسويق رقمي'],
      'seo': ['تحسين محركات البحث'],
      'social media': ['وسائل التواصل الاجتماعي'],
      
      // إدارة المشاريع
      'project management': ['إدارة المشاريع'],
      'agile': ['أجايل', 'منهجية أجايل'],
      'scrum': ['سكروم'],
      
      // المهارات الناعمة
      'communication': ['تواصل', 'مهارات التواصل'],
      'leadership': ['قيادة', 'مهارات قيادية'],
      'teamwork': ['عمل جماعي', 'مهارات العمل الجماعي'],
      'problem solving': ['حل المشكلات'],
      'critical thinking': ['التفكير النقدي']
    };
    
    // تصنيفات المهارات
    this.skillCategories = {
      'programming': ['javascript', 'python', 'react', 'nodejs', 'typescript', 'java', 'c++', 'php'],
      'database': ['database', 'mongodb', 'mysql', 'postgresql', 'sql'],
      'web': ['frontend', 'backend', 'fullstack', 'html', 'css', 'bootstrap', 'tailwind'],
      'mobile': ['mobile', 'react native', 'flutter', 'android', 'ios'],
      'design': ['design', 'ui', 'ux', 'figma', 'adobe xd', 'photoshop'],
      'marketing': ['marketing', 'digital marketing', 'seo', 'social media'],
      'management': ['project management', 'agile', 'scrum'],
      'soft': ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking']
    };
  }
  
  /**
   * تحليل فجوات المهارات بين المستخدم والوظيفة
   * @param {Object} user - بيانات المستخدم
   * @param {Object} job - بيانات الوظيفة
   * @returns {Object} - تحليل فجوات المهارات
   */
  analyzeSkillGaps(user, job) {
    // استخراج مهارات المستخدم
    const userSkills = this.extractUserSkills(user);
    
    // استخراج مهارات الوظيفة المطلوبة
    const jobSkills = this.extractJobSkills(job);
    
    // تحديد المهارات المفقودة
    const missingSkills = this.identifyMissingSkills(userSkills, jobSkills);
    
    // تحليل الفجوات حسب التصنيف
    const gapAnalysis = this.analyzeGapsByCategory(userSkills, jobSkills, missingSkills);
    
    // توليد توصيات الدورات
    const courseRecommendations = this.generateCourseRecommendations(missingSkills, gapAnalysis);
    
    return {
      userSkills,
      jobSkills,
      missingSkills,
      gapAnalysis,
      courseRecommendations,
      summary: this.generateSummary(userSkills, jobSkills, missingSkills, gapAnalysis)
    };
  }
  
  /**
   * استخراج مهارات المستخدم من ملفه الشخصي
   * @param {Object} user - بيانات المستخدم
   * @returns {Array} - قائمة مهارات المستخدم
   */
  extractUserSkills(user) {
    const skills = [];
    
    // مهارات الحاسوب
    if (user.computerSkills && Array.isArray(user.computerSkills)) {
      skills.push(...user.computerSkills.map(skill => ({
        name: skill.skill,
        proficiency: skill.proficiency || 'intermediate',
        category: this.getSkillCategory(skill.skill),
        source: 'computerSkills',
        confidence: 1.0
      })));
    }
    
    // مهارات البرامج
    if (user.softwareSkills && Array.isArray(user.softwareSkills)) {
      skills.push(...user.softwareSkills.map(skill => ({
        name: skill.software,
        proficiency: skill.proficiency || 'intermediate',
        category: this.getSkillCategory(skill.software),
        source: 'softwareSkills',
        confidence: 1.0
      })));
    }
    
    // مهارات أخرى
    if (user.otherSkills && Array.isArray(user.otherSkills)) {
      skills.push(...user.otherSkills.map(skill => ({
        name: skill,
        proficiency: 'intermediate', // قيمة افتراضية
        category: this.getSkillCategory(skill),
        source: 'otherSkills',
        confidence: 0.8
      })));
    }
    
    // استخراج مهارات إضافية من السيرة الذاتية
    if (user.cvFile || user.bio) {
      const text = (user.bio || '').toLowerCase();
      const additionalSkills = this.extractSkillsFromText(text);
      skills.push(...additionalSkills.map(skill => ({
        name: skill,
        proficiency: 'intermediate',
        category: this.getSkillCategory(skill),
        source: 'cv/bio',
        confidence: 0.6
      })));
    }
    
    // إزالة التكرارات
    return this.removeDuplicateSkills(skills);
  }
  
  /**
   * استخراج مهارات الوظيفة المطلوبة
   * @param {Object} job - بيانات الوظيفة
   * @returns {Array} - قائمة مهارات الوظيفة
   */
  extractJobSkills(job) {
    const text = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const extractedSkills = [];
    
    // البحث عن المهارات المعروفة
    Object.entries(this.skillsSynonyms).forEach(([skill, synonyms]) => {
      const allVariants = [skill, ...synonyms];
      
      if (allVariants.some(variant => text.includes(variant.toLowerCase()))) {
        // حساب تكرار المهارة
        let frequency = 0;
        allVariants.forEach(variant => {
          const regex = new RegExp(variant.toLowerCase(), 'gi');
          const matches = text.match(regex);
          frequency += matches ? matches.length : 0;
        });
        
        extractedSkills.push({
          name: skill,
          importance: this.calculateSkillImportance(frequency, skill, text),
          category: this.getSkillCategory(skill),
          frequency,
          variants: allVariants.filter(variant => text.includes(variant.toLowerCase()))
        });
      }
    });
    
    // استخراج مهارات إضافية باستخدام الكلمات الرئيسية
    const additionalSkills = this.extractSkillsFromText(text);
    additionalSkills.forEach(skill => {
      if (!extractedSkills.some(s => s.name === skill)) {
        extractedSkills.push({
          name: skill,
          importance: 0.5, // أهمية افتراضية
          category: this.getSkillCategory(skill),
          frequency: 1,
          variants: [skill]
        });
      }
    });
    
    return extractedSkills;
  }
  
  /**
   * تحديد المهارات المفقودة (الموجودة في الوظيفة وغير موجودة لدى المستخدم)
   * @param {Array} userSkills - مهارات المستخدم
   * @param {Array} jobSkills - مهارات الوظيفة
   * @returns {Array} - المهارات المفقودة
   */
  identifyMissingSkills(userSkills, jobSkills) {
    return jobSkills
      .filter(jobSkill => !userSkills.some(userSkill => 
        this.areSkillsSimilar(userSkill.name, jobSkill.name)
      ))
      .map(skill => ({
        name: skill.name,
        importance: skill.importance,
        category: skill.category,
        frequency: skill.frequency,
        priority: this.calculateSkillPriority(skill.importance, skill.frequency)
      }))
      .sort((a, b) => b.priority - a.priority); // ترتيب تنازلي حسب الأولوية
  }
  
  /**
   * تحليل الفجوات حسب التصنيف
   * @param {Array} userSkills - مهارات المستخدم
   * @param {Array} jobSkills - مهارات الوظيفة
   * @param {Array} missingSkills - المهارات المفقودة
   * @returns {Object} - تحليل الفجوات حسب التصنيف
   */
  analyzeGapsByCategory(userSkills, jobSkills, missingSkills) {
    const analysis = {};
    
    // تهيئة التحليل لكل تصنيف
    Object.keys(this.skillCategories).forEach(category => {
      analysis[category] = {
        userSkillCount: 0,
        jobSkillCount: 0,
        missingSkillCount: 0,
        coverage: 0,
        gapSeverity: 'low',
        skills: []
      };
    });
    
    // حساب إحصائيات المهارات للمستخدم
    userSkills.forEach(skill => {
      const category = skill.category;
      if (analysis[category]) {
        analysis[category].userSkillCount++;
        analysis[category].skills.push({
          name: skill.name,
          type: 'user',
          proficiency: skill.proficiency
        });
      }
    });
    
    // حساب إحصائيات المهارات للوظيفة
    jobSkills.forEach(skill => {
      const category = skill.category;
      if (analysis[category]) {
        analysis[category].jobSkillCount++;
        if (!analysis[category].skills.some(s => s.name === skill.name && s.type === 'job')) {
          analysis[category].skills.push({
            name: skill.name,
            type: 'job',
            importance: skill.importance
          });
        }
      }
    });
    
    // حساب إحصائيات المهارات المفقودة
    missingSkills.forEach(skill => {
      const category = skill.category;
      if (analysis[category]) {
        analysis[category].missingSkillCount++;
        if (!analysis[category].skills.some(s => s.name === skill.name && s.type === 'missing')) {
          analysis[category].skills.push({
            name: skill.name,
            type: 'missing',
            priority: skill.priority
          });
        }
        
        // حساب نسبة التغطية
        if (analysis[category].jobSkillCount > 0) {
          analysis[category].coverage = 
            ((analysis[category].jobSkillCount - analysis[category].missingSkillCount) / 
             analysis[category].jobSkillCount) * 100;
        }
        
        // تحديد شدة الفجوة
        if (analysis[category].coverage < 50) {
          analysis[category].gapSeverity = 'high';
        } else if (analysis[category].coverage < 75) {
          analysis[category].gapSeverity = 'medium';
        } else {
          analysis[category].gapSeverity = 'low';
        }
      }
    });
    
    return analysis;
  }
  
  /**
   * توليد توصيات الدورات بناءً على المهارات المفقودة
   * @param {Array} missingSkills - المهارات المفقودة
   * @param {Object} gapAnalysis - تحليل الفجوات
   * @returns {Array} - توصيات الدورات
   */
  generateCourseRecommendations(missingSkills, gapAnalysis) {
    const recommendations = [];
    
    // تجميع المهارات المفقودة حسب التصنيف
    const skillsByCategory = {};
    missingSkills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill);
    });
    
    // إنشاء توصيات لكل تصنيف
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      const categoryAnalysis = gapAnalysis[category];
      if (!categoryAnalysis) return;
      
      // تحديد مستوى الدورة بناءً على شدة الفجوة
      let courseLevel = 'beginner';
      if (categoryAnalysis.gapSeverity === 'high') {
        courseLevel = 'comprehensive';
      } else if (categoryAnalysis.gapSeverity === 'medium') {
        courseLevel = 'intermediate';
      }
      
      // إنشاء توصية للتصنيف
      recommendations.push({
        category,
        title: this.getCourseTitle(category, courseLevel),
        description: this.getCourseDescription(category, skills, categoryAnalysis),
        skills: skills.map(s => s.name),
        level: courseLevel,
        priority: categoryAnalysis.gapSeverity,
        estimatedDuration: this.getEstimatedDuration(skills.length, courseLevel),
        learningPath: this.generateLearningPath(skills, category)
      });
    });
    
    // ترتيب التوصيات حسب الأولوية
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations.sort((a, b) => 
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    );
  }
  
  /**
   * توليد ملخص تحليل فجوات المهارات
   * @param {Array} userSkills - مهارات المستخدم
   * @param {Array} jobSkills - مهارات الوظيفة
   * @param {Array} missingSkills - المهارات المفقودة
   * @param {Object} gapAnalysis - تحليل الفجوات
   * @returns {Object} - ملخص التحليل
   */
  generateSummary(userSkills, jobSkills, missingSkills, gapAnalysis) {
    const totalUserSkills = userSkills.length;
    const totalJobSkills = jobSkills.length;
    const totalMissingSkills = missingSkills.length;
    
    // حساب نسبة التغطية الإجمالية
    const overallCoverage = totalJobSkills > 0 ? 
      ((totalJobSkills - totalMissingSkills) / totalJobSkills) * 100 : 0;
    
    // تحديد الفجوات الحرجة
    const criticalGaps = Object.entries(gapAnalysis)
      .filter(([category, analysis]) => analysis.gapSeverity === 'high')
      .map(([category]) => category);
    
    // تحديد الفجوات المتوسطة
    const mediumGaps = Object.entries(gapAnalysis)
      .filter(([category, analysis]) => analysis.gapSeverity === 'medium')
      .map(([category]) => category);
    
    return {
      totalUserSkills,
      totalJobSkills,
      totalMissingSkills,
      overallCoverage: Math.round(overallCoverage),
      coverageLevel: this.getCoverageLevel(overallCoverage),
      criticalGaps,
      mediumGaps,
      topMissingSkills: missingSkills.slice(0, 5).map(s => s.name),
      improvementAreas: this.getImprovementAreas(gapAnalysis),
      estimatedTimeToCloseGaps: this.estimateTimeToCloseGaps(missingSkills, gapAnalysis)
    };
  }
  
  // ===== طرق مساعدة =====
  
  /**
   * استخراج المهارات من النص
   */
  extractSkillsFromText(text) {
    const extracted = [];
    const lowerText = text.toLowerCase();
    
    // البحث عن المهارات في النص (بالإنجليزية والعربية)
    Object.entries(this.skillsSynonyms).forEach(([skill, synonyms]) => {
      const allVariants = [skill, ...synonyms];
      
      // التحقق من وجود أي من المتغيرات في النص
      if (allVariants.some(variant => lowerText.includes(variant.toLowerCase()))) {
        extracted.push(skill);
      }
    });
    
    return [...new Set(extracted)]; // إزالة التكرارات
  }
  
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
    for (const [category, skills] of Object.entries(this.skillCategories)) {
      if (skills.includes(skill.toLowerCase())) {
        return category;
      }
    }
    
    // البحث في المرادفات
    for (const [mainSkill, synonyms] of Object.entries(this.skillsSynonyms)) {
      const allVariants = [mainSkill, ...synonyms];
      if (allVariants.includes(skill.toLowerCase())) {
        for (const [category, skills] of Object.entries(this.skillCategories)) {
          if (skills.includes(mainSkill)) {
            return category;
          }
        }
      }
    }
    
    return 'other';
  }
  
  /**
   * حساب أهمية المهارة بناءً على التكرار والسياق
   */
  calculateSkillImportance(frequency, skill, text) {
    let importance = 0.5; // أهمية افتراضية
    
    // زيادة الأهمية بناءً على التكرار
    if (frequency >= 3) importance = 0.9;
    else if (frequency >= 2) importance = 0.7;
    else if (frequency >= 1) importance = 0.5;
    
    // زيادة الأهمية إذا كانت المهارة مذكورة في المتطلبات
    if (text.includes('مطلوب') || text.includes('required')) {
      importance = Math.min(importance + 0.2, 1.0);
    }
    
    // زيادة الأهمية إذا كانت المهارة مذكورة في العنوان
    // (يتم تمرير العنوان بشكل منفصل في extractJobSkills)
    
    return importance;
  }
  
  /**
   * حساب أولوية المهارة المفقودة
   */
  calculateSkillPriority(importance, frequency) {
    return (importance * 0.7) + (Math.min(frequency / 5, 1) * 0.3);
  }
  
  /**
   * إزالة المهارات المكررة
   */
  removeDuplicateSkills(skills) {
    const uniqueSkills = [];
    const seen = new Set();
    
    skills.forEach(skill => {
      const key = skill.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSkills.push(skill);
      }
    });
    
    return uniqueSkills;
  }
  
  /**
   * الحصول على عنوان الدورة
   */
  getCourseTitle(category, level) {
    const titles = {
      'programming': {
        'beginner': 'مقدمة في البرمجة',
        'intermediate': 'تطوير مهارات البرمجة المتقدمة',
        'comprehensive': 'مسار شامل لاحتراف البرمجة'
      },
      'database': {
        'beginner': 'مقدمة في قواعد البيانات',
        'intermediate': 'إدارة قواعد البيانات المتقدمة',
        'comprehensive': 'احتراف إدارة قواعد البيانات'
      },
      'web': {
        'beginner': 'مقدمة في تطوير الويب',
        'intermediate': 'تطوير تطبيقات الويب المتقدمة',
        'comprehensive': 'مسار شامل لتطوير الويب'
      },
      'mobile': {
        'beginner': 'مقدمة في تطوير تطبيقات الموبايل',
        'intermediate': 'تطوير تطبيقات الموبايل المتقدمة',
        'comprehensive': 'احتراف تطوير تطبيقات الموبايل'
      },
      'design': {
        'beginner': 'مقدمة في تصميم واجهات المستخدم',
        'intermediate': 'تصميم تجربة المستخدم المتقدمة',
        'comprehensive': 'مسار شامل لتصميم واجهات المستخدم'
      },
      'marketing': {
        'beginner': 'مقدمة في التسويق الرقمي',
        'intermediate': 'استراتيجيات التسويق الرقمي المتقدمة',
        'comprehensive': 'احتراف التسويق الرقمي'
      },
      'management': {
        'beginner': 'مقدمة في إدارة المشاريع',
        'intermediate': 'إدارة المشاريع المتقدمة',
        'comprehensive': 'احتراف إدارة المشاريع'
      },
      'soft': {
        'beginner': 'تطوير المهارات الناعمة الأساسية',
        'intermediate': 'تطوير المهارات الناعمة المتقدمة',
        'comprehensive': 'مسار شامل لتطوير المهارات الناعمة'
      }
    };
    
    return titles[category]?.[level] || `دورة في ${category}`;
  }
  
  /**
   * الحصول على وصف الدورة
   */
  getCourseDescription(category, skills, analysis) {
    const skillNames = skills.slice(0, 3).map(s => s.name).join('، ');
    const missingCount = analysis.missingSkillCount;
    const coverage = Math.round(analysis.coverage);
    
    return `دورة ${this.getCourseTitle(category, 'beginner')} تركز على تطوير المهارات المفقودة في ${category}. 
            تغطي الدورة ${missingCount} مهارة أساسية بما في ذلك ${skillNames}.
            ستساعدك هذه الدورة على تحسين نسبة تغطية مهاراتك في هذا المجال من ${coverage}% إلى 100%.`;
  }
  
  /**
   * الحصول على المدة المقدرة للدورة
   */
  getEstimatedDuration(skillCount, level) {
    const baseHours = {
      'beginner': 10,
      'intermediate': 20,
      'comprehensive': 40
    };
    
    const hours = baseHours[level] || 20;
    return `${hours + (skillCount * 2)} ساعة`;
  }
  
  /**
   * توليد مسار تعليمي
   */
  generateLearningPath(skills, category) {
    const path = [];
    let week = 1;
    
    // مهارات أساسية (الأسبوع 1-2)
    const basicSkills = skills.filter(s => s.priority < 0.6).slice(0, 3);
    if (basicSkills.length > 0) {
      path.push({
        week,
        title: 'المهارات الأساسية',
        skills: basicSkills.map(s => s.name),
        resources: ['فيديوهات تعليمية', 'تمارين عملية', 'اختبارات قصيرة']
      });
      week++;
    }
    
    // مهارات متوسطة (الأسبوع 3-4)
    const intermediateSkills = skills.filter(s => s.priority >= 0.6 && s.priority < 0.8).slice(0, 3);
    if (intermediateSkills.length > 0) {
      path.push({
        week,
        title: 'المهارات المتوسطة',
        skills: intermediateSkills.map(s => s.name),
        resources: ['مشاريع عملية', 'حالات دراسة', 'تمارين متقدمة']
      });
      week++;
    }
    
    // مهارات متقدمة (الأسبوع 5-6)
    const advancedSkills = skills.filter(s => s.priority >= 0.8).slice(0, 3);
    if (advancedSkills.length > 0) {
      path.push({
        week,
        title: 'المهارات المتقدمة',
        skills: advancedSkills.map(s => s.name),
        resources: ['مشروع نهائي', 'تطبيقات عملية', 'مراجعة شاملة']
      });
    }
    
    return path;
  }
  
  /**
   * الحصول على مستوى التغطية
   */
  getCoverageLevel(coverage) {
    if (coverage >= 90) return 'ممتاز';
    if (coverage >= 75) return 'جيد';
    if (coverage >= 50) return 'متوسط';
    if (coverage >= 25) return 'ضعيف';
    return 'ضعيف جداً';
  }
  
  /**
   * تحديد مجالات التحسين
   */
  getImprovementAreas(gapAnalysis) {
    const areas = [];
    
    Object.entries(gapAnalysis).forEach(([category, analysis]) => {
      if (analysis.gapSeverity === 'high') {
        areas.push({
          category,
          severity: 'high',
          message: `فجوة كبيرة في ${category} (${analysis.coverage.toFixed(1)}% تغطية)`,
          recommendation: `ركز على تطوير مهارات ${category} أولاً`
        });
      } else if (analysis.gapSeverity === 'medium') {
        areas.push({
          category,
          severity: 'medium',
          message: `فجوة متوسطة في ${category} (${analysis.coverage.toFixed(1)}% تغطية)`,
          recommendation: `حسن مهارات ${category} لزيادة فرصك`
        });
      }
    });
    
    return areas;
  }
  
  /**
   * تقدير الوقت اللازم لسد الفجوات
   */
  estimateTimeToCloseGaps(missingSkills, gapAnalysis) {
    let totalHours = 0;
    
    // حساب الساعات بناءً على عدد المهارات وأولويتها
    missingSkills.forEach(skill => {
      if (skill.priority >= 0.8) {
        totalHours += 20; // مهارات عالية الأولوية
      } else if (skill.priority >= 0.6) {
        totalHours += 15; // مهارات متوسطة الأولوية
      } else {
        totalHours += 10; // مهارات منخفضة الأولوية
      }
    });
    
    // تحويل الساعات إلى أسابيع (بافتراض 10 ساعات أسبوعياً)
    const weeks = Math.ceil(totalHours / 10);
    
    return {
      totalHours,
      weeks,
      dailyHours: Math.ceil(totalHours / (weeks * 7)),
      timeline: `${weeks} أسبوع (${totalHours} ساعة)`
    };
  }
}

module.exports = SkillGapAnalysis;