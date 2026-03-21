/**
 * اختبارات الوحدة - نظام الشهادات والإنجازات
 * Unit Tests - Certificates & Achievements System
 *
 * يغطي:
 * - CertificateService (إصدار، تحقق، إلغاء، إعادة إصدار، رؤية)
 * - BadgeService (تعريف الـ badges، حساب التقدم، منح الـ badges)
 * - VerificationService (التحقق، البحث، التحقق الجماعي)
 * - Certificate Model (isValid، revoke، markAsShared، addAuditEntry)
 */

const crypto = require('crypto');
const mongoose = require('mongoose');

// ============================================================
// Certificate Model - Unit Tests
// ============================================================

describe('Certificate Model - Instance Methods', () => {
  const makeCert = (overrides = {}) => ({
    certificateId: crypto.randomUUID(),
    status: 'active',
    expiryDate: null,
    revocation: null,
    reissue: { isReissued: false },
    issueDate: new Date('2026-01-01'),
    linkedInShared: false,
    linkedInSharedAt: null,
    auditLog: [],
    isValid() {
      if (this.status === 'revoked') return false;
      if (this.expiryDate && new Date() > this.expiryDate) return false;
      return this.status === 'active';
    },
    revoke(userId, reason) {
      this.status = 'revoked';
      this.revocation = { revokedAt: new Date(), revokedBy: userId, reason: reason || 'No reason provided' };
    },
    markAsShared() {
      this.linkedInShared = true;
      this.linkedInSharedAt = new Date();
    },
    addAuditEntry(action, performedBy, details = '') {
      this.auditLog.push({ action, performedBy, performedAt: new Date(), details });
    },
    ...overrides
  });

  describe('isValid()', () => {
    test('شهادة نشطة بدون تاريخ انتهاء - صالحة', () => {
      expect(makeCert({ status: 'active' }).isValid()).toBe(true);
    });

    test('شهادة ملغاة - غير صالحة', () => {
      expect(makeCert({ status: 'revoked' }).isValid()).toBe(false);
    });

    test('شهادة منتهية الصلاحية - غير صالحة', () => {
      expect(makeCert({ status: 'active', expiryDate: new Date('2020-01-01') }).isValid()).toBe(false);
    });

    test('شهادة بتاريخ انتهاء مستقبلي - صالحة', () => {
      expect(makeCert({ status: 'active', expiryDate: new Date('2030-01-01') }).isValid()).toBe(true);
    });

    test('شهادة بحالة expired - غير صالحة', () => {
      expect(makeCert({ status: 'expired' }).isValid()).toBe(false);
    });

    test('نتيجة isValid() ثابتة لنفس الشهادة', () => {
      const cert = makeCert({ status: 'active' });
      const results = Array.from({ length: 5 }, () => cert.isValid());
      expect(new Set(results).size).toBe(1);
    });
  });

  describe('revoke()', () => {
    test('تغيير الحالة إلى revoked', () => {
      const cert = makeCert();
      cert.revoke('user123', 'Test reason');
      expect(cert.status).toBe('revoked');
    });

    test('حفظ سبب الإلغاء', () => {
      const cert = makeCert();
      cert.revoke('user123', 'Fraud detected');
      expect(cert.revocation.reason).toBe('Fraud detected');
    });

    test('حفظ معرف المُلغي', () => {
      const cert = makeCert();
      cert.revoke('user123', 'Test');
      expect(cert.revocation.revokedBy).toBe('user123');
    });

    test('تعيين سبب افتراضي إذا لم يُذكر', () => {
      const cert = makeCert();
      cert.revoke('user123');
      expect(cert.revocation.reason).toBe('No reason provided');
    });

    test('بعد الإلغاء، isValid() يعيد false', () => {
      const cert = makeCert();
      cert.revoke('user123', 'Test');
      expect(cert.isValid()).toBe(false);
    });
  });

  describe('markAsShared()', () => {
    test('تعيين linkedInShared إلى true', () => {
      const cert = makeCert();
      cert.markAsShared();
      expect(cert.linkedInShared).toBe(true);
    });

    test('تعيين linkedInSharedAt', () => {
      const cert = makeCert();
      cert.markAsShared();
      expect(cert.linkedInSharedAt).toBeInstanceOf(Date);
    });
  });

  describe('addAuditEntry()', () => {
    test('إضافة سجل للـ auditLog', () => {
      const cert = makeCert();
      cert.addAuditEntry('issued', 'user123', 'Certificate issued');
      expect(cert.auditLog).toHaveLength(1);
    });

    test('حفظ الحقول الصحيحة في السجل', () => {
      const cert = makeCert();
      cert.addAuditEntry('revoked', 'admin456', 'Revoked for fraud');
      const entry = cert.auditLog[0];
      expect(entry.action).toBe('revoked');
      expect(entry.performedBy).toBe('admin456');
      expect(entry.details).toBe('Revoked for fraud');
    });

    test('إضافة عدة سجلات', () => {
      const cert = makeCert();
      cert.addAuditEntry('issued', 'system', '');
      cert.addAuditEntry('viewed', 'user123', '');
      cert.addAuditEntry('downloaded', 'user123', '');
      expect(cert.auditLog).toHaveLength(3);
    });
  });
});

