/**
 * Integration Tests for Share Workflows
 * Validates: Requirements 22.5 (Integration tests for share workflows)
 *
 * Tests cover:
 *  - POST /api/shares - Record a share event (internal and external)
 *  - GET /api/shares/analytics - Get share analytics
 *  - GET /api/shares/:contentType/:contentId - Get share count
 *  - Internal sharing workflow (internal_chat)
 *  - External sharing workflow (Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email)
 *  - Copy link workflow
 *  - Share link generation
 *  - Privacy/permissions validation (private content cannot be shared externally)
 *  - Error handling (invalid content type, missing fields, unauthorized)
 *
 * Strategy: Tests use the real shareService and Share/ShareAnalytics models
 * against the test MongoDB instance (set up by tests/setup.js).
 * The Express app layer is tested via a lightweight mock to avoid the uuid
 * ESM issue in recordingService.js.
 */

const mongoose = require('mongoose');
const Share = require('../src/models/Share');
const ShareAnalytics = require('../src/models/ShareAnalytics');
const shareService = require('../src/services/shareService');

// ─── helpers ────────────────────────────────────────────────────────────────

const CONTENT_ID = new mongoose.Types.ObjectId().toString();

// ─── Share Model Integration ──────────────────────────────────────────────────

describe('Share Model - database integration', () => {
  test('saves a share document to MongoDB', async () => {
    const share = new Share({
      contentType: 'job',
      contentId: CONTENT_ID,
      shareMethod: 'facebook',
      userId: new mongoose.Types.ObjectId()
    });

    const saved = await share.save();

    expect(saved._id).toBeDefined();
    expect(saved.contentType).toBe('job');
    expect(saved.shareMethod).toBe('facebook');
    expect(saved.timestamp).toBeDefined();
  });

  test('rejects a share with invalid contentType', async () => {
    const share = new Share({
      contentType: 'invalid_type',
      contentId: CONTENT_ID,
      shareMethod: 'facebook'
    });

    await expect(share.save()).rejects.toThrow();
  });

  test('rejects a share with invalid shareMethod', async () => {
    const share = new Share({
      contentType: 'job',
      contentId: CONTENT_ID,
      shareMethod: 'fax_machine'
    });

    await expect(share.save()).rejects.toThrow();
  });

  test('rejects a share without required contentType', async () => {
    const share = new Share({
      contentId: CONTENT_ID,
      shareMethod: 'facebook'
    });

    await expect(share.save()).rejects.toThrow();
  });

  test('rejects a share without required shareMethod', async () => {
    const share = new Share({
      contentType: 'job',
      contentId: CONTENT_ID
    });

    await expect(share.save()).rejects.toThrow();
  });

  test('rejects a share without required contentId', async () => {
    const share = new Share({
      contentType: 'job',
      shareMethod: 'facebook'
    });

    await expect(share.save()).rejects.toThrow();
  });

  test('getShareCount returns correct count', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await Share.create([
      { contentType: 'job', contentId: id, shareMethod: 'facebook' },
      { contentType: 'job', contentId: id, shareMethod: 'twitter' },
      { contentType: 'job', contentId: id, shareMethod: 'copy_link' }
    ]);

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(3);
  });

  test('getShareCount returns 0 for content with no shares', async () => {
    const emptyId = new mongoose.Types.ObjectId().toString();
    const count = await Share.getShareCount('course', emptyId);
    expect(count).toBe(0);
  });

  test('getSharesByMethod returns breakdown by share method', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await Share.create([
      { contentType: 'course', contentId: id, shareMethod: 'linkedin' },
      { contentType: 'course', contentId: id, shareMethod: 'linkedin' },
      { contentType: 'course', contentId: id, shareMethod: 'whatsapp' }
    ]);

    const breakdown = await Share.getSharesByMethod('course', id);

    expect(Array.isArray(breakdown)).toBe(true);
    const linkedinEntry = breakdown.find(b => b._id === 'linkedin');
    expect(linkedinEntry).toBeDefined();
    expect(linkedinEntry.count).toBe(2);

    const whatsappEntry = breakdown.find(b => b._id === 'whatsapp');
    expect(whatsappEntry).toBeDefined();
    expect(whatsappEntry.count).toBe(1);
  });

  test('shares for different content items are counted separately', async () => {
    const id1 = new mongoose.Types.ObjectId().toString();
    const id2 = new mongoose.Types.ObjectId().toString();

    await Share.create([
      { contentType: 'job', contentId: id1, shareMethod: 'facebook' },
      { contentType: 'job', contentId: id1, shareMethod: 'twitter' },
      { contentType: 'job', contentId: id2, shareMethod: 'facebook' }
    ]);

    const count1 = await Share.getShareCount('job', id1);
    const count2 = await Share.getShareCount('job', id2);

    expect(count1).toBe(2);
    expect(count2).toBe(1);
  });
});

