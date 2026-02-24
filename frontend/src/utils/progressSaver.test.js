/**
 * Progress Saver Tests
 * اختبارات للتحقق من وظائف حفظ التقدم
 * 
 * Requirements: 6.1, 6.2, 6.6, 6.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveProgress, 
  loadProgress, 
  clearProgress, 
  hasProgress, 
  getProgressInfo 
} from './progressSaver';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

describe('ProgressSaver', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveProgress', () => {
    it('should save progress to localStorage', () => {
      const step = 1;
      const data = { 
        userType: 'individual', 
        firstName: 'أحمد', 
        email: 'ahmad@example.com' 
      };

      const result = saveProgress(step, data);

      expect(result).toBe(true);
      expect(localStorage.getItem('careerak_registration_progress')).toBeTruthy();
    });

    it('should NOT save password (Requirement 6.7)', () => {
      const step = 2;
      const data = { 
        userType: 'individual',
        email: 'ahmad@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      };

      saveProgress(step, data);
      const saved = JSON.parse(localStorage.getItem('careerak_registration_progress'));

      expect(saved.data.password).toBeUndefined();
      expect(saved.data.confirmPassword).toBeUndefined();
      expect(saved.data.email).toBe('ahmad@example.com');
    });

    it('should include expiry date (Requirement 6.6)', () => {
      const step = 1;
      const data = { userType: 'individual' };

      saveProgress(step, data);
      const saved = JSON.parse(localStorage.getItem('careerak_registration_progress'));

      expect(saved.expiresAt).toBeTruthy();
      expect(new Date(saved.expiresAt)).toBeInstanceOf(Date);
    });

    it('should include savedAt timestamp', () => {
      const step = 1;
      const data = { userType: 'individual' };

      saveProgress(step, data);
      const saved = JSON.parse(localStorage.getItem('careerak_registration_progress'));

      expect(saved.savedAt).toBeTruthy();
      expect(new Date(saved.savedAt)).toBeInstanceOf(Date);
    });
  });

  describe('loadProgress', () => {
    it('should load saved progress (Requirement 6.2)', () => {
      const step = 2;
      const data = { 
        userType: 'company', 
        companyName: 'شركة الاختبار' 
      };

      saveProgress(step, data);
      const loaded = loadProgress();

      expect(loaded).toBeTruthy();
      expect(loaded.step).toBe(step);
      expect(loaded.data.userType).toBe('company');
      expect(loaded.data.companyName).toBe('شركة الاختبار');
    });

    it('should return null if no progress saved', () => {
      const loaded = loadProgress();
      expect(loaded).toBeNull();
    });

    it('should return null and clear if expired (Requirement 6.6)', () => {
      const step = 1;
      const data = { userType: 'individual' };

      // حفظ تقدم منتهي الصلاحية
      const expiredProgress = {
        step,
        data,
        savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 أيام مضت
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // انتهى منذ يوم
      };

      localStorage.setItem('careerak_registration_progress', JSON.stringify(expiredProgress));

      const loaded = loadProgress();

      expect(loaded).toBeNull();
      expect(localStorage.getItem('careerak_registration_progress')).toBeNull();
    });

    it('should load valid non-expired progress', () => {
      const step = 1;
      const data = { userType: 'individual' };

      // حفظ تقدم صالح
      const validProgress = {
        step,
        data,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // ينتهي بعد 7 أيام
      };

      localStorage.setItem('careerak_registration_progress', JSON.stringify(validProgress));

      const loaded = loadProgress();

      expect(loaded).toBeTruthy();
      expect(loaded.step).toBe(step);
    });
  });

  describe('clearProgress', () => {
    it('should clear saved progress', () => {
      const step = 1;
      const data = { userType: 'individual' };

      saveProgress(step, data);
      expect(localStorage.getItem('careerak_registration_progress')).toBeTruthy();

      const result = clearProgress();

      expect(result).toBe(true);
      expect(localStorage.getItem('careerak_registration_progress')).toBeNull();
    });
  });

  describe('hasProgress', () => {
    it('should return true if progress exists', () => {
      const step = 1;
      const data = { userType: 'individual' };

      saveProgress(step, data);

      expect(hasProgress()).toBe(true);
    });

    it('should return false if no progress exists', () => {
      expect(hasProgress()).toBe(false);
    });

    it('should return false if progress is expired', () => {
      const expiredProgress = {
        step: 1,
        data: { userType: 'individual' },
        savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      };

      localStorage.setItem('careerak_registration_progress', JSON.stringify(expiredProgress));

      expect(hasProgress()).toBe(false);
    });
  });

  describe('getProgressInfo', () => {
    it('should return progress info', () => {
      const step = 2;
      const data = { userType: 'company' };

      saveProgress(step, data);
      const info = getProgressInfo();

      expect(info).toBeTruthy();
      expect(info.step).toBe(step);
      expect(info.savedAt).toBeTruthy();
      expect(info.expiresAt).toBeTruthy();
      expect(info.daysRemaining).toBeGreaterThan(0);
      expect(info.daysRemaining).toBeLessThanOrEqual(7);
    });

    it('should return null if no progress', () => {
      const info = getProgressInfo();
      expect(info).toBeNull();
    });
  });

  describe('Security Tests', () => {
    it('should never save sensitive data', () => {
      const sensitiveData = {
        userType: 'individual',
        email: 'test@example.com',
        password: 'MySecretPassword123!',
        confirmPassword: 'MySecretPassword123!',
        creditCard: '1234-5678-9012-3456',
        ssn: '123-45-6789'
      };

      saveProgress(1, sensitiveData);
      const saved = JSON.parse(localStorage.getItem('careerak_registration_progress'));

      // التحقق من عدم حفظ كلمات المرور
      expect(saved.data.password).toBeUndefined();
      expect(saved.data.confirmPassword).toBeUndefined();

      // البيانات الأخرى يجب أن تُحفظ
      expect(saved.data.email).toBe('test@example.com');
      expect(saved.data.userType).toBe('individual');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('careerak_registration_progress', 'invalid json {');
      
      const loaded = loadProgress();
      expect(loaded).toBeNull();
    });

    it('should handle missing expiresAt field', () => {
      const invalidProgress = {
        step: 1,
        data: { userType: 'individual' },
        savedAt: new Date().toISOString()
        // expiresAt مفقود
      };

      localStorage.setItem('careerak_registration_progress', JSON.stringify(invalidProgress));

      const loaded = loadProgress();
      expect(loaded).toBeNull(); // يجب أن يُعتبر منتهي الصلاحية
    });

    it('should handle localStorage quota exceeded', () => {
      // محاكاة امتلاء localStorage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = saveProgress(1, { userType: 'individual' });

      expect(result).toBe(false);

      // استعادة الوظيفة الأصلية
      localStorage.setItem = originalSetItem;
    });
  });
});
