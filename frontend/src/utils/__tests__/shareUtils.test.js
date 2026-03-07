import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackShare,
  copyToClipboard,
  getJobUrl,
  createShareData,
  shareNative,
  shareWhatsApp,
  shareLinkedIn,
  shareTwitter,
  shareFacebook,
  shareCopy,
  shareJob,
  isNativeShareSupported
} from '../shareUtils';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock window.open
global.window.open = vi.fn();

describe('shareUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackShare', () => {
    it('يرسل طلب تتبع إلى Backend', async () => {
      fetch.mockResolvedValue({ ok: true });

      await trackShare('123', 'whatsapp');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/jobs/123/share'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({ platform: 'whatsapp' })
        })
      );
    });

    it('لا يرسل طلب إذا لم يكن هناك token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await trackShare('123', 'whatsapp');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('يتعامل مع الأخطاء بصمت', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(trackShare('123', 'whatsapp')).resolves.not.toThrow();
    });
  });

  describe('copyToClipboard', () => {
    it('ينسخ النص باستخدام Clipboard API', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };

      const result = await copyToClipboard('test text');

      expect(writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('يستخدم fallback عند عدم دعم Clipboard API', async () => {
      global.navigator.clipboard = undefined;
      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });

    it('يعيد false عند الفشل', async () => {
      global.navigator.clipboard = undefined;
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await copyToClipboard('test text');

      expect(result).toBe(false);
    });
  });

  describe('getJobUrl', () => {
    it('يعيد رابط الوظيفة الصحيح', () => {
      const url = getJobUrl('123');
      expect(url).toMatch(/\/jobs\/123$/);
    });
  });

  describe('createShareData', () => {
    it('ينشئ بيانات المشاركة بشكل صحيح', () => {
      const job = {
        id: '123',
        title: 'مطور Full Stack',
        company: { name: 'شركة التقنية' },
        location: { city: 'الرياض' }
      };

      const shareData = createShareData(job);

      expect(shareData).toEqual({
        title: 'مطور Full Stack - شركة التقنية',
        text: 'مطور Full Stack في شركة التقنية - الرياض',
        url: expect.stringContaining('/jobs/123')
      });
    });

    it('يتعامل مع البيانات الناقصة', () => {
      const job = {
        id: '123',
        title: 'مطور',
        company: {}
      };

      const shareData = createShareData(job);

      expect(shareData.title).toBe('مطور - شركة');
      expect(shareData.text).toBe('مطور في شركة');
    });
  });

  describe('shareNative', () => {
    it('يستخدم Web Share API', async () => {
      const share = vi.fn().mockResolvedValue();
      global.navigator.share = share;
      fetch.mockResolvedValue({ ok: true });

      const job = {
        id: '123',
        title: 'مطور',
        company: { name: 'شركة' }
      };

      const result = await shareNative(job);

      expect(share).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('يعيد false إذا لم يكن مدعوماً', async () => {
      global.navigator.share = undefined;

      const job = { id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareNative(job);

      expect(result).toBe(false);
    });

    it('يعيد false عند الإلغاء', async () => {
      const share = vi.fn().mockRejectedValue({ name: 'AbortError' });
      global.navigator.share = share;

      const job = { id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareNative(job);

      expect(result).toBe(false);
    });
  });

  describe('shareWhatsApp', () => {
    it('يفتح نافذة WhatsApp', () => {
      const job = {
        id: '123',
        title: 'مطور',
        company: { name: 'شركة' }
      };

      shareWhatsApp(job);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  describe('shareLinkedIn', () => {
    it('يفتح نافذة LinkedIn', () => {
      const job = {
        id: '123',
        title: 'مطور',
        company: { name: 'شركة' }
      };

      shareLinkedIn(job);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  describe('shareTwitter', () => {
    it('يفتح نافذة Twitter', () => {
      const job = {
        id: '123',
        title: 'مطور',
        company: { name: 'شركة' }
      };

      shareTwitter(job);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  describe('shareFacebook', () => {
    it('يفتح نافذة Facebook', () => {
      const job = {
        id: '123',
        title: 'مطور',
        company: { name: 'شركة' }
      };

      shareFacebook(job);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  describe('shareCopy', () => {
    it('ينسخ الرابط ويتتبع', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };
      fetch.mockResolvedValue({ ok: true });

      const job = { id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareCopy(job);

      expect(writeText).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('shareJob', () => {
    it('يستدعي الدالة الصحيحة حسب المنصة', async () => {
      const job = { id: '123', title: 'مطور', company: { name: 'شركة' } };

      // Test copy
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };
      fetch.mockResolvedValue({ ok: true });
      
      await shareJob(job, 'copy');
      expect(writeText).toHaveBeenCalled();

      // Test whatsapp
      await shareJob(job, 'whatsapp');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('يعيد false للمنصات غير المعروفة', async () => {
      const job = { id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareJob(job, 'unknown');

      expect(result).toBe(false);
    });
  });

  describe('isNativeShareSupported', () => {
    it('يعيد true إذا كان مدعوماً', () => {
      global.navigator.share = vi.fn();
      expect(isNativeShareSupported()).toBe(true);
    });

    it('يعيد false إذا لم يكن مدعوماً', () => {
      global.navigator.share = undefined;
      expect(isNativeShareSupported()).toBe(false);
    });
  });
});
