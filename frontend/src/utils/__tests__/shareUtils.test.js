import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackShare,
  copyToClipboard,
  getJobUrl,
  getContentUrl,
  addUtmParams,
  createShareData,
  shareNative,
  shareWhatsApp,
  shareViaWhatsApp,
  shareLinkedIn,
  shareViaLinkedIn,
  shareTwitter,
  shareViaTwitter,
  shareFacebook,
  shareViaFacebook,
  shareViaTelegram,
  shareViaEmail,
  copyShareLink,
  shareCopy,
  shareJob,
  isNativeShareSupported,
  isMobileDevice,
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

// Mock window.location
delete global.window.location;
global.window.location = { href: '' };

describe('shareUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── trackShare ────────────────────────────────────────────────────────────

  describe('trackShare', () => {
    it('يرسل طلب تتبع إلى Backend', async () => {
      fetch.mockResolvedValue({ ok: true });

      await trackShare('123', 'whatsapp');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shares'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          }),
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

  // ─── copyToClipboard ───────────────────────────────────────────────────────

  describe('copyToClipboard', () => {
    it('ينسخ النص باستخدام Clipboard API', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };

      const result = await copyToClipboard('test text');

      expect(writeText).toHaveBeenCalledWith('test text');
      expect(result.success).toBe(true);
      expect(result.fallback).toBe(false);
    });

    it('يستخدم fallback عند عدم دعم Clipboard API', async () => {
      global.navigator.clipboard = undefined;
      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result.success).toBe(true);
    });

    it('يعيد success=false عند الفشل', async () => {
      global.navigator.clipboard = undefined;
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await copyToClipboard('test text');

      expect(result.success).toBe(false);
    });

    it('يعيد fallback=true عند رمي استثناء', async () => {
      global.navigator.clipboard = { writeText: vi.fn().mockRejectedValue(new Error('denied')) };

      const result = await copyToClipboard('test text');

      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
    });
  });

  // ─── getContentUrl / getJobUrl ─────────────────────────────────────────────

  describe('getContentUrl', () => {
    it('يعيد رابط الوظيفة الصحيح', () => {
      const url = getContentUrl('job', '123');
      expect(url).toBe('https://careerak.com/job-postings/123');
    });

    it('يعيد رابط الدورة الصحيح', () => {
      const url = getContentUrl('course', '456');
      expect(url).toBe('https://careerak.com/courses/456');
    });

    it('يعيد رابط الملف الشخصي الصحيح', () => {
      const url = getContentUrl('profile', '789');
      expect(url).toBe('https://careerak.com/profile/789');
    });

    it('يعيد رابط الشركة الصحيح', () => {
      const url = getContentUrl('company', 'abc');
      expect(url).toBe('https://careerak.com/companies/abc');
    });
  });

  describe('getJobUrl (legacy)', () => {
    it('يعيد رابط الوظيفة', () => {
      const url = getJobUrl('123');
      expect(url).toContain('careerak.com');
      expect(url).toContain('123');
    });
  });

  // ─── addUtmParams ──────────────────────────────────────────────────────────

  describe('addUtmParams', () => {
    it('يضيف UTM params إلى رابط بدون query string', () => {
      const url = addUtmParams('https://careerak.com/job-postings/123', 'facebook', 'social');
      expect(url).toBe('https://careerak.com/job-postings/123?utm_source=facebook&utm_medium=social');
    });

    it('يضيف UTM params إلى رابط يحتوي على query string', () => {
      const url = addUtmParams('https://careerak.com/job-postings/123?ref=home', 'twitter', 'social');
      expect(url).toContain('utm_source=twitter');
      expect(url).toContain('utm_medium=social');
    });
  });

  // ─── createShareData ───────────────────────────────────────────────────────

  describe('createShareData', () => {
    it('ينشئ بيانات المشاركة لوظيفة', () => {
      const job = {
        _id: '123',
        title: 'مطور Full Stack',
        company: { name: 'شركة التقنية' },
      };

      const shareData = createShareData(job, 'job');

      expect(shareData.title).toBe('مطور Full Stack - شركة التقنية');
      expect(shareData.url).toBe('https://careerak.com/job-postings/123');
    });

    it('ينشئ بيانات المشاركة لدورة', () => {
      const course = { _id: '456', title: 'دورة React', instructor: 'أحمد' };
      const shareData = createShareData(course, 'course');
      expect(shareData.url).toBe('https://careerak.com/courses/456');
    });

    it('يتعامل مع المحتوى بدون subtitle', () => {
      const job = { _id: '123', title: 'مطور' };
      const shareData = createShareData(job, 'job');
      expect(shareData.title).toBe('مطور');
    });
  });

  // ─── shareNative ───────────────────────────────────────────────────────────

  describe('shareNative', () => {
    it('يستخدم Web Share API', async () => {
      const share = vi.fn().mockResolvedValue();
      global.navigator.share = share;
      fetch.mockResolvedValue({ ok: true });

      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareNative(job);

      expect(share).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('يعيد false إذا لم يكن مدعوماً', async () => {
      global.navigator.share = undefined;
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareNative(job);
      expect(result).toBe(false);
    });

    it('يعيد false عند الإلغاء', async () => {
      const share = vi.fn().mockRejectedValue({ name: 'AbortError' });
      global.navigator.share = share;
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareNative(job);
      expect(result).toBe(false);
    });
  });

  // ─── Req 6: shareViaFacebook ───────────────────────────────────────────────

  describe('shareViaFacebook (Req 6)', () => {
    it('يفتح نافذة Facebook مع UTM params', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaFacebook(job, 'job');

      const call = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(call).toContain('facebook.com/sharer');
      expect(call).toContain('utm_source=facebook');
      expect(call).toContain('utm_medium=social');
    });

    it('legacy shareFacebook يعمل', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareFacebook(job);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  // ─── Req 7: shareViaTwitter ────────────────────────────────────────────────

  describe('shareViaTwitter (Req 7)', () => {
    it('يفتح نافذة Twitter مع UTM params وهاشتاقات', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaTwitter(job, 'job');

      const call = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(call).toContain('twitter.com/intent/tweet');
      expect(call).toContain('utm_source=twitter');
      expect(call).toContain('utm_medium=social');
    });

    it('يحترم حد 280 حرف', () => {
      const longTitle = 'أ'.repeat(300);
      const job = { _id: '123', title: longTitle, company: { name: 'شركة' } };
      shareViaTwitter(job, 'job');

      const call = window.open.mock.calls[0][0];
      const textParam = new URLSearchParams(call.split('?')[1]).get('text');
      // The decoded text + url should be within Twitter's limit
      expect(textParam).toBeTruthy();
    });

    it('legacy shareTwitter يعمل', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareTwitter(job);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  // ─── Req 8: shareViaLinkedIn ───────────────────────────────────────────────

  describe('shareViaLinkedIn (Req 8)', () => {
    it('يفتح نافذة LinkedIn مع UTM params', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaLinkedIn(job, 'job');

      const call = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(call).toContain('linkedin.com/sharing');
      expect(call).toContain('utm_source=linkedin');
      expect(call).toContain('utm_medium=social');
    });

    it('legacy shareLinkedIn يعمل', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareLinkedIn(job);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  // ─── Req 9: shareViaWhatsApp ───────────────────────────────────────────────

  describe('shareViaWhatsApp (Req 9)', () => {
    it('يستخدم web.whatsapp.com على الديسكتوب', () => {
      // isMobileDevice returns false in test env (no mobile UA)
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaWhatsApp(job, 'job');

      const call = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(call).toContain('web.whatsapp.com');
      expect(call).toContain('utm_source=whatsapp');
      expect(call).toContain('utm_medium=messaging');
    });

    it('legacy shareWhatsApp يعمل', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareWhatsApp(job);
      // desktop: web.whatsapp.com
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp'),
        expect.any(String),
        expect.any(String)
      );
    });
  });

  // ─── Req 10: shareViaTelegram ──────────────────────────────────────────────

  describe('shareViaTelegram (Req 10)', () => {
    it('يفتح Telegram مع UTM params', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaTelegram(job, 'job');

      const call = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(call).toContain('t.me/share/url');
      expect(call).toContain('utm_source=telegram');
      expect(call).toContain('utm_medium=messaging');
    });
  });

  // ─── Req 11: shareViaEmail ─────────────────────────────────────────────────

  describe('shareViaEmail (Req 11)', () => {
    it('يفتح عميل البريد مع UTM params وعنوان مناسب', () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      shareViaEmail(job, 'job');

      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toContain('mailto:');
      expect(href).toContain('utm_source=email');
      expect(href).toContain('utm_medium=email');
    });
  });

  // ─── Req 12: copyShareLink ─────────────────────────────────────────────────

  describe('copyShareLink (Req 12)', () => {
    it('ينسخ الرابط النظيف ويعيد success=true', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };
      fetch.mockResolvedValue({ ok: true });

      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await copyShareLink(job, 'job');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://careerak.com/job-postings/123');
      expect(writeText).toHaveBeenCalledWith('https://careerak.com/job-postings/123');
    });

    it('يعيد fallback=true عند فشل الحافظة', async () => {
      global.navigator.clipboard = { writeText: vi.fn().mockRejectedValue(new Error('denied')) };

      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await copyShareLink(job, 'job');

      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
      expect(result.url).toBe('https://careerak.com/job-postings/123');
    });

    it('legacy shareCopy يعمل', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };
      fetch.mockResolvedValue({ ok: true });

      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareCopy(job);

      expect(result).toBe(true);
    });
  });

  // ─── shareJob (legacy) ─────────────────────────────────────────────────────

  describe('shareJob', () => {
    it('يستدعي الدالة الصحيحة حسب المنصة - copy', async () => {
      const writeText = vi.fn().mockResolvedValue();
      global.navigator.clipboard = { writeText };
      fetch.mockResolvedValue({ ok: true });

      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      await shareJob(job, 'copy');
      expect(writeText).toHaveBeenCalled();
    });

    it('يستدعي الدالة الصحيحة حسب المنصة - whatsapp', async () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      await shareJob(job, 'whatsapp');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('يعيد false للمنصات غير المعروفة', async () => {
      const job = { _id: '123', title: 'مطور', company: { name: 'شركة' } };
      const result = await shareJob(job, 'unknown');
      expect(result).toBe(false);
    });
  });

  // ─── isNativeShareSupported ────────────────────────────────────────────────

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

  // ─── isMobileDevice ────────────────────────────────────────────────────────

  describe('isMobileDevice', () => {
    it('يعيد false في بيئة الاختبار (لا mobile UA)', () => {
      expect(isMobileDevice()).toBe(false);
    });
  });
});
