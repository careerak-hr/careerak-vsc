/**
 * Task 8.4 - Test all share methods
 * Validates: Requirements 6-12 (all 8 share methods)
 * Covers:
 *  - Each share method opens the correct URL/dialog
 *  - UTM parameters are correctly appended
 *  - Share events are recorded via the API
 *  - Error handling works for each method
 *  - Mobile vs desktop behavior differences (WhatsApp deep link vs web)
 *  - Clipboard API success and failure cases
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  shareViaFacebook,
  shareViaTwitter,
  shareViaLinkedIn,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaEmail,
  copyShareLink,
  copyToClipboard,
  trackShare,
  addUtmParams,
  getContentUrl,
  isMobileDevice,
} from '../shareUtils';

// ─── Global mocks ─────────────────────────────────────────────────────────────

global.fetch = vi.fn();

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

global.window.open = vi.fn();

delete global.window.location;
global.window.location = { href: '' };

// ─── Test fixtures ────────────────────────────────────────────────────────────

const mockJob = { _id: 'job123', title: 'Software Engineer', company: { name: 'TechCorp' } };
const mockCourse = { _id: 'course456', title: 'React Fundamentals', instructor: 'Jane Doe' };
const mockProfile = { _id: 'user789', firstName: 'John', lastName: 'Doe', jobTitle: 'Developer' };
const mockCompany = { _id: 'comp001', name: 'TechCorp', industry: 'Technology' };

describe('Task 8.4 - All Share Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
    fetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── 1. Internal share (shareViaChat) ─────────────────────────────────────
  // Internal sharing is handled by ContactSelector inside ShareModal.
  // The shareViaChat flow is tested in ShareModal.internalShare.test.jsx.
  // Here we verify the share event tracking for internal shares.

  describe('1. Internal share - trackShare for chat', () => {
    it('records share event with platform "chat" via API', async () => {
      await trackShare('job123', 'chat');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shares'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"chat"'),
        })
      );
    });

    it('includes Authorization header with token', async () => {
      await trackShare('job123', 'chat');
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });

    it('does not call API when user is not authenticated', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      await trackShare('job123', 'chat');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // ─── 2. Facebook share ────────────────────────────────────────────────────

  describe('2. Facebook share (Req 6)', () => {
    it('opens Facebook share dialog', () => {
      shareViaFacebook(mockJob, 'job');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank',
        'width=600,height=400'
      );
    });

    it('includes utm_source=facebook in the URL', () => {
      shareViaFacebook(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_source=facebook');
    });

    it('includes utm_medium=social in the URL', () => {
      shareViaFacebook(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=social');
    });

    it('records share event via API', async () => {
      shareViaFacebook(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('facebook');
    });

    it('works for course content type', () => {
      shareViaFacebook(mockCourse, 'course');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain('courses/course456');
    });

    it('works for company content type', () => {
      shareViaFacebook(mockCompany, 'company');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain('companies/comp001');
    });
  });

  // ─── 3. Twitter share ─────────────────────────────────────────────────────

  describe('3. Twitter share (Req 7)', () => {
    it('opens Twitter share dialog', () => {
      shareViaTwitter(mockJob, 'job');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      );
    });

    it('includes utm_source=twitter in the URL', () => {
      shareViaTwitter(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_source=twitter');
    });

    it('includes utm_medium=social in the URL', () => {
      shareViaTwitter(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=social');
    });

    it('includes job hashtags in tweet text', () => {
      shareViaTwitter(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('#Careerak');
    });

    it('includes course hashtags for course content type', () => {
      shareViaTwitter(mockCourse, 'course');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('#Careerak');
    });

    it('respects 280 character limit for long titles', () => {
      const longJob = { _id: 'j1', title: 'أ'.repeat(300), company: { name: 'شركة' } };
      shareViaTwitter(longJob, 'job');
      const rawUrl = window.open.mock.calls[0][0];
      const textParam = new URLSearchParams(rawUrl.split('?')[1]).get('text');
      // The text param itself should be present and not excessively long
      expect(textParam).toBeTruthy();
      expect(textParam.length).toBeLessThanOrEqual(280);
    });

    it('records share event via API', async () => {
      shareViaTwitter(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('twitter');
    });
  });

  // ─── 4. LinkedIn share ────────────────────────────────────────────────────

  describe('4. LinkedIn share (Req 8)', () => {
    it('opens LinkedIn share dialog', () => {
      shareViaLinkedIn(mockJob, 'job');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing/share-offsite'),
        '_blank',
        'width=600,height=400'
      );
    });

    it('includes utm_source=linkedin in the URL', () => {
      shareViaLinkedIn(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_source=linkedin');
    });

    it('includes utm_medium=social in the URL', () => {
      shareViaLinkedIn(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=social');
    });

    it('includes the content URL in the LinkedIn share link', () => {
      shareViaLinkedIn(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('job-postings/job123');
    });

    it('records share event via API', async () => {
      shareViaLinkedIn(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('linkedin');
    });

    it('works for profile content type', () => {
      shareViaLinkedIn(mockProfile, 'profile');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('linkedin.com/sharing');
      expect(url).toContain('profile/user789');
    });
  });

  // ─── 5. WhatsApp share - mobile vs desktop ────────────────────────────────

  describe('5. WhatsApp share (Req 9) - mobile vs desktop', () => {
    it('uses web.whatsapp.com on desktop (non-mobile)', () => {
      // Default test env has no mobile UA → isMobileDevice() = false
      shareViaWhatsApp(mockJob, 'job');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('web.whatsapp.com'),
        '_blank',
        'width=600,height=400'
      );
    });

    it('uses whatsapp:// deep link on mobile', () => {
      // Temporarily mock isMobileDevice by overriding navigator.userAgent
      const originalUA = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      });

      shareViaWhatsApp(mockJob, 'job');

      // On mobile, uses window.location.href with whatsapp:// scheme
      expect(window.location.href).toContain('whatsapp://send');

      // Restore
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUA,
        configurable: true,
      });
    });

    it('includes utm_source=whatsapp in the message', () => {
      shareViaWhatsApp(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_source=whatsapp');
    });

    it('includes utm_medium=messaging in the message', () => {
      shareViaWhatsApp(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=messaging');
    });

    it('includes content title in the message', () => {
      shareViaWhatsApp(mockJob, 'job');
      const url = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(url).toContain('Software Engineer');
    });

    it('records share event via API', async () => {
      shareViaWhatsApp(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('whatsapp');
    });
  });

  // ─── 6. Telegram share ────────────────────────────────────────────────────

  describe('6. Telegram share (Req 10)', () => {
    it('opens Telegram share URL (t.me/share/url)', () => {
      shareViaTelegram(mockJob, 'job');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('t.me/share/url'),
        '_blank',
        'width=600,height=400'
      );
    });

    it('includes utm_source=telegram in the URL', () => {
      shareViaTelegram(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_source=telegram');
    });

    it('includes utm_medium=messaging in the URL', () => {
      shareViaTelegram(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=messaging');
    });

    it('includes content title as text parameter', () => {
      shareViaTelegram(mockJob, 'job');
      const url = decodeURIComponent(decodeURIComponent(window.open.mock.calls[0][0]));
      expect(url).toContain('Software Engineer');
    });

    it('records share event via API', async () => {
      shareViaTelegram(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('telegram');
    });

    it('works for course content type', () => {
      shareViaTelegram(mockCourse, 'course');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('t.me/share/url');
      expect(url).toContain('courses/course456');
    });
  });

  // ─── 7. Email share ───────────────────────────────────────────────────────

  describe('7. Email share (Req 11)', () => {
    it('opens default email client via mailto:', () => {
      shareViaEmail(mockJob, 'job');
      expect(window.location.href).toContain('mailto:');
    });

    it('includes utm_source=email in the email body', () => {
      shareViaEmail(mockJob, 'job');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toContain('utm_source=email');
    });

    it('includes utm_medium=email in the email body', () => {
      shareViaEmail(mockJob, 'job');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toContain('utm_medium=email');
    });

    it('includes job title in email subject', () => {
      shareViaEmail(mockJob, 'job');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toContain('Software Engineer');
    });

    it('includes call-to-action in email body', () => {
      shareViaEmail(mockJob, 'job');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      // Should contain a link/CTA
      expect(href).toContain('careerak.com');
    });

    it('uses correct subject prefix for job type', () => {
      shareViaEmail(mockJob, 'job');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toMatch(/subject=.*فرصة عمل|job/i);
    });

    it('uses correct subject prefix for course type', () => {
      shareViaEmail(mockCourse, 'course');
      const href = decodeURIComponent(decodeURIComponent(window.location.href));
      expect(href).toMatch(/subject=.*دورة|course/i);
    });

    it('records share event via API', async () => {
      shareViaEmail(mockJob, 'job');
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.platform).toBe('email');
    });
  });

  // ─── 8. Copy to clipboard ─────────────────────────────────────────────────

  describe('8. Copy to clipboard (Req 12)', () => {
    describe('copyToClipboard - Clipboard API', () => {
      it('copies text using navigator.clipboard.writeText', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        const result = await copyToClipboard('https://careerak.com/job-postings/job123');

        expect(writeText).toHaveBeenCalledWith('https://careerak.com/job-postings/job123');
        expect(result.success).toBe(true);
        expect(result.fallback).toBe(false);
      });

      it('returns success=false and fallback=true when clipboard is denied', async () => {
        global.navigator.clipboard = {
          writeText: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
        };

        const result = await copyToClipboard('https://careerak.com/job-postings/job123');

        expect(result.success).toBe(false);
        expect(result.fallback).toBe(true);
      });

      it('falls back to execCommand when clipboard API is unavailable', async () => {
        global.navigator.clipboard = undefined;
        document.execCommand = vi.fn().mockReturnValue(true);

        const result = await copyToClipboard('test text');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(result.success).toBe(true);
      });

      it('returns success=false when execCommand returns false', async () => {
        global.navigator.clipboard = undefined;
        document.execCommand = vi.fn().mockReturnValue(false);

        const result = await copyToClipboard('test text');

        expect(result.success).toBe(false);
      });
    });

    describe('copyShareLink - clean URL without UTM', () => {
      it('copies the clean share URL (no UTM params)', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        const result = await copyShareLink(mockJob, 'job');

        expect(result.success).toBe(true);
        expect(result.url).toBe('https://careerak.com/job-postings/job123');
        // Clean URL - no UTM params
        expect(result.url).not.toContain('utm_');
        expect(writeText).toHaveBeenCalledWith('https://careerak.com/job-postings/job123');
      });

      it('returns the URL even when clipboard fails', async () => {
        global.navigator.clipboard = {
          writeText: vi.fn().mockRejectedValue(new Error('denied')),
        };

        const result = await copyShareLink(mockJob, 'job');

        expect(result.success).toBe(false);
        expect(result.url).toBe('https://careerak.com/job-postings/job123');
      });

      it('records share event with platform "copy" on success', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        await copyShareLink(mockJob, 'job');

        await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.platform).toBe('copy');
      });

      it('does not record share event when clipboard fails', async () => {
        global.navigator.clipboard = {
          writeText: vi.fn().mockRejectedValue(new Error('denied')),
        };

        await copyShareLink(mockJob, 'job');

        // fetch should not be called since copy failed
        expect(fetch).not.toHaveBeenCalled();
      });

      it('generates correct URL for course content type', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        const result = await copyShareLink(mockCourse, 'course');

        expect(result.url).toBe('https://careerak.com/courses/course456');
      });

      it('generates correct URL for profile content type', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        const result = await copyShareLink(mockProfile, 'profile');

        expect(result.url).toBe('https://careerak.com/profile/user789');
      });

      it('generates correct URL for company content type', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        global.navigator.clipboard = { writeText };

        const result = await copyShareLink(mockCompany, 'company');

        expect(result.url).toBe('https://careerak.com/companies/comp001');
      });
    });
  });

  // ─── UTM parameter generation ─────────────────────────────────────────────

  describe('UTM parameter generation', () => {
    it('addUtmParams appends correctly to clean URL', () => {
      const url = addUtmParams('https://careerak.com/job-postings/123', 'facebook', 'social');
      expect(url).toBe('https://careerak.com/job-postings/123?utm_source=facebook&utm_medium=social');
    });

    it('addUtmParams appends correctly to URL with existing query string', () => {
      const url = addUtmParams('https://careerak.com/job-postings/123?ref=home', 'twitter', 'social');
      expect(url).toContain('utm_source=twitter');
      expect(url).toContain('utm_medium=social');
      expect(url).toContain('ref=home');
    });

    it('each platform uses correct utm_source', () => {
      const platforms = [
        { fn: shareViaFacebook, source: 'facebook' },
        { fn: shareViaTwitter, source: 'twitter' },
        { fn: shareViaLinkedIn, source: 'linkedin' },
        { fn: shareViaTelegram, source: 'telegram' },
      ];

      platforms.forEach(({ fn, source }) => {
        vi.clearAllMocks();
        fn(mockJob, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain(`utm_source=${source}`);
      });
    });

    it('messaging platforms use utm_medium=messaging', () => {
      shareViaWhatsApp(mockJob, 'job');
      const url = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url).toContain('utm_medium=messaging');

      vi.clearAllMocks();
      shareViaTelegram(mockJob, 'job');
      const url2 = decodeURIComponent(window.open.mock.calls[0][0]);
      expect(url2).toContain('utm_medium=messaging');
    });

    it('social platforms use utm_medium=social', () => {
      const socialFns = [shareViaFacebook, shareViaTwitter, shareViaLinkedIn];
      socialFns.forEach((fn) => {
        vi.clearAllMocks();
        fn(mockJob, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('utm_medium=social');
      });
    });
  });

  // ─── Content URL generation ───────────────────────────────────────────────

  describe('Content URL generation (Req 13)', () => {
    it('generates correct URL for job content type', () => {
      expect(getContentUrl('job', 'abc')).toBe('https://careerak.com/job-postings/abc');
    });

    it('generates correct URL for course content type', () => {
      expect(getContentUrl('course', 'abc')).toBe('https://careerak.com/courses/abc');
    });

    it('generates correct URL for profile content type', () => {
      expect(getContentUrl('profile', 'abc')).toBe('https://careerak.com/profile/abc');
    });

    it('generates correct URL for company content type', () => {
      expect(getContentUrl('company', 'abc')).toBe('https://careerak.com/companies/abc');
    });

    it('falls back to job-postings for unknown content type', () => {
      expect(getContentUrl('unknown', 'abc')).toBe('https://careerak.com/job-postings/abc');
    });
  });

  // ─── Error handling ───────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('trackShare handles network errors silently', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      await expect(trackShare('job123', 'facebook')).resolves.not.toThrow();
    });

    it('copyToClipboard handles unexpected errors gracefully', async () => {
      global.navigator.clipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Unexpected error')),
      };
      const result = await copyToClipboard('test');
      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
    });

    it('share methods do not throw when content has no _id', () => {
      const contentWithoutId = { title: 'Test Job', company: { name: 'Corp' } };
      expect(() => shareViaFacebook(contentWithoutId, 'job')).not.toThrow();
      expect(() => shareViaTwitter(contentWithoutId, 'job')).not.toThrow();
      expect(() => shareViaLinkedIn(contentWithoutId, 'job')).not.toThrow();
      expect(() => shareViaWhatsApp(contentWithoutId, 'job')).not.toThrow();
      expect(() => shareViaTelegram(contentWithoutId, 'job')).not.toThrow();
      expect(() => shareViaEmail(contentWithoutId, 'job')).not.toThrow();
    });

    it('share methods do not call trackShare when content has no id', async () => {
      const contentWithoutId = { title: 'Test Job', company: { name: 'Corp' } };
      shareViaFacebook(contentWithoutId, 'job');
      // Wait a tick for any async operations
      await new Promise((r) => setTimeout(r, 10));
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
