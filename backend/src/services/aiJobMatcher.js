/**
 * 🤖 نظام مطابقة الوظائف بالذكاء الاصطناعي المتقدم
 * يستخدم خوارزميات التعلم الآلي لمطابقة المرشحين مع الوظائف المناسبة
 */

const natural = require('natural');
const { TfIdf, WordTokenizer } = natural;

class AIJobMatcher {
  constructor() {
    this.tfidf = new TfIdf();
    this.tokenizer = new WordTokenizer();
    this.skillsDatabase = new Map();
    this.jobCategories = new Map();
    this.userProfiles = new Map();
    
    this.initializeNLP();
  }

  initializeNLP() {
    // تهيئة معالج اللغة (تم إزالة attach() لأنه غير موجود في الإصدار الحالي)
    // natural.PorterStemmer.attach(); // هذا السطر يسبب خطأ
    
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

    // أوزان المعايير
    this.matchingWeights = {
      skills: 0.35,
      experience: 0.25,
      education: 0.15,
      location: 0.10,
      salary: 0.10,
      jobType: 0.05
    };
  }

  /**
   * تحليل ملف المرشح وإنشاء ملف ذكي
   */
  async analyzeCandidate(candidateData) {
    const profile = {
      id: candidateData.id,
      skills: this.extractSkills(candidateData),
      experience: this.analyzeExperience(candidateData),
      education: this.analyzeEducation(candidateData),
      preferences: this.extractPreferences(candidateData),
      personality: await this.analyzePersonality(candidateData),
      careerGoals: this.identifyCareerGoals(candidateData),
      strengths: this.identifyStrengths(candidateData),
      improvementAreas: this.identifyImprovementAreas(candidateData)
    };

    this.userProfiles.set(candidateData.id, profile);
    return profile;
  }

  /**
   * استخراج المهارات من النص
   */
  extractSkills(candidateData) {
    const text = `${candidateData.bio || ''} ${candidateData.experience || ''} ${candidateData.skills || ''}`.toLowerCase();
    const tokens = this.tokenizer.tokenize(text);
    const extractedSkills = [];

    // البحث عن المهارات المعروفة
    Object.entries(this.skillsSynonyms).forEach(([skill, synonyms]) => {
      const allVariants = [skill, ...synonyms];
      
      if (allVariants.some(variant => text.includes(variant.toLowerCase()))) {
        extractedSkills.push({
          name: skill,
          confidence: this.calculateSkillConfidence(text, allVariants),
          category: this.getSkillCategory(skill)
        });
      }
    });

    // استخراج مهارات إضافية باستخدام NLP
    const additionalSkills = this.extractAdditionalSkills(tokens);
    
    return [...extractedSkills, ...additionalSkills];
  }

  /**
   * تحليل الخبرة العملية
   */
  analyzeExperience(candidateData) {
    const experienceText = candidateData.experience || '';
    
    return {
      totalYears: this.extractYearsOfExperience(experienceText),
      industries: this.extractIndustries(experienceText),
      positions: this.extractPositions(experienceText),
      companies: this.extractCompanies(experienceText),
      achievements: this.extractAchievements(experienceText),
      careerProgression: this.analyzeCareerProgression(candidateData.workHistory || [])
    };
  }

  /**
   * تحليل الشخصية من النص
   */
  async analyzePersonality(candidateData) {
    const text = `${candidateData.bio || ''} ${candidateData.coverLetter || ''}`;
    
    // تحليل بسيط للشخصية بناءً على الكلمات المستخدمة
    const personalityTraits = {
      leadership: this.analyzeLeadershipTraits(text),
      teamwork: this.analyzeTeamworkTraits(text),
      creativity: this.analyzeCreativityTraits(text),
      analytical: this.analyzeAnalyticalTraits(text),
      communication: this.analyzeCommunicationTraits(text)
    };

    return personalityTraits;
  }

