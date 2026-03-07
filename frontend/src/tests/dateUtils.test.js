import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getRelativeTime, 
  isNewJob, 
  isUrgentJob, 
  formatDate, 
  formatDateTime 
} from '../utils/dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // Mock current date to 2026-03-07 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getRelativeTime', () => {
    it('should return "الآن" for dates less than 1 minute ago (Arabic)', () => {
      const date = new Date('2026-03-07T11:59:30Z');
      expect(getRelativeTime(date, 'ar')).toBe('الآن');
    });

    it('should return "Just now" for dates less than 1 minute ago (English)', () => {
      const date = new Date('2026-03-07T11:59:30Z');
      expect(getRelativeTime(date, 'en')).toBe('Just now');
    });

    it('should return "منذ دقيقة" for 1 minute ago (Arabic)', () => {
      const date = new Date('2026-03-07T11:59:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ دقيقة');
    });

    it('should return "منذ 5 دقائق" for 5 minutes ago (Arabic)', () => {
      const date = new Date('2026-03-07T11:55:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ 5 دقائق');
    });

    it('should return "منذ ساعة" for 1 hour ago (Arabic)', () => {
      const date = new Date('2026-03-07T11:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ ساعة');
    });

    it('should return "منذ 3 ساعات" for 3 hours ago (Arabic)', () => {
      const date = new Date('2026-03-07T09:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ 3 ساعات');
    });

    it('should return "منذ يوم" for 1 day ago (Arabic)', () => {
      const date = new Date('2026-03-06T12:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ يوم');
    });

    it('should return "منذ 3 أيام" for 3 days ago (Arabic)', () => {
      const date = new Date('2026-03-04T12:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ 3 أيام');
    });

    it('should return "منذ أسبوع" for 1 week ago (Arabic)', () => {
      const date = new Date('2026-02-28T12:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ أسبوع');
    });

    it('should return "منذ أسبوعين" for 2 weeks ago (Arabic)', () => {
      const date = new Date('2026-02-21T12:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ أسبوعين');
    });

    it('should return "منذ شهر" for 1 month ago (Arabic)', () => {
      const date = new Date('2026-02-05T12:00:00Z'); // 30 days ago
      expect(getRelativeTime(date, 'ar')).toBe('منذ شهر');
    });

    it('should return "منذ سنة" for 1 year ago (Arabic)', () => {
      const date = new Date('2025-03-07T12:00:00Z');
      expect(getRelativeTime(date, 'ar')).toBe('منذ سنة');
    });

    it('should work with English', () => {
      const date = new Date('2026-03-04T12:00:00Z');
      expect(getRelativeTime(date, 'en')).toBe('3 days ago');
    });

    it('should work with French', () => {
      const date = new Date('2026-03-04T12:00:00Z');
      expect(getRelativeTime(date, 'fr')).toBe('Il y a 3 jours');
    });

    it('should default to Arabic if language not provided', () => {
      const date = new Date('2026-03-04T12:00:00Z');
      expect(getRelativeTime(date)).toBe('منذ 3 أيام');
    });
  });

  describe('isNewJob', () => {
    it('should return true for jobs posted less than 3 days ago', () => {
      const date = new Date('2026-03-05T12:00:00Z'); // 2 days ago
      expect(isNewJob(date)).toBe(true);
    });

    it('should return true for jobs posted today', () => {
      const date = new Date('2026-03-07T10:00:00Z');
      expect(isNewJob(date)).toBe(true);
    });

    it('should return false for jobs posted 3 days ago', () => {
      const date = new Date('2026-03-04T12:00:00Z');
      expect(isNewJob(date)).toBe(false);
    });

    it('should return false for jobs posted more than 3 days ago', () => {
      const date = new Date('2026-03-01T12:00:00Z');
      expect(isNewJob(date)).toBe(false);
    });
  });

  describe('isUrgentJob', () => {
    it('should return true for jobs expiring in 5 days', () => {
      const date = new Date('2026-03-12T12:00:00Z');
      expect(isUrgentJob(date)).toBe(true);
    });

    it('should return true for jobs expiring in 1 day', () => {
      const date = new Date('2026-03-08T12:00:00Z');
      expect(isUrgentJob(date)).toBe(true);
    });

    it('should return false for jobs expiring in 8 days', () => {
      const date = new Date('2026-03-15T12:00:00Z');
      expect(isUrgentJob(date)).toBe(false);
    });

    it('should return false for jobs with no expiry date', () => {
      expect(isUrgentJob(null)).toBe(false);
      expect(isUrgentJob(undefined)).toBe(false);
    });

    it('should return false for expired jobs', () => {
      const date = new Date('2026-03-01T12:00:00Z');
      expect(isUrgentJob(date)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date in Arabic', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDate(date, 'ar');
      // Arabic locale uses Arabic-Indic numerals
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format date in English', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDate(date, 'en');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('7');
    });

    it('should format date in French', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDate(date, 'fr');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('7');
    });

    it('should default to Arabic if language not provided', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time in Arabic', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDateTime(date, 'ar');
      // Arabic locale uses Arabic-Indic numerals
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format date and time in English', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDateTime(date, 'en');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('7');
    });

    it('should format date and time in French', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDateTime(date, 'fr');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('7');
    });

    it('should default to Arabic if language not provided', () => {
      const date = new Date('2026-03-07T12:00:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
