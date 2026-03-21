/**
 * Android Chrome Compatibility Tests for Share Utilities
 *
 * Android Chrome-specific behaviors:
 * - Web Share API (navigator.share) supported since Chrome 61 on Android
 * - navigator.share() can be called from useEffect (no user-gesture restriction)
 * - navigator.canShare() is supported (unlike iOS Safari)
 * - WhatsApp deep link (whatsapp://send) works correctly on Android
 * - Touch targets must be >= 44x44px (enforced via CSS min-height/min-width)
 * - Bottom-sheet modal layout is optimal for Android screen sizes
 * - isMobileDevice() correctly identifies Android via user agent
 * - isAndroidChrome() correctly identifies Android Chrome vs other Android browsers
 */

import { vi, describe, test, expect, afterEach } from 'vitest';
import {
  isAndroidChrome,
  isIOSSafari,
  isMobileDevice,
  isNativeShareSupported,
  shouldUseNativeShare,
  createShareData,
  shareViaWhatsApp,
} from '../shareUtils';

// Helper to mock navigator.userAgent
const mockUserAgent = (ua) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
};

// Common Android Chrome UA strings
const ANDROID_CHROME_UA =
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36';
const ANDROID_CHROME_SAMSUNG_UA =
  'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
const ANDROID_FIREFOX_UA =
  'Mozilla/5.0 (Android 12; Mobile; rv:107.0) Gecko/107.0 Firefox/107.0';
const ANDROID_SAMSUNG_BROWSER_UA =
  'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/19.0 Chrome/102.0.5005.125 Mobile Safari/537.36';
const ANDROID_OPERA_UA =
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36 OPR/73.0.3856.329';
const IOS_SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const DESKTOP_CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36';

afterEach(() => {
  mockUserAgent(DESKTOP_CHROME_UA);
});

// ─── isAndroidChrome detection ────────────────────────────────────────────────

describe('isAndroidChrome detection', () => {
  test('detects Pixel Android Chrome correctly', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    expect(isAndroidChrome()).toBe(true);
  });

  test('detects Samsung Galaxy Android Chrome correctly', () => {
    mockUserAgent(ANDROID_CHROME_SAMSUNG_UA);
    expect(isAndroidChrome()).toBe(true);
  });

  test('does NOT detect Android Firefox as Android Chrome', () => {
    mockUserAgent(ANDROID_FIREFOX_UA);
    expect(isAndroidChrome()).toBe(false);
  });

  test('does NOT detect Samsung Browser as Android Chrome', () => {
    mockUserAgent(ANDROID_SAMSUNG_BROWSER_UA);
    expect(isAndroidChrome()).toBe(false);
  });

  test('does NOT detect Android Opera as Android Chrome', () => {
    mockUserAgent(ANDROID_OPERA_UA);
    expect(isAndroidChrome()).toBe(false);
  });

  test('does NOT detect iOS Safari as Android Chrome', () => {
    mockUserAgent(IOS_SAFARI_UA);
    expect(isAndroidChrome()).toBe(false);
  });

  test('does NOT detect desktop Chrome as Android Chrome', () => {
    mockUserAgent(DESKTOP_CHROME_UA);
    expect(isAndroidChrome()).toBe(false);
  });
});

// ─── isMobileDevice correctly identifies Android ──────────────────────────────

describe('isMobileDevice identifies Android correctly', () => {
  test('returns true for Android Chrome', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    expect(isMobileDevice()).toBe(true);
  });

  test('returns true for Android Firefox', () => {
    mockUserAgent(ANDROID_FIREFOX_UA);
    expect(isMobileDevice()).toBe(true);
  });

  test('returns false for desktop Chrome', () => {
    mockUserAgent(DESKTOP_CHROME_UA);
    expect(isMobileDevice()).toBe(false);
  });
});

// ─── isIOSSafari does NOT misidentify Android Chrome ─────────────────────────

describe('isIOSSafari does not misidentify Android Chrome', () => {
  test('isIOSSafari returns false for Android Chrome', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    expect(isIOSSafari()).toBe(false);
  });
});

// ─── Web Share API on Android Chrome ─────────────────────────────────────────

