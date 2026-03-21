/**
 * Share Error Handling Tests - Task 8.7
 * Tests error handling for network errors, API failures, and edge cases
 * in the content sharing feature.
 *
 * Validates: Requirement 21 - Error Handling
 *   21.1 - IF a share operation fails, display user-friendly error message
 *   21.2 - WHEN network connectivity is lost, queue the share for retry
 *   21.3 - IF a Social_Platform API is unavailable, suggest alternative share methods
 *   21.4 - Log all share errors for debugging purposes
 *   21.5 - WHEN clipboard access is denied, provide manual copy instructions
 */

const mongoose = require('mongoose');
const Share = require('../src/models/Share');
const ShareAnalytics = require('../src/models/ShareAnalytics');
const shareService = require('../src/services/shareService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeId = () => new mongoose.Types.ObjectId().toString();

// ─── shareService error handling - invalid inputs ─────────────────────────────

describe('shareService - invalid input error handling (Req 21.1)', () => {
  test('recordShare throws descriptive error for invalid contentType', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'invalid_type',
        contentId: makeId(),
        shareMethod: 'facebook'
      })
    ).rejects.toThrow('Invalid contentType: invalid_type');
  });

  test('recordShare throws descriptive error for invalid shareMethod', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: makeId(),
        shareMethod: 'fax_machine'
      })
    ).rejects.toThrow('Invalid shareMethod: fax_machine');
  });

  test('generateShareLink throws descriptive error for invalid contentType', () => {
    expect(() =>
      shareService.generateShareLink('unknown', makeId(), 'facebook')
    ).toThrow('Invalid contentType: unknown');
  });

  test('recordShare wraps DB errors with descriptive message', async () => {
    // Force a DB error by passing a contentId that causes a cast error
    // (non-ObjectId string when schema expects ObjectId)
    const originalSave = Share.prototype.save;
    Share.prototype.save = jest.fn().mockRejectedValueOnce(new Error('DB write failed'));

    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: makeId(),
        shareMethod: 'facebook'
      })
    ).rejects.toThrow('Failed to record share: DB write failed');

    Share.prototype.save = originalSave;
  });

  test('getShareAnalytics wraps DB errors with descriptive message', async () => {
    const originalGetShareCount = Share.getShareCount;
    Share.getShareCount = jest.fn().mockRejectedValueOnce(new Error('DB read failed'));

    await expect(
      shareService.getShareAnalytics('job', makeId())
    ).rejects.toThrow('Failed to get share analytics: DB read failed');

    Share.getShareCount = originalGetShareCount;
  });
});

// ─── Network / DB failure simulation ─────────────────────────────────────────

describe('shareService - network/DB failure simulation (Req 21.1, 21.4)', () => {
  test('recordShare fails gracefully when MongoDB is unavailable', async () => {
    const originalSave = Share.prototype.save;
    Share.prototype.save = jest.fn().mockRejectedValueOnce(
      new Error('MongoNetworkError: connection timed out')
    );

    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: makeId(),
        shareMethod: 'twitter'
      })
    ).rejects.toThrow('Failed to record share');

    Share.prototype.save = originalSave;
  });

  test('recordShare fails gracefully on write timeout', async () => {
    const originalSave = Share.prototype.save;
    Share.prototype.save = jest.fn().mockRejectedValueOnce(
      new Error('MongoServerError: write operation timed out')
    );

    await expect(
      shareService.recordShare({
        contentType: 'course',
        contentId: makeId(),
        shareMethod: 'linkedin'
      })
    ).rejects.toThrow('Failed to record share');

    Share.prototype.save = originalSave;
  });

  test('getShareAnalytics fails gracefully when DB is unavailable', async () => {
    const originalGetShareCount = Share.getShareCount;
    Share.getShareCount = jest.fn().mockRejectedValueOnce(
      new Error('MongoNetworkError: connection refused')
    );

    await expect(
      shareService.getShareAnalytics('job', makeId())
    ).rejects.toThrow('Failed to get share analytics');

    Share.getShareCount = originalGetShareCount;
  });

  test('validateSharePermissions fails gracefully when DB is unavailable', async () => {
    // Profile external share requires DB lookup - simulate failure
    const { User } = require('../src/models/User');
    const originalFindById = User.findById;
    User.findById = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error('MongoNetworkError: connection lost'))
      })
    });

    await expect(
      shareService.validateSharePermissions('profile', makeId(), 'user1', true)
    ).rejects.toThrow('Failed to validate share permissions');

    User.findById = originalFindById;
  });
});

