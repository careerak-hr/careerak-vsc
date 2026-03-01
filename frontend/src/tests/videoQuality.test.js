/**
 * Video Quality Tests
 * اختبارات جودة الفيديو HD
 * 
 * يتحقق من:
 * - جودة الفيديو 720p على الأقل
 * - إعدادات الصوت الصحيحة
 * - قيود الوسائط
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import WebRTCService from '../services/webrtcService';

describe('Video Quality Tests', () => {
  let webrtcService;

  beforeEach(() => {
    webrtcService = new WebRTCService();
  });

  afterEach(() => {
    webrtcService.cleanup();
  });

  describe('Media Constraints', () => {
    test('should have HD video constraints (720p minimum)', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.video.height.min).toBeGreaterThanOrEqual(720);
      expect(constraints.video.width.min).toBeGreaterThanOrEqual(1280);
    });

    test('should have ideal HD resolution (1280x720)', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.video.height.ideal).toBe(720);
      expect(constraints.video.width.ideal).toBe(1280);
    });

    test('should support up to Full HD (1920x1080)', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.video.height.max).toBe(1080);
      expect(constraints.video.width.max).toBe(1920);
    });

    test('should have minimum 24 fps', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.video.frameRate.min).toBeGreaterThanOrEqual(24);
    });

    test('should have ideal 30 fps', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.video.frameRate.ideal).toBe(30);
    });
  });

  describe('Audio Constraints', () => {
    test('should have echo cancellation enabled', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.audio.echoCancellation).toBe(true);
    });

    test('should have noise suppression enabled', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.audio.noiseSuppression).toBe(true);
    });

    test('should have auto gain control enabled', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.audio.autoGainControl).toBe(true);
    });

    test('should have high quality audio sample rate (48kHz)', () => {
      const constraints = webrtcService.mediaConstraints;
      
      expect(constraints.audio.sampleRate).toBe(48000);
    });
  });

  describe('ICE Servers Configuration', () => {
    test('should have STUN servers configured', () => {
      const iceServers = webrtcService.iceServers.iceServers;
      
      expect(iceServers.length).toBeGreaterThan(0);
      expect(iceServers.some(server => server.urls.includes('stun'))).toBe(true);
    });

    test('should have multiple STUN servers for redundancy', () => {
      const iceServers = webrtcService.iceServers.iceServers;
      const stunServers = iceServers.filter(server => server.urls.includes('stun'));
      
      expect(stunServers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Connection Quality Calculation', () => {
    test('should return "excellent" for < 2% packet loss', () => {
      const stats = {
        packetsLost: 1,
        packetsReceived: 99
      };
      
      const quality = webrtcService.calculateQuality(stats);
      expect(quality).toBe('excellent');
    });

    test('should return "good" for 2-5% packet loss', () => {
      const stats = {
        packetsLost: 3,
        packetsReceived: 97
      };
      
      const quality = webrtcService.calculateQuality(stats);
      expect(quality).toBe('good');
    });

    test('should return "poor" for > 5% packet loss', () => {
      const stats = {
        packetsLost: 10,
        packetsReceived: 90
      };
      
      const quality = webrtcService.calculateQuality(stats);
      expect(quality).toBe('poor');
    });

    test('should return "unknown" for no packets', () => {
      const stats = {
        packetsLost: 0,
        packetsReceived: 0
      };
      
      const quality = webrtcService.calculateQuality(stats);
      expect(quality).toBe('unknown');
    });
  });

  describe('Media Controls', () => {
    test('should toggle audio correctly', () => {
      // Mock local stream
      const mockAudioTrack = { enabled: true, stop: vi.fn() };
      webrtcService.localStream = {
        getAudioTracks: () => [mockAudioTrack],
        getTracks: () => [mockAudioTrack]
      };

      webrtcService.toggleAudio(false);
      expect(mockAudioTrack.enabled).toBe(false);

      webrtcService.toggleAudio(true);
      expect(mockAudioTrack.enabled).toBe(true);
    });

    test('should toggle video correctly', () => {
      // Mock local stream
      const mockVideoTrack = { enabled: true, stop: vi.fn() };
      webrtcService.localStream = {
        getVideoTracks: () => [mockVideoTrack],
        getTracks: () => [mockVideoTrack]
      };

      webrtcService.toggleVideo(false);
      expect(mockVideoTrack.enabled).toBe(false);

      webrtcService.toggleVideo(true);
      expect(mockVideoTrack.enabled).toBe(true);
    });
  });

  describe('Cleanup', () => {
    test('should stop all tracks on cleanup', () => {
      const mockTrack = { stop: vi.fn() };
      webrtcService.localStream = {
        getTracks: () => [mockTrack]
      };

      webrtcService.cleanup();
      expect(mockTrack.stop).toHaveBeenCalled();
    });

    test('should close peer connection on cleanup', () => {
      const mockPeerConnection = { close: vi.fn() };
      webrtcService.peerConnection = mockPeerConnection;

      webrtcService.cleanup();
      expect(mockPeerConnection.close).toHaveBeenCalled();
    });

    test('should reset connection quality on cleanup', () => {
      webrtcService.connectionQuality = 'excellent';
      webrtcService.cleanup();
      
      expect(webrtcService.connectionQuality).toBe('unknown');
    });
  });
});

describe('Video Quality Property Tests', () => {
  test('Property 2: Video Quality - HD requirement', () => {
    const webrtcService = new WebRTCService();
    const constraints = webrtcService.mediaConstraints;

    // Property: For any active video call with good network conditions,
    // the video quality should be at least 720p
    expect(constraints.video.height.min).toBeGreaterThanOrEqual(720);
    expect(constraints.video.width.min).toBeGreaterThanOrEqual(1280);
    
    // Verify that the ideal settings are HD or better
    expect(constraints.video.height.ideal).toBeGreaterThanOrEqual(720);
    expect(constraints.video.width.ideal).toBeGreaterThanOrEqual(1280);
  });

  test('Property: Audio quality should be high', () => {
    const webrtcService = new WebRTCService();
    const constraints = webrtcService.mediaConstraints;

    // Property: Audio should have enhancements enabled
    expect(constraints.audio.echoCancellation).toBe(true);
    expect(constraints.audio.noiseSuppression).toBe(true);
    expect(constraints.audio.autoGainControl).toBe(true);
  });
});
