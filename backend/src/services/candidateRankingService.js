/**
 * 🎯 Candidate Ranking Service
 * خدمة ترتيب المرشحين حسب التطابق مع الوظيفة
 * 
 * المتطلبات: 3.1, 3.2 (ترتيب تلقائي للمرشحين حسب التطابق)
 * Property: Property 9 - Candidate Ranking Accuracy
 */

const { Individual } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Recommendation = require('../models/Recommendation');

/**
 * استخراج الميزات من ملف المرشح
 */
function extractCandidateFeatures(candidate) {
  const features = {
    // المهارات
    skills: [
      ...(candidate.computerSkills || []).map(s => s.skill?.toLowerCase()),
      ...(candidate.softwareSkills || []).map(s => s.software?.toLowerCase()),
      ...(candidate.otherSkills || []).map(s => s?.toLowerCase())
    ].filter(Boolean),
    
    // الخبرة
    totalExperience: calculateTotalExperience(candidate.experienceList || []),
    experienceAreas: (candidate.experienceList || []).map(exp => ({
      position: exp.position?.toLowerCase(),
      company: exp.company?.toLowerCase(),
      workType: exp.workType,
      jobLevel: exp.jobLevel?.toLowerCase()
    })),
    
    // التعليم
    education: (candidate.educationList || []).map(edu => ({
      level: edu.level?.toLowerCase(),
      degree: edu.degree?.toLowerCase(),
      institution: edu.institution?.toLowerCase()
    })),
    highestEducation: getHighestEducation(candidate.educationList || []),
    
    // الموقع
    location: {
      city: candidate.city?.toLowerCase(),
      country: candidate.country?.toLowerCase()
    },
    
    // التخصص والاهتمامات
    specialization: candidate.specialization?.toLowerCase(),
    interests: (candidate.interests || []).map(i => i?.toLowerCase()),
    
    // اللغات
    languages: (candidate.languages || []).map(lang => ({
      language: lang.language?.toLowerCase(),
      proficiency: lang.proficiency
    })),
    
    // التدريب
    trainingCount: (candidate.trainingList || []).length,
    hasCertificates: (candidate.trainingList || []).some(t => t.hasCertificate)
  };
  
  return features;
}

/**
 * استخراج الميزات من الوظيفة
 */
function extractJobFeatures(job) {
  // استخراج الكلمات المفتاحية من العنوان والوصف والمتطلبات
  const text = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 2);
  
  return {
    title: job.title?.toLowerCase(),
    description: job.description?.toLowerCase(),
    requirements: job.requirements?.toLowerCase(),
    keywords: [...new Set(words)],
    location: job.location?.toLowerCase(),
    jobType: job.jobType,
    postingType: job.postingType,
    salary: job.salary
  };
}

/**
 * حساب إجمالي سنوات الخبرة
 */