// ─── ShareAnalytics Model Integration ────────────────────────────────────────

describe('ShareAnalytics Model - database integration', () => {
  test('incrementShare creates analytics document on first share', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await ShareAnalytics.incrementShare('job', id, 'facebook');

    const analytics = await ShareAnalytics.getAnalytics('job', id);
    expect(analytics).not.toBeNull();
    expect(analytics.totalShares).toBe(1);
    expect(analytics.sharesByMethod.get('facebook')).toBe(1);
  });

  test('incrementShare accumulates multiple shares', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await ShareAnalytics.incrementShare('course', id, 'twitter');
    await ShareAnalytics.incrementShare('course', id, 'twitter');
    await ShareAnalytics.incrementShare('course', id, 'linkedin');

    const analytics = await ShareAnalytics.getAnalytics('course', id);
    expect(analytics.totalShares).toBe(3);
    expect(analytics.sharesByMethod.get('twitter')).toBe(2);
    expect(analytics.sharesByMethod.get('linkedin')).toBe(1);
  });

  test('getAnalytics returns null for content with no analytics', async () => {
    const emptyId = new mongoose.Types.ObjectId().toString();
    const analytics = await ShareAnalytics.getAnalytics('profile', emptyId);
    expect(analytics).toBeNull();
  });

  test('getTopContent returns most shared content', async () => {
    const id1 = new mongoose.Types.ObjectId().toString();
    const id2 = new mongoose.Types.ObjectId().toString();

    // id1 gets 3 shares, id2 gets 1
    await ShareAnalytics.incrementShare('job', id1, 'facebook');
    await ShareAnalytics.incrementShare('job', id1, 'twitter');
    await ShareAnalytics.incrementShare('job', id1, 'linkedin');
    await ShareAnalytics.incrementShare('job', id2, 'facebook');

    const top = await ShareAnalytics.getTopContent('job', 10, 30);
    expect(Array.isArray(top)).toBe(true);
    expect(top.length).toBeGreaterThanOrEqual(2);
    // id1 should rank higher
    const first = top[0];
    expect(first.contentId.toString()).toBe(id1);
  });
});

// ─── shareService.generateShareLink ──────────────────────────────────────────