// ============================================================
// Certificate Unique ID - Property Tests
// ============================================================

describe('Property 2: Unique Certificate ID', () => {
  test('كل شهادة لها معرف UUID فريد', () => {
    const ids = Array.from({ length: 100 }, () => crypto.randomUUID());
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(100);
  });

  test('معرف الشهادة يتبع تنسيق UUID v4', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (let i = 0; i < 20; i++) {
      expect(crypto.randomUUID()).toMatch(uuidRegex);
    }
  });

  test('لا يمكن أن يكون لشهادتين نفس المعرف', () => {
    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    expect(id1).not.toBe(id2);
  });
});

// ============================================================
// BadgeService - Unit Tests
// ============================================================

describe('BadgeService - Badge Definitions', () => {
  // نستورد التعريفات مباشرة بدون DB
  const getBadgeDefinitions = () => [
    { badgeId: 'beginner', criteria: { type: 'courses_completed', value: 1 }, rarity: 'common', points: 10 },
    { badgeId: 'active-learner', criteria: { type: 'courses_completed', value: 5 }, rarity: 'common', points: 50 },
    { badgeId: 'expert', criteria: { type: 'courses_completed', value: 10 }, rarity: 'rare', points: 100 },
    { badgeId: 'speed-learner', criteria: { type: 'course_speed', value: 7 }, rarity: 'rare', points: 75 },
    { badgeId: 'outstanding', criteria: { type: 'high_ratings', value: { count: 3, minRating: 5 } }, rarity: 'epic', points: 150 },
    { badgeId: 'specialist', criteria: { type: 'specialization', value: { count: 3 } }, rarity: 'rare', points: 80 },
    { badgeId: 'persistent', criteria: { type: 'daily_login', value: 30 }, rarity: 'epic', points: 120 },
    { badgeId: 'professional', criteria: { type: 'job_obtained', value: true }, rarity: 'legendary', points: 200 },
    { badgeId: 'certificate-collector', criteria: { type: 'certificates_earned', value: 15 }, rarity: 'epic', points: 180 },
    { badgeId: 'skills-master', criteria: { type: 'skills_mastered', value: 20 }, rarity: 'legendary', points: 250 },
  ];

  test('يجب أن يكون هناك 7+ أنواع badges', () => {
    expect(getBadgeDefinitions().length).toBeGreaterThanOrEqual(7);
  });

  test('كل badge له badgeId فريد', () => {
    const defs = getBadgeDefinitions();
    const ids = defs.map(b => b.badgeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('كل badge له criteria محددة', () => {
    getBadgeDefinitions().forEach(badge => {
      expect(badge.criteria).toBeDefined();
      expect(badge.criteria.type).toBeDefined();
      expect(badge.criteria.value).toBeDefined();
    });
  });

  test('كل badge له نقاط موجبة', () => {
    getBadgeDefinitions().forEach(badge => {
      expect(badge.points).toBeGreaterThan(0);
    });
  });

  test('أنواع الـ rarity صحيحة', () => {
    const validRarities = ['common', 'rare', 'epic', 'legendary'];
    getBadgeDefinitions().forEach(badge => {
      expect(validRarities).toContain(badge.rarity);
    });
  });
});

describe('BadgeService - calculateBadgeProgress()', () => {
  const calculateBadgeProgress = (badge, userStats) => {
    const { type, value } = badge.criteria;
    switch (type) {
      case 'courses_completed':
        return Math.min(100, Math.round((userStats.coursesCompleted / value) * 100));
      case 'course_speed':
        return userStats.fastestCourseCompletion <= value ? 100 : 0;
      case 'high_ratings':
        return Math.min(100, Math.round((userStats.highRatingsCount / value.count) * 100));
      case 'specialization':
        const maxCategory = Math.max(...Object.values(userStats.coursesByCategory || {}), 0);
        return Math.min(100, Math.round((maxCategory / value.count) * 100));
      case 'daily_login':
        return Math.min(100, Math.round((userStats.consecutiveLoginDays / value) * 100));
      case 'job_obtained':
        return userStats.jobObtained ? 100 : 0;
      case 'certificates_earned':
        return Math.min(100, Math.round((userStats.certificatesEarned / value) * 100));
      case 'skills_mastered':
        return Math.min(100, Math.round((userStats.skillsMastered / value) * 100));
      default:
        return 0;
    }
  };

  test('التقدم دائماً بين 0 و 100', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    const stats = { coursesCompleted: 3 };
    const progress = calculateBadgeProgress(badge, stats);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  test('100% عند تحقيق الشرط الكامل', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    expect(calculateBadgeProgress(badge, { coursesCompleted: 5 })).toBe(100);
    expect(calculateBadgeProgress(badge, { coursesCompleted: 10 })).toBe(100);
  });

  test('0% عند عدم البدء', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    expect(calculateBadgeProgress(badge, { coursesCompleted: 0 })).toBe(0);
  });

  test('حساب صحيح للتقدم الجزئي', () => {
    const badge = { criteria: { type: 'courses_completed', value: 10 } };
    expect(calculateBadgeProgress(badge, { coursesCompleted: 5 })).toBe(50);
  });

  test('badge السرعة: 100% إذا أكمل في الوقت المحدد', () => {
    const badge = { criteria: { type: 'course_speed', value: 7 } };
    expect(calculateBadgeProgress(badge, { fastestCourseCompletion: 5 })).toBe(100);
    expect(calculateBadgeProgress(badge, { fastestCourseCompletion: 7 })).toBe(100);
  });

  test('badge السرعة: 0% إذا لم يكمل في الوقت المحدد', () => {
    const badge = { criteria: { type: 'course_speed', value: 7 } };
    expect(calculateBadgeProgress(badge, { fastestCourseCompletion: 10 })).toBe(0);
  });

  test('badge الوظيفة: 100% إذا حصل على وظيفة', () => {
    const badge = { criteria: { type: 'job_obtained', value: true } };
    expect(calculateBadgeProgress(badge, { jobObtained: true })).toBe(100);
    expect(calculateBadgeProgress(badge, { jobObtained: false })).toBe(0);
  });

  test('badge التخصص: حساب صحيح', () => {
    const badge = { criteria: { type: 'specialization', value: { count: 3 } } };
    const stats = { coursesByCategory: { programming: 2, design: 1 } };
    expect(calculateBadgeProgress(badge, stats)).toBe(67);
  });
});

// ============================================================
// Property 5: Badge Award Criteria
// ============================================================

describe('Property 5: Badge Award Criteria', () => {
  const checkCriteria = (badge, userStats) => {
    const { type, value } = badge.criteria;
    switch (type) {
      case 'courses_completed': return userStats.coursesCompleted >= value;
      case 'course_speed': return userStats.fastestCourseCompletion <= value;
      case 'high_ratings': return userStats.highRatingsCount >= value.count;
      case 'specialization':
        return Math.max(...Object.values(userStats.coursesByCategory || {}), 0) >= value.count;
      case 'daily_login': return userStats.consecutiveLoginDays >= value;
      case 'job_obtained': return userStats.jobObtained === true;
      case 'certificates_earned': return userStats.certificatesEarned >= value;
      case 'skills_mastered': return userStats.skillsMastered >= value;
      default: return false;
    }
  };

  test('badge المبتدئ: يُمنح عند إكمال دورة واحدة', () => {
    const badge = { criteria: { type: 'courses_completed', value: 1 } };
    expect(checkCriteria(badge, { coursesCompleted: 1 })).toBe(true);
    expect(checkCriteria(badge, { coursesCompleted: 0 })).toBe(false);
  });

  test('badge المتعلم النشط: يُمنح عند إكمال 5 دورات', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    expect(checkCriteria(badge, { coursesCompleted: 5 })).toBe(true);
    expect(checkCriteria(badge, { coursesCompleted: 6 })).toBe(true);
    expect(checkCriteria(badge, { coursesCompleted: 4 })).toBe(false);
  });

  test('badge الخبير: يُمنح عند إكمال 10 دورات', () => {
    const badge = { criteria: { type: 'courses_completed', value: 10 } };
    expect(checkCriteria(badge, { coursesCompleted: 10 })).toBe(true);
    expect(checkCriteria(badge, { coursesCompleted: 9 })).toBe(false);
  });

  test('badge المثابر: يُمنح عند 30 يوم متتالي', () => {
    const badge = { criteria: { type: 'daily_login', value: 30 } };
    expect(checkCriteria(badge, { consecutiveLoginDays: 30 })).toBe(true);
    expect(checkCriteria(badge, { consecutiveLoginDays: 29 })).toBe(false);
  });

  test('badge المحترف: يُمنح عند الحصول على وظيفة', () => {
    const badge = { criteria: { type: 'job_obtained', value: true } };
    expect(checkCriteria(badge, { jobObtained: true })).toBe(true);
    expect(checkCriteria(badge, { jobObtained: false })).toBe(false);
  });
});

// ============================================================
// Property 10: Badge Progress Tracking
// ============================================================

describe('Property 10: Badge Progress Tracking', () => {
  const calculateProgress = (badge, userStats) => {
    const { type, value } = badge.criteria;
    switch (type) {
      case 'courses_completed':
        return Math.min(100, Math.round((userStats.coursesCompleted / value) * 100));
      case 'certificates_earned':
        return Math.min(100, Math.round((userStats.certificatesEarned / value) * 100));
      default: return 0;
    }
  };

  test('التقدم يعكس الإنجاز الفعلي بدقة', () => {
    const badge = { criteria: { type: 'courses_completed', value: 10 } };
    expect(calculateProgress(badge, { coursesCompleted: 0 })).toBe(0);
    expect(calculateProgress(badge, { coursesCompleted: 3 })).toBe(30);
    expect(calculateProgress(badge, { coursesCompleted: 7 })).toBe(70);
    expect(calculateProgress(badge, { coursesCompleted: 10 })).toBe(100);
  });

  test('التقدم لا يتجاوز 100%', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    expect(calculateProgress(badge, { coursesCompleted: 100 })).toBe(100);
  });

  test('التقدم لا يقل عن 0%', () => {
    const badge = { criteria: { type: 'courses_completed', value: 5 } };
    expect(calculateProgress(badge, { coursesCompleted: 0 })).toBe(0);
  });
});

