/**
 * MatchingEngine - محرك حساب نسبة المطابقة بين الوظائف والمستخدمين
 * 
 * يحسب نسبة التطابق بناءً على:
 * - المهارات (Skills)
 * - الخبرة (Experience)
 * - التعليم (Education)
 * - الموقع (Location)
 * - الراتب (Salary)
 * - نوع العمل (Work Type)
 */

class MatchingEngine {
  constructor() {
    // أوزان المطابقة (يجب أن يكون المجموع = 100)
    this.weights = {
      skills: 35,        // المهارات - الأهم
      experience: 25,    // الخبرة
      education: 15,     // التعليم
      location: 10,      // الموقع
      salary: 10,        // الراتب
      workType: 5        // نوع العمل
    };
  }

  /**
   * حساب نسبة المطابقة بين وظيفة ومستخدم
   * @param {Object} job - الوظيفة
   * @param {Object} userProfile - ملف المستخدم
   * @returns {Object} { matchScore: number, breakdown: Object }
   */
  calculateMatchPercentage(job, userProfile) {
    const breakdown = {
      skills: this.calculateSkillsMatch(job.skills || [], userProfile.skills || []),
      experience: this.calculateExperienceMatch(job.experienceLevel, userProfile.experience),
      education: this.calculateEducationMatch(job.educationLevel, userProfile.education),
      location: this.calculateLocationMatch(job.location, userProfile.location),
      salary: this.calculateSalaryMatch(job.salary, userProfile.expectedSalary),
      workType: this.calculateWorkTypeMatch(job.workType, userProfile.preferredWorkType)
    };

    // حساب النتيجة الإجمالية
    const matchScore = Object.keys(breakdown).reduce((total, key) => {
      return total + (breakdown[key] * this.weights[key] / 100);
    }, 0);

    return {
      matchScore: Math.round(matchScore * 100) / 100, // تقريب لرقمين عشريين
      breakdown,
      details: this.generateMatchDetails(breakdown)
    };
  }

  /**
   * حساب نسبة مطابقة المهارات
   * @param {Array} jobSkills - مهارات الوظيفة
   * @param {Array} userSkills - مهارات المستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateSkillsMatch(jobSkills, userSkills) {
    if (!jobSkills || jobSkills.length === 0) return 100; // لا توجد متطلبات
    if (!userSkills || userSkills.length === 0) return 0;  // المستخدم ليس لديه مهارات

    // تحويل إلى lowercase للمقارنة
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());

    // حساب المهارات المطابقة
    const matchedSkills = jobSkillsLower.filter(skill =>
      userSkillsLower.includes(skill)
    );

    return (matchedSkills.length / jobSkillsLower.length) * 100;
  }

  /**
   * حساب نسبة مطابقة الخبرة
   * @param {string} jobExperience - مستوى الخبرة المطلوب
   * @param {number} userExperience - سنوات خبرة المستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateExperienceMatch(jobExperience, userExperience) {
    if (!jobExperience) return 100;
    if (userExperience === undefined || userExperience === null) return 50;

    const experienceLevels = {
      'entry': { min: 0, max: 2 },
      'junior': { min: 1, max: 3 },
      'mid': { min: 3, max: 5 },
      'senior': { min: 5, max: 10 },
      'expert': { min: 8, max: 100 }
    };

    const level = experienceLevels[jobExperience.toLowerCase()];
    if (!level) return 50;

    // مطابقة تامة إذا كان ضمن النطاق
    if (userExperience >= level.min && userExperience <= level.max) {
      return 100;
    }

    // مطابقة جزئية إذا كان قريب
    const distance = Math.min(
      Math.abs(userExperience - level.min),
      Math.abs(userExperience - level.max)
    );

    if (distance <= 2) return 70;
    if (distance <= 4) return 40;
    return 20;
  }

  /**
   * حساب نسبة مطابقة التعليم
   * @param {string} jobEducation - المستوى التعليمي المطلوب
   * @param {string} userEducation - المستوى التعليمي للمستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateEducationMatch(jobEducation, userEducation) {
    if (!jobEducation) return 100;
    if (!userEducation) return 50;

    const educationLevels = {
      'high_school': 1,
      'diploma': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };

    const jobLevel = educationLevels[jobEducation.toLowerCase()] || 0;
    const userLevel = educationLevels[userEducation.toLowerCase()] || 0;

    if (userLevel >= jobLevel) return 100; // المستخدم لديه مؤهل أعلى أو مساوي
    if (userLevel === jobLevel - 1) return 70; // أقل بمستوى واحد
    if (userLevel === jobLevel - 2) return 40; // أقل بمستويين
    return 20;
  }

  /**
   * حساب نسبة مطابقة الموقع
   * @param {Object} jobLocation - موقع الوظيفة
   * @param {Object} userLocation - موقع المستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateLocationMatch(jobLocation, userLocation) {
    if (!jobLocation || !userLocation) return 50;

    // مطابقة المدينة
    if (jobLocation.city && userLocation.city) {
      if (jobLocation.city.toLowerCase() === userLocation.city.toLowerCase()) {
        return 100;
      }
    }

    // مطابقة الدولة
    if (jobLocation.country && userLocation.country) {
      if (jobLocation.country.toLowerCase() === userLocation.country.toLowerCase()) {
        return 70;
      }
    }

    // إذا كانت الوظيفة عن بعد
    if (jobLocation.remote || jobLocation.workType === 'remote') {
      return 100;
    }

    return 30;
  }

  /**
   * حساب نسبة مطابقة الراتب
   * @param {Object} jobSalary - راتب الوظيفة
   * @param {number} userExpectedSalary - الراتب المتوقع للمستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateSalaryMatch(jobSalary, userExpectedSalary) {
    if (!jobSalary || !userExpectedSalary) return 50;

    const jobMin = jobSalary.min || jobSalary;
    const jobMax = jobSalary.max || jobSalary;

    // إذا كان الراتب المتوقع ضمن النطاق
    if (userExpectedSalary >= jobMin && userExpectedSalary <= jobMax) {
      return 100;
    }

    // إذا كان الراتب المتوقع أقل من الحد الأدنى (جيد للمستخدم)
    if (userExpectedSalary < jobMin) {
      const difference = ((jobMin - userExpectedSalary) / userExpectedSalary) * 100;
      if (difference <= 10) return 90;
      if (difference <= 20) return 80;
      return 70;
    }

    // إذا كان الراتب المتوقع أعلى من الحد الأقصى (سيء للمستخدم)
    if (userExpectedSalary > jobMax) {
      const difference = ((userExpectedSalary - jobMax) / userExpectedSalary) * 100;
      if (difference <= 10) return 60;
      if (difference <= 20) return 40;
      if (difference <= 30) return 20;
      return 10;
    }

    return 50;
  }

  /**
   * حساب نسبة مطابقة نوع العمل
   * @param {string} jobWorkType - نوع العمل المطلوب
   * @param {Array} userPreferredWorkTypes - أنواع العمل المفضلة للمستخدم
   * @returns {number} نسبة المطابقة (0-100)
   */
  calculateWorkTypeMatch(jobWorkType, userPreferredWorkTypes) {
    if (!jobWorkType) return 100;
    if (!userPreferredWorkTypes || userPreferredWorkTypes.length === 0) return 50;

    const workTypesArray = Array.isArray(userPreferredWorkTypes)
      ? userPreferredWorkTypes
      : [userPreferredWorkTypes];

    const match = workTypesArray.some(type =>
      type.toLowerCase() === jobWorkType.toLowerCase()
    );

    return match ? 100 : 30;
  }

