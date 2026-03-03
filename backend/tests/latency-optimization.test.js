/**
 * Latency Optimization Tests
 * اختبارات شاملة للتحقق من أن زمن الانتقال < 300ms
 * 
 * Requirements: 1.3 - زمن انتقال (latency) أقل من 300ms
 */

const LatencyOptimizationService = require('../src/services/latencyOptimizationService');
const ConnectionQualityService = require('../src/services/connectionQualityService');

describe('Latency Optimization Service', () => {
  let latencyService;
  let qualityService;

  beforeEach(() => {
    latencyService = new LatencyOptimizationService();
    qualityService = new ConnectionQualityService();
  });

  describe('Target Latency Configuration', () => {
    test('should have target latency set to 300ms', () => {
      expect(latencyService.latencyConfig.targetLatency).toBe(300);
    });

    test('should have appropriate buffer size for low latency', () => {
      expect(latencyService.latencyConfig.bufferSize).toBeLessThanOrEqual(100);
    });

    test('should use adaptive jitter buffer', () => {
      expect(latencyService.latencyConfig.jitterBuffer).toBe('adaptive');
    });
  });

  describe('Latency Measurement', () => {
    test('should measure latency correctly', async () => {
      // Mock peer connection with stats
      const mockPeerConnection = {
        getStats: jest.fn().mockResolvedValue(new Map([
          ['candidate-pair-1', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.15 // 150ms
          }]
        ]))
      };

      const result = await latencyService.measureLatency(mockPeerConnection);

      expect(result.latency).toBe(150);
      expect(result.unit).toBe('ms');
      expect(result.meetsTarget).toBe(true);
    });

    test('should detect when latency exceeds target', async () => {
      const mockPeerConnection = {
        getStats: jest.fn().mockResolvedValue(new Map([
          ['candidate-pair-1', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.35 // 350ms
          }]
        ]))
      };

      const result = await latencyService.measureLatency(mockPeerConnection);

      expect(result.latency).toBe(350);
      expect(result.meetsTarget).toBe(false);
    });

    test('should calculate average latency from multiple candidate pairs', async () => {
      const mockPeerConnection = {
        getStats: jest.fn().mockResolvedValue(new Map([
          ['candidate-pair-1', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.10 // 100ms
          }],
          ['candidate-pair-2', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.20 // 200ms
          }]
        ]))
      };

      const result = await latencyService.measureLatency(mockPeerConnection);

      expect(result.latency).toBe(150); // Average of 100 and 200
      expect(result.meetsTarget).toBe(true);
    });
  });

  describe('Connection Quality Monitoring', () => {
    test('should monitor connection quality with latency < 300ms', async () => {
      const mockPeerConnection = {
        getStats: jest.fn().mockResolvedValue(new Map([
          ['candidate-pair-1', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.25 // 250ms
          }],
          ['inbound-rtp-1', {
            type: 'inbound-rtp',
            kind: 'video',
            packetsLost: 5,
            packetsReceived: 995,
            jitter: 0.02, // 20ms
            bytesReceived: 1000000,
            timestamp: Date.now()
          }]
        ]))
      };

      const quality = await latencyService.monitorConnectionQuality(mockPeerConnection);

      expect(quality).toBeDefined();
      expect(quality.latency).toBe(250);
      expect(quality.latency).toBeLessThan(300);
      expect(quality.level).toMatch(/excellent|good/);
    });

    test('should detect poor quality when latency > 300ms', async () => {
      const mockPeerConnection = {
        getStats: jest.fn().mockResolvedValue(new Map([
          ['candidate-pair-1', {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.55 // 550ms
          }],
          ['inbound-rtp-1', {
            type: 'inbound-rtp',
            kind: 'video',
            packetsLost: 60,
            packetsReceived: 940,
            jitter: 0.08,
            bytesReceived: 500000,
            timestamp: Date.now()
          }]
        ]))
      };

      const quality = await latencyService.monitorConnectionQuality(mockPeerConnection);

      expect(quality.latency).toBeGreaterThan(300);
      expect(quality.level).toMatch(/fair|poor/);
    });
  });

  describe('Packet Loss Handling', () => {
    test('should configure FEC, NACK, and RTX for packet loss handling', () => {
      const mockSender = {
        track: { kind: 'video' },
        getParameters: jest.fn().mockReturnValue({
          encodings: [{ ssrc: 12345 }]
        }),
        setParameters: jest.fn().mockResolvedValue()
      };

      const mockPeerConnection = {
        getSenders: jest.fn().mockReturnValue([mockSender])
      };

      const result = latencyService.configurePacketLossHandling(mockPeerConnection);

      expect(result.fecEnabled).toBe(true);
      expect(result.nackEnabled).toBe(true);
      expect(result.rtxEnabled).toBe(true);
      expect(mockSender.setParameters).toHaveBeenCalled();
    });

    test('should handle packet loss threshold correctly', () => {
      expect(latencyService.packetLossConfig.threshold).toBe(5);
      expect(latencyService.packetLossConfig.recoveryStrategies).toContain('fec');
      expect(latencyService.packetLossConfig.recoveryStrategies).toContain('nack');
      expect(latencyService.packetLossConfig.recoveryStrategies).toContain('rtx');
    });
  });

  describe('Latency Optimization', () => {
    test('should optimize jitter buffer for low latency', () => {
      const mockReceiver = {
        track: { kind: 'video' },
        playoutDelayHint: undefined
      };

      const mockPeerConnection = {
        getReceivers: jest.fn().mockReturnValue([mockReceiver])
      };

      const result = latencyService.optimizeLatency(mockPeerConnection);

      expect(result.targetLatency).toBe(300);
      expect(result.bufferSize).toBe(50);
      expect(result.jitterBuffer).toBe('adaptive');
    });

    test('should set playout delay hint when supported', () => {
      const mockReceiver = {
        track: { kind: 'video' },
        playoutDelayHint: 0
      };

      const mockPeerConnection = {
        getReceivers: jest.fn().mockReturnValue([mockReceiver])
      };

      latencyService.optimizeLatency(mockPeerConnection);

      expect(mockReceiver.playoutDelayHint).toBe(0.05); // 50ms in seconds
    });
  });

  describe('Auto-Reconnection', () => {
    test('should attempt reconnection with exponential backoff', async () => {
      const mockPeerConnection = {
        iceConnectionState: 'failed',
        restartIce: jest.fn(),
        oniceconnectionstatechange: null
      };

      // Mock successful reconnection on first attempt
      setTimeout(() => {
        mockPeerConnection.iceConnectionState = 'connected';
        if (mockPeerConnection.oniceconnectionstatechange) {
          mockPeerConnection.oniceconnectionstatechange();
        }
      }, 100);

      const result = await latencyService.handleAutoReconnection(
        mockPeerConnection,
        'room-123',
        'user-456'
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(mockPeerConnection.restartIce).toHaveBeenCalled();
    });

    test('should respect max reconnection attempts', async () => {
      // تقليل التأخير للاختبار
      const originalConfig = { ...latencyService.reconnectionConfig };
      latencyService.reconnectionConfig.initialDelay = 10;
      latencyService.reconnectionConfig.maxDelay = 50;

      const mockPeerConnection = {
        iceConnectionState: 'failed',
        restartIce: jest.fn(),
        oniceconnectionstatechange: null
      };

      const result = await latencyService.handleAutoReconnection(
        mockPeerConnection,
        'room-123',
        'user-456'
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(latencyService.reconnectionConfig.maxAttempts);
      expect(result.error).toBe('Max reconnection attempts reached');

      // استعادة الإعدادات الأصلية
      latencyService.reconnectionConfig = originalConfig;
    });
  });

  describe('Quality Level Determination', () => {
    test('should classify excellent quality (latency < 150ms)', () => {
      const quality = {
        latency: 120,
        packetLoss: 0.5
      };

      const level = latencyService.determineQualityLevel(quality);
      expect(level).toBe('excellent');
    });

    test('should classify good quality (latency < 300ms)', () => {
      const quality = {
        latency: 250,
        packetLoss: 2
      };

      const level = latencyService.determineQualityLevel(quality);
      expect(level).toBe('good');
    });

    test('should classify fair quality (latency < 500ms)', () => {
      const quality = {
        latency: 450,
        packetLoss: 4
      };

      const level = latencyService.determineQualityLevel(quality);
      expect(level).toBe('fair');
    });

    test('should classify poor quality (latency >= 500ms)', () => {
      const quality = {
        latency: 600,
        packetLoss: 8
      };

      const level = latencyService.determineQualityLevel(quality);
      expect(level).toBe('poor');
    });
  });

  describe('All Optimizations Applied', () => {
    test('should apply all optimizations successfully', () => {
      const mockSender = {
        track: { kind: 'video' },
        getParameters: jest.fn().mockReturnValue({
          encodings: [{ ssrc: 12345 }]
        }),
        setParameters: jest.fn().mockResolvedValue()
      };

      const mockReceiver = {
        track: { kind: 'video' },
        playoutDelayHint: 0
      };

      const mockPeerConnection = {
        getSenders: jest.fn().mockReturnValue([mockSender]),
        getReceivers: jest.fn().mockReturnValue([mockReceiver])
      };

      const result = latencyService.applyAllOptimizations(mockPeerConnection);

      expect(result.packetLossConfig).toBeDefined();
      expect(result.latencyConfig).toBeDefined();
      expect(result.qualityMonitor).toBeDefined();

      // Cleanup
      clearInterval(result.qualityMonitor);
    });
  });
});

