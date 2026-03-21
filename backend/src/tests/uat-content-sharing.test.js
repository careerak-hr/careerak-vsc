/**
 * UAT Test Suite - Content Sharing Feature
 * User Acceptance Testing for Careerak Content Sharing
 *
 * Validates key user flows from requirements:
 * Req 1 (Job Sharing), Req 2 (Course Sharing), Req 3 (Profile Sharing),
 * Req 4 (Company Sharing), Req 5 (Internal Chat), Req 12 (Copy Link),
 * Req 13 (Share Link Generation), Req 15 (Analytics), Req 17 (Privacy),
 * Req 20 (Performance), Req 21 (Error Handling)
 *
 * Languages: Arabic (ar), English (en), French (fr)
 * Colors: Primary #304B60 | Secondary #E3DAD1 | Accent #D48161
 */

jest.mock('../models/Share');
jest.mock('../models/ShareAnalytics');
jest.mock('../models/UserSettings');

global.fetch = jest.fn();

const shareService = require('../services/shareService');
const Share = require('../models/Share');
const ShareAnalytics = require('../models/ShareAnalytics');
const UserSettings = require('../models/UserSettings');

// ─── Test helpers ─────────────────────────────────────────────────────────────

const MOCK_JOB_ID     = '64a1b2c3d4e5f6a7b8c9d001';
const MOCK_COURSE_ID  = '64a1b2c3d4e5f6a7b8c9d002';
const MOCK_PROFILE_ID = '64a1b2c3d4e5f6a7b8c9d003';
const MOCK_COMPANY_ID = '64a1b2c3d4e5f6a7b8c9d004';
const MOCK_USER_ID    = '64a1b2c3d4e5f6a7b8c9d005';

function mockShareSave(returnValue = { _id: 'share-abc' }) {
  const instance = { save: jest.fn().mockResolvedValue(returnValue) };
  Share.mockImplementation(() => instance);
  ShareAnalytics.incrementShare = jest.fn().mockResolvedValue({});
  return instance;
}

// ─── Requirement 1: Job Sharing ───────────────────────────────────────────────

describe('Req 1 - Job Sharing (مشاركة فرص العمل)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-1.1: generates a share link for a job posting', () => {
    const result = shareService.generateShareLink('job', MOCK_JOB_ID, 'copy_link');
    expect(result.url).toBe(`https://careerak.com/job-postings/${MOCK_JOB_ID}`);
    expect(result.utmParams).toBeNull();
  });

  it('UAT-1.2: external share includes all three share options (facebook, twitter, copy_link)', () => {
    const fb = shareService.generateShareLink('job', MOCK_JOB_ID, 'facebook');
    const tw = shareService.generateShareLink('job', MOCK_JOB_ID, 'twitter');
    const cp = shareService.generateShareLink('job', MOCK_JOB_ID, 'copy_link');

    expect(fb.url).toContain('utm_source=facebook');
    expect(tw.url).toContain('utm_source=twitter');
    expect(cp.utmParams).toBeNull();
  });

  it('UAT-1.3: internal share records the event and calls analytics', async () => {
    const instance = mockShareSave({ _id: 'share-job-1', contentType: 'job' });

    const saved = await shareService.recordShare({
      contentType: 'job',
      contentId: MOCK_JOB_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'internal_chat',
    });

    expect(instance.save).toHaveBeenCalledTimes(1);
    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('job', MOCK_JOB_ID, 'internal_chat');
    expect(saved._id).toBe('share-job-1');
  });

  it('UAT-1.4: job share link is accessible without auth (public content)', async () => {
    const perm = await shareService.validateSharePermissions('job', MOCK_JOB_ID, null, true);
    expect(perm.allowed).toBe(true);
    expect(perm.reason).toBe('Public content');
  });
});

// ─── Requirement 2: Course Sharing ───────────────────────────────────────────

describe('Req 2 - Course Sharing (مشاركة الدورات التدريبية)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-2.1: generates a share link for a course', () => {
    const result = shareService.generateShareLink('course', MOCK_COURSE_ID, 'copy_link');
    expect(result.url).toBe(`https://careerak.com/courses/${MOCK_COURSE_ID}`);
  });

  it('UAT-2.2: course share link includes preview info via UTM for social platforms', () => {
    const result = shareService.generateShareLink('course', MOCK_COURSE_ID, 'linkedin');
    expect(result.url).toContain(MOCK_COURSE_ID);
    expect(result.utmParams.utm_campaign).toBe('share_course');
  });

  it('UAT-2.3: records course share event for analytics', async () => {
    mockShareSave({ _id: 'share-course-1', contentType: 'course' });

    await shareService.recordShare({
      contentType: 'course',
      contentId: MOCK_COURSE_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'whatsapp',
    });

    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('course', MOCK_COURSE_ID, 'whatsapp');
  });
});

