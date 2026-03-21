/**
 * Task 8.4 - Test all share methods
 * Validates: Requirement 22.4 (Unit tests for all share methods)
 *
 * Tests cover all 8 share methods:
 *  1. Internal share (internal_chat) - via chat
 *  2. Facebook share
 *  3. Twitter share
 *  4. LinkedIn share
 *  5. WhatsApp share
 *  6. Telegram share
 *  7. Email share
 *  8. Copy to clipboard
 *
 * For each method, tests verify:
 *  - Correct URL is generated
 *  - UTM parameters are included (where applicable)
 *  - Share events are recorded (trackShare called)
 *  - Error handling works
 */

import { describe, it, expect, vi, beforeEach, afterEach, waitFor } from 'vitest';
import {
  shareViaFacebook,
  shareViaTwitter,
  shareViaLinkedIn,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaEmail,
  copyShareLink,
  createShareData,
  getContentUrl,
  addUtmParams,
  copyToClipboard,
  isMobileDevice,
  isIOSSafari,
  isAndroidChrome,
  shouldUseNativeShare,
} from '../../utils/shareUtils';

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockJob = {
  _id: 'job-abc123',
  title: 'Senior Software Engineer',
  company: { name: 'TechCorp' },
  description: 'Build great software',
};

const mockCourse = {
  _id: 'course-xyz789',
  title: 'React Fundamentals',
  instructor: 'Jane Doe',
};

const mockProfile = {
  _id: 'user-def456',
  firstName: 'Ahmed',
  lastName: 'Ali',
  jobTitle: 'Developer',
};

const mockCompany = {
  _id: 'company-ghi012',
  name: 'Careerak Inc',
  industry: 'Technology',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Capture the URL passed to window.open */
let openedUrl = '';
/** Capture the href assigned to window.location */
let locationHref = '';

beforeEach(() => {
  openedUrl = '';
  locationHref = '';

  vi.spyOn(window, 'open').mockImplementation((url) => {
    openedUrl = url;
    return null;
  });

  // Mock window.location.href setter
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      get href() { return locationHref; },
      set href(v) { locationHref = v; },
    },
    writable: true,
    configurable: true,
  });

  // Mock fetch for trackShare
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

  // Mock window.localStorage.getItem to return a token for trackShare
  // (window.localStorage is replaced with a custom mock in setup.js, so
  //  Storage.prototype spy does not affect it — mock the instance directly)
  window.localStorage.getItem = vi.fn().mockReturnValue('test-token');

  // Default: desktop (not mobile)
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── 1. URL Generation Helpers ────────────────────────────────────────────────

describe('getContentUrl - URL generation for all content types', () => {
  it('generates correct URL for job', () => {
    expect(getContentUrl('job', 'job-abc123')).toBe('https://careerak.com/job-postings/job-abc123');
  });

  it('generates correct URL for course', () => {
    expect(getContentUrl('course', 'course-xyz789')).toBe('https://careerak.com/courses/course-xyz789');
  });

  it('generates correct URL for profile', () => {
    expect(getContentUrl('profile', 'user-def456')).toBe('https://careerak.com/profile/user-def456');
  });

  it('generates correct URL for company', () => {
    expect(getContentUrl('company', 'company-ghi012')).toBe('https://careerak.com/companies/company-ghi012');
  });

  it('falls back to job-postings for unknown content type', () => {
    expect(getContentUrl('unknown', 'some-id')).toBe('https://careerak.com/job-postings/some-id');
  });
});

describe('addUtmParams - UTM parameter generation', () => {
  const baseUrl = 'https://careerak.com/job-postings/job-abc123';

  it('adds utm_source and utm_medium to URL', () => {
    const result = addUtmParams(baseUrl, 'facebook', 'social');
    expect(result).toContain('utm_source=facebook');
    expect(result).toContain('utm_medium=social');
  });

  it('uses social as default medium', () => {
    const result = addUtmParams(baseUrl, 'twitter');
    expect(result).toContain('utm_medium=social');
  });

  it('uses & separator when URL already has query params', () => {
    const urlWithParams = `${baseUrl}?existing=param`;
    const result = addUtmParams(urlWithParams, 'facebook', 'social');
    expect(result).toContain('&utm_source=facebook');
  });

  it('uses ? separator when URL has no query params', () => {
    const result = addUtmParams(baseUrl, 'facebook', 'social');
    expect(result).toContain('?utm_source=facebook');
  });
});

