/**
 * CV Improvement Suggestions Service
 * خدمة توليد اقتراحات محددة لتحسين السيرة الذاتية
 * 
 * الميزات:
 * - توليد اقتراحات محددة وقابلة للتنفيذ
 * - مقارنة مع معايير الصناعة
 * - تحليل جودة المحتوى (الوصف، المهارات، الخبرات)
 * - اقتراحات مخصصة حسب المجال والمستوى
 * 
 * Requirements: 4.3, 4.5
 */

class CVImprovementSuggestions {
  constructor() {
    // معايير الصناعة حسب المجال
    this.industryStandards = {
      'software_development': {
        minSkills: 8,
        idealSkills: 12,
        minExperience: 2,
        idealExperience: 5,
        requiredSkills: ['javascript', 'python', 'java', 'git', 'sql'],
        recommendedSkills: ['react', 'node.js', 'docker', 'aws', 'agile'],
        minProjects: 2,
        idealProjects: 5,
      },
      'data_science': {
        minSkills: 10,
        idealSkills: 15,
        minExperience: 2,
        idealExperience: 4,
        requiredSkills: ['python', 'machine learning', 'statistics', 'sql', 'data analysis'],
        recommendedSkills: ['tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn'],
        minProjects: 3,
        idealProjects: 6,
      },
      'web_development': {
        minSkills: 7,
        idealSkills: 10,
        minExperience: 1,
        idealExperience: 4,
        requiredSkills: ['html', 'css', 'javascript', 'responsive design'],
        recommendedSkills: ['react', 'vue', 'angular', 'sass', 'webpack'],
        minProjects: 2,
        idealProjects: 5,
      },
      'mobile_development': {
        minSkills: 6,
        idealSkills: 10,
        minExperience: 2,
        idealExperience: 5,
        requiredSkills: ['android', 'ios', 'mobile ui/ux'],
        recommendedSkills: ['react native', 'flutter', 'swift', 'kotlin', 'firebase'],
        minProjects: 2,
        idealProjects: 4,
      },
      'devops': {
        minSkills: 10,
        idealSkills: 15,
        minExperience: 3,
        idealExperience: 6,
        requiredSkills: ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws'],
        recommendedSkills: ['terraform', 'ansible', 'jenkins', 'monitoring', 'security'],
        minProjects: 2,
        idealProjects: 4,
      },
      'general': {
        minSkills: 5,
        idealSkills: 10,
        minExperience: 1,
        idealExperience: 3,
        requiredSkills: [],
        recommendedSkills: [],
        minProjects: 1,
        idealProjects: 3,
      },
    };

    // معايير جودة المحتوى
    this.contentQualityStandards = {
      experienceDescription: {
        minLength: 100,
        idealLength: 200,
        maxLength: 400,
        shouldInclude: ['achievements', 'metrics', 'technologies', 'responsibilities'],
      },
      skillDescription: {
        shouldIncludeLevel: true, // مبتدئ، متوسط، متقدم
        shouldIncludeYears: true, // عدد سنوات الخبرة
      },
      summary: {
        minLength: 150,
        idealLength: 250,
        maxLength: 400,
        shouldInclude: ['expertise', 'experience', 'goals'],
      },
    };

    // كلمات قوية للإنجازات
    this.actionVerbs = {
      ar: [
        'طورت', 'أنشأت', 'قدت', 'حسنت', 'زدت', 'قللت', 'نفذت', 'صممت',
        'أدرت', 'نظمت', 'حللت', 'بنيت', 'أطلقت', 'حققت', 'ساهمت',
      ],
      en: [
        'developed', 'created', 'led', 'improved', 'increased', 'reduced', 'implemented',
        'designed', 'managed', 'organized', 'analyzed', 'built', 'launched', 'achieved',
      ],
    };

    // مؤشرات الأداء الكمية
    this.quantifiableMetrics = [
      '%', 'percent', 'نسبة', 'users', 'مستخدم', 'revenue', 'إيرادات',
      'performance', 'أداء', 'time', 'وقت', 'cost', 'تكلفة',
    ];
  }