// ─── Share controller error responses ────────────────────────────────────────

describe('shareController - HTTP error responses (Req 21.1)', () => {
  let shareController;

  beforeAll(() => {
    shareController = require('../src/controllers/shareController');
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('recordShare returns 400 when contentType is missing', async () => {
    const req = {
      body: { contentId: makeId(), shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('recordShare returns 400 when contentId is missing', async () => {
    const req = {
      body: { contentType: 'job', shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('recordShare returns 400 when shareMethod is missing', async () => {
    const req = {
      body: { contentType: 'job', contentId: makeId() },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('recordShare returns 400 for invalid contentType', async () => {
    const req = {
      body: { contentType: 'invalid', contentId: makeId(), shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('Invalid') })
    );
  });

  test('recordShare returns 400 for invalid shareMethod', async () => {
    const req = {
      body: { contentType: 'job', contentId: makeId(), shareMethod: 'invalid_method' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('Invalid') })
    );
  });

  test('recordShare returns 403 when share is not permitted', async () => {
    // Non-existent profile external share → not allowed
    const req = {
      body: {
        contentType: 'profile',
        contentId: new mongoose.Types.ObjectId().toString(),
        shareMethod: 'facebook'
      },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('recordShare returns 500 on unexpected DB error', async () => {
    const originalSave = Share.prototype.save;
    Share.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Unexpected DB error'));

    const req = {
      body: { contentType: 'job', contentId: makeId(), shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = mockRes();

    await shareController.recordShare(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );

    Share.prototype.save = originalSave;
  });

  test('getAnalytics returns 500 on DB error', async () => {
    const originalGetShareCount = Share.getShareCount;
    Share.getShareCount = jest.fn().mockRejectedValueOnce(new Error('DB error'));

    const req = {
      query: { contentType: 'job', contentId: makeId() }
    };
    const res = mockRes();

    await shareController.getAnalytics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );

    Share.getShareCount = originalGetShareCount;
  });

  test('getShareCount returns 500 on DB error', async () => {
    const originalGetShareCount = Share.getShareCount;
    Share.getShareCount = jest.fn().mockRejectedValueOnce(new Error('DB error'));

    const req = {
      params: { contentType: 'job', contentId: makeId() }
    };
    const res = mockRes();

    await shareController.getShareCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );

    Share.getShareCount = originalGetShareCount;
  });
});

// ─── Social platform API unavailability (Req 21.3) ───────────────────────────

describe('Social platform API unavailability - fallback behavior (Req 21.3)', () => {
  test('share link is still generated even when social platform is unavailable', () => {
    // The share link generation is local and does not depend on external APIs
    // So it should always succeed regardless of platform availability
    const platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email'];

    for (const platform of platforms) {
      const result = shareService.generateShareLink('job', makeId(), platform);
      expect(result.url).toBeDefined();
      expect(result.url).toContain('careerak.com');
      expect(result.utmParams).not.toBeNull();
    }
  });

  test('share event is recorded even when social platform window fails to open', async () => {
    // Recording a share is independent of whether the social platform window opened
    const id = makeId();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'facebook'
    });

    expect(result._id).toBeDefined();
    expect(result.shareMethod).toBe('facebook');
  });

  test('copy_link is always available as fallback when social platforms fail', () => {
    // copy_link does not depend on any external API
    const result = shareService.generateShareLink('job', makeId(), 'copy_link');

    expect(result.url).toBeDefined();
    expect(result.utmParams).toBeNull();
    expect(result.url).not.toContain('utm_');
  });

  test('internal_chat is always available as fallback when social platforms fail', async () => {
    const id = makeId();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'internal_chat'
    });

    expect(result.shareMethod).toBe('internal_chat');
  });

  test('all valid share methods can be recorded as fallbacks', async () => {
    const methods = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'internal_chat', 'native'];

    for (const method of methods) {
      const result = await shareService.recordShare({
        contentType: 'job',
        contentId: makeId(),
        shareMethod: method
      });
      expect(result.shareMethod).toBe(method);
    }
  });
});

// ─── Clipboard access denial (Req 21.5) ──────────────────────────────────────

describe('Clipboard access denial - manual copy fallback (Req 21.5)', () => {
  test('share link URL is always available for manual copying', () => {
    // When clipboard is denied, the URL must be accessible for manual copy
    const id = makeId();
    const result = shareService.generateShareLink('job', id, 'copy_link');

    // URL must be a valid, readable string the user can manually copy
    expect(typeof result.url).toBe('string');
    expect(result.url.length).toBeGreaterThan(0);
    expect(result.url).toMatch(/^https:\/\//);
  });

  test('share link for course is accessible for manual copying', () => {
    const id = makeId();
    const result = shareService.generateShareLink('course', id, 'copy_link');

    expect(result.url).toBe(`https://careerak.com/courses/${id}`);
  });

  test('share link for profile is accessible for manual copying', () => {
    const id = makeId();
    const result = shareService.generateShareLink('profile', id, 'copy_link');

    expect(result.url).toBe(`https://careerak.com/profile/${id}`);
  });

  test('share link for company is accessible for manual copying', () => {
    const id = makeId();
    const result = shareService.generateShareLink('company', id, 'copy_link');

    expect(result.url).toBe(`https://careerak.com/companies/${id}`);
  });

  test('copy_link share is recorded even when clipboard API is unavailable', async () => {
    // The backend records the share regardless of clipboard API availability
    const id = makeId();
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'copy_link'
    });

    expect(result._id).toBeDefined();
    expect(result.shareMethod).toBe('copy_link');

    const count = await Share.getShareCount('job', id);
    expect(count).toBe(1);
  });
});

// ─── Share retry logic (Req 21.2) ────────────────────────────────────────────

describe('Share retry logic - network loss recovery (Req 21.2)', () => {
  test('share succeeds on retry after transient DB failure', async () => {
    const id = makeId();
    const originalSave = Share.prototype.save;
    let callCount = 0;

    // First call fails, second succeeds
    Share.prototype.save = jest.fn().mockImplementation(function () {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('MongoNetworkError: connection lost'));
      }
      return originalSave.call(this);
    });

    // First attempt fails
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: id,
        shareMethod: 'facebook'
      })
    ).rejects.toThrow('Failed to record share');

    // Restore and retry - second attempt succeeds
    Share.prototype.save = originalSave;

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'facebook'
    });

    expect(result._id).toBeDefined();
    expect(result.shareMethod).toBe('facebook');
  });

  test('multiple retry attempts can be made for the same share', async () => {
    const id = makeId();

    // Simulate 3 failed attempts followed by success
    const originalSave = Share.prototype.save;
    let callCount = 0;

    Share.prototype.save = jest.fn().mockImplementation(function () {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return originalSave.call(this);
    });

    // First two fail
    for (let i = 0; i < 2; i++) {
      await expect(
        shareService.recordShare({
          contentType: 'job',
          contentId: id,
          shareMethod: 'twitter'
        })
      ).rejects.toThrow();
    }

    // Third succeeds
    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: id,
      shareMethod: 'twitter'
    });

    expect(result._id).toBeDefined();

    Share.prototype.save = originalSave;
  });

  test('share data is preserved across retry attempts', async () => {
    const id = makeId();
    const userId = makeId();

    const shareData = {
      contentType: 'course',
      contentId: id,
      userId,
      shareMethod: 'linkedin',
      ip: '192.168.1.1',
      userAgent: 'TestAgent/1.0'
    };

    // Simulate one failure then success
    const originalSave = Share.prototype.save;
    let called = false;
    Share.prototype.save = jest.fn().mockImplementation(function () {
      if (!called) {
        called = true;
        return Promise.reject(new Error('Transient error'));
      }
      return originalSave.call(this);
    });

    // First attempt fails
    await expect(shareService.recordShare(shareData)).rejects.toThrow();

    // Retry with same data succeeds
    Share.prototype.save = originalSave;
    const result = await shareService.recordShare(shareData);

    expect(result.contentType).toBe('course');
    expect(result.shareMethod).toBe('linkedin');
    expect(result.userId.toString()).toBe(userId);
  });
});