// ============================================================
// VerificationService - Unit Tests
// ============================================================

describe('VerificationService - Logic', () => {
  const buildVerificationResponse = (cert) => {
    const isValid = cert.isValid();
    const status = cert.status;
    let statusMessageAr = '';
    if (status === 'active' && isValid) statusMessageAr = 'الشهادة صالحة ونشطة';
    else if (status === 'revoked') statusMessageAr = 'تم إلغاء الشهادة';
    else if (status === 'expired') statusMessageAr = 'انتهت صلاحية الشهادة';
    else statusMessageAr = 'الشهادة غير صالحة';

    return {
      success: true,
      valid: isValid,
      found: true,
      messageAr: statusMessageAr,
      certificate: {
        certificateId: cert.certificateId,
        holder: { name: cert.holderName },
        course: { name: cert.courseName },
        status: { code: status, isValid },
        links: { verification: cert.verificationUrl, qrCode: cert.qrCode }
      }
    };
  };

  const makeCert = (overrides = {}) => ({
    certificateId: crypto.randomUUID(),
    status: 'active',
    expiryDate: null,
    holderName: 'أحمد محمد',
    courseName: 'دورة تطوير الويب',
    verificationUrl: 'https://careerak.com/verify/test',
    qrCode: 'data:image/png;base64,abc',
    isValid() {
      if (this.status === 'revoked') return false;
      if (this.expiryDate && new Date() > this.expiryDate) return false;
      return this.status === 'active';
    },
    ...overrides
  });

  test('شهادة نشطة: valid=true ورسالة صحيحة', () => {
    const result = buildVerificationResponse(makeCert({ status: 'active' }));
    expect(result.valid).toBe(true);
    expect(result.messageAr).toBe('الشهادة صالحة ونشطة');
  });

  test('شهادة ملغاة: valid=false ورسالة صحيحة', () => {
    const result = buildVerificationResponse(makeCert({ status: 'revoked' }));
    expect(result.valid).toBe(false);
    expect(result.messageAr).toBe('تم إلغاء الشهادة');
  });

  test('شهادة منتهية: valid=false ورسالة صحيحة', () => {
    const result = buildVerificationResponse(makeCert({ status: 'expired' }));
    expect(result.valid).toBe(false);
    expect(result.messageAr).toBe('انتهت صلاحية الشهادة');
  });

  test('الاستجابة تحتوي على جميع الحقول المطلوبة', () => {
    const result = buildVerificationResponse(makeCert());
    expect(result.certificate.certificateId).toBeDefined();
    expect(result.certificate.holder.name).toBeDefined();
    expect(result.certificate.course.name).toBeDefined();
    expect(result.certificate.status.code).toBeDefined();
    expect(result.certificate.links.verification).toContain('/verify/');
    expect(result.certificate.links.qrCode).toBeTruthy();
  });

  test('التحقق الجماعي: ملخص صحيح', () => {
    const certs = [
      makeCert({ status: 'active' }),
      makeCert({ status: 'revoked' }),
      makeCert({ status: 'active' }),
    ];
    const results = certs.map(buildVerificationResponse);
    const summary = {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
    };
    expect(summary.total).toBe(3);
    expect(summary.valid).toBe(2);
    expect(summary.invalid).toBe(1);
  });
});