  /**
   * تحديد المجال من المهارات
   */
  detectField(skills) {
    const skillsLower = skills.map(s => s.toLowerCase());
    
    // حساب التطابق مع كل مجال
    const fieldScores = {};
    
    for (const [field, standards] of Object.entries(this.industryStandards)) {
      if (field === 'general') continue;
      
      const requiredMatches = standards.requiredSkills.filter(skill => 
        skillsLower.some(s => s.includes(skill.toLowerCase()))
      ).length;
      
      const recommendedMatches = standards.recommendedSkills.filter(skill =>
        skillsLower.some(s => s.includes(skill.toLowerCase()))
      ).length;
      
      fieldScores[field] = requiredMatches * 2 + recommendedMatches;
    }
    
    // إيجاد المجال الأعلى
    const detectedField = Object.keys(fieldScores).reduce((a, b) => 
      fieldScores[a] > fieldScores[b] ? a : b
    );
    
    // إذا كانت النتيجة منخفضة جداً، استخدم general
    return fieldScores[detectedField] > 0 ? detectedField : 'general';
  }

  /**
   * تحليل جودة وصف الخبرات
   */
  analyzeExperienceQuality(experiences) {
    const issues = [];
    const suggestions = [];
    
    experiences.forEach((exp, index) => {
      const descLength = exp.description.length;
      const descLower = exp.description.toLowerCase();
      
      // طول الوصف
      if (descLength < this.contentQualityStandards.experienceDescription.minLength) {
        issues.push({
          type: 'short_description',
          experienceIndex: index,
          experienceTitle: exp.title,
          currentLength: descLength,
          minLength: this.contentQualityStandards.experienceDescription.minLength,
        });
        
        suggestions.push({
          priority: 'high',
          category: 'جودة المحتوى',
          experienceTitle: exp.title,
          suggestion: `وصف الخبرة "${exp.title}" قصير جداً (${descLength} حرف). أضف المزيد من التفاصيل عن مسؤولياتك وإنجازاتك (الحد الأدنى: ${this.contentQualityStandards.experienceDescription.minLength} حرف)`,
          impact: 'عالي',
          estimatedImprovement: 5,
          actionable: true,
          example: 'مثال: "طورت تطبيق ويب باستخدام React وNode.js، مما أدى إلى زيادة عدد المستخدمين بنسبة 40% خلال 6 أشهر"',
        });
      } else if (descLength > this.contentQualityStandards.experienceDescription.maxLength) {
        suggestions.push({
          priority: 'low',
          category: 'جودة المحتوى',
          experienceTitle: exp.title,
          suggestion: `وصف الخبرة "${exp.title}" طويل جداً (${descLength} حرف). اختصر المحتوى وركز على الإنجازات الرئيسية`,
          impact: 'منخفض',
          estimatedImprovement: 2,
          actionable: true,
        });
      }
      
      // وجود أفعال قوية
      const hasActionVerbs = this.actionVerbs.ar.some(verb => descLower.includes(verb)) ||
                            this.actionVerbs.en.some(verb => descLower.includes(verb));
      
      if (!hasActionVerbs && descLength > 50) {
        suggestions.push({
          priority: 'medium',
          category: 'جودة المحتوى',
          experienceTitle: exp.title,
          suggestion: `استخدم أفعال قوية في وصف الخبرة "${exp.title}" (مثل: طورت، أنشأت، قدت، حسنت)`,
          impact: 'متوسط',
          estimatedImprovement: 3,
          actionable: true,
          example: 'بدلاً من "كنت مسؤولاً عن..."، استخدم "قدت فريقاً من 5 مطورين..."',
        });
      }
      
      // وجود مقاييس كمية
      const hasMetrics = this.quantifiableMetrics.some(metric => 
        descLower.includes(metric.toLowerCase())
      );
      
      if (!hasMetrics && descLength > 50) {
        suggestions.push({
          priority: 'high',
          category: 'جودة المحتوى',
          experienceTitle: exp.title,
          suggestion: `أضف مقاييس كمية لإنجازاتك في "${exp.title}" (مثل: نسب، أرقام، نتائج قابلة للقياس)`,
          impact: 'عالي',
          estimatedImprovement: 4,
          actionable: true,
          example: 'مثال: "حسنت أداء التطبيق بنسبة 50%" أو "زدت عدد المستخدمين من 1000 إلى 5000"',
        });
      }
      
      // وجود تقنيات مستخدمة
      const mentionsTech = descLower.match(/\b(javascript|python|java|react|node|sql|aws|docker)\b/gi);
      
      if (!mentionsTech && descLength > 50) {
        suggestions.push({
          priority: 'medium',
          category: 'جودة المحتوى',
          experienceTitle: exp.title,
          suggestion: `اذكر التقنيات والأدوات المستخدمة في "${exp.title}"`,
          impact: 'متوسط',
          estimatedImprovement: 3,
          actionable: true,
          example: 'مثال: "باستخدام React، Node.js، وMongoDB"',
        });
      }
    });
    
    return { issues, suggestions };
  }

