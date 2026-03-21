/**
 * Unit Tests for shareService
 * Validates: Requirements 22 (Share Testing)
 *
 * Tests cover:
 *  - generateShareLink (UTM params, no UTM params, invalid contentType)
 *  - recordShare (saves document, calls analytics, invalid inputs)
 *  - getShareAnalytics (returns expected shape)
 *  - validateSharePermissions (job/course/profile external/internal)
 */

jest.mock('../models/Share');
jest.mock('../models/ShareAnalytics');
jest.mock('../models/UserSettings');

const shareService = require('../services/shareService');
const Share = require('../models/Share');
const ShareAnalytics = require('../models/ShareAnalytics');
const UserSettings = require('../models/UserSettings');

// ─── helpers ────────────────────────────────────────────────────────────────

const CONTENT_ID = '64a1b2c3d4e5f6a7b8c9d0e1';

// ─── generateShareLink ───────────────────────────────────────────────────────

describe('generateShareLink', () => {
  test('job + facebook includes UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'facebook');

    expect(result.utmParams).not.toBeNull();
    expect(result.utmParams.utm_source).toBe('facebook');
    expect(result.utmParams.utm_medium).toBe('social');
    expect(result.utmParams.utm_campaign).toBe('share_job');
    expect(result.url).toContain('utm_source=facebook');
    expect(result.url).toContain('utm_medium=social');
    // External shares use /share/job/ route so crawlers get OG/Twitter meta tags
    expect(result.url).toContain(`/share/job/${CONTENT_ID}`);
  });

  test('job + copy_link has no UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'copy_link');

    expect(result.utmParams).toBeNull();
    expect(result.url).not.toContain('utm_');
    expect(result.url).toBe(`https://careerak.com/job-postings/${CONTENT_ID}`);
  });

  test('course + twitter includes correct utm_source', () => {
    const result = shareService.generateShareLink('course', CONTENT_ID, 'twitter');

    expect(result.utmParams).not.toBeNull();
    expect(result.utmParams.utm_source).toBe('twitter');
    expect(result.utmParams.utm_medium).toBe('social');
    expect(result.utmParams.utm_campaign).toBe('share_course');
    // External shares use /share/course/ route so crawlers get OG/Twitter meta tags
    expect(result.url).toContain(`/share/course/${CONTENT_ID}`);
  });

  test('profile + internal_chat has no UTM params', () => {
    const result = shareService.generateShareLink('profile', CONTENT_ID, 'internal_chat');

    expect(result.utmParams).toBeNull();
    expect(result.url).toBe(`https://careerak.com/profile/${CONTENT_ID}`);
  });

  test('throws error for invalid contentType', () => {
    expect(() =>
      shareService.generateShareLink('invalid_type', CONTENT_ID, 'facebook')
    ).toThrow('Invalid contentType: invalid_type');
  });
});

// ─── recordShare ─────────────────────────────────────────────────────────────

describe('recordShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saves a Share document and calls ShareAnalytics.incrementShare', async () => {
    const mockSaved = { _id: 'share123', contentType: 'job', shareMethod: 'facebook' };
    const mockShareInstance = { save: jest.fn().mockResolvedValue(mockSaved) };
    Share.mockImplementation(() => mockShareInstance);
    ShareAnalytics.incrementShare = jest.fn().mockResolvedValue({});

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: CONTENT_ID,
      userId: 'user123',
      shareMethod: 'facebook',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    });

    expect(mockShareInstance.save).toHaveBeenCalledTimes(1);
    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('job', CONTENT_ID, 'facebook');
    expect(result).toEqual(mockSaved);
  });

  test('throws error for invalid contentType', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'invalid',
        contentId: CONTENT_ID,
        shareMethod: 'facebook'
      })
    ).rejects.toThrow('Invalid contentType: invalid');
  });

  test('throws error for invalid shareMethod', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: CONTENT_ID,
        shareMethod: 'fax'
      })
    ).rejects.toThrow('Invalid shareMethod: fax');
  });
});

// ─── getShareAnalytics ───────────────────────────────────────────────────────

describe('getShareAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns totalShares, sharesByMethod, and analytics', async () => {
    const mockAnalytics = { totalShares: 42, sharesByMethod: new Map() };
    const mockTotal = 42;
    const mockByMethod = [{ _id: 'facebook', count: 30 }, { _id: 'twitter', count: 12 }];

    ShareAnalytics.getAnalytics = jest.fn().mockResolvedValue(mockAnalytics);
    Share.getShareCount = jest.fn().mockResolvedValue(mockTotal);
    Share.getSharesByMethod = jest.fn().mockResolvedValue(mockByMethod);

    const result = await shareService.getShareAnalytics('job', CONTENT_ID);

    expect(result).toHaveProperty('totalShares', mockTotal);
    expect(result).toHaveProperty('sharesByMethod', mockByMethod);
    expect(result).toHaveProperty('analytics', mockAnalytics);
    expect(ShareAnalytics.getAnalytics).toHaveBeenCalledWith('job', CONTENT_ID);
    expect(Share.getShareCount).toHaveBeenCalledWith('job', CONTENT_ID);
    expect(Share.getSharesByMethod).toHaveBeenCalledWith('job', CONTENT_ID);
  });
});

// ─── validateSharePermissions ────────────────────────────────────────────────

describe('validateSharePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('allows job share (external)', async () => {
    const result = await shareService.validateSharePermissions('job', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('allows course share (external)', async () => {
    const result = await shareService.validateSharePermissions('course', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('allows internal profile share regardless of visibility', async () => {
    // isExternal = false → should always be allowed for profiles
    const result = await shareService.validateSharePermissions('profile', CONTENT_ID, 'user1', false);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('blocks external profile share when visibility is "none"', async () => {
    // Mock User.findById
    const { User } = require('../models/User');
    jest.mock('../models/User', () => ({
      User: { findById: jest.fn() }
    }));

    // Re-require after mock (inline mock for this test)
    const mockUser = { _id: CONTENT_ID, profileVisibility: 'none' };
    const mockSettings = { privacy: { profileVisibility: 'none' } };

    // Patch the require cache so shareService picks up the mock
    const userModule = require('../models/User');
    userModule.User = { findById: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) }) }) };

    UserSettings.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSettings)
      })
    });

    const result = await shareService.validateSharePermissions('profile', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Profile is private and cannot be shared externally');
  });
});