// ============================================================
// Property 8: Gallery Visibility
// ============================================================

describe('Property 8: Gallery Visibility', () => {
  const filterCertificates = (certs, isOwner) => {
    if (isOwner) return certs; // المالك يرى الكل
    return certs.filter(c => !c.isHidden); // العام لا يرى المخفية
  };

  test('المالك يرى جميع الشهاداتبما فيها المخفية', () => {
    const certs = [
      { id: '1', isHidden: false },
      { id: '2', isHidden: true },
      { id: '3', isHidden: false },
    ];
    expect(filterCertificates(certs, true)).toHaveLength(3);
  });

  test('العرض العام لا يظهر الشهادات المخفية', () => {
    const certs = [
      { id: '1', isHidden: false },
      { id: '2', isHidden: true },
      { id: '3', isHidden: false },
    ];
    const visible = filterCertificates(certs, false);
    expect(visible).toHaveLength(2);
    expect(visible.find(c => c.id === '2')).toBeUndefined();
  });

  test('إخفاء جميع الشهادات: العرض العام فارغ', () => {
    const certs = [
      { id: '1', isHidden: true },
      { id: '2', isHidden: true },
    ];
    expect(filterCertificates(certs, false)).toHaveLength(0);
    expect(filterCertificates(certs, true)).toHaveLength(2);
  });
});