  /**
   * مقارنة مع معايير الصناعة
   */
  compareWithIndustryStandards(parsedCV, detectedField) {
    const { data, stats } = parsedCV;
    const standards = this.industryStandards[detectedField];
    const suggestions = [];
    const comparison = {
      field: detectedField,
      fieldName: this.getFieldName(detectedField),
      meetsStandards: true,
      gaps: [],
    };
    
    // مقارنة عدد المهارات
    if (stats.skillsCount < standards.minSkills) {
      comparison.meetsStandards = false;
      comparison.gaps.push({
        category: 'المهارات',
        current: stats.skillsCount,
        minimum: standards.minSkills,
        ideal: standards.idealSkills,
        gap: standards.minSkills - stats.skillsCount,
      });
      
      suggestions.push({
        priority: 'high',
        category: 'معايير الصناعة',
        suggestion: `عدد المهارات (${stats.skillsCount}) أقل من المعيار في مجال ${this.getFieldName(detectedField)} (الحد الأدنى: ${standards.minSkills})`,
        impact: 'عالي جداً',
        estimatedImprovement: 8,
        actionable: true,
        industryStandard: `${standards.minSkills}-${standards.idealSkills} مهارات`,
      });
    } else if (stats.skillsCount < standards.idealSkills) {
      suggestions.push({
        priority: 'medium',
        category: 'معايير الصناعة',
        suggestion: `أضف ${standards.idealSkills - stats.skillsCount} مهارات إضافية للوصول للعدد المثالي في مجال ${this.getFieldName(detectedField)}`,
        impact: 'متوسط',
        estimatedImprovement: 4,
        actionable: true,
        industryStandard: `${standards.idealSkills} مهارات (مثالي)`,
      });
    }
    
    // مقارنة سنوات الخبرة
    if (stats.totalExperienceYears < standards.minExperience) {
      comparison.gaps.push({
        category: 'الخبرة',
        current: stats.totalExperienceYears,
        minimum: standards.minExperience,
        ideal: standards.idealExperience,
        gap: standards.minExperience - stats.totalExperienceYears,
      });
      
      suggestions.push({
        priority: 'medium',
        category: 'معايير الصناعة',
        suggestion: `سنوات الخبرة (${stats.totalExperienceYears}) أقل من المعيار في مجال ${this.getFieldName(detectedField)} (الحد الأدنى: ${standards.minExperience} سنوات)`,
        impact: 'متوسط',
        estimatedImprovement: 3,
        actionable: false,
        note: 'استمر في اكتساب الخبرة وأضف أي خبرات إضافية (تدريب، مشاريع شخصية، عمل حر)',
      });
    }
    
    // المهارات المطلوبة المفقودة
    const skillsLower = data.skills.map(s => s.toLowerCase());
    const missingRequired = standards.requiredSkills.filter(skill =>
      !skillsLower.some(s => s.includes(skill.toLowerCase()))
    );
    
    if (missingRequired.length > 0) {
      comparison.meetsStandards = false;
      comparison.gaps.push({
        category: 'المهارات المطلوبة',
        missing: missingRequired,
        count: missingRequired.length,
      });
      
      suggestions.push({
        priority: 'high',
        category: 'معايير الصناعة',
        suggestion: `مهارات مطلوبة مفقودة في مجال ${this.getFieldName(detectedField)}: ${missingRequired.join(', ')}`,
        impact: 'عالي جداً',
        estimatedImprovement: 10,
        actionable: true,
        recommendation: 'تعلم هذه المهارات أو أضفها إذا كنت تمتلكها',
      });
    }
    
    // المهارات الموصى بها المفقودة
    const missingRecommended = standards.recommendedSkills.filter(skill =>
      !skillsLower.some(s => s.includes(skill.toLowerCase()))
    );
    
    if (missingRecommended.length > 0) {
      suggestions.push({
        priority: 'medium',
        category: 'معايير الصناعة',
        suggestion: `مهارات موصى بها في مجال ${this.getFieldName(detectedField)}: ${missingRecommended.slice(0, 5).join(', ')}`,
        impact: 'متوسط',
        estimatedImprovement: 5,
        actionable: true,
        recommendation: 'إضافة هذه المهارات سيحسن فرصك في الحصول على وظائف أفضل',
      });
    }
    
    return { comparison, suggestions };
  }