describe('Connection Quality Service', () => {
  let qualityService;

  beforeEach(() => {
    qualityService = new ConnectionQualityService();
  });

  describe('Quality Thresholds', () => {
    test('should have correct excellent quality thresholds', () => {
      expect(qualityService.thresholds.excellent.latency).toBe(150);
      expect(qualityService.thresholds.excellent.packetLoss).toBe(1);
    });

    test('should have correct good quality thresholds', () => {
      expect(qualityService.thresholds.good.latency).toBe(300);
      expect(qualityService.thresholds.good.packetLoss).toBe(3);
    });
  });

  describe('Quality Calculation', () => {
    test('should calculate excellent quality for low latency', () => {
      const stats = {
        latency: 120,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 1500000
      };

      const quality = qualityService.calculateQuality(stats);

      expect(quality.level).toBe('excellent');
      expect(quality.score).toBeGreaterThanOrEqual(85);
      expect(quality.details.latency.status).toBe('excellent');
    });

    test('should calculate good quality for latency < 300ms', () => {
      const stats = {
        latency: 250,
        packetLoss: 2,
        jitter: 40,
        bitrate: 800000
      };

      const quality = qualityService.calculateQuality(stats);

      expect(quality.level).toBe('good');
      expect(quality.score).toBeGreaterThanOrEqual(70);
      expect(quality.details.latency.status).toBe('good');
    });

    test('should calculate fair quality for latency around 300ms', () => {
      const stats = {
        latency: 350,
        packetLoss: 4,
        jitter: 80,
        bitrate: 400000
      };

      const quality = qualityService.calculateQuality(stats);

      expect(quality.level).toMatch(/fair|poor/);
      expect(quality.details.latency.value).toBe(350);
    });

    test('should calculate poor quality for high latency', () => {
      const stats = {
        latency: 600,
        packetLoss: 8,
        jitter: 150,
        bitrate: 150000
      };

      const quality = qualityService.calculateQuality(stats);

      expect(quality.level).toBe('poor');
      expect(quality.score).toBeLessThan(50);
    });
  });

  describe('Recommendations', () => {
    test('should provide recommendations for high latency', () => {
      const quality = {
        level: 'poor',
        details: {
          latency: { status: 'poor', value: 500 },
          packetLoss: { status: 'good', value: 1 },
          jitter: { status: 'good', value: 30 },
          bitrate: { status: 'good', value: 1000000 }
        }
      };

      const recommendations = qualityService.getRecommendations(quality);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBe('latency');
      expect(recommendations[0].severity).toBe('high');
      expect(recommendations[0].messageAr).toContain('تأخير');
    });

    test('should provide no recommendations for excellent quality', () => {
      const quality = {
        level: 'excellent',
        details: {
          latency: { status: 'excellent', value: 100 },
          packetLoss: { status: 'excellent', value: 0.5 },
          jitter: { status: 'excellent', value: 20 },
          bitrate: { status: 'excellent', value: 1500000 }
        }
      };

      const recommendations = qualityService.getRecommendations(quality);

      expect(recommendations.length).toBe(0);
    });
  });

  describe('Trend Analysis', () => {
    test('should detect improving trend', () => {
      const qualityHistory = [
        { score: 60 },
        { score: 65 },
        { score: 70 },
        { score: 75 },
        { score: 80 }
      ];

      const trend = qualityService.analyzeTrends(qualityHistory);

      expect(trend.trend).toBe('improving');
      expect(trend.change).toBeGreaterThan(10);
    });

    test('should detect degrading trend', () => {
      const qualityHistory = [
        { score: 80 },
        { score: 75 },
        { score: 70 },
        { score: 65 },
        { score: 60 }
      ];

      const trend = qualityService.analyzeTrends(qualityHistory);

      expect(trend.trend).toBe('degrading');
      expect(trend.change).toBeLessThan(-10);
    });

    test('should detect stable trend', () => {
      const qualityHistory = [
        { score: 75 },
        { score: 76 },
        { score: 74 },
        { score: 75 },
        { score: 76 }
      ];

      const trend = qualityService.analyzeTrends(qualityHistory);

      expect(trend.trend).toBe('stable');
    });
  });
});
