/**
 * Screen Share 1080p Quality Tests
 * اختبارات جودة مشاركة الشاشة 1080p
 * 
 * Requirements: 3.4 - جودة عالية للمشاركة (1080p)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ScreenShareService from '../services/screenShareService';

describe('Screen Share 1080p Quality', () => {
  let screenShareService;
  let mockStream;
  let mockVideoTrack;

  beforeEach(() => {
    screenShareService = new ScreenShareService();

    // Mock video track with 1080p settings
    mockVideoTrack = {
      kind: 'video',
      readyState: 'live',
      enabled: true,
      getSettings: vi.fn(() => ({
        width: 1920,
        height: 1080,
        frameRate: 30,
        aspectRatio: 16/9,
        displaySurface: 'monitor'
      })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      stop: vi.fn()
    };

    // Mock media stream
    mockStream = {
      id: 'mock-stream-id',
      active: true,
      getVideoTracks: vi.fn(() => [mockVideoTrack]),
      getAudioTracks: vi.fn(() => []),
      getTracks: vi.fn(() => [mockVideoTrack]),
      addTrack: vi.fn(),
      removeTrack: vi.fn()
    };

    // Mock navigator.mediaDevices.getDisplayMedia
    global.navigator = {
      mediaDevices: {
        getDisplayMedia: vi.fn(() => Promise.resolve(mockStream))
      }
    };
  });

  afterEach(() => {
    if (screenShareService.isSharing()) {
      screenShareService.stopScreenShare();
    }
    vi.clearAllMocks();
  });

  describe('Full Screen Share Quality', () => {
    it('should request 1080p quality for full screen share', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ ideal: 1920 }),
            height: expect.objectContaining({ ideal: 1080 })
          })
        })
      );
    });

    it('should achieve 1080p quality', async () => {
      await screenShareService.startFullScreenShare();
      const quality = screenShareService.getQuality();

      expect(quality).toBeDefined();
      expect(quality.width).toBe(1920);
      expect(quality.height).toBe(1080);
      expect(quality.isFullHD).toBe(true);
    });

    it('should support up to 4K resolution', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ max: 3840 }),
            height: expect.objectContaining({ max: 2160 })
          })
        })
      );
    });

    it('should have minimum 720p quality', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ min: 1280 }),
            height: expect.objectContaining({ min: 720 })
          })
        })
      );
    });
  });

  describe('Window Share Quality', () => {
    it('should request 1080p quality for window share', async () => {
      await screenShareService.startWindowShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ ideal: 1920 }),
            height: expect.objectContaining({ ideal: 1080 })
          })
        })
      );
    });

    it('should achieve 1080p quality for window', async () => {
      await screenShareService.startWindowShare();
      const quality = screenShareService.getQuality();

      expect(quality.width).toBe(1920);
      expect(quality.height).toBe(1080);
      expect(quality.isFullHD).toBe(true);
    });
  });

  describe('Tab Share Quality', () => {
    it('should request 1080p quality for tab share', async () => {
      await screenShareService.startTabShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ ideal: 1920 }),
            height: expect.objectContaining({ ideal: 1080 })
          })
        })
      );
    });

    it('should achieve 1080p quality for tab', async () => {
      await screenShareService.startTabShare();
      const quality = screenShareService.getQuality();

      expect(quality.width).toBe(1920);
      expect(quality.height).toBe(1080);
      expect(quality.isFullHD).toBe(true);
    });
  });

  describe('Frame Rate', () => {
    it('should request 30fps frame rate', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            frameRate: expect.objectContaining({ ideal: 30 })
          })
        })
      );
    });

    it('should support up to 60fps', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            frameRate: expect.objectContaining({ max: 60 })
          })
        })
      );
    });

    it('should have minimum 24fps', async () => {
      await screenShareService.startFullScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            frameRate: expect.objectContaining({ min: 24 })
          })
        })
      );
    });
  });

  describe('Quality Detection', () => {
    it('should detect Full HD quality', async () => {
      await screenShareService.startFullScreenShare();
      const quality = screenShareService.getQuality();

      expect(quality.isFullHD).toBe(true);
      expect(quality.isHD).toBe(true);
    });

    it('should detect HD quality (720p)', async () => {
      // Mock 720p quality
      mockVideoTrack.getSettings = vi.fn(() => ({
        width: 1280,
        height: 720,
        frameRate: 30
      }));

      await screenShareService.startFullScreenShare();
      const quality = screenShareService.getQuality();

      expect(quality.isHD).toBe(true);
      expect(quality.isFullHD).toBe(false);
    });

    it('should detect 4K quality', async () => {
      // Mock 4K quality
      mockVideoTrack.getSettings = vi.fn(() => ({
        width: 3840,
        height: 2160,
        frameRate: 30
      }));

      await screenShareService.startFullScreenShare();
      const quality = screenShareService.getQuality();

      expect(quality.is4K).toBe(true);
      expect(quality.isFullHD).toBe(true);
      expect(quality.isHD).toBe(true);
    });
  });

  describe('Custom Quality Options', () => {
    it('should accept custom width and height', async () => {
      await screenShareService.startScreenShare({
        width: 2560,
        height: 1440
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ ideal: 2560 }),
            height: expect.objectContaining({ ideal: 1440 })
          })
        })
      );
    });

    it('should accept custom frame rate', async () => {
      await screenShareService.startScreenShare({
        frameRate: 60
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            frameRate: expect.objectContaining({ ideal: 60 })
          })
        })
      );
    });

    it('should use default 1080p when no options provided', async () => {
      await screenShareService.startScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: expect.objectContaining({ ideal: 1920 }),
            height: expect.objectContaining({ ideal: 1080 })
          })
        })
      );
    });
  });

  describe('Quality Logging', () => {
    it('should log quality information', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      await screenShareService.startFullScreenShare();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Share Quality'),
        expect.any(Object)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Full HD (1080p) quality achieved')
      );
    });

    it('should warn if quality is below HD', async () => {
      // Mock low quality
      mockVideoTrack.getSettings = vi.fn(() => ({
        width: 640,
        height: 480,
        frameRate: 30
      }));

      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      await screenShareService.startFullScreenShare();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Quality is below HD'),
        480
      );
    });
  });

  describe('Aspect Ratio', () => {
    it('should maintain 16:9 aspect ratio for 1080p', async () => {
      await screenShareService.startFullScreenShare();
      const quality = screenShareService.getQuality();

      const aspectRatio = quality.width / quality.height;
      expect(aspectRatio).toBeCloseTo(16/9, 2);
    });
  });
});