  /**
   * العثور على الوظائف المناسبة للمرشح
   */
  async findMatchingJobs(candidateId, jobListings, options = {}) {
    const candidate = this.userProfiles.get(candidateId);
    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    const matches = [];

    for (const job of jobListings) {
      const matchScore = await this.calculateJobMatch(candidate, job);
      
      if (matchScore.overall >= (options.minScore || 0.6)) {
        matches.push({
          job,
          matchScore,
          reasons: this.generateMatchReasons(candidate, job, matchScore),
          recommendations: this.generateRecommendations(candidate, job, matchScore)
        });
      }
    }

    // ترتيب النتائج حسب النقاط
    matches.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

    return matches.slice(0, options.limit || 20);
  }

  /**
   * حساب درجة التطابق بين المرشح والوظيفة
   */
  async calculateJobMatch(candidate, job) {
    const scores = {
      skills: this.calculateSkillsMatch(candidate.skills, job.requiredSkills || []),
      experience: this.calculateExperienceMatch(candidate.experience, job.requirements || {}),
      education: this.calculateEducationMatch(candidate.education, job.requirements || {}),
      location: this.calculateLocationMatch(candidate.preferences, job.location),
      salary: this.calculateSalaryMatch(candidate.preferences, job.salary),
      jobType: this.calculateJobTypeMatch(candidate.preferences, job.type)
    };

    // حساب النقاط الإجمالية
    const overall = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * this.matchingWeights[key]);
    }, 0);

    return { ...scores, overall };
  }

  /**
   * حساب تطابق المهارات
   */
  calculateSkillsMatch(candidateSkills, requiredSkills) {
    if (!requiredSkills.length) return 0.5;

    let matchedSkills = 0;
    let totalWeight = 0;

    requiredSkills.forEach(requiredSkill => {
      const weight = requiredSkill.importance || 1;
      totalWeight += weight;

      const match = candidateSkills.find(skill => 
        this.areSkillsSimilar(skill.name, requiredSkill.name)
      );

      if (match) {
        matchedSkills += weight * match.confidence;
      }
    });

    return totalWeight > 0 ? matchedSkills / totalWeight : 0;
  }

  /**
   * حساب تطابق الخبرة
   */
  calculateExperienceMatch(candidateExp, jobRequirements) {
    let score = 0;
    let factors = 0;

    // سنوات الخبرة
    if (jobRequirements.minExperience) {
      const expScore = Math.min(candidateExp.totalYears / jobRequirements.minExperience, 1);
      score += expScore * 0.4;
      factors += 0.4;
    }

    // الصناعة
    if (jobRequirements.industry && candidateExp.industries.includes(jobRequirements.industry)) {
      score += 0.3;
      factors += 0.3;
    }

    // المناصب السابقة
    if (jobRequirements.similarRoles) {
      const roleMatch = candidateExp.positions.some(pos => 
        jobRequirements.similarRoles.some(role => 
          this.areSimilarRoles(pos, role)
        )
      );
      if (roleMatch) {
        score += 0.3;
      }
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * إنشاء أسباب التطابق
   */
  generateMatchReasons(candidate, job, matchScore) {
    const reasons = [];

    if (matchScore.skills > 0.8) {
      reasons.push({
        type: 'skills',
        message: 'مهاراتك تتطابق بشكل ممتاز مع متطلبات الوظيفة',
        strength: 'high'
      });
    }

    if (matchScore.experience > 0.7) {
      reasons.push({
        type: 'experience',
        message: 'خبرتك العملية مناسبة جداً لهذا المنصب',
        strength: 'high'
      });
    }

    if (matchScore.location > 0.9) {
      reasons.push({
        type: 'location',
        message: 'الموقع الجغرافي مناسب لتفضيلاتك',
        strength: 'medium'
      });
    }

    if (matchScore.salary > 0.8) {
      reasons.push({
        type: 'salary',
        message: 'الراتب المعروض يتماشى مع توقعاتك',
        strength: 'medium'
      });
    }

    return reasons;
  }

  /**
   * إنشاء توصيات للتحسين
   */
  generateRecommendations(candidate, job, matchScore) {
    const recommendations = [];

    if (matchScore.skills < 0.7) {
      const missingSkills = this.identifyMissingSkills(candidate.skills, job.requiredSkills || []);
      recommendations.push({
        type: 'skills',
        message: 'يمكنك تحسين فرصك بتعلم هذه المهارات',
        suggestions: missingSkills,
        priority: 'high'
      });
    }

    if (matchScore.experience < 0.6) {
      recommendations.push({
        type: 'experience',
        message: 'اكتساب المزيد من الخبرة في هذا المجال سيحسن فرصك',
        suggestions: ['البحث عن مشاريع تطوعية', 'دورات تدريبية عملية', 'مشاريع شخصية'],
        priority: 'medium'
      });
    }

    if (matchScore.education < 0.5 && job.requirements?.education) {
      recommendations.push({
        type: 'education',
        message: 'الحصول على مؤهل إضافي قد يحسن فرصك',
        suggestions: ['دورات معتمدة', 'شهادات مهنية', 'دراسات عليا'],
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * اقتراح وظائف بديلة
   */
  async suggestAlternativeJobs(candidateId, originalJob, allJobs) {
    const candidate = this.userProfiles.get(candidateId);
    if (!candidate) return [];

    // البحث عن وظائف مشابهة
    const similarJobs = allJobs.filter(job => 
      job.id !== originalJob.id &&
      this.areJobsSimilar(originalJob, job)
    );

    const alternatives = [];
    
    for (const job of similarJobs) {
      const matchScore = await this.calculateJobMatch(candidate, job);
      
      if (matchScore.overall > 0.5) {
        alternatives.push({
          job,
          matchScore,
          similarity: this.calculateJobSimilarity(originalJob, job),
          reasons: [`مشابه للوظيفة الأصلية`, `نقاط تطابق أعلى في ${this.getBestMatchingArea(matchScore)}`]
        });
      }
    }

    return alternatives
      .sort((a, b) => b.matchScore.overall - a.matchScore.overall)
      .slice(0, 5);
  }

  /**
   * تحليل اتجاهات السوق
   */
  analyzeMarketTrends(jobListings) {
    const trends = {
      mostDemandedSkills: this.getMostDemandedSkills(jobListings),
      salaryTrends: this.analyzeSalaryTrends(jobListings),
      locationTrends: this.analyzeLocationTrends(jobListings),
      industryGrowth: this.analyzeIndustryGrowth(jobListings),
      emergingRoles: this.identifyEmergingRoles(jobListings)
    };

    return trends;
  }

  /**
   * إنشاء تقرير مطابقة مفصل
   */
  generateDetailedMatchReport(candidateId, jobId, matchResult) {
    const candidate = this.userProfiles.get(candidateId);
    
    return {
      candidateId,
      jobId,
      matchScore: matchResult.matchScore,
      strengths: this.identifyMatchStrengths(candidate, matchResult),
      weaknesses: this.identifyMatchWeaknesses(candidate, matchResult),
      improvementPlan: this.createImprovementPlan(candidate, matchResult),
      timeline: this.estimateImprovementTimeline(candidate, matchResult),
      resources: this.recommendLearningResources(candidate, matchResult),
      alternativeCareerPaths: this.suggestCareerPaths(candidate)
    };
  }

  // Helper Methods
  calculateSkillConfidence(text, variants) {
    let mentions = 0;
    variants.forEach(variant => {
      const regex = new RegExp(variant.toLowerCase(), 'gi');
      const matches = text.match(regex);
      mentions += matches ? matches.length : 0;
    });
    
    return Math.min(mentions * 0.2 + 0.3, 1.0);
  }

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

  extractYearsOfExperience(text) {
    const yearPatterns = [
      /(\d+)\s*سنة/g,
      /(\d+)\s*years?/gi,
      /(\d+)\s*عام/g
    ];
    
    let maxYears = 0;
    yearPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)[0]);
          maxYears = Math.max(maxYears, years);
        });
      }
    });
    
    return maxYears;
  }

  areSkillsSimilar(skill1, skill2) {
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

  identifyMissingSkills(candidateSkills, requiredSkills) {
    return requiredSkills
      .filter(required => !candidateSkills.some(candidate => 
        this.areSkillsSimilar(candidate.name, required.name)
      ))
      .map(skill => skill.name);
  }

  getBestMatchingArea(matchScore) {
    const areas = Object.entries(matchScore)
      .filter(([key]) => key !== 'overall')
      .sort(([,a], [,b]) => b - a);
    
    return areas[0]?.[0] || 'المهارات';
  }
}

module.exports = AIJobMatcher;