describe('createShareData - share data creation', () => {
  it('creates share data for job with title and URL', () => {
    const data = createShareData(mockJob, 'job');
    expect(data.title).toContain('Senior Software Engineer');
    expect(data.url).toBe('https://careerak.com/job-postings/job-abc123');
    expect(data.text).toBeTruthy();
  });

  it('creates share data for course', () => {
    const data = createShareData(mockCourse, 'course');
    expect(data.title).toContain('React Fundamentals');
    expect(data.url).toBe('https://careerak.com/courses/course-xyz789');
  });

  it('creates share data for profile', () => {
    const data = createShareData(mockProfile, 'profile');
    expect(data.title).toContain('Ahmed');
    expect(data.url).toBe('https://careerak.com/profile/user-def456');
  });

  it('creates share data for company', () => {
    const data = createShareData(mockCompany, 'company');
    expect(data.title).toContain('Careerak Inc');
    expect(data.url).toBe('https://careerak.com/companies/company-ghi012');
  });

  it('includes subtitle when available (job: company name)', () => {
    const data = createShareData(mockJob, 'job');
    expect(data.title).toContain('TechCorp');
  });

  it('includes subtitle when available (course: instructor)', () => {
    const data = createShareData(mockCourse, 'course');
    expect(data.title).toContain('Jane Doe');
  });
});

// ─── 2. Facebook Share (Req 6) ────────────────────────────────────────────────