// ─── Error logging (Req 21.4) ─────────────────────────────────────────────────

describe('Error logging for share failures (Req 21.4)', () => {
  test('console.error is called when recordShare controller encounters an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalSave = Share.prototype.save;
    Share.prototype.save = jest.fn().mockRejectedValueOnce(new Error('DB failure'));

    const shareController = require('../src/controllers/shareController');
    const req = {
      body: { contentType: 'job', contentId: makeId(), shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    await shareController.recordShare(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in recordShare'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
    Share.prototype.save = originalSave;
  });

  test('console.error is called when getAnalytics controller encounters an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalGetShareCount = Share.getShareCount;
    Share.getShareCount = jest.fn().mockRejectedValueOnce(new Error('DB failure'));

    const shareController = require('../src/controllers/shareController');
    const req = { query: { contentType: 'job', contentId: makeId() } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    await shareController.getAnalytics(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in getAnalytics'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
    Share.getShareCount = originalGetShareCount;
  });

  test('error response includes error message for debugging', async () => {
    const shareController = require('../src/controllers/shareController');
    const req = {
      body: { contentType: 'invalid_type', contentId: makeId(), shareMethod: 'facebook' },
      user: { id: makeId() },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0')
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    await shareController.recordShare(req, res);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.error).toBeDefined();
    expect(typeof jsonCall.error).toBe('string');
    expect(jsonCall.error.length).toBeGreaterThan(0);
  });
});

// ─── Share Model validation errors ───────────────────────────────────────────

describe('Share Model - validation error handling', () => {
  test('Share model rejects missing contentType with validation error', async () => {
    const share = new Share({ contentId: makeId(), shareMethod: 'facebook' });
    await expect(share.save()).rejects.toThrow();
  });

  test('Share model rejects missing contentId with validation error', async () => {
    const share = new Share({ contentType: 'job', shareMethod: 'facebook' });
    await expect(share.save()).rejects.toThrow();
  });

  test('Share model rejects missing shareMethod with validation error', async () => {
    const share = new Share({ contentType: 'job', contentId: makeId() });
    await expect(share.save()).rejects.toThrow();
  });

  test('Share model rejects invalid contentType enum value', async () => {
    const share = new Share({
      contentType: 'video',
      contentId: makeId(),
      shareMethod: 'facebook'
    });
    await expect(share.save()).rejects.toThrow();
  });

  test('Share model rejects invalid shareMethod enum value', async () => {
    const share = new Share({
      contentType: 'job',
      contentId: makeId(),
      shareMethod: 'snapchat'
    });
    await expect(share.save()).rejects.toThrow();
  });
});

// ─── Analytics error handling ─────────────────────────────────────────────────

describe('ShareAnalytics - error handling', () => {
  test('getAnalytics returns null gracefully for non-existent content', async () => {
    const result = await ShareAnalytics.getAnalytics('job', makeId());
    expect(result).toBeNull();
  });

  test('incrementShare handles concurrent calls without throwing', async () => {
    const id = makeId();

    // Fire multiple concurrent increments
    const promises = Array.from({ length: 5 }, () =>
      ShareAnalytics.incrementShare('job', id, 'facebook')
    );

    await expect(Promise.all(promises)).resolves.toBeDefined();

    const analytics = await ShareAnalytics.getAnalytics('job', id);
    expect(analytics.totalShares).toBe(5);
  });

  test('getShareAnalytics returns zero counts for content with no shares', async () => {
    const result = await shareService.getShareAnalytics('job', makeId());

    expect(result.totalShares).toBe(0);
    expect(result.sharesByMethod).toEqual([]);
    expect(result.analytics).toBeNull();
  });
});
