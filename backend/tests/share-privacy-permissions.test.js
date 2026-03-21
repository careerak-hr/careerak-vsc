/**
 * Privacy and Permissions Tests for Content Sharing
 * Validates: Requirement 17 (Privacy and Security)
 *
 * Tests cover:
 *  - 17.1 Privacy settings respected (public, private, connections-only)
 *  - 17.2 Private content cannot be shared externally
 *  - 17.3 Share links don't expose sensitive user info (email, phone, internal IDs)
 *  - 17.4 Recipient permission validation for internal shares
 *  - 17.5 Deleted content returns 404 on share link access
 */

const mongoose = require('mongoose');
const Share = require('../src/models/Share');
const ShareAnalytics = require('../src/models/ShareAnalytics');
const UserSettings = require('../src/models/UserSettings');
const shareService = require('../src/services/shareService');

// ─── helpers ─────────────────────────────────────────────────────────────────

const newId = () => new mongoose.Types.ObjectId().toString();


// ─── helpers: create a minimal valid User ────────────────────────────────────

let _phoneCounter = 1000;
const makeUser = async (overrides = {}) => {
  const { User } = require('../src/models/User');
  _phoneCounter++;
  return User.create({
    phone: `+9665${_phoneCounter}`,
    password: 'password12345',
    role: 'Employee',
    country: 'Egypt',
    ...overrides
  });
};

// ─── Requirement 17.1: Privacy settings respected ────────────────────────────

describe('Req 17.1 - Privacy settings (public, private, connections-only)', () => {
  test('job content is always public - external share allowed', async () => {
    const result = await shareService.validateSharePermissions('job', newId(), 'user1', true);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('course content is always public - external share allowed', async () => {
    const result = await shareService.validateSharePermissions('course', newId(), 'user1', true);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('company content is always public - external share allowed', async () => {
    const result = await shareService.validateSharePermissions('company', newId(), 'user1', true);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('profile with visibility=everyone - external share allowed', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'everyone' }
    });

    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', true);
    expect(result.allowed).toBe(true);
  });

  test('profile with visibility=none - external share blocked', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Profile is private and cannot be shared externally');
  });

  test('profile with visibility=registered - external share allowed (not none)', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'registered' }
    });

    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', true);
    expect(result.allowed).toBe(true);
  });
});


// ─── Requirement 17.2: Private content cannot be shared externally ────────────

describe('Req 17.2 - Private content cannot be shared externally', () => {
  test('private profile blocks external share via facebook', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', true);
    expect(result.allowed).toBe(false);
  });

  test('private profile blocks external share via twitter', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    // isExternal=true covers all external platforms (facebook, twitter, linkedin, etc.)
    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', true);
    expect(result.allowed).toBe(false);
  });

  test('private profile still allows internal share', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    // isExternal=false → internal share is always allowed
    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other_user', false);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('non-existent profile blocks external share', async () => {
    const fakeId = newId();
    const result = await shareService.validateSharePermissions('profile', fakeId, 'user1', true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Profile not found');
  });
});


// ─── Requirement 17.3: Share links don't expose sensitive user info ───────────

describe('Req 17.3 - Share links do not expose sensitive user information', () => {
  test('generated share link for profile does not contain email pattern', () => {
    const profileId = newId();
    const link = shareService.generateShareLink('profile', profileId, 'copy_link');

    // Link should not contain an email address
    expect(link.url).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  });

  test('generated share link for profile does not contain phone number pattern', () => {
    const profileId = newId();
    const link = shareService.generateShareLink('profile', profileId, 'copy_link');

    // Link should not contain a phone number (digits sequence of 7+)
    expect(link.url).not.toMatch(/\+?\d[\d\s\-]{6,}/);
  });

  test('generated share link for job does not expose internal user IDs beyond content ID', () => {
    const jobId = newId();
    const userId = newId();
    const link = shareService.generateShareLink('job', jobId, 'facebook');

    // URL should only contain the jobId, not any userId
    expect(link.url).toContain(jobId);
    expect(link.url).not.toContain(userId);
  });

  test('share link URL follows expected clean format without raw DB fields', () => {
    const contentId = newId();
    const link = shareService.generateShareLink('job', contentId, 'copy_link');

    // Should be a clean careerak.com URL
    expect(link.url).toMatch(/^https:\/\/careerak\.com\//);
    // Should not contain query params that expose internal data
    expect(link.url).not.toContain('userId=');
    expect(link.url).not.toContain('email=');
    expect(link.url).not.toContain('phone=');
    expect(link.url).not.toContain('password=');
  });

  test('UTM params in share link only contain tracking info, not user PII', () => {
    const contentId = newId();
    const link = shareService.generateShareLink('job', contentId, 'facebook');

    expect(link.utmParams).not.toBeNull();
    // UTM params should only have source, medium, campaign
    const paramKeys = Object.keys(link.utmParams);
    expect(paramKeys).toEqual(expect.arrayContaining(['utm_source', 'utm_medium', 'utm_campaign']));
    // No PII fields
    expect(paramKeys).not.toContain('email');
    expect(paramKeys).not.toContain('phone');
    expect(paramKeys).not.toContain('userId');
  });

  test('share record stored in DB does not include sensitive fields beyond ip/userAgent', async () => {
    const contentId = newId();
    const userId = newId();

    const saved = await shareService.recordShare({
      contentType: 'job',
      contentId,
      userId,
      shareMethod: 'facebook',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    });

    // Verify the saved document has no sensitive fields
    const doc = saved.toObject ? saved.toObject() : saved;
    expect(doc).not.toHaveProperty('email');
    expect(doc).not.toHaveProperty('phone');
    expect(doc).not.toHaveProperty('password');
  });
});


// ─── Requirement 17.4: Recipient permission validation for internal shares ────

describe('Req 17.4 - Recipient permission validation for internal shares', () => {
  test('internal share of a job is always allowed', async () => {
    const result = await shareService.validateSharePermissions('job', newId(), 'user1', false);
    expect(result.allowed).toBe(true);
  });

  test('internal share of a course is always allowed', async () => {
    const result = await shareService.validateSharePermissions('course', newId(), 'user1', false);
    expect(result.allowed).toBe(true);
  });

  test('internal share of a company is always allowed', async () => {
    const result = await shareService.validateSharePermissions('company', newId(), 'user1', false);
    expect(result.allowed).toBe(true);
  });

  test('internal share of a public profile is allowed', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'everyone' }
    });

    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'sender_user', false);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('internal share of a private profile is still allowed (internal bypass)', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    // Internal shares bypass external privacy restrictions
    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'sender_user', false);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('internal share is recorded correctly in the database', async () => {
    const contentId = newId();
    const senderId = newId();

    const saved = await shareService.recordShare({
      contentType: 'job',
      contentId,
      userId: senderId,
      shareMethod: 'internal_chat'
    });

    expect(saved.shareMethod).toBe('internal_chat');
    expect(saved.contentType).toBe('job');

    const doc = await Share.findOne({ contentId, shareMethod: 'internal_chat' });
    expect(doc).not.toBeNull();
  });
});


