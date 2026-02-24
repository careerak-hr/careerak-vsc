/**
 * Security Score Service Tests
 * اختبارات خدمة Security Score
 */

const { calculateSecurityScore, getSecurityTips } = require('../src/services/securityScoreService');

describe('Security Score Service', () => {
  describe('calculateSecurityScore', () => {
    test('should calculate score for user with all factors', () => {
      const user = {
        passwordStrength: { score: 4, label: 'strong' },
        emailVerified: true,
        twoFactorEnabled: true,
        oauthAccounts: [
          { provider: 'google' },
          { provider: 'facebook' }
        ],
        phone: '1234567890',
        country: 'Egypt',
        city: 'Cairo',
        profileImage: 'image.jpg'
      };

      const result = calculateSecurityScore(user);

      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.level).toBe('excellent');
      expect(result.factors).toHaveLength(5);
      expect(result.recommendations).toHaveLength(0); // لا توصيات لأن كل شيء مكتمل
    });

    test('should calculate score for user with weak password', () => {
      const user = {
        passwordStrength: { score: 1, label: 'weak' },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: [],
        phone: '',
        country: '',
        city: '',
        profileImage: ''
      };

      const result = calculateSecurityScore(user);

      expect(result.score).toBeLessThan(40);
      expect(result.level).toBe('weak');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should give 20 points for verified email', () => {
      const user1 = {
        passwordStrength: { score: 0 },
        emailVerified: true,
        twoFactorEnabled: false,
        oauthAccounts: []
      };

      const user2 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: []
      };

      const result1 = calculateSecurityScore(user1);
      const result2 = calculateSecurityScore(user2);

      expect(result1.score - result2.score).toBe(20);
    });

    test('should give 30 points for 2FA', () => {
      const user1 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: true,
        oauthAccounts: []
      };

      const user2 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: []
      };

      const result1 = calculateSecurityScore(user1);
      const result2 = calculateSecurityScore(user2);

      expect(result1.score - result2.score).toBe(30);
    });

    test('should give 5 points per OAuth account (max 15)', () => {
      const user1 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: [
          { provider: 'google' }
        ]
      };

      const user2 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: [
          { provider: 'google' },
          { provider: 'facebook' },
          { provider: 'linkedin' }
        ]
      };

      const user3 = {
        passwordStrength: { score: 0 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: [
          { provider: 'google' },
          { provider: 'facebook' },
          { provider: 'linkedin' },
          { provider: 'extra' } // يجب أن يتجاهل الرابع
        ]
      };

      const result1 = calculateSecurityScore(user1);
      const result2 = calculateSecurityScore(user2);
      const result3 = calculateSecurityScore(user3);

      expect(result1.factors.find(f => f.name === 'oauth_accounts').score).toBe(5);
      expect(result2.factors.find(f => f.name === 'oauth_accounts').score).toBe(15);
      expect(result3.factors.find(f => f.name === 'oauth_accounts').score).toBe(15); // حد أقصى 15
    });

    test('should prioritize recommendations by priority', () => {
      const user = {
        passwordStrength: { score: 1 },
        emailVerified: false,
        twoFactorEnabled: false,
        oauthAccounts: []
      };

      const result = calculateSecurityScore(user);

      // التوصيات يجب أن تكون مرتبة: high, medium, low
      const priorities = result.recommendations.map(r => r.priority);
      const sortedPriorities = [...priorities].sort((a, b) => {
        const order = { high: 1, medium: 2, low: 3 };
        return order[a] - order[b];
      });

      expect(priorities).toEqual(sortedPriorities);
    });
  });

  describe('getSecurityTips', () => {
    test('should return general tips', () => {
      const securityScore = {
        score: 80,
        factors: []
      };

      const tips = getSecurityTips(securityScore);

      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(t => t.category === 'general')).toBe(true);
    });

    test('should return improvement tip for low score', () => {
      const securityScore = {
        score: 40,
        factors: []
      };

      const tips = getSecurityTips(securityScore);

      expect(tips.some(t => t.category === 'improvement')).toBe(true);
    });

    test('should return 2FA tip when not enabled', () => {
      const securityScore = {
        score: 60,
        factors: [
          { name: 'two_factor', score: 0 }
        ]
      };

      const tips = getSecurityTips(securityScore);

      expect(tips.some(t => t.category === 'security')).toBe(true);
    });
  });
});