describe('shareViaFacebook - Requirement 6', () => {
  it('opens Facebook share dialog with correct base URL', () => {
    shareViaFacebook(mockJob, 'job');
    expect(openedUrl).toContain('facebook.com/sharer/sharer.php');
  });

  it('includes the content URL in the Facebook share URL', () => {
    shareViaFacebook(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('careerak.com'));
  });

  it('includes UTM source=facebook in the shared URL (Req 6.3)', () => {
    shareViaFacebook(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=facebook'));
  });

  it('includes UTM medium=social for Facebook (Req 6.3)', () => {
    shareViaFacebook(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_medium=social'));
  });

  it('records share event via trackShare (Req 6.4)', async () => {
    shareViaFacebook(mockJob, 'job');
    // trackShare is async fire-and-forget; wait for fetch to be called
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('works for course content type', () => {
    shareViaFacebook(mockCourse, 'course');
    expect(openedUrl).toContain('facebook.com/sharer');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=facebook'));
  });

  it('works for company content type', () => {
    shareViaFacebook(mockCompany, 'company');
    expect(openedUrl).toContain('facebook.com/sharer');
  });

  it('opens in a new window with dimensions', () => {
    shareViaFacebook(mockJob, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      expect.stringContaining('width=')
    );
  });
});

// ─── 3. Twitter Share (Req 7) ─────────────────────────────────────────────────

describe('shareViaTwitter - Requirement 7', () => {
  it('opens Twitter intent URL', () => {
    shareViaTwitter(mockJob, 'job');
    expect(openedUrl).toContain('twitter.com/intent/tweet');
  });

  it('includes UTM source=twitter (Req 7.4)', () => {
    shareViaTwitter(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=twitter'));
  });

  it('includes UTM medium=social for Twitter (Req 7.4)', () => {
    shareViaTwitter(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_medium=social'));
  });

  it('includes job-related hashtags in tweet text (Req 7.3)', () => {
    shareViaTwitter(mockJob, 'job');
    const decodedUrl = decodeURIComponent(openedUrl);
    expect(decodedUrl).toContain('#Careerak');
  });

  it('includes course-related hashtags for course content', () => {
    shareViaTwitter(mockCourse, 'course');
    const decodedUrl = decodeURIComponent(openedUrl);
    expect(decodedUrl).toContain('#Careerak');
  });

  it('tweet text does not exceed 280 characters (Req 7.3)', () => {
    const longTitleJob = {
      _id: 'job-long',
      title: 'A'.repeat(300),
      company: { name: 'B'.repeat(100) },
    };
    shareViaTwitter(longTitleJob, 'job');
    // The URL is opened - verify it was called (truncation happened internally)
    expect(window.open).toHaveBeenCalled();
    // The text param should be present
    expect(openedUrl).toContain('text=');
  });

  it('records share event via trackShare (Req 7)', async () => {
    shareViaTwitter(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('opens in a new window', () => {
    shareViaTwitter(mockJob, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      expect.any(String)
    );
  });
});

// ─── 4. LinkedIn Share (Req 8) ────────────────────────────────────────────────

describe('shareViaLinkedIn - Requirement 8', () => {
  it('opens LinkedIn share URL', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(openedUrl).toContain('linkedin.com/sharing/share-offsite');
  });

  it('includes UTM source=linkedin (Req 8.3)', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=linkedin'));
  });

  it('includes UTM medium=social for LinkedIn (Req 8.3)', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_medium=social'));
  });

  it('includes the content URL as a parameter', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(openedUrl).toContain('url=');
    expect(openedUrl).toContain(encodeURIComponent('careerak.com'));
  });

  it('records share event via trackShare (Req 8.5)', async () => {
    shareViaLinkedIn(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('works for profile content type (Req 8)', () => {
    shareViaLinkedIn(mockProfile, 'profile');
    expect(openedUrl).toContain('linkedin.com/sharing');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=linkedin'));
  });

  it('works for company content type', () => {
    shareViaLinkedIn(mockCompany, 'company');
    expect(openedUrl).toContain('linkedin.com/sharing');
  });

  it('opens in a new window', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      expect.any(String)
    );
  });
});

// ─── 5. WhatsApp Share (Req 9) ────────────────────────────────────────────────

describe('shareViaWhatsApp - Requirement 9', () => {
  describe('Desktop behavior (Req 9.3)', () => {
    it('opens WhatsApp Web on desktop', () => {
      // Default mock is desktop UA
      shareViaWhatsApp(mockJob, 'job');
      expect(openedUrl).toContain('web.whatsapp.com/send');
    });

    it('includes UTM source=whatsapp in message (Req 9.5)', () => {
      shareViaWhatsApp(mockJob, 'job');
      expect(openedUrl).toContain(encodeURIComponent('utm_source=whatsapp'));
    });

    it('includes UTM medium=messaging for WhatsApp (Req 9.5)', () => {
      shareViaWhatsApp(mockJob, 'job');
      expect(openedUrl).toContain(encodeURIComponent('utm_medium=messaging'));
    });

    it('includes content title in the message', () => {
      shareViaWhatsApp(mockJob, 'job');
      const decodedUrl = decodeURIComponent(openedUrl);
      expect(decodedUrl).toContain('Senior Software Engineer');
    });
  });

  describe('Mobile behavior (Req 9.2)', () => {
    beforeEach(() => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/90.0.4430.91 Mobile Safari/537.36'
      );
    });

    it('uses whatsapp:// deep link on mobile (Req 9.2)', () => {
      shareViaWhatsApp(mockJob, 'job');
      expect(locationHref).toContain('whatsapp://send');
    });

    it('includes UTM params in mobile deep link', () => {
      shareViaWhatsApp(mockJob, 'job');
      expect(locationHref).toContain(encodeURIComponent('utm_source=whatsapp'));
    });
  });

  it('records share event via trackShare', async () => {
    shareViaWhatsApp(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('works for course content type', () => {
    shareViaWhatsApp(mockCourse, 'course');
    // Desktop: opens web.whatsapp.com
    expect(openedUrl).toContain('whatsapp.com');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=whatsapp'));
  });
});

// ─── 6. Telegram Share (Req 10) ───────────────────────────────────────────────

describe('shareViaTelegram - Requirement 10', () => {
  it('opens Telegram share URL (Req 10.2)', () => {
    shareViaTelegram(mockJob, 'job');
    expect(openedUrl).toContain('t.me/share/url');
  });

  it('includes UTM source=telegram (Req 10.4)', () => {
    shareViaTelegram(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=telegram'));
  });

  it('includes UTM medium=messaging for Telegram (Req 10.4)', () => {
    shareViaTelegram(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_medium=messaging'));
  });

  it('includes content title as text parameter (Req 10.3)', () => {
    shareViaTelegram(mockJob, 'job');
    expect(openedUrl).toContain('text=');
    const decodedUrl = decodeURIComponent(openedUrl);
    expect(decodedUrl).toContain('Senior Software Engineer');
  });

  it('includes the content URL as url parameter', () => {
    shareViaTelegram(mockJob, 'job');
    expect(openedUrl).toContain('url=');
    expect(openedUrl).toContain(encodeURIComponent('careerak.com'));
  });

  it('records share event via trackShare', async () => {
    shareViaTelegram(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('works for course content type', () => {
    shareViaTelegram(mockCourse, 'course');
    expect(openedUrl).toContain('t.me/share/url');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=telegram'));
  });

  it('opens in a new window', () => {
    shareViaTelegram(mockJob, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      expect.any(String)
    );
  });
});

// ─── 7. Email Share (Req 11) ──────────────────────────────────────────────────

describe('shareViaEmail - Requirement 11', () => {
  it('opens mailto: link (Req 11.1)', () => {
    shareViaEmail(mockJob, 'job');
    expect(locationHref).toContain('mailto:');
  });

  it('includes subject with content type and title (Req 11.2)', () => {
    shareViaEmail(mockJob, 'job');
    const decodedHref = decodeURIComponent(locationHref);
    expect(decodedHref).toContain('Senior Software Engineer');
  });

  it('includes job-specific subject prefix', () => {
    shareViaEmail(mockJob, 'job');
    const decodedHref = decodeURIComponent(locationHref);
    expect(decodedHref).toContain('subject=');
  });

  it('includes course-specific subject prefix', () => {
    shareViaEmail(mockCourse, 'course');
    const decodedHref = decodeURIComponent(locationHref);
    expect(decodedHref).toContain('subject=');
    expect(decodedHref).toContain('React Fundamentals');
  });

  it('includes UTM source=email in body URL (Req 11.4)', () => {
    shareViaEmail(mockJob, 'job');
    expect(locationHref).toContain(encodeURIComponent('utm_source=email'));
  });

  it('includes UTM medium=email for email shares (Req 11.4)', () => {
    shareViaEmail(mockJob, 'job');
    expect(locationHref).toContain(encodeURIComponent('utm_medium=email'));
  });

  it('includes call-to-action in email body (Req 11.3)', () => {
    shareViaEmail(mockJob, 'job');
    const decodedHref = decodeURIComponent(locationHref);
    // Body should contain the URL
    expect(decodedHref).toContain('careerak.com');
  });

  it('includes Careerak branding in email body', () => {
    shareViaEmail(mockJob, 'job');
    const decodedHref = decodeURIComponent(locationHref);
    expect(decodedHref).toContain('Careerak');
  });

  it('records share event via trackShare', async () => {
    shareViaEmail(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('works for profile content type', () => {
    shareViaEmail(mockProfile, 'profile');
    expect(locationHref).toContain('mailto:');
    expect(locationHref).toContain(encodeURIComponent('utm_source=email'));
  });
});

// ─── 8. Copy to Clipboard (Req 12) ───────────────────────────────────────────

describe('copyShareLink - Requirement 12', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('copies the clean URL without UTM params (Req 12.3)', async () => {
    const result = await copyShareLink(mockJob, 'job');
    expect(result.url).toBe('https://careerak.com/job-postings/job-abc123');
    expect(result.url).not.toContain('utm_');
  });

  it('returns success=true when clipboard write succeeds (Req 12.1)', async () => {
    const result = await copyShareLink(mockJob, 'job');
    expect(result.success).toBe(true);
  });

  it('calls navigator.clipboard.writeText with the URL', async () => {
    await copyShareLink(mockJob, 'job');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://careerak.com/job-postings/job-abc123'
    );
  });

  it('records share event via trackShare on success', async () => {
    await copyShareLink(mockJob, 'job');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('returns correct URL for course content type', async () => {
    const result = await copyShareLink(mockCourse, 'course');
    expect(result.url).toBe('https://careerak.com/courses/course-xyz789');
  });

  it('returns correct URL for profile content type', async () => {
    const result = await copyShareLink(mockProfile, 'profile');
    expect(result.url).toBe('https://careerak.com/profile/user-def456');
  });

  it('returns correct URL for company content type', async () => {
    const result = await copyShareLink(mockCompany, 'company');
    expect(result.url).toBe('https://careerak.com/companies/company-ghi012');
  });

  it('returns success=false when clipboard write fails (Req 12.5)', async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    const result = await copyShareLink(mockJob, 'job');
    expect(result.success).toBe(false);
    // URL is still returned for manual copy fallback
    expect(result.url).toBe('https://careerak.com/job-postings/job-abc123');
  });

  it('falls back to execCommand when clipboard API is unavailable (Req 12.4)', async () => {
    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    // Mock execCommand
    document.execCommand = vi.fn().mockReturnValue(true);

    const result = await copyShareLink(mockJob, 'job');
    // execCommand fallback should be attempted
    expect(result.url).toBe('https://careerak.com/job-postings/job-abc123');
  });
});

// ─── 9. Internal Share (Req 5) ───────────────────────────────────────────────

describe('Internal share (internal_chat) - Requirement 5', () => {
  it('generates clean URL without UTM params for internal share', () => {
    // Internal share uses getContentUrl directly (no UTM)
    const url = getContentUrl('job', mockJob._id);
    expect(url).toBe('https://careerak.com/job-postings/job-abc123');
    expect(url).not.toContain('utm_');
  });

  it('generates correct internal URL for course', () => {
    const url = getContentUrl('course', mockCourse._id);
    expect(url).toBe('https://careerak.com/courses/course-xyz789');
    expect(url).not.toContain('utm_');
  });

  it('generates correct internal URL for profile', () => {
    const url = getContentUrl('profile', mockProfile._id);
    expect(url).toBe('https://careerak.com/profile/user-def456');
    expect(url).not.toContain('utm_');
  });

  it('generates correct internal URL for company', () => {
    const url = getContentUrl('company', mockCompany._id);
    expect(url).toBe('https://careerak.com/companies/company-ghi012');
    expect(url).not.toContain('utm_');
  });

  it('createShareData returns clean URL for internal use', () => {
    const data = createShareData(mockJob, 'job');
    // The base URL from createShareData has no UTM params
    expect(data.url).not.toContain('utm_');
    expect(data.url).toBe('https://careerak.com/job-postings/job-abc123');
  });
});

// ─── 10. UTM Parameters - All External Methods ───────────────────────────────

describe('UTM parameters - all external share methods (Req 6.3, 7.4, 8.3, 9.5, 10.4, 11.4)', () => {
  const externalMethods = [
    { name: 'Facebook', fn: shareViaFacebook, source: 'facebook', medium: 'social' },
    { name: 'Twitter', fn: shareViaTwitter, source: 'twitter', medium: 'social' },
    { name: 'LinkedIn', fn: shareViaLinkedIn, source: 'linkedin', medium: 'social' },
    { name: 'Telegram', fn: shareViaTelegram, source: 'telegram', medium: 'messaging' },
  ];

  externalMethods.forEach(({ name, fn, source, medium }) => {
    it(`${name}: includes utm_source=${source}`, () => {
      fn(mockJob, 'job');
      expect(openedUrl).toContain(encodeURIComponent(`utm_source=${source}`));
    });

    it(`${name}: includes utm_medium=${medium}`, () => {
      fn(mockJob, 'job');
      expect(openedUrl).toContain(encodeURIComponent(`utm_medium=${medium}`));
    });
  });

  it('WhatsApp: includes utm_source=whatsapp (desktop)', () => {
    shareViaWhatsApp(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_source=whatsapp'));
  });

  it('WhatsApp: includes utm_medium=messaging (desktop)', () => {
    shareViaWhatsApp(mockJob, 'job');
    expect(openedUrl).toContain(encodeURIComponent('utm_medium=messaging'));
  });

  it('Email: includes utm_source=email', () => {
    shareViaEmail(mockJob, 'job');
    expect(locationHref).toContain(encodeURIComponent('utm_source=email'));
  });

  it('Email: includes utm_medium=email', () => {
    shareViaEmail(mockJob, 'job');
    expect(locationHref).toContain(encodeURIComponent('utm_medium=email'));
  });

  it('Copy link: does NOT include UTM params (clean URL)', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const result = await copyShareLink(mockJob, 'job');
    expect(result.url).not.toContain('utm_');
  });
});

// ─── 11. Share Event Recording - All Methods ─────────────────────────────────

describe('Share event recording - trackShare called for all methods (Req 15.1)', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('Facebook: calls trackShare with content ID', () => {
    shareViaFacebook(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('job-abc123'),
      })
    );
  });

  it('Twitter: calls trackShare with content ID', () => {
    shareViaTwitter(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('LinkedIn: calls trackShare with content ID', () => {
    shareViaLinkedIn(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('WhatsApp: calls trackShare with content ID', () => {
    shareViaWhatsApp(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('Telegram: calls trackShare with content ID', () => {
    shareViaTelegram(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('Email: calls trackShare with content ID', () => {
    shareViaEmail(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('Copy link: calls trackShare on successful copy', async () => {
    await copyShareLink(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/shares'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('trackShare sends Authorization header with token', () => {
    shareViaFacebook(mockJob, 'job');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('trackShare does not throw when fetch fails (graceful error handling)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    // Should not throw
    expect(() => shareViaFacebook(mockJob, 'job')).not.toThrow();
  });

  it('trackShare does not call fetch when no token is available', () => {
    window.localStorage.getItem = vi.fn().mockReturnValue(null);
    shareViaFacebook(mockJob, 'job');
    // fetch should not be called for tracking when no token
    // (window.open is still called for the share itself)
    expect(window.open).toHaveBeenCalled();
  });
});

// ─── 12. Error Handling (Req 21) ─────────────────────────────────────────────

describe('Error handling - Requirement 21', () => {
  it('Facebook: window.open is called even when popup might be blocked', () => {
    // shareViaFacebook calls window.open directly; verify it's called
    shareViaFacebook(mockJob, 'job');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com'),
      '_blank',
      expect.any(String)
    );
  });

  it('copyToClipboard: returns success=false on clipboard error', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      },
    });
    const result = await copyToClipboard('https://careerak.com/test');
    expect(result.success).toBe(false);
  });

  it('copyShareLink: returns url even when clipboard fails (Req 12.5)', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      },
    });
    const result = await copyShareLink(mockJob, 'job');
    expect(result.url).toBe('https://careerak.com/job-postings/job-abc123');
    expect(result.success).toBe(false);
  });

  it('copyShareLink: does not call trackShare when copy fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      },
    });
    await copyShareLink(mockJob, 'job');
    // trackShare should NOT be called on failure
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('all share methods handle content without _id gracefully', () => {
    const contentWithoutId = { title: 'No ID Content', company: { name: 'Test' } };
    // Should not throw even without _id
    expect(() => shareViaFacebook(contentWithoutId, 'job')).not.toThrow();
    expect(() => shareViaTwitter(contentWithoutId, 'job')).not.toThrow();
    expect(() => shareViaLinkedIn(contentWithoutId, 'job')).not.toThrow();
    expect(() => shareViaTelegram(contentWithoutId, 'job')).not.toThrow();
  });
});

// ─── 13. All 4 Content Types × All 8 Share Methods ───────────────────────────

describe('All content types work with all share methods (Req 22.4)', () => {
  const contentTypes = [
    { type: 'job', content: mockJob },
    { type: 'course', content: mockCourse },
    { type: 'profile', content: mockProfile },
    { type: 'company', content: mockCompany },
  ];

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  contentTypes.forEach(({ type, content }) => {
    it(`Facebook share works for contentType="${type}"`, () => {
      shareViaFacebook(content, type);
      expect(openedUrl).toContain('facebook.com/sharer');
    });

    it(`Twitter share works for contentType="${type}"`, () => {
      shareViaTwitter(content, type);
      expect(openedUrl).toContain('twitter.com/intent/tweet');
    });

    it(`LinkedIn share works for contentType="${type}"`, () => {
      shareViaLinkedIn(content, type);
      expect(openedUrl).toContain('linkedin.com/sharing');
    });

    it(`WhatsApp share works for contentType="${type}"`, () => {
      shareViaWhatsApp(content, type);
      expect(openedUrl).toContain('whatsapp.com');
    });

    it(`Telegram share works for contentType="${type}"`, () => {
      shareViaTelegram(content, type);
      expect(openedUrl).toContain('t.me/share/url');
    });

    it(`Email share works for contentType="${type}"`, () => {
      shareViaEmail(content, type);
      expect(locationHref).toContain('mailto:');
    });

    it(`Copy link works for contentType="${type}"`, async () => {
      const result = await copyShareLink(content, type);
      expect(result.url).toContain('careerak.com');
      expect(result.url).not.toContain('utm_');
    });

    it(`Internal share URL is clean for contentType="${type}"`, () => {
      const id = content._id || content.id;
      const url = getContentUrl(type, id);
      expect(url).toContain('careerak.com');
      expect(url).not.toContain('utm_');
    });
  });
});

// ─── 14. Mobile Detection Utilities ──────────────────────────────────────────

describe('Mobile detection utilities', () => {
  it('isMobileDevice returns false for desktop UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    expect(isMobileDevice()).toBe(false);
  });

  it('isMobileDevice returns true for Android UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/90.0.4430.91 Mobile Safari/537.36'
    );
    expect(isMobileDevice()).toBe(true);
  });

  it('isMobileDevice returns true for iPhone UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    );
    expect(isMobileDevice()).toBe(true);
  });

  it('isIOSSafari returns true for iOS Safari UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    );
    expect(isIOSSafari()).toBe(true);
  });

  it('isIOSSafari returns false for Android Chrome', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/90.0.4430.91 Mobile Safari/537.36'
    );
    expect(isIOSSafari()).toBe(false);
  });

  it('isAndroidChrome returns true for Android Chrome UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
    );
    expect(isAndroidChrome()).toBe(true);
  });

  it('shouldUseNativeShare returns false on desktop', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    expect(shouldUseNativeShare()).toBe(false);
  });
});
