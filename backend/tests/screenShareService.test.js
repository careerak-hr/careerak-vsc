/**
 * Screen Share Service Tests
 * اختبارات خدمة مشاركة الشاشة
 */

const ScreenShareService = require('../src/services/screenShareService');

describe('ScreenShareService', () => {
  let screenShareService;
  const roomId = 'test-room-123';
  const userId = 'user-456';

  beforeEach(() => {
    screenShareService = new ScreenShareService();
  });

  afterEach(() => {
    // تنظيف جميع المشاركات النشطة
    screenShareService.cleanup();
  });

  describe('Constructor', () => {
    test('should initialize with default constraints', () => {
      expect(screenShareService.screenShareConstraints).toBeDefined();
      expect(screenShareService.screenShareConstraints.video.width.ideal).toBe(1920);
      expect(screenShareService.screenShareConstraints.video.height.ideal).toBe(1080);
    });

    test('should initialize with empty active shares map', () => {
      expect(screenShareService.activeScreenShares.size).toBe(0);
    });
  });

  describe('isScreenShareActive', () => {
    test('should return false when no screen share is active', () => {
      expect(screenShareService.isScreenShareActive(roomId)).toBe(false);
    });

    test('should return true when screen share is active', () => {
      // محاكاة مشاركة نشطة
      screenShareService.activeScreenShares.set(roomId, {
        userId,
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt: new Date()
      });

      expect(screenShareService.isScreenShareActive(roomId)).toBe(true);
    });
  });

  describe('getActiveScreenShare', () => {
    test('should return null when no screen share is active', () => {
      expect(screenShareService.getActiveScreenShare(roomId)).toBeNull();
    });

    test('should return screen share info when active', () => {
      const startedAt = new Date();
      screenShareService.activeScreenShares.set(roomId, {
        userId,
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt,
        settings: { width: 1920, height: 1080, frameRate: 30 }
      });

      const info = screenShareService.getActiveScreenShare(roomId);
      expect(info).toBeDefined();
      expect(info.userId).toBe(userId);
      expect(info.shareType).toBe('screen');
      expect(info.startedAt).toBe(startedAt);
      expect(info.settings.width).toBe(1920);
    });
  });

  describe('stopScreenShare', () => {
    test('should return false when no screen share is active', () => {
      const result = screenShareService.stopScreenShare(roomId, userId);
      expect(result).toBe(false);
    });

    test('should throw error when user is not the owner', () => {
      screenShareService.activeScreenShares.set(roomId, {
        userId: 'other-user',
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt: new Date()
      });

      expect(() => {
        screenShareService.stopScreenShare(roomId, userId);
      }).toThrow('Only the user who started screen share can stop it');
    });

    test('should stop screen share successfully', () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = { getTracks: () => [mockTrack] };

      screenShareService.activeScreenShares.set(roomId, {
        userId,
        stream: mockStream,
        shareType: 'screen',
        startedAt: new Date()
      });

      const result = screenShareService.stopScreenShare(roomId, userId);
      expect(result).toBe(true);
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(screenShareService.activeScreenShares.has(roomId)).toBe(false);
    });
  });

  describe('handleScreenShareEnded', () => {
    test('should remove screen share from active shares', () => {
      screenShareService.activeScreenShares.set(roomId, {
        userId,
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt: new Date()
      });

      screenShareService.handleScreenShareEnded(roomId, userId);
      expect(screenShareService.activeScreenShares.has(roomId)).toBe(false);
    });

    test('should not remove if user is not the owner', () => {
      screenShareService.activeScreenShares.set(roomId, {
        userId: 'other-user',
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt: new Date()
      });

      screenShareService.handleScreenShareEnded(roomId, userId);
      expect(screenShareService.activeScreenShares.has(roomId)).toBe(true);
    });
  });

  describe('buildConstraints', () => {
    test('should return default constraints', () => {
      const constraints = screenShareService.buildConstraints({});
      expect(constraints.video.width.ideal).toBe(1920);
      expect(constraints.video.height.ideal).toBe(1080);
      expect(constraints.audio).toBe(false);
    });

    test('should include audio when requested', () => {
      const constraints = screenShareService.buildConstraints({ includeAudio: true });
      expect(constraints.audio).toBe(true);
    });

    test('should prefer current tab when requested', () => {
      const constraints = screenShareService.buildConstraints({ preferCurrentTab: true });
      expect(constraints.video.displaySurface).toBe('browser');
    });

    test('should prefer window when requested', () => {
      const constraints = screenShareService.buildConstraints({ preferWindow: true });
      expect(constraints.video.displaySurface).toBe('window');
    });

    test('should use high quality settings', () => {
      const constraints = screenShareService.buildConstraints({ quality: 'high' });
      expect(constraints.video.width.ideal).toBe(1920);
      expect(constraints.video.height.ideal).toBe(1080);
      expect(constraints.video.frameRate.ideal).toBe(60);
    });

    test('should use medium quality settings', () => {
      const constraints = screenShareService.buildConstraints({ quality: 'medium' });
      expect(constraints.video.width.ideal).toBe(1280);
      expect(constraints.video.height.ideal).toBe(720);
      expect(constraints.video.frameRate.ideal).toBe(30);
    });

    test('should use low quality settings', () => {
      const constraints = screenShareService.buildConstraints({ quality: 'low' });
      expect(constraints.video.width.ideal).toBe(854);
      expect(constraints.video.height.ideal).toBe(480);
      expect(constraints.video.frameRate.ideal).toBe(15);
    });
  });

  describe('getShareType', () => {
    test('should return "screen" for monitor', () => {
      const type = screenShareService.getShareType({ displaySurface: 'monitor' });
      expect(type).toBe('screen');
    });

    test('should return "window" for window', () => {
      const type = screenShareService.getShareType({ displaySurface: 'window' });
      expect(type).toBe('window');
    });

    test('should return "tab" for browser', () => {
      const type = screenShareService.getShareType({ displaySurface: 'browser' });
      expect(type).toBe('tab');
    });

    test('should return "unknown" for unknown surface', () => {
      const type = screenShareService.getShareType({ displaySurface: 'unknown' });
      expect(type).toBe('unknown');
    });
  });

  describe('getScreenShareStats', () => {
    test('should return null when no screen share is active', () => {
      expect(screenShareService.getScreenShareStats(roomId)).toBeNull();
    });

    test('should return stats when screen share is active', () => {
      const startedAt = new Date();
      screenShareService.activeScreenShares.set(roomId, {
        userId,
        stream: { getTracks: () => [] },
        shareType: 'screen',
        startedAt,
        settings: { width: 1920, height: 1080, frameRate: 30 }
      });

      const stats = screenShareService.getScreenShareStats(roomId);
      expect(stats).toBeDefined();
      expect(stats.userId).toBe(userId);
      expect(stats.shareType).toBe('screen');
      expect(stats.quality.width).toBe(1920);
      expect(stats.quality.height).toBe(1080);
      expect(stats.quality.resolution).toBe('1920x1080');
    });
  });

  describe('cleanup', () => {
    test('should stop all active screen shares', () => {
      const mockTrack1 = { stop: jest.fn() };
      const mockTrack2 = { stop: jest.fn() };
      const mockStream1 = { getTracks: () => [mockTrack1] };
      const mockStream2 = { getTracks: () => [mockTrack2] };

      screenShareService.activeScreenShares.set('room1', {
        userId: 'user1',
        stream: mockStream1,
        shareType: 'screen',
        startedAt: new Date()
      });

      screenShareService.activeScreenShares.set('room2', {
        userId: 'user2',
        stream: mockStream2,
        shareType: 'window',
        startedAt: new Date()
      });

      screenShareService.cleanup();

      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
      expect(screenShareService.activeScreenShares.size).toBe(0);
    });
  });
});