  /**
   * توليد تفاصيل المطابقة
   * @param {Object} breakdown - تفاصيل المطابقة
   * @returns {Array} قائمة بالتفاصيل
   */
  generateMatchDetails(breakdown) {
    const details = [];

    if (breakdown.skills >= 80) {
      details.push('مهاراتك تطابق متطلبات الوظيفة بشكل ممتاز');
    } else if (breakdown.skills >= 60) {
      details.push('لديك معظم المهارات المطلوبة');
    } else if (breakdown.skills >= 40) {
      details.push('لديك بعض المهارات المطلوبة');
    }

    if (breakdown.experience >= 80) {
      details.push('خبرتك مناسبة تماماً لهذه الوظيفة');
    } else if (breakdown.experience >= 60) {
      details.push('خبرتك قريبة من المطلوب');
    }

    if (breakdown.education >= 80) {
      details.push('مؤهلك التعليمي يلبي المتطلبات');
    }

    if (breakdown.location >= 80) {
      details.push('الموقع مناسب لك');
    }

    if (breakdown.salary >= 80) {
      details.push('الراتب يتناسب مع توقعاتك');
    }

    if (breakdown.workType >= 80) {
      details.push('نوع العمل يناسب تفضيلاتك');
    }

    return details;
  }

  /**
   * ترتيب الوظائف حسب نسبة المطابقة
   * @param {Array} jobs - قائمة الوظائف
   * @param {Object} userProfile - ملف المستخدم
   * @returns {Array} الوظائف مرتبة حسب المطابقة
   */
  rankByMatch(jobs, userProfile) {
    return jobs
      .map(job => {
        const match = this.calculateMatchPercentage(job, userProfile);
        return {
          ...job.toObject ? job.toObject() : job,
          matchScore: match.matchScore,
          matchBreakdown: match.breakdown,
          matchDetails: match.details
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * تحديث أوزان المطابقة
   * @param {Object} newWeights - الأوزان الجديدة
   */
  updateWeights(newWeights) {
    // التحقق من أن المجموع = 100
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error('مجموع الأوزان يجب أن يساوي 100');
    }

    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * الحصول على الأوزان الحالية
   * @returns {Object} الأوزان
   */
  getWeights() {
    return { ...this.weights };
  }
}

module.exports = MatchingEngine;
