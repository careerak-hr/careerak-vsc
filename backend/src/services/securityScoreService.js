/**
 * Security Score Service
 * حساب درجة أمان الحساب بناءً على عدة عوامل
 */

/**
 * حساب Security Score للمستخدم
 * @param {Object} user - كائن المستخدم
 * @returns {Object} - { score: Number (0-100), level: String, factors: Array, recommendations: Array }
 */
function calculateSecurityScore(user) {
  let score = 0;
  const maxScore = 100;
  const factors = [];
  const recommendations = [];

  // 1. قوة كلمة المرور (25 نقطة)
  if (user.passwordStrength && user.passwordStrength.score !== undefined) {
    const passwordScore = (user.passwordStrength.score / 4) * 25;
    score += passwordScore;
    
    factors.push({
      name: 'password_strength',
      label: 'قوة كلمة المرور',
      score: passwordScore,
      maxScore: 25,
      status: user.passwordStrength.score >= 3 ? 'good' : user.passwordStrength.score >= 2 ? 'medium' : 'weak'
    });

    if (user.passwordStrength.score < 3) {
      recommendations.push({
        type: 'password',
        priority: 'high',
        message: 'استخدم كلمة مرور أقوى تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز',
        action: 'change_password'
      });
    }
  } else {
    factors.push({
      name: 'password_strength',
      label: 'قوة كلمة المرور',
      score: 0,
      maxScore: 25,
      status: 'unknown'
    });
    recommendations.push({
      type: 'password',
      priority: 'high',
      message: 'قم بتحديث كلمة المرور لتحسين الأمان',
      action: 'change_password'
    });
  }

  // 2. تأكيد البريد الإلكتروني (20 نقطة)
  if (user.emailVerified) {
    score += 20;
    factors.push({
      name: 'email_verified',
      label: 'تأكيد البريد الإلكتروني',
      score: 20,
      maxScore: 20,
      status: 'good'
    });
  } else {
    factors.push({
      name: 'email_verified',
      label: 'تأكيد البريد الإلكتروني',
      score: 0,
      maxScore: 20,
      status: 'weak'
    });
    recommendations.push({
      type: 'email',
      priority: 'high',
      message: 'قم بتأكيد بريدك الإلكتروني لتحسين أمان حسابك',
      action: 'verify_email'
    });
  }

  // 3. المصادقة الثنائية (2FA) (30 نقطة)
  if (user.twoFactorEnabled) {
    score += 30;
    factors.push({
      name: 'two_factor',
      label: 'المصادقة الثنائية (2FA)',
      score: 30,
      maxScore: 30,
      status: 'good'
    });
  } else {
    factors.push({
      name: 'two_factor',
      label: 'المصادقة الثنائية (2FA)',
      score: 0,
      maxScore: 30,
      status: 'weak'
    });
    recommendations.push({
      type: '2fa',
      priority: 'medium',
      message: 'فعّل المصادقة الثنائية لحماية إضافية لحسابك',
      action: 'enable_2fa'
    });
  }

  // 4. حسابات OAuth المرتبطة (15 نقطة)
  const oauthCount = user.oauthAccounts ? user.oauthAccounts.length : 0;
  const oauthScore = Math.min(oauthCount * 5, 15); // 5 نقاط لكل حساب، حد أقصى 15
  score += oauthScore;
  
  factors.push({
    name: 'oauth_accounts',
    label: 'حسابات OAuth المرتبطة',
    score: oauthScore,
    maxScore: 15,
    status: oauthCount >= 2 ? 'good' : oauthCount >= 1 ? 'medium' : 'weak',
    count: oauthCount
  });

  if (oauthCount === 0) {
    recommendations.push({
      type: 'oauth',
      priority: 'low',
      message: 'اربط حسابك بـ Google أو Facebook أو LinkedIn لسهولة الوصول',
      action: 'link_oauth'
    });
  }

  // 5. اكتمال الملف الشخصي (10 نقاط)
  let profileCompleteness = 0;
  const profileFields = ['phone', 'country', 'city', 'profileImage'];
  const completedFields = profileFields.filter(field => user[field] && user[field] !== '').length;
  profileCompleteness = (completedFields / profileFields.length) * 10;
  score += profileCompleteness;

  factors.push({
    name: 'profile_completeness',
    label: 'اكتمال الملف الشخصي',
    score: profileCompleteness,
    maxScore: 10,
    status: profileCompleteness >= 7 ? 'good' : profileCompleteness >= 5 ? 'medium' : 'weak',
    completedFields,
    totalFields: profileFields.length
  });

  if (profileCompleteness < 10) {
    recommendations.push({
      type: 'profile',
      priority: 'low',
      message: 'أكمل ملفك الشخصي لتحسين أمان حسابك',
      action: 'complete_profile'
    });
  }

  // تحديد مستوى الأمان
  let level = 'weak';
  let levelLabel = 'ضعيف';
  let color = '#ef4444'; // أحمر

  if (score >= 80) {
    level = 'excellent';
    levelLabel = 'ممتاز';
    color = '#10b981'; // أخضر
  } else if (score >= 60) {
    level = 'good';
    levelLabel = 'جيد';
    color = '#3b82f6'; // أزرق
  } else if (score >= 40) {
    level = 'medium';
    levelLabel = 'متوسط';
    color = '#f59e0b'; // برتقالي
  }

  // ترتيب التوصيات حسب الأولوية
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    score: Math.round(score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    level,
    levelLabel,
    color,
    factors,
    recommendations,
    calculatedAt: new Date()
  };
}

/**
 * الحصول على نصائح لتحسين Security Score
 * @param {Object} securityScore - نتيجة calculateSecurityScore
 * @returns {Array} - قائمة النصائح
 */
function getSecurityTips(securityScore) {
  const tips = [];

  // نصائح عامة
  tips.push({
    category: 'general',
    tip: 'لا تشارك كلمة المرور مع أي شخص',
    icon: '🔒'
  });

  tips.push({
    category: 'general',
    tip: 'استخدم كلمة مرور فريدة لكل موقع',
    icon: '🔑'
  });

  // نصائح بناءً على النتيجة
  if (securityScore.score < 60) {
    tips.push({
      category: 'improvement',
      tip: 'حسابك يحتاج تحسين. اتبع التوصيات أدناه',
      icon: '⚠️'
    });
  }

  if (!securityScore.factors.find(f => f.name === 'two_factor' && f.score > 0)) {
    tips.push({
      category: 'security',
      tip: 'المصادقة الثنائية تحمي حسابك حتى لو تم اختراق كلمة المرور',
      icon: '🛡️'
    });
  }

  return tips;
}

module.exports = {
  calculateSecurityScore,
  getSecurityTips
};
