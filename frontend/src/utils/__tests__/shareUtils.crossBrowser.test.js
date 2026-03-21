/**
 * Cross-Browser Compatibility Tests for Share Utilities
 * Task 8.9: Test on multiple browsers (Chrome, Firefox, Safari, Edge)
 *
 * Validates: Requirement 12 (Copy Link - works on all supported browsers)
 * Validates: Requirement 19 (Responsive Design - native share sheet detection)
 * Validates: Requirement 21 (Error Handling - clipboard fallback per browser)
 * Validates: Requirement 22 (Share Testing - unit tests for all share methods)
 *
 * Browser-specific behaviors tested:
 * - Chrome (desktop & Android): navigator.share supported, Clipboard API supported
 * - Firefox (desktop & Android): no navigator.share, Clipboard API supported
 * - Safari (desktop macOS): no navigator.share on desktop, Clipboard API supported
 * - Safari (iOS): navigator.share supported (user gesture only), no canShare
 * - Edge (desktop): navigator.share supported (Chromium-based), Clipboard API supported
 * - Legacy browsers: no Clipboard API, execCommand fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isIOSSafari,
  isAndroidChrome,
  isMobileDevice,
  isNativeShareSupported,
  isSecureContext,
  shouldUseNativeShare,
  copyToClipboard,
  copyShareLink,
  createShareData,
  shareViaFacebook,
  shareViaTwitter,
  shareViaLinkedIn,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaEmail,
} from '../shareUtils';

// ─── User Agent strings for each browser ─────────────────────────────────────

const UA = {
  // Chrome 120 on Windows
  chromeDesktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Chrome 120 on Android
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  // Firefox 121 on Windows
  firefoxDesktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Firefox 121 on Android
  firefoxAndroid:
    'Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
  // Safari 17 on macOS
  safariDesktop:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  // Safari on iPhone iOS 17
  safariIOS:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  // Safari on iPad iOS 17
  safariIPad:
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  // Edge 120 on Windows (Chromium-based)
  edgeDesktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Edge on Android
  edgeAndroid:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0',
  // Samsung Internet (Android)
  samsungBrowser:
    'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const setUA = (ua) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
};

const setNavigatorShare = (fn) => {
  Object.defineProperty(navigator, 'share', { value: fn, configurable: true, writable: true });
};

const setClipboard = (writeText) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText !== undefined ? { writeText } : undefined,
    configurable: true,
    writable: true,
  });
};

const mockContent = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'TechCorp' },
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
  global.localStorage = { getItem: vi.fn().mockReturnValue('token'), setItem: vi.fn() };
  global.window.open = vi.fn();
  delete global.window.location;
  global.window.location = { href: '' };
  // Reset to desktop Chrome UA as baseline
  setUA(UA.chromeDesktop);
  setNavigatorShare(undefined);
  setClipboard(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── 1. Browser Detection ─────────────────────────────────────────────────────

describe('Browser detection across browsers', () => {
  describe('isIOSSafari', () => {
    it('returns false for Chrome desktop', () => {
      setUA(UA.chromeDesktop);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns false for Firefox desktop', () => {
      setUA(UA.firefoxDesktop);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns false for Safari desktop (macOS)', () => {
      setUA(UA.safariDesktop);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns true for Safari on iPhone', () => {
      setUA(UA.safariIOS);
      expect(isIOSSafari()).toBe(true);
    });

    it('returns true for Safari on iPad', () => {
      setUA(UA.safariIPad);
      expect(isIOSSafari()).toBe(true);
    });

    it('returns false for Edge desktop', () => {
      setUA(UA.edgeDesktop);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns false for Chrome on Android', () => {
      setUA(UA.chromeAndroid);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns false for Firefox on Android', () => {
      setUA(UA.firefoxAndroid);
      expect(isIOSSafari()).toBe(false);
    });

    it('returns false for Samsung Internet', () => {
      setUA(UA.samsungBrowser);
      expect(isIOSSafari()).toBe(false);
    });
  });

  describe('isAndroidChrome', () => {
    it('returns false for Chrome desktop', () => {
      setUA(UA.chromeDesktop);
      expect(isAndroidChrome()).toBe(false);
    });

    it('returns true for Chrome on Android', () => {
      setUA(UA.chromeAndroid);
      expect(isAndroidChrome()).toBe(true);
    });

    it('returns false for Firefox on Android', () => {
      setUA(UA.firefoxAndroid);
      expect(isAndroidChrome()).toBe(false);
    });

    it('returns false for Edge on Android (EdgA)', () => {
      setUA(UA.edgeAndroid);
      expect(isAndroidChrome()).toBe(false);
    });

    it('returns false for Samsung Internet', () => {
      setUA(UA.samsungBrowser);
      expect(isAndroidChrome()).toBe(false);
    });

    it('returns false for iOS Safari', () => {
      setUA(UA.safariIOS);
      expect(isAndroidChrome()).toBe(false);
    });
  });

  describe('isMobileDevice', () => {
    it('returns false for Chrome desktop', () => {
      setUA(UA.chromeDesktop);
      expect(isMobileDevice()).toBe(false);
    });

    it('returns false for Firefox desktop', () => {
      setUA(UA.firefoxDesktop);
      expect(isMobileDevice()).toBe(false);
    });

    it('returns false for Safari desktop', () => {
      setUA(UA.safariDesktop);
      expect(isMobileDevice()).toBe(false);
    });

    it('returns false for Edge desktop', () => {
      setUA(UA.edgeDesktop);
      expect(isMobileDevice()).toBe(false);
    });

    it('returns true for Chrome on Android', () => {
      setUA(UA.chromeAndroid);
      expect(isMobileDevice()).toBe(true);
    });

    it('returns true for iOS Safari', () => {
      setUA(UA.safariIOS);
      expect(isMobileDevice()).toBe(true);
    });

    it('returns true for Firefox on Android', () => {
      setUA(UA.firefoxAndroid);
      expect(isMobileDevice()).toBe(true);
    });

    it('returns true for Samsung Internet', () => {
      setUA(UA.samsungBrowser);
      expect(isMobileDevice()).toBe(true);
    });
  });
});

// ─── 2. navigator.share API availability per browser ─────────────────────────

describe('navigator.share availability per browser (Req 19.2)', () => {
  it('Chrome desktop: navigator.share is available (Chrome 89+)', () => {
    setUA(UA.chromeDesktop);
    setNavigatorShare(vi.fn().mockResolvedValue(undefined));
    expect(isNativeShareSupported()).toBe(true);
  });

  it('Firefox desktop: navigator.share is NOT available', () => {
    setUA(UA.firefoxDesktop);
    setNavigatorShare(undefined);
    expect(isNativeShareSupported()).toBe(false);
  });

  it('Safari desktop (macOS): navigator.share available since Safari 12.1', () => {
    setUA(UA.safariDesktop);
    setNavigatorShare(vi.fn().mockResolvedValue(undefined));
    expect(isNativeShareSupported()).toBe(true);
  });

  it('Safari iOS: navigator.share is available', () => {
    setUA(UA.safariIOS);
    setNavigatorShare(vi.fn().mockResolvedValue(undefined));
    expect(isNativeShareSupported()).toBe(true);
  });

  it('Edge desktop (Chromium): navigator.share is available', () => {
    setUA(UA.edgeDesktop);
    setNavigatorShare(vi.fn().mockResolvedValue(undefined));
    expect(isNativeShareSupported()).toBe(true);
  });

  it('Firefox Android: navigator.share is NOT available', () => {
    setUA(UA.firefoxAndroid);
    setNavigatorShare(undefined);
    expect(isNativeShareSupported()).toBe(false);
  });
});

// ─── 3. shouldUseNativeShare per browser ─────────────────────────────────────

describe('shouldUseNativeShare per browser', () => {
  it('Chrome desktop: returns false (desktop, not mobile)', () => {
    setUA(UA.chromeDesktop);
    setNavigatorShare(vi.fn());
    expect(shouldUseNativeShare()).toBe(false);
  });

  it('Firefox desktop: returns false (no navigator.share)', () => {
    setUA(UA.firefoxDesktop);
    setNavigatorShare(undefined);
    expect(shouldUseNativeShare()).toBe(false);
  });

  it('Safari desktop: returns false (desktop, not mobile)', () => {
    setUA(UA.safariDesktop);
    setNavigatorShare(vi.fn());
    expect(shouldUseNativeShare()).toBe(false);
  });

  it('Edge desktop: returns false (desktop, not mobile)', () => {
    setUA(UA.edgeDesktop);
    setNavigatorShare(vi.fn());
    expect(shouldUseNativeShare()).toBe(false);
  });

  it('Chrome Android: returns true when navigator.share is available', () => {
    setUA(UA.chromeAndroid);
    setNavigatorShare(vi.fn());
    expect(shouldUseNativeShare()).toBe(true);
  });

  it('Firefox Android: returns false (no navigator.share)', () => {
    setUA(UA.firefoxAndroid);
    setNavigatorShare(undefined);
    expect(shouldUseNativeShare()).toBe(false);
  });

  it('iOS Safari over HTTPS: returns true', () => {
    setUA(UA.safariIOS);
    setNavigatorShare(vi.fn());
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(window, 'location', {
      value: { protocol: 'https:', hostname: 'careerak.com' },
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(true);
  });

  it('iOS Safari over HTTP: returns false (HTTPS required)', () => {
    setUA(UA.safariIOS);
    setNavigatorShare(vi.fn());
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    Object.defineProperty(window, 'location', {
      value: { protocol: 'http:', hostname: 'careerak.com' },
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(false);
  });
});

// ─── 4. Clipboard API compatibility per browser ───────────────────────────────

describe('Clipboard API compatibility per browser (Req 12)', () => {
  describe('Chrome desktop - Clipboard API supported', () => {
    it('copies text using navigator.clipboard.writeText', async () => {
      setUA(UA.chromeDesktop);
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard(writeText);

      const result = await copyToClipboard('https://careerak.com/job-postings/123');

      expect(writeText).toHaveBeenCalledWith('https://careerak.com/job-postings/123');
      expect(result.success).toBe(true);
      expect(result.fallback).toBe(false);
    });

    it('returns success=false when clipboard permission is denied', async () => {
      setUA(UA.chromeDesktop);
      setClipboard(vi.fn().mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError')
      ));

      const result = await copyToClipboard('https://careerak.com/job-postings/123');

      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
    });
  });

  describe('Firefox desktop - Clipboard API supported', () => {
    it('copies text using navigator.clipboard.writeText', async () => {
      setUA(UA.firefoxDesktop);
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard(writeText);

      const result = await copyToClipboard('https://careerak.com/job-postings/123');

      expect(writeText).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('falls back to execCommand when clipboard API is unavailable', async () => {
      setUA(UA.firefoxDesktop);
      setClipboard(undefined);
      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result.success).toBe(true);
    });
  });

  describe('Safari desktop - Clipboard API supported', () => {
    it('copies text using navigator.clipboard.writeText', async () => {
      setUA(UA.safariDesktop);
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard(writeText);

      const result = await copyToClipboard('https://careerak.com/job-postings/123');

      expect(writeText).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Edge desktop - Clipboard API supported', () => {
    it('copies text using navigator.clipboard.writeText', async () => {
      setUA(UA.edgeDesktop);
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard(writeText);

      const result = await copyToClipboard('https://careerak.com/job-postings/123');

      expect(writeText).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Legacy browsers - execCommand fallback (Req 12.4)', () => {
    it('falls back to execCommand when clipboard API is absent', async () => {
      setClipboard(undefined);
      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result.success).toBe(true);
    });

    it('returns success=false when execCommand also fails', async () => {
      setClipboard(undefined);
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await copyToClipboard('test text');

      expect(result.success).toBe(false);
    });

    it('returns fallback=true when both clipboard and execCommand fail', async () => {
      setClipboard(vi.fn().mockRejectedValue(new Error('denied')));

      const result = await copyToClipboard('test text');

      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
    });
  });
});

// ─── 5. copyShareLink returns URL for manual copy fallback ────────────────────

describe('copyShareLink - manual copy fallback across browsers (Req 12.5)', () => {
  it('always returns the URL even when clipboard fails (Chrome)', async () => {
    setUA(UA.chromeDesktop);
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    const result = await copyShareLink(mockContent, 'job');

    expect(result.url).toBe('https://careerak.com/job-postings/job123');
    expect(result.success).toBe(false);
  });

  it('always returns the URL even when clipboard fails (Firefox)', async () => {
    setUA(UA.firefoxDesktop);
    setClipboard(undefined);
    document.execCommand = vi.fn().mockReturnValue(false);

    const result = await copyShareLink(mockContent, 'job');

    expect(result.url).toBe('https://careerak.com/job-postings/job123');
    expect(result.success).toBe(false);
  });

  it('always returns the URL even when clipboard fails (Safari)', async () => {
    setUA(UA.safariDesktop);
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    const result = await copyShareLink(mockContent, 'job');

    expect(result.url).toBe('https://careerak.com/job-postings/job123');
    expect(result.success).toBe(false);
  });

  it('always returns the URL even when clipboard fails (Edge)', async () => {
    setUA(UA.edgeDesktop);
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    const result = await copyShareLink(mockContent, 'job');

    expect(result.url).toBe('https://careerak.com/job-postings/job123');
    expect(result.success).toBe(false);
  });

  it('URL is clean (no UTM params) for copy link across all browsers', async () => {
    const browsers = [UA.chromeDesktop, UA.firefoxDesktop, UA.safariDesktop, UA.edgeDesktop];
    for (const ua of browsers) {
      setUA(ua);
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard(writeText);

      const result = await copyShareLink(mockContent, 'job');

      expect(result.url).not.toContain('utm_');
      expect(result.url).toBe('https://careerak.com/job-postings/job123');
    }
  });
});

// ─── 6. External share URL generation across browsers ────────────────────────

describe('External share URL generation works across all browsers (Reqs 6-11)', () => {
  const browsers = [
    { name: 'Chrome desktop', ua: UA.chromeDesktop },
    { name: 'Firefox desktop', ua: UA.firefoxDesktop },
    { name: 'Safari desktop', ua: UA.safariDesktop },
    { name: 'Edge desktop', ua: UA.edgeDesktop },
  ];

  browsers.forEach(({ name, ua }) => {
    describe(`${name}`, () => {
      beforeEach(() => setUA(ua));

      it('Facebook share opens correct URL with UTM params', () => {
        shareViaFacebook(mockContent, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('facebook.com/sharer');
        expect(url).toContain('utm_source=facebook');
        expect(url).toContain('utm_medium=social');
      });

      it('Twitter share opens correct URL with UTM params', () => {
        shareViaTwitter(mockContent, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('twitter.com/intent/tweet');
        expect(url).toContain('utm_source=twitter');
        expect(url).toContain('utm_medium=social');
      });

      it('LinkedIn share opens correct URL with UTM params', () => {
        shareViaLinkedIn(mockContent, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('linkedin.com/sharing/share-offsite');
        expect(url).toContain('utm_source=linkedin');
        expect(url).toContain('utm_medium=social');
      });

      it('WhatsApp share uses web.whatsapp.com on desktop', () => {
        shareViaWhatsApp(mockContent, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('web.whatsapp.com');
        expect(url).toContain('utm_source=whatsapp');
        expect(url).toContain('utm_medium=messaging');
      });

      it('Telegram share opens correct URL with UTM params', () => {
        shareViaTelegram(mockContent, 'job');
        const url = decodeURIComponent(window.open.mock.calls[0][0]);
        expect(url).toContain('t.me/share/url');
        expect(url).toContain('utm_source=telegram');
        expect(url).toContain('utm_medium=messaging');
      });

      it('Email share opens mailto: with UTM params', () => {
        shareViaEmail(mockContent, 'job');
        const href = decodeURIComponent(decodeURIComponent(window.location.href));
        expect(href).toContain('mailto:');
        expect(href).toContain('utm_source=email');
        expect(href).toContain('utm_medium=email');
      });
    });
  });
});

// ─── 7. WhatsApp mobile deep link vs desktop web ──────────────────────────────

describe('WhatsApp mobile deep link vs desktop web (Req 9)', () => {
  it('uses whatsapp:// deep link on iOS Safari (mobile)', () => {
    setUA(UA.safariIOS);
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { set href(v) { hrefSpy(v); } },
      configurable: true,
    });

    shareViaWhatsApp(mockContent, 'job');

    expect(hrefSpy).toHaveBeenCalledWith(expect.stringMatching(/^whatsapp:\/\/send/));
  });

  it('uses whatsapp:// deep link on Chrome Android (mobile)', () => {
    setUA(UA.chromeAndroid);
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { set href(v) { hrefSpy(v); } },
      configurable: true,
    });

    shareViaWhatsApp(mockContent, 'job');

    expect(hrefSpy).toHaveBeenCalledWith(expect.stringMatching(/^whatsapp:\/\/send/));
  });

  it('uses web.whatsapp.com on Chrome desktop', () => {
    setUA(UA.chromeDesktop);
    shareViaWhatsApp(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('web.whatsapp.com'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('uses web.whatsapp.com on Firefox desktop', () => {
    setUA(UA.firefoxDesktop);
    shareViaWhatsApp(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('web.whatsapp.com'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('uses web.whatsapp.com on Safari desktop', () => {
    setUA(UA.safariDesktop);
    shareViaWhatsApp(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('web.whatsapp.com'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('uses web.whatsapp.com on Edge desktop', () => {
    setUA(UA.edgeDesktop);
    shareViaWhatsApp(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('web.whatsapp.com'),
      '_blank',
      'width=600,height=400'
    );
  });
});

// ─── 8. createShareData produces valid payload for all browsers ───────────────

describe('createShareData produces valid share payload for all browsers (Req 13)', () => {
  const browsers = [
    { name: 'Chrome', ua: UA.chromeDesktop },
    { name: 'Firefox', ua: UA.firefoxDesktop },
    { name: 'Safari', ua: UA.safariDesktop },
    { name: 'Edge', ua: UA.edgeDesktop },
    { name: 'iOS Safari', ua: UA.safariIOS },
    { name: 'Chrome Android', ua: UA.chromeAndroid },
  ];

  browsers.forEach(({ name, ua }) => {
    it(`${name}: share data has title, text, and valid URL`, () => {
      setUA(ua);
      const data = createShareData(mockContent, 'job');

      expect(data.title).toBeTruthy();
      expect(data.text).toBeTruthy();
      expect(data.url).toMatch(/^https:\/\/careerak\.com\//);
      expect(data.url).not.toContain('undefined');
      expect(data.url).not.toContain('null');
    });
  });

  it('share URL is correct for all content types across browsers', () => {
    const cases = [
      { content: { _id: 'j1', title: 'Job' }, type: 'job', expected: 'job-postings/j1' },
      { content: { _id: 'c1', title: 'Course' }, type: 'course', expected: 'courses/c1' },
      { content: { _id: 'p1', firstName: 'John', lastName: 'Doe' }, type: 'profile', expected: 'profile/p1' },
      { content: { _id: 'co1', name: 'Corp' }, type: 'company', expected: 'companies/co1' },
    ];

    [UA.chromeDesktop, UA.firefoxDesktop, UA.safariDesktop, UA.edgeDesktop].forEach((ua) => {
      setUA(ua);
      cases.forEach(({ content, type, expected }) => {
        const data = createShareData(content, type);
        expect(data.url).toContain(expected);
      });
    });
  });
});

// ─── 9. window.open popup behavior across browsers ───────────────────────────

describe('window.open popup behavior across browsers', () => {
  it('opens share dialogs with correct dimensions on Chrome', () => {
    setUA(UA.chromeDesktop);
    shareViaFacebook(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'width=600,height=400'
    );
  });

  it('opens share dialogs with correct dimensions on Firefox', () => {
    setUA(UA.firefoxDesktop);
    shareViaTwitter(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'width=600,height=400'
    );
  });

  it('opens share dialogs with correct dimensions on Safari', () => {
    setUA(UA.safariDesktop);
    shareViaLinkedIn(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'width=600,height=400'
    );
  });

  it('opens share dialogs with correct dimensions on Edge', () => {
    setUA(UA.edgeDesktop);
    shareViaTelegram(mockContent, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'width=600,height=400'
    );
  });
});

// ─── 10. Error handling across browsers ──────────────────────────────────────

describe('Error handling across browsers (Req 21)', () => {
  it('share methods do not throw on Chrome when content has no _id', () => {
    setUA(UA.chromeDesktop);
    const noId = { title: 'Test', company: { name: 'Corp' } };
    expect(() => shareViaFacebook(noId, 'job')).not.toThrow();
    expect(() => shareViaTwitter(noId, 'job')).not.toThrow();
    expect(() => shareViaLinkedIn(noId, 'job')).not.toThrow();
    expect(() => shareViaTelegram(noId, 'job')).not.toThrow();
    expect(() => shareViaEmail(noId, 'job')).not.toThrow();
  });

  it('share methods do not throw on Firefox when content has no _id', () => {
    setUA(UA.firefoxDesktop);
    const noId = { title: 'Test', company: { name: 'Corp' } };
    expect(() => shareViaFacebook(noId, 'job')).not.toThrow();
    expect(() => shareViaLinkedIn(noId, 'job')).not.toThrow();
  });

  it('share methods do not throw on Safari when content has no _id', () => {
    setUA(UA.safariDesktop);
    const noId = { title: 'Test', company: { name: 'Corp' } };
    expect(() => shareViaFacebook(noId, 'job')).not.toThrow();
    expect(() => shareViaLinkedIn(noId, 'job')).not.toThrow();
  });

  it('share methods do not throw on Edge when content has no _id', () => {
    setUA(UA.edgeDesktop);
    const noId = { title: 'Test', company: { name: 'Corp' } };
    expect(() => shareViaFacebook(noId, 'job')).not.toThrow();
    expect(() => shareViaLinkedIn(noId, 'job')).not.toThrow();
  });

  it('copyToClipboard handles SecurityError on Safari (clipboard blocked)', async () => {
    setUA(UA.safariDesktop);
    setClipboard(vi.fn().mockRejectedValue(
      new DOMException('The request is not allowed', 'SecurityError')
    ));

    const result = await copyToClipboard('https://careerak.com/job-postings/123');

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });

  it('copyToClipboard handles NotAllowedError on Chrome (permission denied)', async () => {
    setUA(UA.chromeDesktop);
    setClipboard(vi.fn().mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    ));

    const result = await copyToClipboard('https://careerak.com/job-postings/123');

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });

  it('copyToClipboard handles NotAllowedError on Firefox', async () => {
    setUA(UA.firefoxDesktop);
    setClipboard(vi.fn().mockRejectedValue(
      new DOMException('Clipboard write is not allowed', 'NotAllowedError')
    ));

    const result = await copyToClipboard('https://careerak.com/job-postings/123');

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });

  it('copyToClipboard handles NotAllowedError on Edge', async () => {
    setUA(UA.edgeDesktop);
    setClipboard(vi.fn().mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    ));

    const result = await copyToClipboard('https://careerak.com/job-postings/123');

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });
});
