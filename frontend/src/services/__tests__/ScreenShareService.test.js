/**
 * ScreenShareService Tests
 * اختبارات خدمة مشاركة الشاشة
 * 
 * Tests:
 * - Start screen sharing
 * - Stop screen sharing
 * - Switch source
 * - Replace track in peer connection
 * - Get screen share settings
 * - Check if supported
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ScreenShareService from '../ScreenShareService';

describe('ScreenShareService', () => {
  let service;
  let mockStream;
  let mockVideoTrack;
  let mockPeerConnection;

  beforeEach(() => {
    service = new ScreenShareService();

    // Mock video track
    mockVideoTrack = {
      kind: 'video',
      stop: vi.fn(),
      onended: null,
      getSettings: vi.fn(() => ({
        width: 1920,
        height: 1080,
        frameRate: 30,
        displaySurface: 'monitor',
        cursor: 'always'
      }))
    };

    // Mock stream
    mockStream = {
      getVideoTracks: vi.fn(() => [mockVideoTrack]),
      getTracks: vi.fn(() => [mockVideoTrack])
    };

    // Mock peer connection
    mockPeerConnection = {
      getSenders: vi.fn(() => [
        {
          track: { kind: 'video' },
          replaceTrack: vi.fn()
        }
      ]),
      addTrack: vi.fn()
    };

    // Mock navigator.mediaDevices.getDisplayMedia
    global.navigator.mediaDevices = {
      getDisplayMedia: vi.fn(() => Promise.resolve(mockStream)),
      getSupportedConstraints: vi.fn(() => ({
        width: true,
        height: true,
        frameRate: true,
        cursor: true,
        displaySurface: true
      }))
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('startScreenShare', () => {
    it('should start screen sharing successfully', async () => {
      const stream = await service.startScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
      expect(service.isScreenSharing()).toBe(true);
      expect(service.getScreenStream()).toBe(mockStream);
      expect(stream).toBe(mockStream);
    });

    it('should start with preferred source (screen)', async () => {
      await service.startScreenShare({ preferredSource: 'screen' });

      const callArgs = navigator.mediaDevices.getDisplayMedia.mock.calls[0][0];
      expect(callArgs.video.displaySurface).toBe('monitor');
    });

    it('should start with preferred source (window)', async () => {
      await service.startScreenShare({ preferredSource: 'window' });

      const callArgs = navigator.mediaDevices.getDisplayMedia.mock.calls[0][0];
      expect(callArgs.video.displaySurface).toBe('window');
    });

    it('should start with preferred source (tab)', async () => {
      await service.startScreenShare({ preferredSource: 'tab' });

      const callArgs = navigator.mediaDevices.getDisplayMedia.mock.calls[0][0];
      expect(callArgs.video.displaySurface).toBe('browser');
    });

    it('should include audio if requested', async () => {
      await service.startScreenShare({ audio: true });

      const callArgs = navigator.mediaDevices.getDisplayMedia.mock.calls[0][0];
      expect(callArgs.audio).toBe(true);
    });

    it('should return existing stream if already sharing', async () => {
      await service.startScreenShare();
      const stream2 = await service.startScreenShare();

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledTimes(1);
      expect(stream2).toBe(mockStream);
    });

    it('should handle permission denied error', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      navigator.mediaDevices.getDisplayMedia.mockRejectedValue(error);

      await expect(service.startScreenShare()).rejects.toThrow('Screen sharing permission denied by user');
    });

    it('should handle not found error', async () => {
      const error = new Error('Not found');
      error.name = 'NotFoundError';
      navigator.mediaDevices.getDisplayMedia.mockRejectedValue(error);

      await expect(service.startScreenShare()).rejects.toThrow('No screen sharing source available');
    });

    it('should handle not supported error', async () => {
      const error = new Error('Not supported');
      error.name = 'NotSupportedError';
      navigator.mediaDevices.getDisplayMedia.mockRejectedValue(error);

      await expect(service.startScreenShare()).rejects.toThrow('Screen sharing not supported in this browser');
    });

    it('should handle abort error', async () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      navigator.mediaDevices.getDisplayMedia.mockRejectedValue(error);

      await expect(service.startScreenShare()).rejects.toThrow('Screen sharing cancelled by user');
    });

    it('should set up track ended handler', async () => {
      await service.startScreenShare();

      expect(mockVideoTrack.onended).toBeDefined();
      expect(typeof mockVideoTrack.onended).toBe('function');
    });

    it('should stop sharing when track ends', async () => {
      await service.startScreenShare();
      
      // Simulate track ended
      mockVideoTrack.onended();

      expect(service.isScreenSharing()).toBe(false);
      expect(service.getScreenStream()).toBeNull();
    });

    it('should log HD quality achievement', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await service.startScreenShare();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Full HD (1080p) screen sharing achieved')
      );

      consoleSpy.mockRestore();
    });

    it('should warn about lower quality', async () => {
      mockVideoTrack.getSettings.mockReturnValue({
        width: 1280,
        height: 720,
        frameRate: 30,
        displaySurface: 'monitor'
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await service.startScreenShare();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HD (720p) screen sharing - lower than target 1080p')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('stopScreenShare', () => {
    it('should stop screen sharing', async () => {
      await service.startScreenShare();
      service.stopScreenShare();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(service.isScreenSharing()).toBe(false);
      expect(service.getScreenStream()).toBeNull();
      expect(service.getCurrentSource()).toBeNull();
    });

    it('should handle stopping when not sharing', () => {
      expect(() => service.stopScreenShare()).not.toThrow();
    });
  });

  describe('switchSource', () => {
    it('should switch screen share source', async () => {
      await service.startScreenShare({ preferredSource: 'screen' });
      
      const newStream = await service.switchSource({ preferredSource: 'window' });

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledTimes(2);
      expect(newStream).toBe(mockStream);
    });

    it('should handle errors during switch', async () => {
      await service.startScreenShare();
      
      const error = new Error('Switch failed');
      navigator.mediaDevices.getDisplayMedia.mockRejectedValue(error);

      await expect(service.switchSource()).rejects.toThrow();
    });
  });

  describe('replaceTrackInPeerConnection', () => {
    it('should replace track in peer connection', async () => {
      await service.startScreenShare();
      
      const newTrack = mockVideoTrack;
      await service.replaceTrackInPeerConnection(mockPeerConnection, newTrack);

      const sender = mockPeerConnection.getSenders()[0];
      expect(sender.replaceTrack).toHaveBeenCalledWith(newTrack);
    });

    it('should throw error if no peer connection', async () => {
      await service.startScreenShare();
      
      await expect(
        service.replaceTrackInPeerConnection(null, mockVideoTrack)
      ).rejects.toThrow('No peer connection provided');
    });

    it('should throw error if no video sender found', async () => {
      await service.startScreenShare();
      
      mockPeerConnection.getSenders.mockReturnValue([]);

      await expect(
        service.replaceTrackInPeerConnection(mockPeerConnection, mockVideoTrack)
      ).rejects.toThrow('No video sender found in peer connection');
    });
  });

  describe('addTrackToPeerConnection', () => {
    it('should add track to peer connection', async () => {
      await service.startScreenShare();
      
      await service.addTrackToPeerConnection(mockPeerConnection);

      expect(mockPeerConnection.addTrack).toHaveBeenCalledWith(
        mockVideoTrack,
        mockStream
      );
    });

    it('should throw error if no peer connection', async () => {
      await service.startScreenShare();
      
      await expect(
        service.addTrackToPeerConnection(null)
      ).rejects.toThrow('No peer connection provided');
    });

    it('should throw error if no screen stream', async () => {
      await expect(
        service.addTrackToPeerConnection(mockPeerConnection)
      ).rejects.toThrow('No screen share stream available');
    });
  });

  describe('determineSourceType', () => {
    it('should determine source type from display surface', () => {
      expect(service.determineSourceType('monitor')).toBe('screen');
      expect(service.determineSourceType('window')).toBe('window');
      expect(service.determineSourceType('browser')).toBe('tab');
      expect(service.determineSourceType('unknown')).toBe('unknown');
    });
  });

  describe('getScreenShareSettings', () => {
    it('should return screen share settings', async () => {
      await service.startScreenShare();
      
      const settings = service.getScreenShareSettings();

      expect(settings).toEqual({
        width: 1920,
        height: 1080,
        frameRate: 30,
        displaySurface: 'monitor',
        cursor: 'always',
        source: 'screen',
        isHD: true,
        quality: 'Full HD'
      });
    });

    it('should return null if not sharing', () => {
      const settings = service.getScreenShareSettings();
      expect(settings).toBeNull();
    });

    it('should determine quality level correctly', async () => {
      // Test 4K
      mockVideoTrack.getSettings.mockReturnValue({
        width: 3840,
        height: 2160,
        displaySurface: 'monitor'
      });
      await service.startScreenShare();
      expect(service.getScreenShareSettings().quality).toBe('4K');

      // Test 2K
      service.stopScreenShare();
      mockVideoTrack.getSettings.mockReturnValue({
        width: 2560,
        height: 1440,
        displaySurface: 'monitor'
      });
      await service.startScreenShare();
      expect(service.getScreenShareSettings().quality).toBe('2K');

      // Test Full HD
      service.stopScreenShare();
      mockVideoTrack.getSettings.mockReturnValue({
        width: 1920,
        height: 1080,
        displaySurface: 'monitor'
      });
      await service.startScreenShare();
      expect(service.getScreenShareSettings().quality).toBe('Full HD');

      // Test HD
      service.stopScreenShare();
      mockVideoTrack.getSettings.mockReturnValue({
        width: 1280,
        height: 720,
        displaySurface: 'monitor'
      });
      await service.startScreenShare();
      expect(service.getScreenShareSettings().quality).toBe('HD');

      // Test SD
      service.stopScreenShare();
      mockVideoTrack.getSettings.mockReturnValue({
        width: 640,
        height: 480,
        displaySurface: 'monitor'
      });
      await service.startScreenShare();
      expect(service.getScreenShareSettings().quality).toBe('SD');
    });
  });

  describe('isSupported', () => {
    it('should return true if screen sharing is supported', () => {
      expect(ScreenShareService.isSupported()).toBe(true);
    });

    it('should return false if not supported', () => {
      delete global.navigator.mediaDevices.getDisplayMedia;
      expect(ScreenShareService.isSupported()).toBe(false);
    });
  });

  describe('getSupportedConstraints', () => {
    it('should return supported constraints', () => {
      const constraints = service.getSupportedConstraints();
      
      expect(constraints).toEqual({
        width: true,
        height: true,
        frameRate: true,
        cursor: true,
        displaySurface: true
      });
    });

    it('should return empty object if not available', () => {
      delete global.navigator.mediaDevices.getSupportedConstraints;
      
      const constraints = service.getSupportedConstraints();
      expect(constraints).toEqual({});
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      await service.startScreenShare();
      service.cleanup();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(service.isScreenSharing()).toBe(false);
      expect(service.getScreenStream()).toBeNull();
    });
  });

  describe('getCurrentSource', () => {
    it('should return current source type', async () => {
      expect(service.getCurrentSource()).toBeNull();
      
      await service.startScreenShare();
      expect(service.getCurrentSource()).toBe('screen');
      
      service.stopScreenShare();
      expect(service.getCurrentSource()).toBeNull();
    });
  });
});