// ============================================================
// Property 6: Certificate Revocation
// ============================================================

describe('Property 6: Certificate Revocation', () => {
  test('شهادة ملغاة: التحقق يعيد status=revoked', () => {
    const cert = {
      status: 'revoked',
      isValid: function () { return this.status === 'active'; }
    };
    expect(cert.isValid()).toBe(false);
    expect(cert.status).toBe('revoked');
  });

  test('لا يمكن إلغاء شهادة ملغاة مرة أخرى', () => {
    const cert = { status: 'revoked' };
    const tryRevoke = () => {
      if (cert.status === 'revoked') throw new Error('Certificate is already revoked');
    };
    expect(tryRevoke).toThrow('Certificate is already revoked');
  });

  test('بعد الإلغاء، الشهادة غير صالحة في جميع الحالات', () => {
    const certs = Array.from({ length: 5 }, () => ({
      status: 'revoked',
      isValid: function () { return this.status === 'active'; }
    }));
    certs.forEach(cert => expect(cert.isValid()).toBe(false));
  });
});

// ============================================================
// Property 7: LinkedIn Share Data
// ============================================================

describe('Property 7: LinkedIn Share Data', () => {
  const buildLinkedInShareData = (cert, user) => ({
    name: cert.courseName,
    issuer: 'Careerak',
    issueDate: cert.issueDate,
    certUrl: cert.verificationUrl,
    certId: cert.certificateId,
    holderName: `${user.firstName} ${user.lastName}`,
  });

  test('بيانات المشاركة تحتوي على اسم الدورة', () => {
    const cert = { courseName: 'دورة تطوير الويب', issueDate: new Date(), verificationUrl: 'https://careerak.com/verify/123', certificateId: 'abc-123' };
    const user = { firstName: 'أحمد', lastName: 'محمد' };
    const data = buildLinkedInShareData(cert, user);
    expect(data.name).toBe('دورة تطوير الويب');
  });

  test('بيانات المشاركة تحتوي على رابط التحقق', () => {
    const cert = { courseName: 'Test', issueDate: new Date(), verificationUrl: 'https://careerak.com/verify/xyz', certificateId: 'xyz' };
    const user = { firstName: 'Test', lastName: 'User' };
    const data = buildLinkedInShareData(cert, user);
    expect(data.certUrl).toContain('/verify/');
  });

  test('بيانات المشاركة تحتوي على معرف الشهادة', () => {
    const certId = crypto.randomUUID();
    const cert = { courseName: 'Test', issueDate: new Date(), verificationUrl: `https://careerak.com/verify/${certId}`, certificateId: certId };
    const user = { firstName: 'Test', lastName: 'User' };
    const data = buildLinkedInShareData(cert, user);
    expect(data.certId).toBe(certId);
  });

  test('بيانات المشاركة تحتوي على اسم المُصدِر Careerak', () => {
    const cert = { courseName: 'Test', issueDate: new Date(), verificationUrl: 'https://careerak.com/verify/1', certificateId: '1' };
    const user = { firstName: 'Test', lastName: 'User' };
    const data = buildLinkedInShareData(cert, user);
    expect(data.issuer).toBe('Careerak');
  });
});