  /**
   * اقتراحات عامة للتحسين
   */
  generateGeneralSuggestions(parsedCV, qualityAnalysis) {
    const { data } = parsedCV;
    const suggestions = [];
    
    // اقتراحات معلومات الاتصال
    if (!data.contactInfo.linkedin) {
      suggestions.push({
        priority: 'medium',
        category: 'معلومات الاتصال',
        suggestion: 'أضف رابط LinkedIn الخاص بك لزيادة فرص التواصل مع أصحاب العمل',
        impact: 'متوسط',
        estimatedImprovement: 3,
        actionable: true,
      });
    }
    
    if (!data.contactInfo.github && this.isTechField(data.skills)) {
      suggestions.push({
        priority: 'medium',
        category: 'معلومات الاتصال',
        suggestion: 'أضف رابط GitHub الخاص بك لعرض مشاريعك البرمجية',
        impact: 'متوسط',
        estimatedImprovement: 4,
        actionable: true,
      });
    }
    
    // اقتراحات التعليم
    if (data.education.length === 0) {
      suggestions.push({
        priority: 'high',
        category: 'التعليم',
        suggestion: 'أضف مؤهلاتك التعليمية (الدرجة العلمية، الجامعة، سنة التخرج)',
        impact: 'عالي',
        estimatedImprovement: 6,
        actionable: true,
      });
    } else {
      // التحقق من اكتمال معلومات التعليم
      data.education.forEach((edu, index) => {
        if (!edu.year) {
          suggestions.push({
            priority: 'low',
            category: 'التعليم',
            suggestion: `أضف سنة التخرج للمؤهل "${edu.degree}"`,
            impact: 'منخفض',
            estimatedImprovement: 1,
            actionable: true,
          });
        }
      });
    }
    
    // اقتراحات الملخص الشخصي
    const hasSummary = data.rawText.toLowerCase().includes('summary') ||
                      data.rawText.toLowerCase().includes('profile') ||
                      data.rawText.toLowerCase().includes('ملخص') ||
                      data.rawText.toLowerCase().includes('نبذة');
    
    if (!hasSummary) {
      suggestions.push({
        priority: 'high',
        category: 'الملخص الشخصي',
        suggestion: 'أضف ملخصاً شخصياً في بداية السيرة الذاتية (2-3 جمل تلخص خبرتك وأهدافك)',
        impact: 'عالي',
        estimatedImprovement: 5,
        actionable: true,
        example: 'مثال: "مطور برمجيات بخبرة 5 سنوات في تطوير تطبيقات الويب باستخدام React وNode.js. متخصص في بناء حلول قابلة للتوسع وتحسين الأداء."',
      });
    }
    
    return suggestions;
  }