function calculateTotalExperience(experienceList) {
  if (!experienceList || experienceList.length === 0) return 0;
  
  let totalMonths = 0;
  experienceList.forEach(exp => {
    if (exp.from && exp.to) {
      const from = new Date(exp.from);
      const to = new Date(exp.to);
      const months = (to.getFullYear() - from.getFullYear()) * 12 + 
                     (to.getMonth() - from.getMonth());
      totalMonths += Math.max(0, months);
    }
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // سنوات بدقة عشرية
}

/**
 * الحصول على أعلى مستوى تعليمي
 */
function getHighestEducation(educationList) {
  if (!educationList || educationList.length === 0) return 'none';
  
  const levels = {
    'phd': 5,
    'doctorate': 5,
    'master': 4,
    'bachelor': 3,
    'diploma': 2,
    'high school': 1,
    'secondary': 1
  };
  
  let highest = 'none';
  let highestScore = 0;
  
  educationList.forEach(edu => {
    const level = edu.level?.toLowerCase() || '';
    for (const [key, score] of Object.entries(levels)) {
      if (level.includes(key) && score > highestScore) {
        highest = key;
        highestScore = score;
      }
    }
  });
  
  return highest;
}

/**
 * حساب تطابق المهارات
 */
function calculateSkillsMatch(candidateSkills, jobKeywords) {
  if (!candidateSkills || candidateSkills.length === 0) return 0;
  
  let matchCount = 0;
  let totalRelevant = 0;
  
  jobKeywords.forEach(keyword => {
    if (keyword.length < 3) return; // تجاهل الكلمات القصيرة
    
    totalRelevant++;
    const found = candidateSkills.some(skill => 
      skill && (skill.includes(keyword) || keyword.includes(skill))
    );
    
    if (found) matchCount++;
  });
  
  return totalRelevant > 0 ? (matchCount / totalRelevant) * 100 : 0;
}

/**
 * حساب تطابق الخبرة
 */
function calculateExperienceMatch(candidateExp, jobFeatures) {
  let score = 0;
  const reasons = [];
  
  // التحقق من سنوات الخبرة
  if (candidateExp.totalExperience > 0) {
    if (candidateExp.totalExperience >= 5) {
      score += 30;
      reasons.push('خبرة عملية قوية (5+ سنوات)');
    } else if (candidateExp.totalExperience >= 2) {
      score += 20;
      reasons.push('خبرة عملية جيدة (2-5 سنوات)');
    } else {
      score += 10;
      reasons.push('خبرة عملية محدودة');
    }
  }
  
  // التحقق من تطابق المسميات الوظيفية
  const jobTitle = jobFeatures.title || '';
  const hasRelevantPosition = candidateExp.experienceAreas.some(exp => 
    exp.position && jobTitle.includes(exp.position)
  );
  
  if (hasRelevantPosition) {
    score += 20;
    reasons.push('خبرة في نفس المجال الوظيفي');
  }
  
  return { score, reasons };
}

/**
 * حساب تطابق التعليم
 */
function calculateEducationMatch(candidateEdu, jobFeatures) {
  let score = 0;
  const reasons = [];
  
  const educationScores = {
    'phd': 30,
    'doctorate': 30,
    'master': 25,
    'bachelor': 20,
    'diploma': 15,
    'high school': 10,
    'secondary': 10,
    'none': 0
  };
  
  const eduScore = educationScores[candidateEdu.highestEducation] || 0;
  score += eduScore;
  
  if (eduScore >= 20) {
    reasons.push(`مؤهل تعليمي عالي (${candidateEdu.highestEducation})`);
  } else if (eduScore > 0) {
    reasons.push(`مؤهل تعليمي مناسب (${candidateEdu.highestEducation})`);
  }
  
  return { score, reasons };
}

/**
 * حساب تطابق الموقع
 */
function calculateLocationMatch(candidateLocation, jobLocation) {
  if (!jobLocation) return { score: 0, reasons: [] };
  
  const jobLoc = jobLocation.toLowerCase();
  const candCity = candidateLocation.city || '';
  const candCountry = candidateLocation.country || '';
  
  // تطابق تام
  if (jobLoc.includes(candCity) || candCity.includes(jobLoc)) {
    return { score: 20, reasons: ['موقع مطابق تماماً'] };
  }
  
  // تطابق الدولة
  if (jobLoc.includes(candCountry) || candCountry.includes(jobLoc)) {
    return { score: 10, reasons: ['موقع في نفس الدولة'] };
  }
  
  return { score: 0, reasons: [] };
}

/**
 * حساب درجة التطابق الإجمالية
 */
function calculateMatchScore(candidateFeatures, jobFeatures) {
  const scores = {
    skills: 0,
    experience: 0,
    education: 0,
    location: 0
  };
  
  const reasons = [];
  
  // 1. تطابق المهارات (40%)
  const skillsScore = calculateSkillsMatch(candidateFeatures.skills, jobFeatures.keywords);
  scores.skills = skillsScore * 0.4;
  
  if (skillsScore >= 70) {
    reasons.push({
      type: 'skills',
      message: `تطابق قوي في المهارات (${Math.round(skillsScore)}%)`,
      strength: 'high',
      details: { score: skillsScore }
    });
  } else if (skillsScore >= 40) {
    reasons.push({
      type: 'skills',
      message: `تطابق جيد في المهارات (${Math.round(skillsScore)}%)`,
      strength: 'medium',
      details: { score: skillsScore }
    });
  }
  
  // 2. تطابق الخبرة (30%)
  const expMatch = calculateExperienceMatch(candidateFeatures, jobFeatures);
  scores.experience = expMatch.score * 0.3;
  
  expMatch.reasons.forEach(msg => {
    reasons.push({
      type: 'experience',
      message: msg,
      strength: expMatch.score >= 25 ? 'high' : 'medium',
      details: { years: candidateFeatures.totalExperience }
    });
  });
  
  // 3. تطابق التعليم (20%)
  const eduMatch = calculateEducationMatch(candidateFeatures, jobFeatures);
  scores.education = eduMatch.score * 0.2;
  
  eduMatch.reasons.forEach(msg => {
    reasons.push({
      type: 'education',
      message: msg,
      strength: eduMatch.score >= 20 ? 'high' : 'medium',
      details: { level: candidateFeatures.highestEducation }
    });
  });
  
  // 4. تطابق الموقع (10%)
  const locMatch = calculateLocationMatch(candidateFeatures.location, jobFeatures.location);
  scores.location = locMatch.score * 0.1;
  
  locMatch.reasons.forEach(msg => {
    reasons.push({
      type: 'location',
      message: msg,
      strength: 'medium',
      details: candidateFeatures.location
    });
  });
  
  // الدرجة الإجمالية
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  
  return {
    score: Math.min(100, Math.round(totalScore)),
    confidence: calculateConfidence(scores),
    reasons,
    breakdown: scores
  };
}

/**
 * حساب ثقة النموذج
 */
function calculateConfidence(scores) {
  // الثقة تعتمد على عدد المعايير المتطابقة
  const nonZeroScores = Object.values(scores).filter(s => s > 0).length;
  const totalCriteria = Object.keys(scores).length;
  
  return Math.min(1, nonZeroScores / totalCriteria);
}

/**
 * ترتيب المرشحين لوظيفة معينة
 */
async function rankCandidatesForJob(jobId, options = {}) {
  try {
    const {
      limit = 50,
      minScore = 30,
      saveRecommendations = true
    } = options;
    
    // 1. جلب الوظيفة
    const job = await JobPosting.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // 2. استخراج ميزات الوظيفة
    const jobFeatures = extractJobFeatures(job);
    
    // 3. جلب جميع المرشحين (الموظفين)
    const candidates = await Individual.find({
      accountDisabled: { $ne: true }
    }).select('-password -otp');
    
    // 4. حساب درجة التطابق لكل مرشح
    const rankedCandidates = [];
    
    for (const candidate of candidates) {
      const candidateFeatures = extractCandidateFeatures(candidate);
      const matchResult = calculateMatchScore(candidateFeatures, jobFeatures);
      
      // تجاهل المرشحين ذوي الدرجات المنخفضة جداً
      if (matchResult.score >= minScore) {
        rankedCandidates.push({
          candidate: candidate.toObject(),
          matchScore: matchResult.score,
          confidence: matchResult.confidence,
          reasons: matchResult.reasons,
          breakdown: matchResult.breakdown
        });
      }
    }
    
    // 5. ترتيب حسب الدرجة (تنازلياً)
    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    
    // 6. تحديد العدد المطلوب
    const topCandidates = rankedCandidates.slice(0, limit);
    
    // 7. حفظ التوصيات (اختياري)
    if (saveRecommendations && topCandidates.length > 0) {
      const recommendations = topCandidates.map((item, index) => ({
        userId: job.postedBy, // الشركة
        itemType: 'candidate',
        itemId: item.candidate._id,
        score: item.matchScore,
        confidence: item.confidence,
        reasons: item.reasons,
        features: item.breakdown,
        modelVersion: '1.0',
        metadata: {
          algorithm: 'content_based',
          ranking: index + 1
        }
      }));
      
      // حذف التوصيات القديمة لهذه الوظيفة
      await Recommendation.deleteMany({
        userId: job.postedBy,
        itemType: 'candidate',
        'features.jobId': jobId
      });
      
      // إضافة التوصيات الجديدة
      await Recommendation.insertMany(recommendations);
    }
    
    return {
      jobId,
      jobTitle: job.title,
      totalCandidates: candidates.length,
      matchedCandidates: rankedCandidates.length,
      topCandidates,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('Error ranking candidates:', error);
    throw error;
  }
}

/**
 * الحصول على المرشحين المرتبين من التوصيات المحفوظة
 */
async function getRankedCandidatesFromRecommendations(companyId, options = {}) {
  try {
    const {
      limit = 20,
      minScore = 30
    } = options;
    
    const recommendations = await Recommendation.find({
      userId: companyId,
      itemType: 'candidate',
      score: { $gte: minScore },
      expiresAt: { $gt: new Date() }
    })
    .sort({ score: -1, 'metadata.ranking': 1 })
    .limit(limit)
    .populate('itemId', '-password -otp')
    .exec();
    
    return recommendations.map(rec => ({
      candidate: rec.itemId,
      matchScore: rec.score,
      confidence: rec.confidence,
      reasons: rec.reasons,
      breakdown: rec.features,
      ranking: rec.metadata.ranking,
      createdAt: rec.createdAt
    }));
    
  } catch (error) {
    console.error('Error getting ranked candidates:', error);
    throw error;
  }
}

/**
 * تحليل نقاط القوة والضعف للمرشح
 * Requirements: 3.3 (تحليل نقاط القوة والضعف)
 */
function analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // 1. تحليل المهارات
  const skillsMatch = calculateSkillsMatch(candidateFeatures.skills, jobFeatures.keywords);
  
  if (skillsMatch >= 70) {
    strengths.push({
      category: 'skills',
      title: 'مهارات تقنية قوية',
      description: `يمتلك ${Math.round(skillsMatch)}% من المهارات المطلوبة للوظيفة`,
      impact: 'high',
      details: {
        matchPercentage: Math.round(skillsMatch),
        matchedSkills: candidateFeatures.skills.filter(skill => 
          jobFeatures.keywords.some(kw => skill.includes(kw) || kw.includes(skill))
        ).slice(0, 5)
      }
    });
  } else if (skillsMatch >= 40) {
    strengths.push({
      category: 'skills',
      title: 'مهارات تقنية جيدة',
      description: `يمتلك ${Math.round(skillsMatch)}% من المهارات المطلوبة`,
      impact: 'medium',
      details: {
        matchPercentage: Math.round(skillsMatch),
        matchedSkills: candidateFeatures.skills.filter(skill => 
          jobFeatures.keywords.some(kw => skill.includes(kw) || kw.includes(skill))
        ).slice(0, 3)
      }
    });
  } else {
    weaknesses.push({
      category: 'skills',
      title: 'فجوة في المهارات التقنية',
      description: `يمتلك فقط ${Math.round(skillsMatch)}% من المهارات المطلوبة`,
      impact: 'high',
      details: {
        matchPercentage: Math.round(skillsMatch),
        missingSkills: jobFeatures.keywords.filter(kw => 
          !candidateFeatures.skills.some(skill => skill.includes(kw) || kw.includes(skill))
        ).slice(0, 5)
      }
    });
    
    recommendations.push({
      category: 'skills',
      priority: 'high',
      suggestion: 'يُنصح بتطوير المهارات التقنية المطلوبة من خلال دورات تدريبية',
      actionItems: [
        'التسجيل في دورات تدريبية متخصصة',
        'الحصول على شهادات معتمدة',
        'المشاركة في مشاريع عملية'
      ]
    });
  }
  
  // 2. تحليل الخبرة
  const totalExp = candidateFeatures.totalExperience;
  
  if (totalExp >= 5) {
    strengths.push({
      category: 'experience',
      title: 'خبرة عملية واسعة',
      description: `${totalExp} سنوات من الخبرة العملية`,
      impact: 'high',
      details: {
        years: totalExp,
        positions: candidateFeatures.experienceAreas.map(exp => exp.position).filter(Boolean).slice(0, 3)
      }
    });
  } else if (totalExp >= 2) {
    strengths.push({
      category: 'experience',
      title: 'خبرة عملية جيدة',
      description: `${totalExp} سنوات من الخبرة العملية`,
      impact: 'medium',
      details: {
        years: totalExp,
        positions: candidateFeatures.experienceAreas.map(exp => exp.position).filter(Boolean).slice(0, 2)
      }
    });
  } else if (totalExp > 0) {
    weaknesses.push({
      category: 'experience',
      title: 'خبرة عملية محدودة',
      description: `${totalExp} سنة فقط من الخبرة العملية`,
      impact: 'medium',
      details: {
        years: totalExp
      }
    });
    
    recommendations.push({
      category: 'experience',
      priority: 'medium',
      suggestion: 'بناء المزيد من الخبرة العملية في المجال',
      actionItems: [
        'البحث عن فرص تدريب عملي',
        'المشاركة في مشاريع تطوعية',
        'العمل على مشاريع شخصية'
      ]
    });
  } else {
    weaknesses.push({
      category: 'experience',
      title: 'لا توجد خبرة عملية',
      description: 'المرشح حديث التخرج أو بدون خبرة عملية',
      impact: 'high',
      details: {
        years: 0
      }
    });
    
    recommendations.push({
      category: 'experience',
      priority: 'high',
      suggestion: 'اكتساب خبرة عملية في المجال المطلوب',
      actionItems: [
        'التقديم على برامج التدريب',
        'البحث عن وظائف entry-level',
        'بناء portfolio من المشاريع'
      ]
    });
  }
  
  // 3. تحليل التعليم
  const eduLevel = candidateFeatures.highestEducation;
  const eduScores = {
    'phd': { score: 5, label: 'دكتوراه' },
    'doctorate': { score: 5, label: 'دكتوراه' },
    'master': { score: 4, label: 'ماجستير' },
    'bachelor': { score: 3, label: 'بكالوريوس' },
    'diploma': { score: 2, label: 'دبلوم' },
    'high school': { score: 1, label: 'ثانوية عامة' },
    'secondary': { score: 1, label: 'ثانوية عامة' },
    'none': { score: 0, label: 'لا يوجد' }
  };
  
  const eduInfo = eduScores[eduLevel] || { score: 0, label: 'غير محدد' };
  
  if (eduInfo.score >= 4) {
    strengths.push({
      category: 'education',
      title: 'مؤهل تعليمي متقدم',
      description: `حاصل على ${eduInfo.label}`,
      impact: 'high',
      details: {
        level: eduInfo.label,
        institutions: candidateFeatures.education.map(e => e.institution).filter(Boolean).slice(0, 2)
      }
    });
  } else if (eduInfo.score >= 3) {
    strengths.push({
      category: 'education',
      title: 'مؤهل تعليمي جيد',
      description: `حاصل على ${eduInfo.label}`,
      impact: 'medium',
      details: {
        level: eduInfo.label,
        institutions: candidateFeatures.education.map(e => e.institution).filter(Boolean).slice(0, 1)
      }
    });
  } else if (eduInfo.score > 0) {
    weaknesses.push({
      category: 'education',
      title: 'مؤهل تعليمي أساسي',
      description: `حاصل على ${eduInfo.label} فقط`,
      impact: 'medium',
      details: {
        level: eduInfo.label
      }
    });
    
    recommendations.push({
      category: 'education',
      priority: 'medium',
      suggestion: 'تحسين المؤهل التعليمي من خلال الدراسة الأكاديمية',
      actionItems: [
        'التسجيل في برامج البكالوريوس/الماجستير',
        'الحصول على شهادات مهنية معتمدة',
        'الالتحاق بدورات تعليمية متقدمة'
      ]
    });
  } else {
    weaknesses.push({
      category: 'education',
      title: 'لا يوجد مؤهل تعليمي',
      description: 'المرشح بدون مؤهل تعليمي رسمي',
      impact: 'high',
      details: {
        level: 'لا يوجد'
      }
    });
    
    recommendations.push({
      category: 'education',
      priority: 'high',
      suggestion: 'الحصول على مؤهل تعليمي أساسي',
      actionItems: [
        'إكمال التعليم الثانوي',
        'التسجيل في برامج تعليمية',
        'الحصول على شهادات مهنية'
      ]
    });
  }
  
  // 4. تحليل التدريب والشهادات
  const trainingCount = candidateFeatures.trainingCount;
  const hasCerts = candidateFeatures.hasCertificates;
  
  if (trainingCount >= 5 && hasCerts) {
    strengths.push({
      category: 'training',
      title: 'تدريب مكثف وشهادات معتمدة',
      description: `أكمل ${trainingCount} دورات تدريبية مع شهادات`,
      impact: 'high',
      details: {
        count: trainingCount,
        hasCertificates: true
      }
    });
  } else if (trainingCount >= 2) {
    strengths.push({
      category: 'training',
      title: 'تدريب جيد',
      description: `أكمل ${trainingCount} دورات تدريبية`,
      impact: 'medium',
      details: {
        count: trainingCount,
        hasCertificates: hasCerts
      }
    });
  } else if (trainingCount === 0) {
    weaknesses.push({
      category: 'training',
      title: 'لا توجد دورات تدريبية',
      description: 'المرشح لم يكمل أي دورات تدريبية',
      impact: 'medium',
      details: {
        count: 0
      }
    });
    
    recommendations.push({
      category: 'training',
      priority: 'medium',
      suggestion: 'الالتحاق بدورات تدريبية لتطوير المهارات',
      actionItems: [
        'البحث عن دورات مجانية أونلاين',
        'التسجيل في برامج تدريبية متخصصة',
        'الحصول على شهادات معتمدة'
      ]
    });
  }
  
  // 5. تحليل اللغات
  const languageCount = candidateFeatures.languages.length;
  const hasAdvancedLanguages = candidateFeatures.languages.some(
    lang => lang.proficiency === 'advanced' || lang.proficiency === 'native'
  );
  
  if (languageCount >= 3 && hasAdvancedLanguages) {
    strengths.push({
      category: 'languages',
      title: 'متعدد اللغات',
      description: `يتقن ${languageCount} لغات بمستويات متقدمة`,
      impact: 'high',
      details: {
        count: languageCount,
        languages: candidateFeatures.languages.map(l => l.language).slice(0, 3)
      }
    });
  } else if (languageCount >= 2) {
    strengths.push({
      category: 'languages',
      title: 'مهارات لغوية جيدة',
      description: `يتقن ${languageCount} لغات`,
      impact: 'medium',
      details: {
        count: languageCount,
        languages: candidateFeatures.languages.map(l => l.language)
      }
    });
  } else if (languageCount <= 1) {
    weaknesses.push({
      category: 'languages',
      title: 'مهارات لغوية محدودة',
      description: 'يتقن لغة واحدة فقط',
      impact: 'low',
      details: {
        count: languageCount
      }
    });
    
    recommendations.push({
      category: 'languages',
      priority: 'low',
      suggestion: 'تعلم لغات إضافية لتوسيع الفرص',
      actionItems: [
        'تعلم اللغة الإنجليزية (إذا لم يكن يتقنها)',
        'الالتحاق بدورات لغات',
        'ممارسة اللغة من خلال التطبيقات'
      ]
    });
  }
  
  // 6. تحليل الموقع
  const locationMatch = calculateLocationMatch(candidateFeatures.location, jobFeatures.location);
  
  if (locationMatch.score >= 15) {
    strengths.push({
      category: 'location',
      title: 'موقع مثالي',
      description: 'المرشح في نفس موقع الوظيفة',
      impact: 'medium',
      details: candidateFeatures.location
    });
  } else if (locationMatch.score === 0 && jobFeatures.location) {
    weaknesses.push({
      category: 'location',
      title: 'موقع بعيد',
      description: 'المرشح في موقع مختلف عن الوظيفة',
      impact: 'low',
      details: {
        candidateLocation: candidateFeatures.location,
        jobLocation: jobFeatures.location
      }
    });
  }
  
  // 7. حساب النقاط الإجمالية
  const totalStrengths = strengths.length;
  const totalWeaknesses = weaknesses.length;
  const highImpactStrengths = strengths.filter(s => s.impact === 'high').length;
  const highImpactWeaknesses = weaknesses.filter(w => w.impact === 'high').length;
  
  // 8. تقييم عام
  let overallAssessment = '';
  let hiringRecommendation = '';
  
  if (highImpactStrengths >= 3 && highImpactWeaknesses === 0) {
    overallAssessment = 'مرشح ممتاز';
    hiringRecommendation = 'يُنصح بشدة بالتوظيف';
  } else if (highImpactStrengths >= 2 && highImpactWeaknesses <= 1) {
    overallAssessment = 'مرشح قوي';
    hiringRecommendation = 'يُنصح بالتوظيف';
  } else if (totalStrengths > totalWeaknesses) {
    overallAssessment = 'مرشح جيد';
    hiringRecommendation = 'يمكن النظر في التوظيف';
  } else if (totalStrengths === totalWeaknesses) {
    overallAssessment = 'مرشح متوسط';
    hiringRecommendation = 'يحتاج إلى تقييم إضافي';
  } else {
    overallAssessment = 'مرشح ضعيف';
    hiringRecommendation = 'لا يُنصح بالتوظيف حالياً';
  }
  
  return {
    strengths,
    weaknesses,
    recommendations,
    summary: {
      totalStrengths,
      totalWeaknesses,
      highImpactStrengths,
      highImpactWeaknesses,
      overallAssessment,
      hiringRecommendation
    }
  };
}

/**
 * تحليل شامل للمرشح مقابل وظيفة
 * Requirements: 3.3 (تحليل نقاط القوة والضعف)
 */
async function analyzeCandidate(candidateId, jobId) {
  try {
    // 1. جلب المرشح والوظيفة
    const candidate = await Individual.findById(candidateId).select('-password -otp');
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    const job = await JobPosting.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // 2. استخراج الميزات
    const candidateFeatures = extractCandidateFeatures(candidate);
    const jobFeatures = extractJobFeatures(job);
    
    // 3. حساب درجة التطابق
    const matchResult = calculateMatchScore(candidateFeatures, jobFeatures);
    
    // 4. تحليل نقاط القوة والضعف
    const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
    
    return {
      candidate: {
        _id: candidate._id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        profileImage: candidate.profileImage
      },
      job: {
        _id: job._id,
        title: job.title,
        company: job.company
      },
      matchScore: matchResult.score,
      confidence: matchResult.confidence,
      matchReasons: matchResult.reasons,
      breakdown: matchResult.breakdown,
      analysis: {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        summary: analysis.summary
      },
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('Error analyzing candidate:', error);
    throw error;
  }
}

module.exports = {
  rankCandidatesForJob,
  getRankedCandidatesFromRecommendations,
  extractCandidateFeatures,
  extractJobFeatures,
  calculateMatchScore,
  analyzeCandidateStrengthsWeaknesses,
  analyzeCandidate
};

/**
 * مقارنة جنباً إلى جنب بين مرشحين أو أكثر
 * Requirements: 3.4 (مقارنة جنباً إلى جنب - side-by-side)
 * 
 * @param {Array<String>} candidateIds - معرفات المرشحين للمقارنة (2-5 مرشحين)
 * @param {String} jobId - معرف الوظيفة للمقارنة بناءً عليها
 * @returns {Object} نتائج المقارنة التفصيلية
 */
async function compareCandidatesSideBySide(candidateIds, jobId) {
  try {
    // 1. التحقق من عدد المرشحين
    if (!candidateIds || candidateIds.length < 2) {
      throw new Error('يجب تحديد مرشحين على الأقل للمقارنة');
    }
    
    if (candidateIds.length > 5) {
      throw new Error('لا يمكن مقارنة أكثر من 5 مرشحين في نفس الوقت');
    }
    
    // 2. جلب الوظيفة
    const job = await JobPosting.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    const jobFeatures = extractJobFeatures(job);
    
    // 3. جلب المرشحين وتحليلهم
    const candidatesData = [];
    
    for (const candidateId of candidateIds) {
      const candidate = await Individual.findById(candidateId).select('-password -otp');
      
      if (!candidate) {
        console.warn(`Candidate ${candidateId} not found, skipping...`);
        continue;
      }
      
      // استخراج الميزات
      const candidateFeatures = extractCandidateFeatures(candidate);
      
      // حساب درجة التطابق
      const matchResult = calculateMatchScore(candidateFeatures, jobFeatures);
      
      // تحليل نقاط القوة والضعف
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      candidatesData.push({
        candidate: {
          _id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          profileImage: candidate.profileImage,
          city: candidate.city,
          country: candidate.country
        },
        features: candidateFeatures,
        matchScore: matchResult.score,
        confidence: matchResult.confidence,
        breakdown: matchResult.breakdown,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary
      });
    }
    
    // 4. ترتيب المرشحين حسب درجة التطابق
    candidatesData.sort((a, b) => b.matchScore - a.matchScore);
    
    // 5. إنشاء جدول المقارنة
    const comparisonTable = {
      // معلومات أساسية
      basicInfo: candidatesData.map(c => ({
        id: c.candidate._id,
        name: `${c.candidate.firstName} ${c.candidate.lastName}`,
        email: c.candidate.email,
        location: `${c.candidate.city || ''}, ${c.candidate.country || ''}`.trim(),
        profileImage: c.candidate.profileImage
      })),
      
      // درجات التطابق
      matchScores: candidatesData.map(c => ({
        id: c.candidate._id,
        totalScore: c.matchScore,
        confidence: Math.round(c.confidence * 100),
        breakdown: {
          skills: Math.round(c.breakdown.skills),
          experience: Math.round(c.breakdown.experience),
          education: Math.round(c.breakdown.education),
          location: Math.round(c.breakdown.location)
        }
      })),
      
      // المهارات
      skills: candidatesData.map(c => ({
        id: c.candidate._id,
        totalSkills: c.features.skills.length,
        topSkills: c.features.skills.slice(0, 10),
        skillsMatchPercentage: Math.round(calculateSkillsMatch(c.features.skills, jobFeatures.keywords))
      })),
      
      // الخبرة
      experience: candidatesData.map(c => ({
        id: c.candidate._id,
        totalYears: c.features.totalExperience,
        positions: c.features.experienceAreas.map(exp => ({
          position: exp.position,
          company: exp.company,
          workType: exp.workType,
          jobLevel: exp.jobLevel
        })).slice(0, 5)
      })),
      
      // التعليم
      education: candidatesData.map(c => ({
        id: c.candidate._id,
        highestLevel: c.features.highestEducation,
        degrees: c.features.education.map(edu => ({
          level: edu.level,
          degree: edu.degree,
          institution: edu.institution
        }))
      })),
      
      // التدريب والشهادات
      training: candidatesData.map(c => ({
        id: c.candidate._id,
        totalCourses: c.features.trainingCount,
        hasCertificates: c.features.hasCertificates
      })),
      
      // اللغات
      languages: candidatesData.map(c => ({
        id: c.candidate._id,
        totalLanguages: c.features.languages.length,
        languages: c.features.languages.map(lang => ({
          language: lang.language,
          proficiency: lang.proficiency
        }))
      })),
      
      // نقاط القوة
      strengths: candidatesData.map(c => ({
        id: c.candidate._id,
        total: c.strengths.length,
        highImpact: c.strengths.filter(s => s.impact === 'high').length,
        topStrengths: c.strengths.slice(0, 5).map(s => ({
          category: s.category,
          title: s.title,
          description: s.description,
          impact: s.impact
        }))
      })),
      
      // نقاط الضعف
      weaknesses: candidatesData.map(c => ({
        id: c.candidate._id,
        total: c.weaknesses.length,
        highImpact: c.weaknesses.filter(w => w.impact === 'high').length,
        topWeaknesses: c.weaknesses.slice(0, 5).map(w => ({
          category: w.category,
          title: w.title,
          description: w.description,
          impact: w.impact
        }))
      })),
      
      // التقييم العام
      overallAssessment: candidatesData.map(c => ({
        id: c.candidate._id,
        assessment: c.summary.overallAssessment,
        recommendation: c.summary.hiringRecommendation,
        strengthsCount: c.summary.totalStrengths,
        weaknessesCount: c.summary.totalWeaknesses
      }))
    };
    
    // 6. تحليل المقارنة
    const comparisonAnalysis = {
      // أفضل مرشح
      topCandidate: {
        id: candidatesData[0].candidate._id,
        name: `${candidatesData[0].candidate.firstName} ${candidatesData[0].candidate.lastName}`,
        score: candidatesData[0].matchScore,
        reasons: [
          `أعلى درجة تطابق: ${candidatesData[0].matchScore}%`,
          `${candidatesData[0].summary.highImpactStrengths} نقاط قوة عالية التأثير`,
          `${candidatesData[0].summary.highImpactWeaknesses} نقاط ضعف عالية التأثير`
        ]
      },
      
      // فروقات رئيسية
      keyDifferences: [],
      
      // توصيات
      recommendations: []
    };
    
    // تحليل الفروقات الرئيسية
    if (candidatesData.length >= 2) {
      const first = candidatesData[0];
      const second = candidatesData[1];
      
      // فرق في المهارات
      const skillsDiff = Math.abs(
        calculateSkillsMatch(first.features.skills, jobFeatures.keywords) -
        calculateSkillsMatch(second.features.skills, jobFeatures.keywords)
      );
      
      if (skillsDiff > 20) {
        comparisonAnalysis.keyDifferences.push({
          category: 'skills',
          description: `فرق كبير في المهارات التقنية (${Math.round(skillsDiff)}%)`,
          advantage: first.features.skills.length > second.features.skills.length ? 
            `${first.candidate.firstName} ${first.candidate.lastName}` : 
            `${second.candidate.firstName} ${second.candidate.lastName}`
        });
      }
      
      // فرق في الخبرة
      const expDiff = Math.abs(first.features.totalExperience - second.features.totalExperience);
      
      if (expDiff > 2) {
        comparisonAnalysis.keyDifferences.push({
          category: 'experience',
          description: `فرق في سنوات الخبرة (${expDiff.toFixed(1)} سنوات)`,
          advantage: first.features.totalExperience > second.features.totalExperience ? 
            `${first.candidate.firstName} ${first.candidate.lastName}` : 
            `${second.candidate.firstName} ${second.candidate.lastName}`
        });
      }
      
      // فرق في التعليم
      const eduLevels = { 'phd': 5, 'doctorate': 5, 'master': 4, 'bachelor': 3, 'diploma': 2, 'high school': 1, 'none': 0 };
      const firstEduLevel = eduLevels[first.features.highestEducation] || 0;
      const secondEduLevel = eduLevels[second.features.highestEducation] || 0;
      
      if (Math.abs(firstEduLevel - secondEduLevel) >= 2) {
        comparisonAnalysis.keyDifferences.push({
          category: 'education',
          description: `فرق في المستوى التعليمي`,
          advantage: firstEduLevel > secondEduLevel ? 
            `${first.candidate.firstName} ${first.candidate.lastName} (${first.features.highestEducation})` : 
            `${second.candidate.firstName} ${second.candidate.lastName} (${second.features.highestEducation})`
        });
      }
    }
    
    // توصيات المقارنة
    if (candidatesData[0].matchScore - candidatesData[candidatesData.length - 1].matchScore > 30) {
      comparisonAnalysis.recommendations.push({
        priority: 'high',
        suggestion: 'يوجد فرق كبير في درجات التطابق. يُنصح بالتركيز على المرشحين الأوائل.',
        action: 'ترتيب المقابلات حسب درجة التطابق'
      });
    }
    
    if (candidatesData.filter(c => c.matchScore >= 70).length > 1) {
      comparisonAnalysis.recommendations.push({
        priority: 'medium',
        suggestion: 'يوجد أكثر من مرشح بدرجة تطابق عالية (70%+).',
        action: 'إجراء مقابلات مع جميع المرشحين ذوي الدرجات العالية'
      });
    }
    
    const avgScore = candidatesData.reduce((sum, c) => sum + c.matchScore, 0) / candidatesData.length;
    if (avgScore < 50) {
      comparisonAnalysis.recommendations.push({
        priority: 'high',
        suggestion: 'متوسط درجات التطابق منخفض. قد تحتاج إلى توسيع نطاق البحث.',
        action: 'مراجعة متطلبات الوظيفة أو البحث عن مرشحين إضافيين'
      });
    }
    
    // 7. النتيجة النهائية
    return {
      job: {
        _id: job._id,
        title: job.title,
        company: job.company
      },
      candidatesCount: candidatesData.length,
      comparisonTable,
      analysis: comparisonAnalysis,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('Error comparing candidates:', error);
    throw error;
  }
}

/**
 * توصيات استباقية للمرشحين المحتملين
 * Requirements: 3.5 (توصيات استباقية لمرشحين محتملين)
 * 
 * تقترح مرشحين محتملين للشركة بناءً على:
 * - الوظائف المنشورة سابقاً
 * - أنماط التوظيف
 * - المرشحين الجدد المسجلين
 * - المرشحين الذين قد يهتمون بالوظيفة
 * 
 * @param {String} companyId - معرف الشركة
 * @param {Object} options - خيارات التوصيات
 * @returns {Object} قائمة المرشحين المقترحين
 */
async function suggestProactiveCandidates(companyId, options = {}) {
  try {
    const {
      limit = 20,
      minScore = 50,
      includeNewCandidates = true,
      includeActiveCandidates = true,
      daysBack = 30
    } = options;
    
    // 1. جلب الوظائف الحديثة للشركة
    const recentJobs = await JobPosting.find({
      postedBy: companyId,
      createdAt: { $gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(5);
    
    if (recentJobs.length === 0) {
      return {
        companyId,
        suggestions: [],
        message: 'لا توجد وظائف حديثة لتحليل أنماط التوظيف'
      };
    }
    
    // 2. استخراج الأنماط المشتركة من الوظائف
    const commonPatterns = extractCommonPatternsFromJobs(recentJobs);
    
    // 3. بناء معايير البحث عن المرشحين
    const searchCriteria = buildCandidateSearchCriteria(commonPatterns, {
      includeNewCandidates,
      includeActiveCandidates,
      daysBack
    });
    
    // 4. البحث عن المرشحين المحتملين
    const potentialCandidates = await Individual.find(searchCriteria)
      .select('-password -otp')
      .limit(limit * 2); // جلب ضعف العدد للتصفية
    
    // 5. تقييم كل مرشح مقابل الأنماط المشتركة
    const scoredCandidates = [];
    
    for (const candidate of potentialCandidates) {
      const candidateFeatures = extractCandidateFeatures(candidate);
      const score = calculateProactiveMatchScore(candidateFeatures, commonPatterns);
      
      if (score.totalScore >= minScore) {
        scoredCandidates.push({
          candidate: {
            _id: candidate._id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            profileImage: candidate.profileImage,
            city: candidate.city,
            country: candidate.country,
            specialization: candidate.specialization,
            createdAt: candidate.createdAt
          },
          matchScore: score.totalScore,
          confidence: score.confidence,
          reasons: score.reasons,
          breakdown: score.breakdown,
          isNewCandidate: isNewCandidate(candidate, daysBack),
          potentialJobs: score.potentialJobs
        });
      }
    }
    
    // 6. ترتيب حسب الدرجة
    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
    
    // 7. تحديد العدد المطلوب
    const topSuggestions = scoredCandidates.slice(0, limit);
    
    // 8. حفظ التوصيات الاستباقية
    if (topSuggestions.length > 0) {
      const recommendations = topSuggestions.map((item, index) => ({
        userId: companyId,
        itemType: 'candidate',
        itemId: item.candidate._id,
        score: item.matchScore,
        confidence: item.confidence,
        reasons: item.reasons,
        features: {
          ...item.breakdown,
          isProactive: true,
          isNewCandidate: item.isNewCandidate,
          potentialJobs: item.potentialJobs
        },
        modelVersion: '1.0',
        metadata: {
          algorithm: 'proactive_recommendation',
          ranking: index + 1,
          suggestedAt: new Date()
        }
      }));
      
      await Recommendation.insertMany(recommendations);
    }
    
    return {
      companyId,
      totalCandidatesEvaluated: potentialCandidates.length,
      suggestionsCount: topSuggestions.length,
      suggestions: topSuggestions,
      patterns: {
        commonSkills: commonPatterns.commonSkills.slice(0, 10),
        preferredEducation: commonPatterns.preferredEducation,
        preferredExperience: commonPatterns.preferredExperience,
        commonLocations: commonPatterns.commonLocations
      },
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('Error suggesting proactive candidates:', error);
    throw error;
  }
}

/**
 * استخراج الأنماط المشتركة من الوظائف
 */
function extractCommonPatternsFromJobs(jobs) {
  const allKeywords = [];
  const allLocations = [];
  
  jobs.forEach(job => {
    const jobFeatures = extractJobFeatures(job);
    allKeywords.push(...jobFeatures.keywords);
    if (jobFeatures.location) {
      allLocations.push(jobFeatures.location);
    }
  });
  
  // حساب تكرار الكلمات المفتاحية
  const keywordFrequency = {};
  allKeywords.forEach(keyword => {
    keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
  });
  
  // ترتيب حسب التكرار
  const commonSkills = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count]) => ({ keyword, count }))
    .filter(item => item.keyword.length > 3);
  
  // حساب تكرار المواقع
  const locationFrequency = {};
  allLocations.forEach(location => {
    locationFrequency[location] = (locationFrequency[location] || 0) + 1;
  });
  
  const commonLocations = Object.entries(locationFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => ({ location, count }));
  
  return {
    commonSkills,
    commonLocations,
    preferredEducation: ['bachelor', 'master'], // يمكن تحسينه بتحليل الوظائف
    preferredExperience: { min: 2, max: 10 }, // يمكن تحسينه بتحليل الوظائف
    totalJobs: jobs.length
  };
}

/**
 * بناء معايير البحث عن المرشحين
 */
function buildCandidateSearchCriteria(patterns, options) {
  const criteria = {
    accountDisabled: { $ne: true }
  };
  
  // البحث بناءً على المهارات المشتركة
  if (patterns.commonSkills.length > 0) {
    const topSkills = patterns.commonSkills.slice(0, 20).map(s => s.keyword);
    
    criteria.$or = [
      { 'computerSkills.skill': { $in: topSkills } },
      { 'softwareSkills.software': { $in: topSkills } },
      { otherSkills: { $in: topSkills } },
      { specialization: { $in: topSkills } },
      { interests: { $in: topSkills } }
    ];
  }
  
  // تصفية المرشحين الجدد فقط
  if (options.includeNewCandidates && !options.includeActiveCandidates) {
    criteria.createdAt = {
      $gte: new Date(Date.now() - options.daysBack * 24 * 60 * 60 * 1000)
    };
  }
  
  // تصفية المرشحين النشطين (آخر تسجيل دخول)
  if (options.includeActiveCandidates) {
    criteria.lastLogin = {
      $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // آخر 60 يوم
    };
  }
  
  return criteria;
}

/**
 * حساب درجة التطابق الاستباقية
 */
function calculateProactiveMatchScore(candidateFeatures, patterns) {
  let totalScore = 0;
  const reasons = [];
  const breakdown = {};
  const potentialJobs = [];
  
  // 1. تطابق المهارات مع الأنماط المشتركة (50%)
  const topPatternSkills = patterns.commonSkills.slice(0, 20).map(s => s.keyword);
  const skillsMatch = calculateSkillsMatch(candidateFeatures.skills, topPatternSkills);
  breakdown.skills = skillsMatch * 0.5;
  totalScore += breakdown.skills;
  
  if (skillsMatch >= 60) {
    reasons.push({
      type: 'skills',
      message: `يمتلك ${Math.round(skillsMatch)}% من المهارات المطلوبة في وظائفكم`,
      strength: 'high'
    });
  } else if (skillsMatch >= 30) {
    reasons.push({
      type: 'skills',
      message: `يمتلك ${Math.round(skillsMatch)}% من المهارات المطلوبة`,
      strength: 'medium'
    });
  }
  
  // 2. تطابق الخبرة (25%)
  const expInRange = candidateFeatures.totalExperience >= patterns.preferredExperience.min &&
                     candidateFeatures.totalExperience <= patterns.preferredExperience.max;
  
  if (expInRange) {
    breakdown.experience = 25;
    totalScore += 25;
    reasons.push({
      type: 'experience',
      message: `خبرة مناسبة (${candidateFeatures.totalExperience} سنوات)`,
      strength: 'high'
    });
  } else if (candidateFeatures.totalExperience > 0) {
    breakdown.experience = 15;
    totalScore += 15;
    reasons.push({
      type: 'experience',
      message: `لديه خبرة عملية (${candidateFeatures.totalExperience} سنوات)`,
      strength: 'medium'
    });
  } else {
    breakdown.experience = 0;
  }
  
  // 3. تطابق التعليم (15%)
  if (patterns.preferredEducation.includes(candidateFeatures.highestEducation)) {
    breakdown.education = 15;
    totalScore += 15;
    reasons.push({
      type: 'education',
      message: `مؤهل تعليمي مناسب (${candidateFeatures.highestEducation})`,
      strength: 'high'
    });
  } else if (candidateFeatures.highestEducation !== 'none') {
    breakdown.education = 8;
    totalScore += 8;
    reasons.push({
      type: 'education',
      message: `لديه مؤهل تعليمي (${candidateFeatures.highestEducation})`,
      strength: 'medium'
    });
  } else {
    breakdown.education = 0;
  }
  
  // 4. تطابق الموقع (10%)
  if (patterns.commonLocations.length > 0) {
    const candidateLocation = `${candidateFeatures.location.city} ${candidateFeatures.location.country}`.toLowerCase();
    const locationMatch = patterns.commonLocations.some(loc => 
      candidateLocation.includes(loc.location) || loc.location.includes(candidateLocation)
    );
    
    if (locationMatch) {
      breakdown.location = 10;
      totalScore += 10;
      reasons.push({
        type: 'location',
        message: 'موقع مناسب لوظائفكم',
        strength: 'medium'
      });
    } else {
      breakdown.location = 0;
    }
  } else {
    breakdown.location = 0;
  }
  
  // 5. حساب الثقة
  const confidence = Math.min(1, (reasons.length / 4) * (totalScore / 100));
  
  // 6. تحديد الوظائف المحتملة (بناءً على المهارات)
  if (skillsMatch >= 40) {
    potentialJobs.push({
      type: 'technical',
      reason: 'مهارات تقنية مناسبة',
      matchPercentage: Math.round(skillsMatch)
    });
  }
  
  if (candidateFeatures.totalExperience >= 3) {
    potentialJobs.push({
      type: 'senior',
      reason: 'خبرة كافية لمناصب متقدمة',
      years: candidateFeatures.totalExperience
    });
  }
  
  return {
    totalScore: Math.min(100, Math.round(totalScore)),
    confidence,
    reasons,
    breakdown,
    potentialJobs
  };
}

/**
 * التحقق من كون المرشح جديد
 */
function isNewCandidate(candidate, daysBack) {
  const registrationDate = new Date(candidate.createdAt);
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  return registrationDate >= cutoffDate;
}

/**
 * إشعار المرشحين المناسبين عن وظيفة جديدة
 * Requirements: 3.5 (إشعار المرشحين المناسبين)
 * 
 * @param {String} jobId - معرف الوظيفة الجديدة
 * @param {Object} options - خيارات الإشعار
 * @returns {Object} نتائج الإشعار
 */
async function notifyMatchingCandidates(jobId, options = {}) {
  try {
    const {
      minScore = 60,
      maxNotifications = 50,
      sendImmediately = true
    } = options;
    
    // 1. جلب الوظيفة
    const job = await JobPosting.findById(jobId).populate('postedBy', 'companyName');
    if (!job) {
      throw new Error('Job not found');
    }
    
    // 2. استخراج ميزات الوظيفة
    const jobFeatures = extractJobFeatures(job);
    
    // 3. البحث عن المرشحين المحتملين
    const keywords = jobFeatures.keywords.slice(0, 30);
    
    const potentialCandidates = await Individual.find({
      accountDisabled: { $ne: true },
      $or: [
        { 'computerSkills.skill': { $in: keywords } },
        { 'softwareSkills.software': { $in: keywords } },
        { otherSkills: { $in: keywords } },
        { specialization: { $in: keywords } },
        { interests: { $in: keywords } }
      ]
    }).select('_id firstName lastName email').limit(maxNotifications * 2);
    
    // 4. تقييم كل مرشح
    const matchedCandidates = [];
    
    for (const candidate of potentialCandidates) {
      const fullCandidate = await Individual.findById(candidate._id).select('-password -otp');
      const candidateFeatures = extractCandidateFeatures(fullCandidate);
      const matchResult = calculateMatchScore(candidateFeatures, jobFeatures);
      
      if (matchResult.score >= minScore) {
        matchedCandidates.push({
          candidateId: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          matchScore: matchResult.score,
          reasons: matchResult.reasons
        });
      }
    }
    
    // 5. ترتيب حسب الدرجة
    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    
    // 6. تحديد العدد المطلوب
    const candidatesToNotify = matchedCandidates.slice(0, maxNotifications);
    
    // 7. إرسال الإشعارات
    const notificationService = require('./notificationService');
    const notificationResults = [];
    
    if (sendImmediately) {
      for (const candidate of candidatesToNotify) {
        try {
          const notification = await notificationService.createNotification({
            recipient: candidate.candidateId,
            type: 'job_match',
            title: 'وظيفة جديدة مناسبة لك! 🎯',
            message: `وظيفة "${job.title}" في ${job.postedBy?.companyName || job.location} تناسب مهاراتك بنسبة ${candidate.matchScore}%`,
            relatedData: { 
              jobPosting: job._id,
              matchScore: candidate.matchScore,
              matchReasons: candidate.reasons.slice(0, 3)
            },
            priority: candidate.matchScore >= 80 ? 'high' : 'medium'
          });
          
          notificationResults.push({
            candidateId: candidate.candidateId,
            name: candidate.name,
            status: 'sent',
            notificationId: notification?._id
          });
        } catch (error) {
          console.error(`Error notifying candidate ${candidate.candidateId}:`, error);
          notificationResults.push({
            candidateId: candidate.candidateId,
            name: candidate.name,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    return {
      jobId,
      jobTitle: job.title,
      totalCandidatesEvaluated: potentialCandidates.length,
      matchedCandidates: matchedCandidates.length,
      notificationsSent: notificationResults.filter(r => r.status === 'sent').length,
      notificationsFailed: notificationResults.filter(r => r.status === 'failed').length,
      results: notificationResults,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('Error notifying matching candidates:', error);
    throw error;
  }
}

module.exports = {
  rankCandidatesForJob,
  getRankedCandidatesFromRecommendations,
  extractCandidateFeatures,
  extractJobFeatures,
  calculateMatchScore,
  analyzeCandidateStrengthsWeaknesses,
  analyzeCandidate,
  compareCandidatesSideBySide,
  suggestProactiveCandidates,
  notifyMatchingCandidates
};