// ─── Requirement 3: Profile Sharing ──────────────────────────────────────────

describe('Req 3 - Profile Sharing (مشاركة الملفات الشخصية)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-3.1: generates a share link for a public profile', () => {
    const result = shareService.generateShareLink('profile', MOCK_PROFILE_ID, 'copy_link');
    expect(result.url).toBe(`https://careerak.com/profile/${MOCK_PROFILE_ID}`);
  });

  it('UAT-3.2: internal profile share is always allowed', async () => {
    const perm = await shareService.validateSharePermissions('profile', MOCK_PROFILE_ID, MOCK_USER_ID, false);
    expect(perm.allowed).toBe(true);
    expect(perm.reason).toBe('Internal share allowed');
  });

  it('UAT-3.3: private profile cannot be shared externally', async () => {
    const { User } = require('../models/User');
    const userModule = require('../models/User');
    userModule.User = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: MOCK_PROFILE_ID, profileVisibility: 'none' }),
        }),
      }),
    };
    UserSettings.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ privacy: { profileVisibility: 'none' } }),
      }),
    });

    const perm = await shareService.validateSharePermissions('profile', MOCK_PROFILE_ID, MOCK_USER_ID, true);
    expect(perm.allowed).toBe(false);
    expect(perm.reason).toBe('Profile is private and cannot be shared externally');
  });
});

// ─── Requirement 4: Company Profile Sharing ───────────────────────────────────

describe('Req 4 - Company Profile Sharing (مشاركة ملفات الشركات)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-4.1: generates a publicly accessible share link for a company', () => {
    const result = shareService.generateShareLink('company', MOCK_COMPANY_ID, 'copy_link');
    expect(result.url).toBe(`https://careerak.com/companies/${MOCK_COMPANY_ID}`);
  });

  it('UAT-4.2: company share is always allowed (public content)', async () => {
    const perm = await shareService.validateSharePermissions('company', MOCK_COMPANY_ID, MOCK_USER_ID, true);
    expect(perm.allowed).toBe(true);
  });

  it('UAT-4.3: records company share event with source and destination', async () => {
    mockShareSave({ _id: 'share-company-1' });

    await shareService.recordShare({
      contentType: 'company',
      contentId: MOCK_COMPANY_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'facebook',
    });

    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('company', MOCK_COMPANY_ID, 'facebook');
  });
});

// ─── Requirement 5: Internal Chat Sharing ────────────────────────────────────

describe('Req 5 - Internal Chat Sharing (المشاركة الداخلية عبر المحادثات)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-5.1: records internal_chat share for a job', async () => {
    const instance = mockShareSave({ _id: 'share-chat-1', shareMethod: 'internal_chat' });

    const saved = await shareService.recordShare({
      contentType: 'job',
      contentId: MOCK_JOB_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'internal_chat',
    });

    expect(instance.save).toHaveBeenCalledTimes(1);
    expect(saved.shareMethod).toBe('internal_chat');
  });

  it('UAT-5.2: internal share link has no UTM params (clean URL)', () => {
    const result = shareService.generateShareLink('job', MOCK_JOB_ID, 'internal_chat');
    expect(result.utmParams).toBeNull();
    expect(result.url).not.toContain('utm_');
  });

  it('UAT-5.3: internal share is allowed for all content types', async () => {
    for (const type of ['job', 'course', 'company']) {
      const perm = await shareService.validateSharePermissions(type, MOCK_JOB_ID, MOCK_USER_ID, false);
      expect(perm.allowed).toBe(true);
    }
  });
});

// ─── Requirement 12: Copy Link ────────────────────────────────────────────────

