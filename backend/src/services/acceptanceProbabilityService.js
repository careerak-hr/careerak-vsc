/**
 * Acceptance Probability Service
 * 
 * يحسب احتمالية قبول المرشح للوظيفة بناءً على:
 * 1. نسبة التطابق (من Content-Based Filtering)
 * 2. عدد المتقدمين
 * 3. متطلبات الوظيفة
 * 4. خبرة المرشح
 * 
 * المستويات:
 * - عالي (High): 70%+ احتمالية
 * - متوسط (Medium): 40-70% احتمالية
 * - منخفض (Low): < 40% احتمالية
 */

const ContentBasedFiltering = require('./contentBasedFiltering');

class AcceptanceProbabilityService {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
  }

  /**
   * حساب احتمالية القبول لوظيفة واحدة
   * @param {Object} user - بيانات المستخدم
   * @param {Object} job - بيانات الوظيفة
   * @returns {Object} { probability, level, factors }
   */
  async calculateAcceptanceProbability(user, job) {
    try {
      // 1. حساب نسبة التطابق من Content-Based Filtering
      const userFeatures = this.contentBasedFiltering.extractUserFeatures(user);
      const jobFeatures = this.contentBasedFiltering.extractJobFeatures(job);
      const matchScore = this.contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

      // 2. حساب عوامل إضافية
      const competitionFactor = this.calculateCompetitionFactor(job);
      const experienceFactor = this.calculateExperienceFactor(user, job);
      const skillsFactor = this.calculateSkillsFactor(user, job);
      const educationFactor = this.calculateEducationFactor(user, job);

      // 3. حساب الاحتمالية النهائية (weighted average)
      const probability = this.calculateFinalProbability({
        matchScore: matchScore.overall,
        competitionFactor,
        experienceFactor,
        skillsFactor,
        educationFactor
      });

      // 4. تحديد المستوى
      const level = this.getProbabilityLevel(probability);

      // 5. توليد العوامل المؤثرة
      const factors = this.generateFactors({
        matchScore: matchScore.overall,
        competitionFactor,
        experienceFactor,
        skillsFactor,
        educationFactor,
        level
      });

      return {
        probability: Math.round(probability),
        level,
        factors,
        matchScore: Math.round(matchScore.overall),
        details: {
          competition: Math.round(competitionFactor * 100),
          experience: Math.round(experienceFactor * 100),
          skills: Math.round(skillsFactor * 100),
          education: Math.round(educationFactor * 100)
        }
      };
    } catch (error) {
      console.error('Error calculating acceptance probability:', error);
      return {
        probability: 50,
        level: 'medium',
        factors: ['لا يمكن حساب الاحتمالية بدقة'],
        matchScore: 50,
        details: {}
      };
    }
  }

  /**
   * حساب عامل المنافسة (كلما زاد عدد المتقدمين، قلت الاحتمالية)
   */
  calculateCompetitionFactor(job) {
    const applicantCount = job.applicantCount || 0;

    if (applicantCount === 0) return 1.0; // لا منافسة
    if (applicantCount < 10) return 0.9;  // منافسة قليلة
    if (applicantCount < 50) return 0.7;  // منافسة متوسطة
    if (applicantCount < 100) return 0.5; // منافسة عالية
    return 0.3; // منافسة شديدة جداً
  }

  /**
   * حساب عامل الخبرة
   */
  calculateExperienceFactor(user, job) {
    const userYears = this.extractYearsOfExperience(user);
    const requiredYears = this.extractRequiredExperience(job);

    if (requiredYears === 0) return 1.0; // لا يوجد متطلب خبرة

    const ratio = userYears / requiredYears;

    if (ratio >= 1.5) return 1.0;  // خبرة أكثر من المطلوب
    if (ratio >= 1.0) return 0.9;  // خبرة مطابقة
    if (ratio >= 0.7) return 0.7;  // خبرة قريبة
    if (ratio >= 0.5) return 0.5;  // خبرة أقل قليلاً
    return 0.3; // خبرة أقل بكثير
  }

  /**
   * حساب عامل المهارات
   */
  calculateSkillsFactor(user, job) {
    const userSkills = this.contentBasedFiltering.extractUserSkills(user);
    const jobSkills = this.contentBasedFiltering.extractJobSkills(job);

    if (jobSkills.required.length === 0) return 1.0;

    // حساب نسبة المهارات المطلوبة المتوفرة
    let matchedRequired = 0;
    for (const reqSkill of jobSkills.required) {
      const hasSkill = userSkills.some(userSkill => 
        this.contentBasedFiltering.areSkillsSimilar(userSkill.name, reqSkill)
      );
      if (hasSkill) matchedRequired++;
    }

    const requiredRatio = matchedRequired / jobSkills.required.length;

    // حساب نسبة المهارات المفضلة
    let matchedPreferred = 0;
    if (jobSkills.preferred.length > 0) {
      for (const prefSkill of jobSkills.preferred) {
        const hasSkill = userSkills.some(userSkill => 
          this.contentBasedFiltering.areSkillsSimilar(userSkill.name, prefSkill)
        );
        if (hasSkill) matchedPreferred++;
      }
    }

    const preferredRatio = jobSkills.preferred.length > 0 
      ? matchedPreferred / jobSkills.preferred.length 
      : 0;

    // الوزن: 80% للمهارات المطلوبة، 20% للمفضلة
    return (requiredRatio * 0.8) + (preferredRatio * 0.2);
  }

  /**
   * حساب عامل التعليم
   */
  calculateEducationFactor(user, job) {
    const userEducation = this.contentBasedFiltering.extractUserEducation(user);
    const jobEducation = this.contentBasedFiltering.extractJobEducation(job);

    if (!jobEducation.required) return 1.0; // لا يوجد متطلب تعليمي

    const educationLevels = {
      'high_school': 1,
      'diploma': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };

    const userLevel = educationLevels[userEducation.level] || 0;
    const requiredLevel = educationLevels[jobEducation.required] || 0;

    if (userLevel >= requiredLevel) return 1.0; // يلبي المتطلب
    if (userLevel === requiredLevel - 1) return 0.7; // أقل بدرجة واحدة
    return 0.4; // أقل بكثير
  }

  /**
   * حساب الاحتمالية النهائية (weighted average)
   */
  calculateFinalProbability(factors) {
    const weights = {
      matchScore: 0.40,      // 40% - الأهم
      skillsFactor: 0.25,    // 25%
      experienceFactor: 0.20, // 20%
      competitionFactor: 0.10, // 10%
      educationFactor: 0.05   // 5%
    };

    const probability = 
      (factors.matchScore * weights.matchScore) +
      (factors.skillsFactor * 100 * weights.skillsFactor) +
      (factors.experienceFactor * 100 * weights.experienceFactor) +
      (factors.competitionFactor * 100 * weights.competitionFactor) +
      (factors.educationFactor * 100 * weights.educationFactor);

    return Math.min(100, Math.max(0, probability));
  }

  /**
   * تحديد مستوى الاحتمالية
   */
  getProbabilityLevel(probability) {
    if (probability >= 70) return 'high';
    if (probability >= 40) return 'medium';
    return 'low';
  }

  /**
   * توليد العوامل المؤثرة (للعرض للمستخدم)
   */
  generateFactors(data) {
    const factors = [];

    // عامل التطابق
    if (data.matchScore >= 80) {
      factors.push('تطابق ممتاز مع متطلبات الوظيفة');
    } else if (data.matchScore >= 60) {
      factors.push('تطابق جيد مع متطلبات الوظيفة');
    } else {
      factors.push('تطابق متوسط مع متطلبات الوظيفة');
    }

    // عامل المهارات
    if (data.skillsFactor >= 0.8) {
      factors.push('لديك معظم المهارات المطلوبة');
    } else if (data.skillsFactor >= 0.6) {
      factors.push('لديك بعض المهارات المطلوبة');
    } else if (data.skillsFactor < 0.5) {
      factors.push('ينقصك بعض المهارات الأساسية');
    }

    // عامل الخبرة
    if (data.experienceFactor >= 0.9) {
      factors.push('خبرتك تتجاوز المطلوب');
    } else if (data.experienceFactor >= 0.7) {
      factors.push('خبرتك مناسبة للوظيفة');
    } else if (data.experienceFactor < 0.5) {
      factors.push('خبرتك أقل من المطلوب');
    }

    // عامل المنافسة
    if (data.competitionFactor >= 0.8) {
      factors.push('عدد المتقدمين قليل');
    } else if (data.competitionFactor <= 0.4) {
      factors.push('منافسة عالية على هذه الوظيفة');
    }

    // عامل التعليم
    if (data.educationFactor >= 1.0) {
      factors.push('مؤهلك التعليمي يلبي المتطلبات');
    } else if (data.educationFactor < 0.7) {
      factors.push('مؤهلك التعليمي أقل من المطلوب');
    }

    return factors.slice(0, 4); // أقصى 4 عوامل
  }

  /**
   * استخراج سنوات الخبرة من بيانات المستخدم
   */
  extractYearsOfExperience(user) {
    if (user.experience && Array.isArray(user.experience)) {
      // حساب مجموع سنوات الخبرة من جميع الوظائف
      return user.experience.reduce((total, exp) => {
        const years = exp.years || 0;
        return total + years;
      }, 0);
    }
    return 0;
  }

  /**
   * استخراج سنوات الخبرة المطلوبة من الوظيفة
   */
  extractRequiredExperience(job) {
    if (job.experienceRequired) {
      // استخراج الرقم من النص (مثل: "3-5 سنوات" -> 3)
      const match = job.experienceRequired.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }
    
    if (job.experienceLevel) {
      const levels = {
        'entry': 0,
        'junior': 1,
        'mid': 3,
        'senior': 5,
        'expert': 8
      };
      return levels[job.experienceLevel] || 0;
    }

    return 0;
  }

  /**
   * حساب احتمالية القبول لعدة وظائف
   */
  async calculateBulkProbabilities(user, jobs) {
    const results = [];

    for (const job of jobs) {
      const probability = await this.calculateAcceptanceProbability(user, job);
      results.push({
        jobId: job._id,
        ...probability
      });
    }

    return results;
  }
}

module.exports = AcceptanceProbabilityService;