describe('Web Share API on Android Chrome (Chrome 61+)', () => {
  test('shouldUseNativeShare returns true when navigator.share is available on Android Chrome', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(true);
  });

  test('shouldUseNativeShare returns false when navigator.share is absent (Chrome < 61)', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(false);
  });

  test('isNativeShareSupported returns true when navigator.share is a function', () => {
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    expect(isNativeShareSupported()).toBe(true);
  });

  test('Android Chrome does NOT require HTTPS for shouldUseNativeShare (unlike iOS Safari)', () => {
    // Android Chrome supports navigator.share over HTTP in some contexts.
    // shouldUseNativeShare only enforces HTTPS for iOS Safari.
    mockUserAgent(ANDROID_CHROME_UA);
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    // Even without checking secure context, Android Chrome should pass
    expect(shouldUseNativeShare()).toBe(true);
  });
});

// ─── WhatsApp deep link on Android ───────────────────────────────────────────

describe('WhatsApp deep link on Android Chrome (Req 9)', () => {
  test('shareViaWhatsApp uses whatsapp:// deep link on Android mobile', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, set href(v) { hrefSpy(v); } },
      configurable: true,
    });

    const content = { _id: 'job123', title: 'Software Engineer', company: { name: 'Acme' } };
    shareViaWhatsApp(content, 'job');

    // On mobile, should use whatsapp:// protocol
    expect(hrefSpy).toHaveBeenCalledWith(expect.stringMatching(/^whatsapp:\/\/send/));
  });

  test('WhatsApp deep link message includes content title and URL', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, set href(v) { hrefSpy(v); } },
      configurable: true,
    });

    const content = { _id: 'job456', title: 'React Developer', company: { name: 'TechCorp' } };
    shareViaWhatsApp(content, 'job');

    const calledUrl = hrefSpy.mock.calls[0][0];
    const decodedText = decodeURIComponent(calledUrl.replace('whatsapp://send?text=', ''));
    expect(decodedText).toContain('React Developer');
    expect(decodedText).toContain('careerak.com');
  });

  test('WhatsApp URL includes UTM params for tracking', () => {
    mockUserAgent(ANDROID_CHROME_UA);
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, set href(v) { hrefSpy(v); } },
      configurable: true,
    });

    const content = { _id: 'job789', title: 'Designer', company: { name: 'Studio' } };
    shareViaWhatsApp(content, 'job');

    const calledUrl = hrefSpy.mock.calls[0][0];
    const decodedText = decodeURIComponent(calledUrl.replace('whatsapp://send?text=', ''));
    expect(decodedText).toContain('utm_source=whatsapp');
    expect(decodedText).toContain('utm_medium=messaging');
  });
});

// ─── createShareData produces valid payload for Android Chrome ────────────────

describe('createShareData produces valid Web Share API payload for Android Chrome', () => {
  test('job share data has title, text, and url', () => {
    const job = { _id: 'abc123', title: 'Frontend Developer', company: { name: 'TechCorp' } };
    const data = createShareData(job, 'job');
    expect(data.title).toBeTruthy();
    expect(data.text).toBeTruthy();
    expect(data.url).toMatch(/^https:\/\/careerak\.com\//);
  });

  test('course share data has title and url', () => {
    const course = { _id: 'crs456', title: 'React Masterclass', instructor: 'Jane Doe' };
    const data = createShareData(course, 'course');
    expect(data.title).toBeTruthy();
    expect(data.url).toMatch(/^https:\/\/careerak\.com\/courses\//);
  });

  test('share url does not contain undefined or null', () => {
    const job = { _id: 'job789', title: 'Designer' };
    const data = createShareData(job, 'job');
    expect(data.url).not.toContain('undefined');
    expect(data.url).not.toContain('null');
  });

  test('Android Chrome share data does not include files (not needed for basic share)', () => {
    const job = { _id: 'job001', title: 'Engineer', company: { name: 'Corp' } };
    const data = createShareData(job, 'job');
    // Files are not included in basic share — Android Chrome supports file sharing
    // but we don't use it for content sharing
    expect(data.files).toBeUndefined();
  });
});

// ─── Fallback modal on Android browsers without Web Share API ─────────────────

describe('Fallback modal on Android browsers without Web Share API', () => {
  test('shouldUseNativeShare returns false on Android Firefox (no navigator.share)', () => {
    mockUserAgent(ANDROID_FIREFOX_UA);
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(false);
  });

  test('shouldUseNativeShare returns false on desktop Chrome', () => {
    mockUserAgent(DESKTOP_CHROME_UA);
    expect(shouldUseNativeShare()).toBe(false);
  });
});