describe('Req 12 - Copy Link (نسخ الرابط)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-12.1: copy_link returns a clean URL without UTM parameters', () => {
    const result = shareService.generateShareLink('job', MOCK_JOB_ID, 'copy_link');
    expect(result.url).toBe(`https://careerak.com/job-postings/${MOCK_JOB_ID}`);
    expect(result.url).not.toContain('utm_');
    expect(result.utmParams).toBeNull();
  });

  it('UAT-12.2: copy_link works for all content types', () => {
    const types = [
      { type: 'job',     id: MOCK_JOB_ID,     path: 'job-postings' },
      { type: 'course',  id: MOCK_COURSE_ID,   path: 'courses' },
      { type: 'profile', id: MOCK_PROFILE_ID,  path: 'profile' },
      { type: 'company', id: MOCK_COMPANY_ID,  path: 'companies' },
    ];

    types.forEach(({ type, id, path }) => {
      const result = shareService.generateShareLink(type, id, 'copy_link');
      expect(result.url).toBe(`https://careerak.com/${path}/${id}`);
    });
  });
});

// ─── Requirement 13: Share Link Generation ───────────────────────────────────

describe('Req 13 - Share Link Generation (توليد روابط المشاركة)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-13.1: share links follow format https://careerak.com/{contentType}/{contentId}', () => {
    const result = shareService.generateShareLink('job', MOCK_JOB_ID, 'copy_link');
    expect(result.url).toMatch(/^https:\/\/careerak\.com\//);
    expect(result.url).toContain(MOCK_JOB_ID);
  });

  it('UAT-13.2: UTM params are appended for external shares', () => {
    const methods = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email'];
    methods.forEach((method) => {
      const result = shareService.generateShareLink('job', MOCK_JOB_ID, method);
      expect(result.url).toContain(`utm_source=${method}`);
      expect(result.utmParams).not.toBeNull();
    });
  });

  it('UAT-13.3: internal and copy_link methods produce no UTM params', () => {
    ['copy_link', 'internal_chat', 'native'].forEach((method) => {
      const result = shareService.generateShareLink('job', MOCK_JOB_ID, method);
      expect(result.utmParams).toBeNull();
    });
  });

  it('UAT-13.4: throws for invalid content type', () => {
    expect(() => shareService.generateShareLink('event', MOCK_JOB_ID, 'copy_link'))
      .toThrow('Invalid contentType: event');
  });
});

// ─── Requirement 15: Share Analytics ─────────────────────────────────────────

describe('Req 15 - Share Analytics (تتبع المشاركات)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-15.1: share event is recorded with correct metadata', async () => {
    const instance = mockShareSave({
      _id: 'share-analytics-1',
      contentType: 'job',
      contentId: MOCK_JOB_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'facebook',
    });

    const saved = await shareService.recordShare({
      contentType: 'job',
      contentId: MOCK_JOB_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'facebook',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(instance.save).toHaveBeenCalledTimes(1);
    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('job', MOCK_JOB_ID, 'facebook');
    expect(saved.contentType).toBe('job');
    expect(saved.shareMethod).toBe('facebook');
  });

  it('UAT-15.2: getShareAnalytics returns totalShares, sharesByMethod, and analytics', async () => {
    const mockAnalytics = { totalShares: 10, sharesByMethod: new Map() };
    ShareAnalytics.getAnalytics = jest.fn().mockResolvedValue(mockAnalytics);
    Share.getShareCount = jest.fn().mockResolvedValue(10);
    Share.getSharesByMethod = jest.fn().mockResolvedValue([
      { _id: 'facebook', count: 7 },
      { _id: 'twitter', count: 3 },
    ]);

    const result = await shareService.getShareAnalytics('job', MOCK_JOB_ID);

    expect(result.totalShares).toBe(10);
    expect(result.sharesByMethod).toHaveLength(2);
    expect(result.analytics).toEqual(mockAnalytics);
  });

  it('UAT-15.3: analytics are tracked for all content types', async () => {
    for (const type of ['job', 'course', 'profile', 'company']) {
      jest.clearAllMocks();
      mockShareSave({ _id: `share-${type}` });

      await shareService.recordShare({
        contentType: type,
        contentId: MOCK_JOB_ID,
        userId: MOCK_USER_ID,
        shareMethod: 'copy_link',
      });

      expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith(type, MOCK_JOB_ID, 'copy_link');
    }
  });
});

// ─── Requirement 17: Privacy ──────────────────────────────────────────────────

