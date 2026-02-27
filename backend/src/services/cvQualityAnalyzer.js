/**
 * CV Quality Analyzer Service
 * خدمة تحليل جودة السيرة الذاتية وحساب درجة الجودة (0-100)
 * 
 * الميزات:
 * - حساب درجة الجودة الإجمالية (0-100)
 * - تحديد نقاط القوة والضعف
 * - تحليل الاكتمال والجودة
 * - اقتراحات للتحسين
 * 
 * Requirements: 4.3, 4.4
 */

class CVQualityAnalyzer {
  constructor() {
    // أوزان معايير التقييم (المجموع = 100)
    this.weights = {
      contactInfo: 10,      // معلومات الاتصال
      skills: 25,           // المهارات
      experience: 30,       // الخبرات
      education: 20,        // التعليم
      formatting: 10,       // التنسيق والطول
      completeness: 5,      // الاكتمال العام
    };

    // الحدود المثالية
    this.idealRanges = {
      skills: { min: 5, ideal: 10, max: 20 },
      experience: { min: 1, ideal: 3, max: 10 },
      education: { min: 1, ideal: 2, max: 5 },
      textLength: { min: 500, ideal: 1500, max: 3000 },
      experienceYears: { min: 1, ideal: 3, max: 15 },
    };
  }

  /**
   * تحليل جودة السيرة الذاتية الكامل
   * @param {Object} parsedCV - البيانات المستخرجة من CV Parser
   * @returns {Object} - نتائج التحليل مع الدرجة والتوصيات
   */
  analyzeQuality(parsedCV) {
    const { data, stats } = parsedCV;

    // حساب درجات المعايير المختلفة
    const scores = {
      contactInfo: this.scoreContactInfo(data.contactInfo),
      skills: this.scoreSkills(stats.skillsCount),
      experience: this.scoreExperience(data.experience, stats.totalExperienceYears),
      education: this.scoreEducation(data.education),
      formatting: this.scoreFormatting(data.rawText),
      completeness: this.scoreCompleteness(data),
    };

    // حساب الدرجة الإجمالية
    const totalScore = this.calculateTotalScore(scores);

    // تحديد نقاط القوة والضعف
    const strengths = this.identifyStrengths(scores, data);
    const weaknesses = this.identifyWeaknesses(scores, data);

    // توليد التوصيات
    const recommendations = this.generateRecommendations(scores, data, stats);

    return {
      overallScore: Math.round(totalScore),
      rating: this.getRating(totalScore),
      scores: {
        contactInfo: Math.round(scores.contactInfo),
        skills: Math.round(scores.skills),
        experience: Math.round(scores.experience),
        education: Math.round(scores.education),
        formatting: Math.round(scores.formatting),
        completeness: Math.round(scores.completeness),
      },
      strengths,
      weaknesses,
      recommendations,
      analyzedAt: new Date(),
    };
  }

  /**
   * تقييم معلومات الاتصال (0-100)
   */
  scoreContactInfo(contactInfo) {
    let score = 0;
    const maxScore = 100;

    // البريد الإلكتروني (40 نقطة)
    if (contactInfo.emails && contactInfo.emails.length > 0) {
      score += 40;
    }

    // رقم الهاتف (30 نقطة)
    if (contactInfo.phones && contactInfo.phones.length > 0) {
      score += 30;
    }

    // LinkedIn (20 نقطة)
    if (contactInfo.linkedin) {
      score += 20;
    }

    // GitHub (10 نقاط - إضافية)
    if (contactInfo.github) {
      score += 10;
    }

    return Math.min(score, maxScore);
  }

  /**
   * تقييم المهارات (0-100)
   */
  scoreSkills(skillsCount) {
    const { min, ideal, max } = this.idealRanges.skills;

    if (skillsCount === 0) return 0;
    if (skillsCount < min) return (skillsCount / min) * 50;
    if (skillsCount <= ideal) return 50 + ((skillsCount - min) / (ideal - min)) * 30;
    if (skillsCount <= max) return 80 + ((skillsCount - ideal) / (max - ideal)) * 20;
    
    // أكثر من الحد الأقصى - خصم نقاط (قد يكون مبالغ فيه)
    return Math.max(70, 100 - (skillsCount - max) * 2);
  }

  /**
   * تقييم الخبرات (0-100)
   */
  scoreExperience(experiences, totalYears) {
    let score = 0;

    // عدد الخبرات (50 نقطة)
    const expCount = experiences.length;
    const { min, ideal, max } = this.idealRanges.experience;

    if (expCount === 0) {
      score += 0;
    } else if (expCount < min) {
      score += (expCount / min) * 25;
    } else if (expCount <= ideal) {
      score += 25 + ((expCount - min) / (ideal - min)) * 15;
    } else if (expCount <= max) {
      score += 40 + ((expCount - ideal) / (max - ideal)) * 10;
    } else {
      score += 50;
    }

    // سنوات الخبرة (50 نقطة)
    const { min: minYears, ideal: idealYears, max: maxYears } = this.idealRanges.experienceYears;

    if (totalYears === 0) {
      score += 0;
    } else if (totalYears < minYears) {
      score += (totalYears / minYears) * 25;
    } else if (totalYears <= idealYears) {
      score += 25 + ((totalYears - minYears) / (idealYears - minYears)) * 15;
    } else if (totalYears <= maxYears) {
      score += 40 + ((totalYears - idealYears) / (maxYears - idealYears)) * 10;
    } else {
      score += 50;
    }

    // جودة الوصف (bonus)
    const avgDescLength = experiences.reduce((sum, exp) => sum + exp.description.length, 0) / expCount;
    if (avgDescLength > 100) score += 5;
    if (avgDescLength > 200) score += 5;

    return Math.min(score, 100);
  }

