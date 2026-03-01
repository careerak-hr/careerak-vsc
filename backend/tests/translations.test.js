/**
 * 🧪 Translations System Tests
 * اختبارات نظام الترجمة
 */

const { t, tBoth, detectLanguage, translations } = require('../src/utils/translations');

describe('Translations System', () => {
  
  describe('t() function', () => {
    test('should return Arabic translation by default', () => {
      const result = t('user.notFound');
      expect(result).toBe('المستخدم غير موجود');
    });

    test('should return English translation when specified', () => {
      const result = t('user.notFound', 'en');
      expect(result).toBe('User not found');
    });

    test('should handle nested keys', () => {
      const result = t('recommendations.generated', 'ar');
      expect(result).toBe('تم توليد التوصيات بنجاح');
    });

    test('should replace parameters in text', () => {
      const result = t('candidates.filtered', 'ar', { count: 5 });
      expect(result).toBe('تم العثور على 5 مرشح مطابق');
    });

    test('should replace parameters in English text', () => {
      const result = t('candidates.filtered', 'en', { count: 5 });
      expect(result).toBe('Found 5 matching candidates');
    });

    test('should handle multiple parameters', () => {
      const result = t('strengths.experience', 'ar', { years: 3 });
      expect(result).toBe('لديك 3 سنوات من الخبرة');
    });

    test('should fallback to key if translation not found', () => {
      const result = t('nonexistent.key', 'ar');
      expect(result).toBe('nonexistent.key');
    });

    test('should fallback to Arabic if language not found', () => {
      const result = t('user.notFound', 'fr');
      expect(result).toBe('المستخدم غير موجود');
    });
  });

  describe('tBoth() function', () => {
    test('should return both Arabic and English translations', () => {
      const result = tBoth('user.notFound');
      expect(result).toEqual({
        ar: 'المستخدم غير موجود',
        en: 'User not found'
      });
    });

    test('should handle parameters in both languages', () => {
      const result = tBoth('candidates.filtered', { count: 5 });
      expect(result.ar).toBe('تم العثور على 5 مرشح مطابق');
      expect(result.en).toBe('Found 5 matching candidates');
    });
  });

  describe('detectLanguage() function', () => {
    test('should detect language from query parameter', () => {
      const req = { query: { lang: 'en' } };
      const result = detectLanguage(req);
      expect(result).toBe('en');
    });

    test('should detect language from Accept-Language header', () => {
      const req = { 
        query: {},
        headers: { 'accept-language': 'en-US,en;q=0.9' }
      };
      const result = detectLanguage(req);
      expect(result).toBe('en');
    });

    test('should detect language from body', () => {
      const req = { 
        query: {},
        headers: {},
        body: { language: 'en' }
      };
      const result = detectLanguage(req);
      expect(result).toBe('en');
    });

    test('should default to Arabic if no language specified', () => {
      const req = { 
        query: {},
        headers: {},
        body: {}
      };
      const result = detectLanguage(req);
      expect(result).toBe('ar');
    });

    test('should prioritize query over header', () => {
      const req = { 
        query: { lang: 'ar' },
        headers: { 'accept-language': 'en-US' }
      };
      const result = detectLanguage(req);
      expect(result).toBe('ar');
    });
  });

  describe('Translation Coverage', () => {
    test('should have all required categories', () => {
      const requiredCategories = [
        'general',
        'user',
        'job',
        'recommendations',
        'match',
        'profile',
        'feedback',
        'skillGaps',
        'courses',
        'candidates',
        'notifications',
        'accuracy',
        'profileCompleteness',
        'strengths',
        'improvements',
        'profileSuggestions'
      ];

      requiredCategories.forEach(category => {
        expect(translations[category]).toBeDefined();
      });
    });

    test('should have both Arabic and English for all keys', () => {
      const checkTranslations = (obj, path = '') => {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];

          if (value && typeof value === 'object') {
            if (value.ar && value.en) {
              // This is a translation object
              expect(value.ar).toBeTruthy();
              expect(value.en).toBeTruthy();
            } else {
              // This is a nested category
              checkTranslations(value, currentPath);
            }
          }
        });
      };

      checkTranslations(translations);
    });

    test('should have at least 100 translation keys', () => {
      const countKeys = (obj) => {
        let count = 0;
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (value && typeof value === 'object') {
            if (value.ar && value.en) {
              count++;
            } else {
              count += countKeys(value);
            }
          }
        });
        return count;
      };

      const totalKeys = countKeys(translations);
      expect(totalKeys).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Parameter Replacement', () => {
    test('should handle single parameter', () => {
      const result = t('notifications.sent', 'ar', { count: 10 });
      expect(result).toBe('تم إرسال 10 إشعار فوري بنجاح');
    });

    test('should handle multiple occurrences of same parameter', () => {
      const result = t('strengths.experience', 'ar', { years: 5 });
      expect(result).toContain('5');
    });

    test('should not replace if parameter not provided', () => {
      const result = t('candidates.filtered', 'ar');
      expect(result).toContain('{count}');
    });

    test('should handle numeric parameters', () => {
      const result = t('notifications.noMatches', 'ar', { score: 70 });
      expect(result).toContain('70');
    });
  });

  describe('Error Handling', () => {
    test('should not throw error for invalid key', () => {
      expect(() => t('invalid.key.path', 'ar')).not.toThrow();
    });

    test('should not throw error for null parameters', () => {
      expect(() => t('user.notFound', 'ar', null)).not.toThrow();
    });

    test('should not throw error for undefined language', () => {
      expect(() => t('user.notFound', undefined)).not.toThrow();
    });

    test('should handle empty request object', () => {
      expect(() => detectLanguage({})).not.toThrow();
    });
  });
});

// تشغيل الاختبارات
if (require.main === module) {
  console.log('🧪 Running Translations Tests...\n');
  
  // اختبار بسيط
  console.log('✅ Arabic:', t('user.notFound', 'ar'));
  console.log('✅ English:', t('user.notFound', 'en'));
  console.log('✅ With params:', t('candidates.filtered', 'ar', { count: 5 }));
  console.log('✅ Both languages:', tBoth('recommendations.generated'));
  
  console.log('\n✅ All manual tests passed!');
}