describe('Req 17 - Privacy and Security (الخصوصية والأمان)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-17.1: jobs, courses, and companies are always shareable externally', async () => {
    for (const type of ['job', 'course', 'company']) {
      const perm = await shareService.validateSharePermissions(type, MOCK_JOB_ID, MOCK_USER_ID, true);
      expect(perm.allowed).toBe(true);
    }
  });

  it('UAT-17.2: private profile blocked from external sharing', async () => {
    const userModule = require('../models/User');
    userModule.User = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: MOCK_PROFILE_ID }),
        }),
      }),
    };
    UserSettings.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ privacy: { profileVisibility: 'none' } }),
      }),
    });

    const perm = await shareService.validateSharePermissions('profile', MOCK_PROFILE_ID, MOCK_USER_ID, true);
    expect(perm.allowed).toBe(false);
  });

  it('UAT-17.3: share link does not expose sensitive info (no email/phone in URL)', () => {
    const result = shareService.generateShareLink('profile', MOCK_PROFILE_ID, 'copy_link');
    expect(result.url).not.toContain('@');
    expect(result.url).not.toContain('email');
    expect(result.url).not.toContain('phone');
  });

  it('UAT-17.4: throws for invalid shareMethod (prevents injection)', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: MOCK_JOB_ID,
        shareMethod: 'unknown_method',
      })
    ).rejects.toThrow('Invalid shareMethod: unknown_method');
  });
});

// ─── Requirement 20: Performance ─────────────────────────────────────────────

describe('Req 20 - Performance (الأداء والتحسين)', () => {
  it('UAT-20.1: generateShareLink completes within 100ms', () => {
    const start = Date.now();
    shareService.generateShareLink('job', MOCK_JOB_ID, 'facebook');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('UAT-20.2: generateShareLink is synchronous (no async overhead)', () => {
    const result = shareService.generateShareLink('course', MOCK_COURSE_ID, 'copy_link');
    // If it were async it would return a Promise; it should return a plain object
    expect(result).not.toBeInstanceOf(Promise);
    expect(result).toHaveProperty('url');
  });

  it('UAT-20.3: recordShare is non-blocking (analytics increment is fire-and-forget)', async () => {
    // Simulate slow analytics
    ShareAnalytics.incrementShare = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );
    const instance = { save: jest.fn().mockResolvedValue({ _id: 'perf-share' }) };
    Share.mockImplementation(() => instance);

    const start = Date.now();
    await shareService.recordShare({
      contentType: 'job',
      contentId: MOCK_JOB_ID,
      userId: MOCK_USER_ID,
      shareMethod: 'twitter',
    });
    const elapsed = Date.now() - start;

    // recordShare should resolve quickly without waiting for analytics
    expect(elapsed).toBeLessThan(200);
  });
});

// ─── Requirement 21: Error Handling ──────────────────────────────────────────

describe('Req 21 - Error Handling (معالجة الأخطاء)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('UAT-21.1: recordShare throws user-friendly error for invalid contentType', async () => {
    await expect(
      shareService.recordShare({ contentType: 'video', contentId: MOCK_JOB_ID, shareMethod: 'facebook' })
    ).rejects.toThrow('Invalid contentType: video');
  });

  it('UAT-21.2: recordShare throws user-friendly error for invalid shareMethod', async () => {
    await expect(
      shareService.recordShare({ contentType: 'job', contentId: MOCK_JOB_ID, shareMethod: 'fax' })
    ).rejects.toThrow('Invalid shareMethod: fax');
  });

  it('UAT-21.3: generateShareLink throws for unknown content type', () => {
    expect(() => shareService.generateShareLink('podcast', MOCK_JOB_ID, 'copy_link'))
      .toThrow('Invalid contentType: podcast');
  });

  it('UAT-21.4: recordShare wraps DB errors with descriptive message', async () => {
    const instance = { save: jest.fn().mockRejectedValue(new Error('DB connection lost')) };
    Share.mockImplementation(() => instance);

    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: MOCK_JOB_ID,
        shareMethod: 'facebook',
      })
    ).rejects.toThrow('Failed to record share: DB connection lost');
  });

  it('UAT-21.5: getShareAnalytics wraps errors with descriptive message', async () => {
    ShareAnalytics.getAnalytics = jest.fn().mockRejectedValue(new Error('Timeout'));
    Share.getShareCount = jest.fn().mockResolvedValue(0);
    Share.getSharesByMethod = jest.fn().mockResolvedValue([]);

    await expect(
      shareService.getShareAnalytics('job', MOCK_JOB_ID)
    ).rejects.toThrow('Failed to get share analytics: Timeout');
  });
});
