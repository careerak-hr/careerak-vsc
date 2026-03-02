const ConnectionQualityService = require('../src/services/connectionQualityService');

describe('ConnectionQualityService', () => {
  let service;

  beforeEach(() => {
    service = new ConnectionQualityService();
  });

  describe('calculateQuality', () => {
    test('should return excellent quality for optimal stats', () => {
      const stats = {
        latency: 100,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 1500000
      };

      const result = service.calculateQuality(stats);

      expect(result.level).toBe('excellent');
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.details).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should return good quality for decent stats', () => {
      const stats = {
        latency: 250,
        packetLoss: 2,
        jitter: 40,
        bitrate: 800000
      };

      const result = service.calculateQuality(stats);

      expect(result.level).toBe('good');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.score).toBeLessThan(85);
    });

    test('should return fair quality for mediocre stats', () => {
      const stats = {
        latency: 400,
        packetLoss: 4,
        jitter: 80,
        bitrate: 300000
      };

      const result = service.calculateQuality(stats);

      expect(result.level).toBe('fair');
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(70);
    });

    test('should return poor quality for bad stats', () => {
      const stats = {
        latency: 800,
        packetLoss: 8,
        jitter: 150,
        bitrate: 100000
      };

      const result = service.calculateQuality(stats);

      expect(result.level).toBe('poor');
      expect(result.score).toBeLessThan(50);
    });

    test('should include detailed metrics for each stat', () => {
      const stats = {
        latency: 200,
        packetLoss: 1.5,
        jitter: 35,
        bitrate: 900000
      };

      const result = service.calculateQuality(stats);

      expect(result.details.latency).toBeDefined();
      expect(result.details.latency.value).toBe(200);
      expect(result.details.latency.score).toBeDefined();
      expect(result.details.latency.status).toBeDefined();

      expect(result.details.packetLoss).toBeDefined();
      expect(result.details.jitter).toBeDefined();
      expect(result.details.bitrate).toBeDefined();
    });
  });

  describe('getRecommendations', () => {
    test('should return no recommendations for excellent quality', () => {
      const quality = service.calculateQuality({
        latency: 100,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 1500000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations).toHaveLength(0);
    });

    test('should recommend latency improvements for high latency', () => {
      const quality = service.calculateQuality({
        latency: 600,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 1500000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'latency')).toBe(true);
      expect(recommendations.find(r => r.type === 'latency').severity).toBe('high');
    });

    test('should recommend packet loss improvements for high packet loss', () => {
      const quality = service.calculateQuality({
        latency: 100,
        packetLoss: 6,
        jitter: 20,
        bitrate: 1500000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations.some(r => r.type === 'packetLoss')).toBe(true);
    });

    test('should recommend jitter improvements for high jitter', () => {
      const quality = service.calculateQuality({
        latency: 100,
        packetLoss: 0.5,
        jitter: 120,
        bitrate: 1500000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations.some(r => r.type === 'jitter')).toBe(true);
    });

    test('should recommend bitrate improvements for low bitrate', () => {
      const quality = service.calculateQuality({
        latency: 100,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 150000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations.some(r => r.type === 'bitrate')).toBe(true);
    });

    test('should include both English and Arabic messages', () => {
      const quality = service.calculateQuality({
        latency: 600,
        packetLoss: 0.5,
        jitter: 20,
        bitrate: 1500000
      });

      const recommendations = service.getRecommendations(quality);

      expect(recommendations[0].message).toBeDefined();
      expect(recommendations[0].messageAr).toBeDefined();
    });
  });

  describe('analyzeTrends', () => {
    test('should return stable trend for consistent scores', () => {
      const history = [
        { score: 80 },
        { score: 82 },
        { score: 81 },
        { score: 79 },
        { score: 80 }
      ];

      const result = service.analyzeTrends(history);

      expect(result.trend).toBe('stable');
      expect(result.average).toBeCloseTo(80, 1);
    });

    test('should return improving trend for increasing scores', () => {
      const history = [
        { score: 60 },
        { score: 65 },
        { score: 70 },
        { score: 75 },
        { score: 80 }
      ];

      const result = service.analyzeTrends(history);

      expect(result.trend).toBe('improving');
      expect(result.change).toBeGreaterThan(10);
    });

    test('should return degrading trend for decreasing scores', () => {
      const history = [
        { score: 80 },
        { score: 75 },
        { score: 70 },
        { score: 65 },
        { score: 60 }
      ];

      const result = service.analyzeTrends(history);

      expect(result.trend).toBe('degrading');
      expect(result.change).toBeLessThan(-10);
    });

    test('should handle insufficient data', () => {
      const history = [{ score: 80 }];

      const result = service.analyzeTrends(history);

      expect(result.trend).toBe('stable');
      expect(result.message).toContain('Not enough data');
    });
  });

  describe('edge cases', () => {
    test('should handle zero values', () => {
      const stats = {
        latency: 0,
        packetLoss: 0,
        jitter: 0,
        bitrate: 0
      };

      const result = service.calculateQuality(stats);

      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle very high values', () => {
      const stats = {
        latency: 5000,
        packetLoss: 50,
        jitter: 1000,
        bitrate: 10000000
      };

      const result = service.calculateQuality(stats);

      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
    });

    test('should handle negative values gracefully', () => {
      const stats = {
        latency: -10,
        packetLoss: -5,
        jitter: -20,
        bitrate: -1000
      };

      const result = service.calculateQuality(stats);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
