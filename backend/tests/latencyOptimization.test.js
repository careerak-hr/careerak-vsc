/**
 * Latency Optimization Tests
 * اختبارات تحسين زمن الانتقال
 */

const LatencyOptimizationService = require('../src/services/latencyOptimizationService');

describe('Latency Optimization Service', () => {
  let service;

  beforeEach(() => {
    service = new LatencyOptimizationService();
  });

  describe('Configuration', () => {
    test('should have correct reconnection config', () => {
      expect(service.reconnectionConfig).toBeDefined();
      expect(service.reconnectionConfig.maxAttempts).toBe(5);
      expect(service.reconnectionConfig.initialDelay).toBe(1000);
      expect(service.reconnectionConfig.maxDelay).toBe(10000);
    });

    test('should have correct packet loss config', () => {
      expect(service.packetLossConfig).toBeDefined();
      expect(service.packetLossConfig.threshold).toBe(5);
      expect(service.packetLossConfig.recoveryStrategies).toContain('fec');
      expect(service.packetLossConfig.recoveryStrategies).toContain('nack');
      expect(service.packetLossConfig.recoveryStrategies).toContain('rtx');
    });

    test('should have correct latency config', () => {
      expect(service.latencyConfig).toBeDefined();
      expect(service.latencyConfig.targetLatency).toBe(300);
      expect(service.latencyConfig.bufferSize).toBe(50);
      expect(service.latencyConfig.jitterBuffer).toBe('adaptive');
    });
  });

  describe('Quality Level Determination', () => {
    test('should return "excellent" for low latency and packet loss', () => {
      const quality = { latency: 100, packetLoss: 0.5 };
      const level = service.determineQualityLevel(quality);
      expect(level).toBe('excellent');
    });

    test('should return "good" for acceptable latency and packet loss', () => {
      const quality = { latency: 250, packetLoss: 2 };
      const level = service.determineQualityLevel(quality);
      expect(level).toBe('good');
    });

    test('should return "fair" for moderate latency and packet loss', () => {
      const quality = { latency: 400, packetLoss: 4 };
      const level = service.determineQualityLevel(quality);
      expect(level).toBe('fair');
    });

    test('should return "poor" for high latency', () => {
      const quality = { latency: 600, packetLoss: 2 };
      const level = service.determineQualityLevel(quality);
      expect(level).toBe('poor');
    });

    test('should return "poor" for high packet loss', () => {
      const quality = { latency: 200, packetLoss: 8 };
      const level = service.determineQualityLevel(quality);
      expect(level).toBe('poor');
    });
  });

  describe('Latency Measurement', () => {
    test('should return null for invalid peer connection', async () => {
      const mockPC = {
        getStats: jest.fn().mockRejectedValue(new Error('Invalid connection'))
      };

      const result = await service.measureLatency(mockPC);
      expect(result).toHaveProperty('error');
      expect(result.latency).toBeNull();
    });

    test('should calculate average latency correctly', async () => {
      const mockStats = new Map([
        ['candidate-pair-1', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.1 // 100ms
        }],
        ['candidate-pair-2', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.2 // 200ms
        }]
      ]);

      const mockPC = {
        getStats: jest.fn().mockResolvedValue(mockStats)
      };

      const result = await service.measureLatency(mockPC);
      expect(result.latency).toBe(150); // average of 100 and 200
      expect(result.unit).toBe('ms');
      expect(result.meetsTarget).toBe(true); // < 300ms
    });

    test('should detect when latency exceeds target', async () => {
      const mockStats = new Map([
        ['candidate-pair-1', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.4 // 400ms
        }]
      ]);

      const mockPC = {
        getStats: jest.fn().mockResolvedValue(mockStats)
      };

      const result = await service.measureLatency(mockPC);
      expect(result.latency).toBe(400);
      expect(result.meetsTarget).toBe(false); // > 300ms
    });
  });

  describe('Connection Quality Monitoring', () => {
    test('should calculate packet loss correctly', async () => {
      const mockStats = new Map([
        ['inbound-rtp-1', {
          type: 'inbound-rtp',
          kind: 'video',
          packetsLost: 10,
          packetsReceived: 990
        }]
      ]);

      const mockPC = {
        getStats: jest.fn().mockResolvedValue(mockStats)
      };

      const result = await service.monitorConnectionQuality(mockPC);
      expect(result.packetLoss).toBe('1.00'); // 10/1000 = 1%
    });

    test('should measure jitter correctly', async () => {
      const mockStats = new Map([
        ['inbound-rtp-1', {
          type: 'inbound-rtp',
          kind: 'video',
          jitter: 0.025, // 25ms
          packetsLost: 0,
          packetsReceived: 1000
        }]
      ]);

      const mockPC = {
        getStats: jest.fn().mockResolvedValue(mockStats)
      };

      const result = await service.monitorConnectionQuality(mockPC);
      expect(result.jitter).toBe(25);
    });

    test('should determine overall quality correctly', async () => {
      const mockStats = new Map([
        ['candidate-pair-1', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.1 // 100ms
        }],
        ['inbound-rtp-1', {
          type: 'inbound-rtp',
          kind: 'video',
          packetsLost: 5,
          packetsReceived: 995,
          jitter: 0.01
        }]
      ]);

      const mockPC = {
        getStats: jest.fn().mockResolvedValue(mockStats)
      };

      const result = await service.monitorConnectionQuality(mockPC);
      expect(result.level).toBe('excellent'); // latency < 150ms, packet loss < 1%
    });
  });

  describe('Auto-reconnection', () => {
    test('should attempt reconnection with exponential backoff', async () => {
      const mockPC = {
        iceConnectionState: 'failed',
        restartIce: jest.fn(),
        oniceconnectionstatechange: null
      };

      // محاكاة فشل جميع المحاولات
      const result = await service.handleAutoReconnection(mockPC, 'room-123', 'user-456');
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(5); // maxAttempts
      expect(mockPC.restartIce).toHaveBeenCalled();
    });

    test('should return success on successful reconnection', async () => {
      const mockPC = {
        iceConnectionState: 'disconnected',
        restartIce: jest.fn(),
        oniceconnectionstatechange: null
      };

      // محاكاة نجاح إعادة الاتصال
      jest.spyOn(service, 'attemptReconnection').mockResolvedValue(true);
      jest.spyOn(service, 'measureLatency').mockResolvedValue({ latency: 150 });

      const result = await service.handleAutoReconnection(mockPC, 'room-123', 'user-456');
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.latency).toBeDefined();
    });
  });

  describe('Packet Loss Handling', () => {
    test('should configure FEC, NACK, and RTX', () => {
      const mockSender = {
        track: { kind: 'video' },
        getParameters: jest.fn().mockReturnValue({
          encodings: [{ ssrc: 12345 }]
        }),
        setParameters: jest.fn().mockResolvedValue()
      };

      const mockPC = {
        getSenders: jest.fn().mockReturnValue([mockSender])
      };

      const result = service.configurePacketLossHandling(mockPC);
      
      expect(result.fecEnabled).toBe(true);
      expect(result.nackEnabled).toBe(true);
      expect(result.rtxEnabled).toBe(true);
      expect(mockSender.setParameters).toHaveBeenCalled();
    });
  });

  describe('Latency Optimization', () => {
    test('should optimize jitter buffer', () => {
      const mockReceiver = {
        track: { kind: 'video' },
        playoutDelayHint: undefined
      };

      const mockPC = {
        getReceivers: jest.fn().mockReturnValue([mockReceiver])
      };

      const result = service.optimizeLatency(mockPC);
      
      expect(result.targetLatency).toBe(300);
      expect(result.bufferSize).toBe(50);
      expect(result.jitterBuffer).toBe('adaptive');
    });
  });

  describe('Integration', () => {
    test('should apply all optimizations successfully', () => {
      const mockSender = {
        track: { kind: 'video' },
        getParameters: jest.fn().mockReturnValue({ encodings: [{}] }),
        setParameters: jest.fn().mockResolvedValue()
      };

      const mockReceiver = {
        track: { kind: 'video' }
      };

      const mockPC = {
        getSenders: jest.fn().mockReturnValue([mockSender]),
        getReceivers: jest.fn().mockReturnValue([mockReceiver])
      };

      const result = service.applyAllOptimizations(mockPC);
      
      expect(result.packetLossConfig).toBeDefined();
      expect(result.latencyConfig).toBeDefined();
      expect(result.qualityMonitor).toBeDefined();
      
      // تنظيف
      clearInterval(result.qualityMonitor);
    });
  });
});
