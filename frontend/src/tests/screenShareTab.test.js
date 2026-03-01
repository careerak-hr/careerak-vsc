/**
 * Screen Share Tab Tests
 * اختبارات مشاركة تبويب المتصفح
 * 
 * Requirements: 3.3 (مشاركة تبويب المتصفح)
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import ScreenShareService from '../services/screenShareService';

describe('Screen Share Tab Tests', () => {
  let screenShareService;
  let mockStream;
  let mockVideoTrack;

  beforeEach(() => {
    screenShareService = new ScreenShareService();

    // Mock video track
    mockVideoTrack = {
      kind: 'video',
      readyState: 'live',
      stop: vi.fn(),
      addEventListener: vi.fn(),
      getSettings: vi.fn(() => ({
        width: 1920,
        height: 1080,
        frameRate: 30,
        displaySurface: 'browser'
      }))
    };

    // Mock audio track
    const mockAudioTrack = {
      kind: 'audio',
      readyState: 'live',
      stop: vi.fn(),
      addEventListener: vi.fn()
    };

    // Mock stream
    mockStream = {
      getVideoTracks: vi.fn(() => [mockVideoTrack]),
      getAudioTracks: vi.fn(() => [mockAudioTrack]),
      getTracks: vi.fn(() => [mockVideoTrack, mockAudioTrack])
    };

    // Mock getDisplayMedia
    global.navigator.mediaDevices = {
      getDisplayMedia: vi.fn(() => Promise.resolve(mockStream))
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Tab Share Functionality', () => {
    test('should start tab share successfully', async () => {
      const stream = await screenShareService.startTabShare();

      expect(stream).toBe(mockStream);
      expect(screenShareService.isSharing()).toBe(true);
      expect(screenShareService.getShareType()).toBe('tab');
    });

    test('should request correct constraints for tab share', async () => {
      await screenShareService.startTabShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith({
        video: {
          displaySurface: 'browser',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true // Tab share includes audio
      });
    });

    test('should include audio for tab share', async () => {
      await screenShareService.startTabShare();

      const call = navigator.mediaDevices.getDisplayMedia.mock.calls[0][0];
      expect(call.audio).toBe(true);
    });

    test('should detect tab share type correctly', async () => {
      await screenShareService.startTabShare();

      const shareType = screenShareService.detectShareType(mockStream);
      expect(shareType).toBe('tab');
    });
  });

  describe('2. Tab Share Quality', () => {
    test('should get correct quality settings', async () => {
      await screenShareService.startTabShare();

      const quality = screenShareService.getQuality();
      expect(quality).toEqual({
        width: 1920,
        height: 1080,
        frameRate: 30,
        aspectRatio: 0
      });
    });

    test('should support HD quality (1080p)', async () => {
      await screenShareService.startTabShare();

      const quality = screenShareService.getQuality();
      expect(quality.height).toBeGreaterThanOrEqual(1080);
    });

    test('should support 30fps frame rate', async () => {
      await screenShareService.startTabShare();

      const quality = screenShareService.getQuality();
      expect(quality.frameRate).toBeGreaterThanOrEqual(30);
    });
  });

  describe('3. Tab Share Audio', () => {
    test('should capture tab audio', async () => {
      const stream = await screenShareService.startTabShare();

      const audioTracks = stream.getAudioTracks();
      expect(audioTracks.length).toBeGreaterThan(0);
    });

    test('should have audio track in live state', async () => {
      const stream = await screenShareService.startTabShare();

      const audioTrack = stream.getAudioTracks()[0];
      expect(audioTrack.readyState).toBe('live');
    });
  });

  describe('4. Tab Share Lifecycle', () => {
    test('should stop tab share correctly', async () => {
      await screenShareService.startTabShare();
      screenShareService.stopScreenShare();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(screenShareService.isSharing()).toBe(false);
      expect(screenShareService.getShareType()).toBeNull();
    });

    test('should handle stream ended event', async () => {
      await screenShareService.startTabShare();

      // Simulate stream ended
      const endedCallback = mockVideoTrack.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )[1];
      endedCallback();

      expect(screenShareService.isSharing()).toBe(false);
    });

    test('should dispatch custom event on stream end', async () => {
      const eventListener = vi.fn();
      window.addEventListener('screenshare-ended', eventListener);

      await screenShareService.startTabShare();

      // Simulate stream ended
      const endedCallback = mockVideoTrack.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )[1];
      endedCallback();

      expect(eventListener).toHaveBeenCalled();

      window.removeEventListener('screenshare-ended', eventListener);
    });
  });

  describe('5. Tab Share vs Other Types', () => {
    test('should differentiate tab from screen share', async () => {
      // Tab share
      await screenShareService.startTabShare();
      const tabType = screenShareService.getShareType();

      // Stop and start screen share
      screenShareService.stopScreenShare();
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'monitor'
      }));
      await screenShareService.startFullScreenShare();
      const screenType = screenShareService.getShareType();

      expect(tabType).toBe('tab');
      expect(screenType).toBe('screen');
      expect(tabType).not.toBe(screenType);
    });

    test('should differentiate tab from window share', async () => {
      // Tab share
      await screenShareService.startTabShare();
      const tabType = screenShareService.getShareType();

      // Stop and start window share
      screenShareService.stopScreenShare();
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'window'
      }));
      await screenShareService.startWindowShare();
      const windowType = screenShareService.getShareType();

      expect(tabType).toBe('tab');
      expect(windowType).toBe('window');
      expect(tabType).not.toBe(windowType);
    });
  });

  describe('6. Tab Share Switching', () => {
    test('should switch from screen to tab', async () => {
      // Start screen share
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'monitor'
      }));
      await screenShareService.startFullScreenShare();
      expect(screenShareService.getShareType()).toBe('screen');

      // Switch to tab
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'browser'
      }));
      await screenShareService.switchSource('tab');
      expect(screenShareService.getShareType()).toBe('tab');
    });

    test('should switch from window to tab', async () => {
      // Start window share
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'window'
      }));
      await screenShareService.startWindowShare();
      expect(screenShareService.getShareType()).toBe('window');

      // Switch to tab
      mockVideoTrack.getSettings = vi.fn(() => ({
        displaySurface: 'browser'
      }));
      await screenShareService.switchSource('tab');
      expect(screenShareService.getShareType()).toBe('tab');
    });

    test('should stop old stream when switching', async () => {
      await screenShareService.startFullScreenShare();
      const oldStopFn = mockVideoTrack.stop;

      await screenShareService.switchSource('tab');

      expect(oldStopFn).toHaveBeenCalled();
    });
  });

  describe('7. Error Handling', () => {
    test('should handle permission denied error', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      navigator.mediaDevices.getDisplayMedia = vi.fn(() => Promise.reject(error));

      await expect(screenShareService.startTabShare()).rejects.toThrow('تم رفض إذن مشاركة الشاشة');
    });

    test('should handle not supported error', async () => {
      const error = new Error('Not supported');
      error.name = 'NotSupportedError';
      navigator.mediaDevices.getDisplayMedia = vi.fn(() => Promise.reject(error));

      await expect(screenShareService.startTabShare()).rejects.toThrow('مشاركة الشاشة غير مدعومة في هذا المتصفح');
    });

    test('should handle abort error', async () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      navigator.mediaDevices.getDisplayMedia = vi.fn(() => Promise.reject(error));

      await expect(screenShareService.startTabShare()).rejects.toThrow('تم إلغاء مشاركة الشاشة');
    });
  });

  describe('8. Browser Support', () => {
    test('should detect browser support', () => {
      expect(ScreenShareService.isSupported()).toBe(true);
    });

    test('should return false when not supported', () => {
      const originalMediaDevices = navigator.mediaDevices;
      delete navigator.mediaDevices;

      expect(ScreenShareService.isSupported()).toBe(false);

      navigator.mediaDevices = originalMediaDevices;
    });
  });

  describe('9. Tab Share State Management', () => {
    test('should maintain correct state during tab share', async () => {
      expect(screenShareService.isSharing()).toBe(false);

      await screenShareService.startTabShare();
      expect(screenShareService.isSharing()).toBe(true);
      expect(screenShareService.getCurrentStream()).toBe(mockStream);

      screenShareService.stopScreenShare();
      expect(screenShareService.isSharing()).toBe(false);
      expect(screenShareService.getCurrentStream()).toBeNull();
    });

    test('should update share type correctly', async () => {
      expect(screenShareService.getShareType()).toBeNull();

      await screenShareService.startTabShare();
      expect(screenShareService.getShareType()).toBe('tab');

      screenShareService.stopScreenShare();
      expect(screenShareService.getShareType()).toBeNull();
    });
  });

  describe('10. Tab Share with Custom Options', () => {
    test('should accept custom width', async () => {
      await screenShareService.startScreenShare({
        displaySurface: 'browser',
        width: 1280
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: { ideal: 1280 }
          })
        })
      );
    });

    test('should accept custom height', async () => {
      await screenShareService.startScreenShare({
        displaySurface: 'browser',
        height: 720
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            height: { ideal: 720 }
          })
        })
      );
    });

    test('should accept custom frame rate', async () => {
      await screenShareService.startScreenShare({
        displaySurface: 'browser',
        frameRate: 60
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            frameRate: { ideal: 60 }
          })
        })
      );
    });
  });
});