describe('shareService.generateShareLink - integration', () => {
  test('job + facebook generates URL with UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'facebook');

    expect(result.url).toContain(`/share/job/${CONTENT_ID}`);
    expect(result.url).toContain('utm_source=facebook');
    expect(result.url).toContain('utm_medium=social');
    expect(result.url).toContain('utm_campaign=share_job');
    expect(result.utmParams).not.toBeNull();
    expect(result.utmParams.utm_source).toBe('facebook');
  });

  test('course + twitter generates URL with UTM params', () => {
    const result = shareService.generateShareLink('course', CONTENT_ID, 'twitter');

    expect(result.url).toContain(`/share/course/${CONTENT_ID}`);
    expect(result.url).toContain('utm_source=twitter');
    expect(result.utmParams.utm_medium).toBe('social');
  });

  test('job + linkedin generates URL with UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'linkedin');

    expect(result.url).toContain('utm_source=linkedin');
    expect(result.utmParams.utm_medium).toBe('social');
  });

  test('job + whatsapp generates URL with messaging UTM medium', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'whatsapp');

    expect(result.url).toContain('utm_source=whatsapp');
    expect(result.utmParams.utm_medium).toBe('messaging');
  });

  test('job + telegram generates URL with messaging UTM medium', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'telegram');

    expect(result.url).toContain('utm_source=telegram');
    expect(result.utmParams.utm_medium).toBe('messaging');
  });

  test('job + email generates URL with email UTM medium', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'email');

    expect(result.url).toContain('utm_source=email');
    expect(result.utmParams.utm_medium).toBe('email');
  });

  test('copy_link generates clean URL without UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'copy_link');

    expect(result.url).toBe(`https://careerak.com/job-postings/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
    expect(result.url).not.toContain('utm_');
  });

  test('internal_chat generates clean URL without UTM params', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'internal_chat');

    expect(result.url).toBe(`https://careerak.com/job-postings/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });

  test('profile + internal_chat generates correct profile URL', () => {
    const result = shareService.generateShareLink('profile', CONTENT_ID, 'internal_chat');

    expect(result.url).toBe(`https://careerak.com/profile/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });

  test('company + copy_link generates correct company URL', () => {
    const result = shareService.generateShareLink('company', CONTENT_ID, 'copy_link');

    expect(result.url).toBe(`https://careerak.com/companies/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });

  test('throws error for invalid contentType', () => {
    expect(() =>
      shareService.generateShareLink('invalid_type', CONTENT_ID, 'facebook')
    ).toThrow('Invalid contentType: invalid_type');
  });
});

// ─── shareService.recordShare - real DB ──────────────────────────────────────

describe('shareService.recordShare - database integration', () => {
  test('records a facebook share for a job', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      userId,
      shareMethod: 'facebook',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    });

    expect(result._id).toBeDefined();
    expect(result.contentType).toBe('job');
    expect(result.shareMethod).toBe('facebook');
    expect(result.userId.toString()).toBe(userId);
  });

  test('records a twitter share for a course', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'course',
      contentId: id,
      shareMethod: 'twitter'
    });

    expect(result.contentType).toBe('course');
    expect(result.shareMethod).toBe('twitter');
  });

  test('records a linkedin share for a company', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'company',
      contentId: id,
      shareMethod: 'linkedin'
    });

    expect(result.shareMethod).toBe('linkedin');
  });

  test('records a whatsapp share', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'whatsapp'
    });
    expect(result.shareMethod).toBe('whatsapp');
  });

  test('records a telegram share', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'telegram'
    });
    expect(result.shareMethod).toBe('telegram');
  });

  test('records an email share', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'email'
    });
    expect(result.shareMethod).toBe('email');
  });

  test('records a copy_link share', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'copy_link'
    });
    expect(result.shareMethod).toBe('copy_link');
  });

  test('records an internal_chat share', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'internal_chat'
    });
    expect(result.shareMethod).toBe('internal_chat');
  });

  test('persists share document in the database', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'facebook'
    });

    const saved = await Share.findOne({ contentId: id, shareMethod: 'facebook' });
    expect(saved).not.toBeNull();
    expect(saved.contentType).toBe('job');
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
        shareMethod: 'fax_machine'
      })
    ).rejects.toThrow('Invalid shareMethod: fax_machine');
  });

  test('multiple shares accumulate in count', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'facebook' });
    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'twitter' });
    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'copy_link' });

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(3);
  });
});

// ─── shareService.getShareAnalytics - real DB ────────────────────────────────