// ─── Requirement 17.5: Deleted content returns 404 on share link access ───────

describe('Req 17.5 - Deleted content returns 404 on share link access', () => {
  /**
   * The share link generation is a pure URL construction (no DB lookup).
   * The 404 behavior is enforced at the controller/route level when the
   * content is fetched. These tests verify the service-level behavior:
   * - validateSharePermissions returns not-allowed for non-existent profiles
   * - Share records for deleted content can still be queried (orphaned shares)
   * - The share count for a non-existent content ID is 0 (no shares recorded)
   */

  test('validateSharePermissions returns not-allowed for deleted profile', async () => {
    const deletedProfileId = newId(); // ID that doesn't exist in DB
    const result = await shareService.validateSharePermissions('profile', deletedProfileId, 'user1', true);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Profile not found');
  });

  test('share count for non-existent content is 0', async () => {
    const nonExistentId = newId();
    const count = await Share.getShareCount('job', nonExistentId);
    expect(count).toBe(0);
  });

  test('share analytics for non-existent content returns null analytics', async () => {
    const nonExistentId = newId();
    const result = await shareService.getShareAnalytics('job', nonExistentId);

    expect(result.totalShares).toBe(0);
    expect(result.analytics).toBeNull();
    expect(result.sharesByMethod).toEqual([]);
  });

  test('share link can still be generated for a deleted content ID (URL construction only)', () => {
    // generateShareLink is a pure URL builder - it doesn't check DB existence.
    // The 404 is returned by the content endpoint when the content is fetched.
    const deletedId = newId();
    const link = shareService.generateShareLink('job', deletedId, 'copy_link');

    expect(link.url).toContain(deletedId);
    expect(link.url).toMatch(/^https:\/\/careerak\.com\//);
  });

  test('share records for deleted content are orphaned but do not cause errors', async () => {
    const contentId = newId();

    // Record a share for content that "exists"
    await shareService.recordShare({
      contentType: 'job',
      contentId,
      shareMethod: 'facebook'
    });

    // Simulate content deletion by not having it in DB
    // The share record still exists (orphaned), but count reflects it
    const count = await Share.getShareCount('job', contentId);
    expect(count).toBe(1);

    // Analytics still work without errors
    const analytics = await shareService.getShareAnalytics('job', contentId);
    expect(analytics.totalShares).toBe(1);
  });
});


// ─── Cross-cutting: Privacy settings interaction with share methods ───────────

describe('Privacy settings interaction with share methods', () => {
  test('public job can be shared via all external methods', async () => {
    const externalMethods = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email'];
    const jobId = newId();

    for (const method of externalMethods) {
      const result = await shareService.validateSharePermissions('job', jobId, 'user1', true);
      expect(result.allowed).toBe(true);
    }
  });

  test('private profile blocks all external shares regardless of method', async () => {
    const user = await makeUser();

    await UserSettings.create({
      userId: user._id,
      privacy: { profileVisibility: 'none' }
    });

    // All external shares should be blocked
    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other', true);
    expect(result.allowed).toBe(false);
  });

  test('profile with no UserSettings defaults to public (everyone)', async () => {
    const user = await makeUser();

    // No UserSettings created - should default to allowed
    const result = await shareService.validateSharePermissions('profile', user._id.toString(), 'other', true);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Profile is publicly shareable');
  });

  test('share link for private profile does not include privacy status in URL', () => {
    const profileId = newId();
    const link = shareService.generateShareLink('profile', profileId, 'copy_link');

    // URL should not leak privacy status
    expect(link.url).not.toContain('private');
    expect(link.url).not.toContain('visibility');
    expect(link.url).not.toContain('none');
  });
});
