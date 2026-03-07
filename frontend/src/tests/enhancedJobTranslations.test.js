/**
 * Enhanced Job Postings - Translations Tests
 * اختبارات نظام الترجمة
 */

import { t, tp, enhancedJobPostingsTranslations } from '../translations/enhancedJobPostings';

describe('Enhanced Job Postings Translations', () => {
  
  describe('Basic Translation (t)', () => {
    test('should translate Arabic keys correctly', () => {
      expect(t('ar', 'bookmark.save')).toBe('حفظ الوظيفة');
      expect(t('ar', 'share.title')).toBe('مشاركة الوظيفة');
      expect(t('ar', 'jobCard.apply')).toBe('تقديم');
    });
    
    test('should translate English keys correctly', () => {
      expect(t('en', 'bookmark.save')).toBe('Save Job');
      expect(t('en', 'share.title')).toBe('Share Job');
      expect(t('en', 'jobCard.apply')).toBe('Apply');
    });
    
    test('should return key if translation not found', () => {
      expect(t('ar', 'nonexistent.key')).toBe('nonexistent.key');
      expect(t('en', 'invalid.path')).toBe('invalid.path');
    });
    
    test('should handle parameters correctly', () => {
      expect(t('ar', 'salary.tooltip', { count: 10 }))
        .toBe('بناءً على 10 وظيفة مشابهة');
      expect(t('en', 'salary.tooltip', { count: 10 }))
        .toBe('Based on 10 similar jobs');
    });
  });
  
  describe('Plural Translation (tp)', () => {
    test('should handle Arabic singular correctly', () => {
      expect(tp('ar', 'jobCard.applicants', 1)).toBe('متقدم');
      expect(tp('ar', 'bookmark.bookmarkCount', 1)).toBe('وظيفة محفوظة');
    });
    
    test('should handle Arabic plural correctly', () => {
      expect(tp('ar', 'jobCard.applicants', 5)).toBe('متقدمين');
      expect(tp('ar', 'bookmark.bookmarkCount', 10)).toBe('وظائف محفوظة');
    });
    
    test('should handle English singular correctly', () => {
      expect(tp('en', 'jobCard.applicants', 1)).toBe('applicant');
      expect(tp('en', 'bookmark.bookmarkCount', 1)).toBe('saved job');
    });
    
    test('should handle English plural correctly', () => {
      expect(tp('en', 'jobCard.applicants', 5)).toBe('applicants');
      expect(tp('en', 'bookmark.bookmarkCount', 10)).toBe('saved jobs');
    });
    
    test('should include count in result', () => {
      const resultAr = tp('ar', 'jobCard.applicants', 25);
      const resultEn = tp('en', 'jobCard.applicants', 25);
      
      expect(resultAr).toContain('25');
      expect(resultEn).toContain('25');
    });
  });
  
  describe('Translation Structure', () => {
    test('should have all required categories in Arabic', () => {
      const ar = enhancedJobPostingsTranslations.ar;
      
      expect(ar).toHaveProperty('viewToggle');
      expect(ar).toHaveProperty('bookmark');
      expect(ar).toHaveProperty('share');
      expect(ar).toHaveProperty('similarJobs');
      expect(ar).toHaveProperty('salary');
      expect(ar).toHaveProperty('company');
      expect(ar).toHaveProperty('jobCard');
      expect(ar).toHaveProperty('filters');
      expect(ar).toHaveProperty('search');
      expect(ar).toHaveProperty('loading');
      expect(ar).toHaveProperty('errors');
      expect(ar).toHaveProperty('time');
    });
    
    test('should have all required categories in English', () => {
      const en = enhancedJobPostingsTranslations.en;
      
      expect(en).toHaveProperty('viewToggle');
      expect(en).toHaveProperty('bookmark');
      expect(en).toHaveProperty('share');
      expect(en).toHaveProperty('similarJobs');
      expect(en).toHaveProperty('salary');
      expect(en).toHaveProperty('company');
      expect(en).toHaveProperty('jobCard');
      expect(en).toHaveProperty('filters');
      expect(en).toHaveProperty('search');
      expect(en).toHaveProperty('loading');
      expect(en).toHaveProperty('errors');
      expect(en).toHaveProperty('time');
    });
    
    test('should have matching keys in both languages', () => {
      const arKeys = Object.keys(enhancedJobPostingsTranslations.ar);
      const enKeys = Object.keys(enhancedJobPostingsTranslations.en);
      
      expect(arKeys.sort()).toEqual(enKeys.sort());
    });
  });
  
  describe('Specific Translations', () => {
    test('should have all view toggle translations', () => {
      expect(t('ar', 'viewToggle.grid')).toBe('عرض شبكي');
      expect(t('ar', 'viewToggle.list')).toBe('عرض قائمة');
      expect(t('en', 'viewToggle.grid')).toBe('Grid View');
      expect(t('en', 'viewToggle.list')).toBe('List View');
    });
    
    test('should have all bookmark translations', () => {
      expect(t('ar', 'bookmark.save')).toBe('حفظ الوظيفة');
      expect(t('ar', 'bookmark.saved')).toBe('تم الحفظ');
      expect(t('en', 'bookmark.save')).toBe('Save Job');
      expect(t('en', 'bookmark.saved')).toBe('Saved');
    });
    
    test('should have all share translations', () => {
      expect(t('ar', 'share.whatsapp')).toBe('واتساب');
      expect(t('ar', 'share.linkedin')).toBe('لينكد إن');
      expect(t('en', 'share.whatsapp')).toBe('WhatsApp');
      expect(t('en', 'share.linkedin')).toBe('LinkedIn');
    });
    
    test('should have all salary translations', () => {
      expect(t('ar', 'salary.below')).toBe('أقل من المتوسط');
      expect(t('ar', 'salary.average')).toBe('متوسط السوق');
      expect(t('ar', 'salary.above')).toBe('أعلى من المتوسط');
      expect(t('en', 'salary.below')).toBe('Below Average');
      expect(t('en', 'salary.average')).toBe('Market Average');
      expect(t('en', 'salary.above')).toBe('Above Average');
    });
    
    test('should have all time translations', () => {
      expect(t('ar', 'time.justNow')).toBe('الآن');
      expect(t('en', 'time.justNow')).toBe('Just now');
      expect(tp('ar', 'time.daysAgo', 3)).toContain('3');
      expect(tp('en', 'time.daysAgo', 3)).toContain('3');
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty parameters', () => {
      expect(t('ar', 'bookmark.save', {})).toBe('حفظ الوظيفة');
      expect(t('en', 'bookmark.save', {})).toBe('Save Job');
    });
    
    test('should handle zero count', () => {
      expect(tp('ar', 'jobCard.applicants', 0)).toContain('0');
      expect(tp('en', 'jobCard.applicants', 0)).toContain('0');
    });
    
    test('should handle large numbers', () => {
      expect(tp('ar', 'jobCard.applicants', 1000)).toContain('1000');
      expect(tp('en', 'jobCard.applicants', 1000)).toContain('1000');
    });
    
    test('should handle undefined language (fallback to Arabic)', () => {
      expect(t(undefined, 'bookmark.save')).toBe('حفظ الوظيفة');
    });
    
    test('should handle null language (fallback to Arabic)', () => {
      expect(t(null, 'bookmark.save')).toBe('حفظ الوظيفة');
    });
  });
});