  /**
   * توليد اقتراحات شاملة للتحسين
   */
  generateImprovementSuggestions(parsedCV, qualityAnalysis) {
    const allSuggestions = [];
    
    // تحديد المجال
    const detectedField = this.detectField(parsedCV.data.skills);
    
    // تحليل جودة المحتوى
    const contentAnalysis = this.analyzeExperienceQuality(parsedCV.data.experience);
    allSuggestions.push(...contentAnalysis.suggestions);
    
    // مقارنة مع معايير الصناعة
    const industryComparison = this.compareWithIndustryStandards(parsedCV, detectedField);
    allSuggestions.push(...industryComparison.suggestions);
    
    // اقتراحات عامة
    const generalSuggestions = this.generateGeneralSuggestions(parsedCV, qualityAnalysis);
    allSuggestions.push(...generalSuggestions);
    
    // إضافة اقتراحات من تحليل الجودة
    if (qualityAnalysis.recommendations) {
      allSuggestions.push(...qualityAnalysis.recommendations);
    }
    
    // إزالة التكرارات وترتيب حسب الأولوية
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
    const sortedSuggestions = this.sortSuggestions(uniqueSuggestions);
    
    return {
      totalSuggestions: sortedSuggestions.length,
      detectedField,
      fieldName: this.getFieldName(detectedField),
      industryComparison: industryComparison.comparison,
      suggestions: sortedSuggestions,
      summary: this.generateSummary(sortedSuggestions, industryComparison.comparison),
    };
  }

  /**
   * إزالة الاقتراحات المكررة
   */
  deduplicateSuggestions(suggestions) {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.category}-${suggestion.suggestion}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * ترتيب الاقتراحات حسب الأولوية والتأثير
   */
  sortSuggestions(suggestions) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return suggestions.sort((a, b) => {
      // الأولوية أولاً
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // ثم التأثير المتوقع
      return (b.estimatedImprovement || 0) - (a.estimatedImprovement || 0);
    });
  }

  /**
   * توليد ملخص الاقتراحات
   */
  generateSummary(suggestions, industryComparison) {
    const highPriority = suggestions.filter(s => s.priority === 'high').length;
    const mediumPriority = suggestions.filter(s => s.priority === 'medium').length;
    const lowPriority = suggestions.filter(s => s.priority === 'low').length;
    
    const totalImprovement = suggestions.reduce((sum, s) => 
      sum + (s.estimatedImprovement || 0), 0
    );
    
    return {
      totalSuggestions: suggestions.length,
      byPriority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      estimatedTotalImprovement: Math.min(totalImprovement, 30), // الحد الأقصى 30 نقطة
      meetsIndustryStandards: industryComparison.meetsStandards,
      topPriorities: suggestions.slice(0, 3).map(s => s.suggestion),
    };
  }

  /**
   * الحصول على اسم المجال بالعربية
   */
  getFieldName(field) {
    const names = {
      'software_development': 'تطوير البرمجيات',
      'data_science': 'علم البيانات',
      'web_development': 'تطوير الويب',
      'mobile_development': 'تطوير تطبيقات الموبايل',
      'devops': 'DevOps',
      'general': 'عام',
    };
    return names[field] || field;
  }

  /**
   * التحقق من كون المجال تقني
   */
  isTechField(skills) {
    const techKeywords = [
      'javascript', 'python', 'java', 'programming', 'development',
      'software', 'web', 'mobile', 'data', 'برمجة', 'تطوير',
    ];
    
    return skills.some(skill => 
      techKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword)
      )
    );
  }
}

module.exports = new CVImprovementSuggestions();