  /**
   * تقييم التعليم (0-100)
   */
  scoreEducation(education) {
    const eduCount = education.length;
    const { min, ideal, max } = this.idealRanges.education;

    if (eduCount === 0) return 0;
    if (eduCount < min) return (eduCount / min) * 60;
    if (eduCount <= ideal) return 60 + ((eduCount - min) / (ideal - min)) * 30;
    if (eduCount <= max) return 90 + ((eduCount - ideal) / (max - ideal)) * 10;
    
    return 100;
  }

  /**
   * تقييم التنسيق والطول (0-100)
   */
  scoreFormatting(rawText) {
    let score = 0;
    const textLength = rawText.length;
    const { min, ideal, max } = this.idealRanges.textLength;

    // طول النص (70 نقطة)
    if (textLength < min) {
      score += (textLength / min) * 35;
    } else if (textLength <= ideal) {
      score += 35 + ((textLength - min) / (ideal - min)) * 20;
    } else if (textLength <= max) {
      score += 55 + ((textLength - ideal) / (max - ideal)) * 15;
    } else {
      // طويل جداً - خصم نقاط
      score += Math.max(40, 70 - (textLength - max) / 100);
    }

    // البنية والتنظيم (30 نقطة)
    const lines = rawText.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
    const avgLineLength = textLength / nonEmptyLines;

    // خطوط منظمة (ليست طويلة جداً أو قصيرة جداً)
    if (avgLineLength >= 30 && avgLineLength <= 100) {
      score += 15;
    } else if (avgLineLength >= 20 && avgLineLength <= 120) {
      score += 10;
    } else {
      score += 5;
    }

    // وجود أقسام واضحة
    const sectionKeywords = ['experience', 'education', 'skills', 'خبرة', 'تعليم', 'مهارات'];
    const sectionsFound = sectionKeywords.filter(keyword => 
      rawText.toLowerCase().includes(keyword)
    ).length;

    score += Math.min(sectionsFound * 5, 15);

    return Math.min(score, 100);
  }

  /**
   * تقييم الاكتمال العام (0-100)
   */
  scoreCompleteness(data) {
    let score = 0;
    const components = [
      data.contactInfo.emails.length > 0,
      data.contactInfo.phones.length > 0,
      data.skills.length > 0,
      data.experience.length > 0,
      data.education.length > 0,
    ];

    const completedComponents = components.filter(Boolean).length;
    score = (completedComponents / components.length) * 100;

    return score;
  }

  /**
   * حساب الدرجة الإجمالية
   */
  calculateTotalScore(scores) {
    let total = 0;

    total += (scores.contactInfo * this.weights.contactInfo) / 100;
    total += (scores.skills * this.weights.skills) / 100;
    total += (scores.experience * this.weights.experience) / 100;
    total += (scores.education * this.weights.education) / 100;
    total += (scores.formatting * this.weights.formatting) / 100;
    total += (scores.completeness * this.weights.completeness) / 100;

    return total;
  }

  /**
   * تحديد التقييم النصي
   */
  getRating(score) {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    if (score >= 50) return 'ضعيف';
    return 'ضعيف جداً';
  }

  /**
   * تحديد نقاط القوة
   */
  identifyStrengths(scores, data) {
    const strengths = [];

    if (scores.contactInfo >= 80) {
      strengths.push({
        category: 'معلومات الاتصال',
        description: 'معلومات اتصال كاملة ومتنوعة',
        score: Math.round(scores.contactInfo),
      });
    }

    if (scores.skills >= 80) {
      strengths.push({
        category: 'المهارات',
        description: `مجموعة متنوعة من المهارات (${data.skills.length} مهارة)`,
        score: Math.round(scores.skills),
      });
    }

    if (scores.experience >= 80) {
      strengths.push({
        category: 'الخبرات',
        description: `خبرات عملية قوية (${data.totalExperience} سنوات)`,
        score: Math.round(scores.experience),
      });
    }

    if (scores.education >= 80) {
      strengths.push({
        category: 'التعليم',
        description: 'مؤهلات تعليمية جيدة',
        score: Math.round(scores.education),
      });
    }

    if (scores.formatting >= 80) {
      strengths.push({
        category: 'التنسيق',
        description: 'سيرة ذاتية منظمة وواضحة',
        score: Math.round(scores.formatting),
      });
    }

    return strengths;
  }