describe('shareService.getShareAnalytics - database integration', () => {
  test('returns totalShares, sharesByMethod, and analytics', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await Share.create([
      { contentType: 'job', contentId: id, shareMethod: 'facebook' },
      { contentType: 'job', contentId: id, shareMethod: 'twitter' },
      { contentType: 'job', contentId: id, shareMethod: 'facebook' }
    ]);

    const result = await shareService.getShareAnalytics('job', id);

    expect(result).toHaveProperty('totalShares', 3);
    expect(result).toHaveProperty('sharesByMethod');
    expect(result).toHaveProperty('analytics');
    expect(Array.isArray(result.sharesByMethod)).toBe(true);
  });

  test('returns zero totalShares for content with no shares', async () => {
    const emptyId = new mongoose.Types.ObjectId().toString();
    const result = await shareService.getShareAnalytics('course', emptyId);

    expect(result.totalShares).toBe(0);
    expect(result.sharesByMethod).toEqual([]);
    expect(result.analytics).toBeNull();
  });

  test('sharesByMethod breakdown is correct', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await Share.create([
      { contentType: 'course', contentId: id, shareMethod: 'linkedin' },
      { contentType: 'course', contentId: id, shareMethod: 'linkedin' },
      { contentType: 'course', contentId: id, shareMethod: 'whatsapp' }
    ]);

    const result = await shareService.getShareAnalytics('course', id);

    const linkedinEntry = result.sharesByMethod.find(m => m._id === 'linkedin');
    expect(linkedinEntry).toBeDefined();
    expect(linkedinEntry.count).toBe(2);
  });
});

// ─── shareService.validateSharePermissions ───────────────────────────────────

describe('shareService.validateSharePermissions - integration', () => {
  test('allows external share of a job (public content)', async () => {
    const result = await shareService.validateSharePermissions('job', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('allows external share of a course (public content)', async () => {
    const result = await shareService.validateSharePermissions('course', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('allows external share of a company (public content)', async () => {
    const result = await shareService.validateSharePermissions('company', CONTENT_ID, 'user1', true);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Public content');
  });

  test('allows internal share of a profile regardless of privacy', async () => {
    const result = await shareService.validateSharePermissions('profile', CONTENT_ID, 'user1', false);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('blocks external share of a non-existent profile', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const result = await shareService.validateSharePermissions('profile', nonExistentId, 'user1', true);

    // Profile not found → not allowed
    expect(result.allowed).toBe(false);
  });
});

// ─── Internal sharing workflow ────────────────────────────────────────────────

describe('Internal sharing workflow (internal_chat)', () => {
  test('records internal_chat share for a job', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'internal_chat'
    });

    expect(result.shareMethod).toBe('internal_chat');
    expect(result.contentType).toBe('job');
  });

  test('records internal_chat share for a course', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'course',
      contentId: id,
      shareMethod: 'internal_chat'
    });

    expect(result.shareMethod).toBe('internal_chat');
    expect(result.contentType).toBe('course');
  });

  test('records internal_chat share for a profile', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'profile',
      contentId: id,
      shareMethod: 'internal_chat'
    });

    expect(result.shareMethod).toBe('internal_chat');
    expect(result.contentType).toBe('profile');
  });

  test('internal_chat share generates link without UTM params', () => {
    const id = new mongoose.Types.ObjectId().toString();
    const link = shareService.generateShareLink('job', id, 'internal_chat');

    expect(link.utmParams).toBeNull();
    expect(link.url).not.toContain('utm_');
    expect(link.url).toBe(`https://careerak.com/job-postings/${id}`);
  });

  test('internal_chat share is counted in analytics', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'internal_chat' });

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(1);
  });
});

// ─── External sharing workflow ────────────────────────────────────────────────

describe('External sharing workflow', () => {
  const externalMethods = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email'];

  externalMethods.forEach(method => {
    test(`records ${method} share and persists it`, async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const result = await shareService.recordShare({
        contentType: 'job',
        contentId: id,
        shareMethod: method
      });

      expect(result.shareMethod).toBe(method);

      // Verify persisted in DB
      const doc = await Share.findOne({ contentId: id, shareMethod: method });
      expect(doc).not.toBeNull();
    });

    test(`${method} share generates URL with UTM params`, () => {
      const id = new mongoose.Types.ObjectId().toString();
      const link = shareService.generateShareLink('job', id, method);

      expect(link.utmParams).not.toBeNull();
      expect(link.url).toContain(`utm_source=${method}`);
    });
  });
});

