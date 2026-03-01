/**
 * Camera Switching Tests
 * اختبارات تبديل الكاميرا
 */

import WebRTCService from '../services/webrtcService';

describe('Camera Switching', () => {
  let webrtcService;

  beforeEach(() => {
    webrtcService = new WebRTCService();
  });

  afterEach(() => {
    webrtcService.cleanup();
  });

  describe('getAvailableCameras', () => {
    it('should return array of video input devices', async () => {
      // Mock enumerateDevices
      const mockDevices = [
        { deviceId: '1', kind: 'videoinput', label: 'Front Camera' },
        { deviceId: '2', kind: 'videoinput', label: 'Back Camera' },
        { deviceId: '3', kind: 'audioinput', label: 'Microphone' }
      ];

      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockResolvedValue(mockDevices)
      };

      const cameras = await webrtcService.getAvailableCameras();

      expect(cameras).toHaveLength(2);
      expect(cameras[0].kind).toBe('videoinput');
      expect(cameras[1].kind).toBe('videoinput');
    });

    it('should return empty array if no cameras available', async () => {
      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockResolvedValue([
          { deviceId: '1', kind: 'audioinput', label: 'Microphone' }
        ])
      };

      const cameras = await webrtcService.getAvailableCameras();

      expect(cameras).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockRejectedValue(new Error('Permission denied'))
      };

      const cameras = await webrtcService.getAvailableCameras();

      expect(cameras).toEqual([]);
    });
  });

  describe('hasMultipleCameras', () => {
    it('should return true if device has multiple cameras', async () => {
      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockResolvedValue([
          { deviceId: '1', kind: 'videoinput', label: 'Front Camera' },
          { deviceId: '2', kind: 'videoinput', label: 'Back Camera' }
        ])
      };

      const result = await webrtcService.hasMultipleCameras();

      expect(result).toBe(true);
    });

    it('should return false if device has only one camera', async () => {
      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockResolvedValue([
          { deviceId: '1', kind: 'videoinput', label: 'Front Camera' }
        ])
      };

      const result = await webrtcService.hasMultipleCameras();

      expect(result).toBe(false);
    });

    it('should return false if device has no cameras', async () => {
      global.navigator.mediaDevices = {
        enumerateDevices: jest.fn().mockResolvedValue([])
      };

      const result = await webrtcService.hasMultipleCameras();

      expect(result).toBe(false);
    });
  });

  describe('switchCamera', () => {
    it('should switch from user to environment', async () => {
      // Mock current stream with user facing mode
      const mockVideoTrack = {
        stop: jest.fn(),
        getSettings: jest.fn().mockReturnValue({ facingMode: 'user' })
      };

      webrtcService.localStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack])
      };

      // Mock getUserMedia for new stream
      const mockNewVideoTrack = {
        getSettings: jest.fn().mockReturnValue({ facingMode: 'environment' })
      };

      const mockNewStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockNewVideoTrack])
      };

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockResolvedValue(mockNewStream)
      };

      const newStream = await webrtcService.switchCamera();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            facingMode: expect.objectContaining({ exact: 'environment' })
          })
        })
      );
      expect(newStream).toBe(mockNewStream);
    });

    it('should switch from environment to user', async () => {
      // Mock current stream with environment facing mode
      const mockVideoTrack = {
        stop: jest.fn(),
        getSettings: jest.fn().mockReturnValue({ facingMode: 'environment' })
      };

      webrtcService.localStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack])
      };

      // Mock getUserMedia for new stream
      const mockNewVideoTrack = {
        getSettings: jest.fn().mockReturnValue({ facingMode: 'user' })
      };

      const mockNewStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockNewVideoTrack])
      };

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockResolvedValue(mockNewStream)
      };

      const newStream = await webrtcService.switchCamera();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            facingMode: expect.objectContaining({ exact: 'user' })
          })
        })
      );
      expect(newStream).toBe(mockNewStream);
    });

    it('should fallback without exact if not supported', async () => {
      const mockVideoTrack = {
        stop: jest.fn(),
        getSettings: jest.fn().mockReturnValue({ facingMode: 'user' })
      };

      webrtcService.localStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack])
      };

      const mockNewStream = {
        getVideoTracks: jest.fn().mockReturnValue([
          { getSettings: jest.fn().mockReturnValue({ facingMode: 'environment' }) }
        ])
      };

      // First call fails (exact not supported), second succeeds
      global.navigator.mediaDevices = {
        getUserMedia: jest.fn()
          .mockRejectedValueOnce(new Error('OverconstrainedError'))
          .mockResolvedValueOnce(mockNewStream)
      };

      const newStream = await webrtcService.switchCamera();

      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
      expect(newStream).toBe(mockNewStream);
    });

    it('should throw error if no active stream', async () => {
      webrtcService.localStream = null;

      await expect(webrtcService.switchCamera()).rejects.toThrow(
        'No active stream to switch camera'
      );
    });

    it('should throw error if no video track', async () => {
      webrtcService.localStream = {
        getVideoTracks: jest.fn().mockReturnValue([])
      };

      await expect(webrtcService.switchCamera()).rejects.toThrow(
        'No video track found'
      );
    });

    it('should update peer connection if exists', async () => {
      const mockVideoTrack = {
        stop: jest.fn(),
        getSettings: jest.fn().mockReturnValue({ facingMode: 'user' })
      };

      webrtcService.localStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack])
      };

      const mockNewVideoTrack = {
        getSettings: jest.fn().mockReturnValue({ facingMode: 'environment' })
      };

      const mockNewStream = {
        getVideoTracks: jest.fn().mockReturnValue([mockNewVideoTrack])
      };

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockResolvedValue(mockNewStream)
      };

      // Mock peer connection with sender
      const mockSender = {
        track: { kind: 'video' },
        replaceTrack: jest.fn().mockResolvedValue()
      };

      webrtcService.peerConnection = {
        getSenders: jest.fn().mockReturnValue([mockSender])
      };

      await webrtcService.switchCamera();

      expect(mockSender.replaceTrack).toHaveBeenCalledWith(mockNewVideoTrack);
    });
  });
});