  /**
   * تحديد نقاط الضعف
   */
  identifyWeaknesses(scores, data) {
    const weaknesses = [];

    if (scores.contactInfo < 60) {
      weaknesses.push({
        category: 'معلومات الاتصال',
        description: 'معلومات اتصال ناقصة',
        score: Math.round(scores.contactInfo),
        severity: scores.contactInfo < 40 ? 'high' : 'medium',
      });
    }

    if (scores.skills < 60) {
      weaknesses.push({
        category: 'المهارات',
        description: data.skills.length === 0 
          ? 'لا توجد مهارات مذكورة' 
          : 'عدد المهارات قليل جداً',
        score: Math.round(scores.skills),
        severity: scores.skills < 40 ? 'high' : 'medium',
      });
    }

    if (scores.experience < 60) {
      weaknesses.push({
        category: 'الخبرات',
        description: data.experience.length === 0 
          ? 'لا توجد خبرات مذكورة' 
          : 'خبرات عملية محدودة',
        score: Math.round(scores.experience),
        severity: scores.experience < 40 ? 'high' : 'medium',
      });
    }

    if (scores.education < 60) {
      weaknesses.push({
        category: 'التعليم',
        description: 'معلومات تعليمية ناقصة',
        score: Math.round(scores.education),
        severity: scores.education < 40 ? 'high' : 'medium',
      });
    }

    if (scores.formatting < 60) {
      weaknesses.push({
        category: 'التنسيق',
        description: 'السيرة الذاتية تحتاج إلى تحسين في التنسيق',
        score: Math.round(scores.formatting),
        severity: scores.formatting < 40 ? 'high' : 'medium',
      });
    }

    return weaknesses;
  }

  /**
   * توليد التوصيات للتحسين
   */
  generateRecommendations(scores, data, stats) {
    const recommendations = [];

    // توصيات معلومات الاتصال
    if (scores.contactInfo < 80) {
      if (!data.contactInfo.emails || data.contactInfo.emails.length === 0) {
        recommendations.push({
          priority: 'high',
          category: 'معلومات الاتصال',
          suggestion: 'أضف بريدك الإلكتروني',
          impact: 'عالي',
          estimatedImprovement: 4,
        });
      }
      if (!data.contactInfo.phones || data.contactInfo.phones.length === 0) {
        recommendations.push({
          priority: 'high',
          category: 'معلومات الاتصال',
          suggestion: 'أضف رقم هاتفك',
          impact: 'عالي',
          estimatedImprovement: 3,
        });
      }
      if (!data.contactInfo.linkedin) {
        recommendations.push({
          priority: 'medium',
          category: 'معلومات الاتصال',
          suggestion: 'أضف رابط LinkedIn الخاص بك',
          impact: 'متوسط',
          estimatedImprovement: 2,
        });
      }
    }

    // توصيات المهارات
    if (stats.skillsCount < this.idealRanges.skills.min) {
      recommendations.push({
        priority: 'high',
        category: 'المهارات',
        suggestion: `أضف المزيد من المهارات (الحد الأدنى: ${this.idealRanges.skills.min})`,
        impact: 'عالي جداً',
        estimatedImprovement: 6,
      });
    } else if (stats.skillsCount < this.idealRanges.skills.ideal) {
      recommendations.push({
        priority: 'medium',
        category: 'المهارات',
        suggestion: `أضف المزيد من المهارات للوصول للعدد المثالي (${this.idealRanges.skills.ideal})`,
        impact: 'متوسط',
        estimatedImprovement: 3,
      });
    }

    // توصيات الخبرات
    if (data.experience.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'الخبرات',
        suggestion: 'أضف خبراتك العملية',
        impact: 'عالي جداً',
        estimatedImprovement: 8,
      });
    } else if (data.experience.length < this.idealRanges.experience.ideal) {
      recommendations.push({
        priority: 'medium',
        category: 'الخبرات',
        suggestion: 'أضف المزيد من التفاصيل عن خبراتك',
        impact: 'متوسط',
        estimatedImprovement: 4,
      });
    }

    // توصيات التعليم
    if (data.education.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'التعليم',
        suggestion: 'أضف مؤهلاتك التعليمية',
        impact: 'عالي',
        estimatedImprovement: 5,
      });
    }

    // توصيات التنسيق
    if (scores.formatting < 70) {
      const textLength = data.rawText.length;
      if (textLength < this.idealRanges.textLength.min) {
        recommendations.push({
          priority: 'medium',
          category: 'التنسيق',
          suggestion: 'السيرة الذاتية قصيرة جداً، أضف المزيد من التفاصيل',
          impact: 'متوسط',
          estimatedImprovement: 3,
        });
      } else if (textLength > this.idealRanges.textLength.max) {
        recommendations.push({
          priority: 'low',
          category: 'التنسيق',
          suggestion: 'السيرة الذاتية طويلة جداً، اختصر المحتوى',
          impact: 'منخفض',
          estimatedImprovement: 2,
        });
      }
    }

    // ترتيب حسب الأولوية والتأثير
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || 
             b.estimatedImprovement - a.estimatedImprovement;
    });
  }
}

module.exports = new CVQualityAnalyzer();