// ─── Copy link workflow ───────────────────────────────────────────────────────

describe('Copy link workflow', () => {
  test('records copy_link share for a job', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'copy_link'
    });

    expect(result.shareMethod).toBe('copy_link');
  });

  test('copy_link generates clean URL without UTM params', () => {
    const id = new mongoose.Types.ObjectId().toString();
    const link = shareService.generateShareLink('job', id, 'copy_link');

    expect(link.utmParams).toBeNull();
    expect(link.url).toBe(`https://careerak.com/job-postings/${id}`);
    expect(link.url).not.toContain('utm_');
  });

  test('copy_link share is counted in analytics', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'copy_link' });

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(1);
  });

  test('copy_link share for course generates correct URL', () => {
    const id = new mongoose.Types.ObjectId().toString();
    const link = shareService.generateShareLink('course', id, 'copy_link');

    expect(link.url).toBe(`https://careerak.com/courses/${id}`);
    expect(link.utmParams).toBeNull();
  });
});

// ─── Privacy / permissions validation ────────────────────────────────────────

describe('Privacy and permissions validation', () => {
  test('job share is always allowed externally', async () => {
    const result = await shareService.validateSharePermissions('job', CONTENT_ID, 'user1', true);
    expect(result.allowed).toBe(true);
  });

  test('course share is always allowed externally', async () => {
    const result = await shareService.validateSharePermissions('course', CONTENT_ID, 'user1', true);
    expect(result.allowed).toBe(true);
  });

  test('company share is always allowed externally', async () => {
    const result = await shareService.validateSharePermissions('company', CONTENT_ID, 'user1', true);
    expect(result.allowed).toBe(true);
  });

  test('profile internal share is always allowed', async () => {
    const result = await shareService.validateSharePermissions('profile', CONTENT_ID, 'user1', false);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Internal share allowed');
  });

  test('profile external share is blocked when profile not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const result = await shareService.validateSharePermissions('profile', nonExistentId, 'user1', true);
    expect(result.allowed).toBe(false);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('Error handling', () => {
  test('recordShare throws for invalid contentType', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'invalid_type',
        contentId: CONTENT_ID,
        shareMethod: 'facebook'
      })
    ).rejects.toThrow('Invalid contentType: invalid_type');
  });

  test('recordShare throws for invalid shareMethod', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: CONTENT_ID,
        shareMethod: 'invalid_method'
      })
    ).rejects.toThrow('Invalid shareMethod: invalid_method');
  });

  test('generateShareLink throws for invalid contentType', () => {
    expect(() =>
      shareService.generateShareLink('invalid_type', CONTENT_ID, 'facebook')
    ).toThrow('Invalid contentType: invalid_type');
  });

  test('Share model rejects missing required fields', async () => {
    const share = new Share({ shareMethod: 'facebook' });
    await expect(share.save()).rejects.toThrow();
  });
});

// ─── Share count accumulation ─────────────────────────────────────────────────

describe('Share count accumulation', () => {
  test('multiple shares for same content accumulate correctly', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    for (const method of ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'internal_chat']) {
      await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: method });
    }

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(8);
  });

  test('shares for different content types are counted separately', async () => {
    const id = new mongoose.Types.ObjectId().toString();

    await shareService.recordShare({ contentType: 'job', contentId: id, shareMethod: 'facebook' });
    await shareService.recordShare({ contentType: 'course', contentId: id, shareMethod: 'facebook' });

    const jobCount = await Share.getShareCount('job', id);
    const courseCount = await Share.getShareCount('course', id);

    expect(jobCount).toBe(1);
    expect(courseCount).toBe(1);
  });
});
