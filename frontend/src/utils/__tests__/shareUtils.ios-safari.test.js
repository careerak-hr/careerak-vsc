/**
 * iOS Safari Compatibility Tests for Share Utilities
 *
 * iOS Safari-specific behaviors:
 * - iOS Safari 12.1+ supports navigator.share() but only in response to user gestures
 * - iOS Safari does NOT support navigator.canShare()
 * - iOS Safari requires HTTPS for navigator.share()
 * - Files sharing requires iOS 15+
 * - navigator.share() called from useEffect (async/deferred) will be blocked
 */

import { vi, describe, test, expect, afterEach } from 'vitest';
import {
  isIOSSafari,
  isSecureContext,
  isNativeShareSupported,
  shouldUseNativeShare,
  isMobileDevice,
  createShareData,
  shareNative,
} from '../shareUtils';

// Helper to mock navigator.userAgent
const mockUserAgent = (ua) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
};

// Helper to mock window.location.protocol
const mockProtocol = (protocol) => {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, protocol, hostname: 'careerak.com' },
    configurable: true,
  });
};

const mockIsSecureContext = (value) => {
  Object.defineProperty(window, 'isSecureContext', {
    value,
    configurable: true,
  });
};

describe('iOS Safari Detection', () => {
  afterEach(() => {
    // Reset userAgent
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );
  });

  test('detects iPhone Safari correctly', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    expect(isIOSSafari()).toBe(true);
  });

  test('detects iPad Safari correctly', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    expect(isIOSSafari()).toBe(true);
  });

  test('does NOT detect iOS Chrome as iOS Safari', () => {
    // iOS Chrome uses CriOS in user agent
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/107.0.5304.101 Mobile/15E148 Safari/604.1'
    );
    expect(isIOSSafari()).toBe(false);
  });

  test('does NOT detect iOS Firefox as iOS Safari', () => {
    // iOS Firefox uses FxiOS in user agent
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/107.0 Mobile/15E148 Safari/604.1'
    );
    expect(isIOSSafari()).toBe(false);
  });

  test('does NOT detect Android Chrome as iOS Safari', () => {
    mockUserAgent(
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36'
    );
    expect(isIOSSafari()).toBe(false);
  });

  test('does NOT detect desktop Safari as iOS Safari', () => {
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
    );
    expect(isIOSSafari()).toBe(false);
  });
});

describe('iOS Safari: navigator.share availability', () => {
  test('isNativeShareSupported returns true when navigator.share is a function', () => {
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    expect(isNativeShareSupported()).toBe(true);
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    });
  });

  test('isNativeShareSupported returns false when navigator.share is undefined', () => {
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    expect(isNativeShareSupported()).toBe(false);
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    });
  });

  test('iOS Safari does NOT have navigator.canShare — code must not rely on it', () => {
    // This test documents that we should never call navigator.canShare() for iOS Safari
    // The isNativeShareSupported() function only checks navigator.share (correct behavior)
    const originalCanShare = navigator.canShare;
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      configurable: true,
    });
    // isNativeShareSupported should still work without canShare
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    expect(isNativeShareSupported()).toBe(true);
    Object.defineProperty(navigator, 'canShare', {
      value: originalCanShare,
      configurable: true,
    });
  });
});

describe('iOS Safari: HTTPS requirement for navigator.share', () => {
  test('shouldUseNativeShare returns false on iOS Safari over HTTP', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    mockIsSecureContext(false);
    Object.defineProperty(window, 'location', {
      value: { protocol: 'http:', hostname: 'careerak.com' },
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(false);
  });

  test('shouldUseNativeShare returns true on iOS Safari over HTTPS', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    mockIsSecureContext(true);
    Object.defineProperty(window, 'location', {
      value: { protocol: 'https:', hostname: 'careerak.com' },
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(true);
  });

  test('shouldUseNativeShare returns true on localhost (development)', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });
    mockIsSecureContext(false);
    Object.defineProperty(window, 'location', {
      value: { protocol: 'http:', hostname: 'localhost' },
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(true);
  });
});

describe('iOS Safari: shareNative user gesture requirement', () => {
  test('shareNative returns false when navigator.share is not available (fallback modal)', async () => {
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    const job = { _id: 'job123', title: 'Software Engineer', company: { name: 'Acme' } };
    const result = await shareNative(job);
    expect(result).toBe(false);
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    });
  });

  test('shareNative returns true when navigator.share resolves successfully', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
    });
    const job = { _id: 'job123', title: 'Software Engineer', company: { name: 'Acme' } };
    const result = await shareNative(job);
    expect(result).toBe(true);
    expect(mockShare).toHaveBeenCalledTimes(1);
    // Verify share data structure
    const callArgs = mockShare.mock.calls[0][0];
    expect(callArgs).toHaveProperty('title');
    expect(callArgs).toHaveProperty('url');
  });

  test('shareNative returns false when user cancels (AbortError)', async () => {
    const abortError = new DOMException('Share cancelled', 'AbortError');
    const mockShare = vi.fn().mockRejectedValue(abortError);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
    });
    const job = { _id: 'job123', title: 'Software Engineer' };
    const result = await shareNative(job);
    expect(result).toBe(false);
  });

  test('shareNative returns false on non-AbortError (e.g. NotAllowedError from iOS gesture restriction)', async () => {
    // iOS Safari throws NotAllowedError when share is not called from a user gesture
    const notAllowedError = new DOMException(
      'Must be handling a user gesture to perform a share request.',
      'NotAllowedError'
    );
    const mockShare = vi.fn().mockRejectedValue(notAllowedError);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
    });
    const job = { _id: 'job123', title: 'Software Engineer' };
    const result = await shareNative(job);
    expect(result).toBe(false);
  });
});

describe('iOS Safari: createShareData produces valid share payload', () => {
  test('job share data has title, text, and url', () => {
    const job = { _id: 'abc123', title: 'Frontend Developer', company: { name: 'TechCorp' } };
    const data = createShareData(job, 'job');
    expect(data.title).toBeTruthy();
    expect(data.url).toMatch(/^https:\/\/careerak\.com\//);
    // iOS Safari share data must not include files unless iOS 15+
    expect(data.files).toBeUndefined();
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
});

describe('Fallback modal behavior when native share unavailable', () => {
  test('shouldUseNativeShare returns false on desktop (no native share)', () => {
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    );
    expect(shouldUseNativeShare()).toBe(false);
  });

  test('shouldUseNativeShare returns false when navigator.share is absent on mobile', () => {
    mockUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    expect(shouldUseNativeShare()).toBe(false);
  });
});
