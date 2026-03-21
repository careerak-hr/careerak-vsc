/**
 * Anti-Fraud Service Tests
 * Validates: Requirements 6.1, 6.2, 6.4
 */

jest.mock('../src/models/Referral', () => ({
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const Referral = require('../src/models/Referral');
const antiFraudService = require('../src/services/antiFraudService');

describe('AntiFraudService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Referral.findOne.mockResolvedValue(null);
    Referral.countDocuments.mockResolvedValue(0);
  });

  describe('Self-referral prevention', () => {
    test('blocks when referrer and referred are the same user', async () => {
      const result = await antiFraudService.checkFraud({
        referrerId: 'user-123',
        referredUserId: 'user-123',
        ipAddress: '1.2.3.4'
      });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.flags).toContain('self_referral');
    });

    test('blocks when same IP found for referrer+referred pair', async () => {
      // IP check (30) + device check (40) = 70 -> blocked
      Referral.findOne
        .mockResolvedValueOnce({ _id: 'ip-match' })   // IP self-referral check
        .mockResolvedValueOnce({ _id: 'dev-match' })  // same_device_self_referral
        .mockResolvedValueOnce(null);                  // same_device referral
      Referral.countDocuments.mockResolvedValue(0);
      const result = await antiFraudService.checkFraud({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '192.168.1.1',
        deviceFingerprint: 'fp-shared'
      });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe('blocked');
    });
  });

  describe('calculateSuspicionScore', () => {
    test('returns score 0 and clean status for a legitimate referral', async () => {
      const result = await antiFraudService.calculateSuspicionScore({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '10.0.0.1',
        deviceFingerprint: 'device-xyz'
      });
      expect(result.score).toBe(0);
      expect(result.status).toBe('clean');
      expect(result.flags).toHaveLength(0);
    });

    test('adds 20 points for rapid signups (>= 5 per hour)', async () => {
      Referral.countDocuments.mockResolvedValue(5);
      const result = await antiFraudService.calculateSuspicionScore({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '1.2.3.4'
      });
      expect(result.flags).toContain('rapid_signups');
      expect(result.score).toBeGreaterThanOrEqual(20);
    });

    test('returns suspicious (score=40) when same device detected', async () => {
      // calculateSuspicionScore call order with ipAddress + deviceFingerprint:
      // findOne #1: IP self-referral -> null
      // countDocuments #1: IP monthly -> 0
      // findOne #2: same device self-referral -> null
      // findOne #3: same device referral -> match (adds 40)
      // countDocuments #2: rapid signups -> 0
      Referral.findOne
        .mockResolvedValueOnce(null)  // IP self-referral check
        .mockResolvedValueOnce(null)  // same_device_self_referral check
        .mockResolvedValueOnce({ _id: 'device-match' }); // same_device check
      Referral.countDocuments
        .mockResolvedValueOnce(0)  // IP monthly
        .mockResolvedValueOnce(0); // rapid signups

      const result = await antiFraudService.calculateSuspicionScore({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '1.2.3.4',
        deviceFingerprint: 'fp-abc'
      });

      expect(result.status).toBe('suspicious');
      expect(result.score).toBe(40);
      expect(result.flags).toContain('same_device');
    });

    test('returns blocked when score >= 70', async () => {
      // IP limit exceeded (30) + same device (40) + rapid signups (20) = 90
      // findOne #1: IP self-referral -> null
      // countDocuments #1: IP monthly -> 11 (adds 30)
      // findOne #2: same device -> match (adds 40)
      // countDocuments #2: rapid signups -> 6 (adds 20)
      Referral.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: 'device-match' });
      Referral.countDocuments
        .mockResolvedValueOnce(11)
        .mockResolvedValueOnce(6);

      const result = await antiFraudService.calculateSuspicionScore({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '1.2.3.4',
        deviceFingerprint: 'fp-abc'
      });

      expect(result.status).toBe('blocked');
      expect(result.score).toBeGreaterThanOrEqual(70);
    });
  });

  describe('IP monthly limit', () => {
    test('flags as suspicious when IP exceeds 10 referrals/month', async () => {
      // All countDocuments calls return 11 (>= 10 limit) to ensure IP flag is set
      Referral.findOne.mockResolvedValue(null);
      Referral.countDocuments.mockResolvedValue(11);

      const result = await antiFraudService.checkFraud({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '5.5.5.5'
      });

      expect(result.status).not.toBe('clean');
      expect(result.flags).toContain('same_ip_monthly_limit');
    });

    test('isIpLimitExceeded returns true when count >= 10', async () => {
      Referral.countDocuments.mockResolvedValue(10);
      expect(await antiFraudService.isIpLimitExceeded('5.5.5.5', 'user-A')).toBe(true);
    });

    test('isIpLimitExceeded returns false when count < 10', async () => {
      Referral.countDocuments.mockResolvedValue(3);
      expect(await antiFraudService.isIpLimitExceeded('5.5.5.5', 'user-A')).toBe(false);
    });

    test('isIpLimitExceeded returns false when no IP provided', async () => {
      expect(await antiFraudService.isIpLimitExceeded(null, 'user-A')).toBe(false);
    });
  });

  describe('Legitimate referral', () => {
    test('allows a clean referral', async () => {
      const result = await antiFraudService.checkFraud({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '10.0.0.1',
        deviceFingerprint: 'device-unique'
      });
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('clean');
      expect(result.waitingPeriodDays).toBe(0);
    });

    test('suspicious referral is allowed with 7-day waiting period', async () => {
      // checkFraud: findOne #1 (IP self-referral) -> null
      // calculateSuspicionScore: findOne #2 (IP self-referral) -> null, countDocuments #1 (IP monthly) -> 0
      //   findOne #3 (same device) -> match, countDocuments #2 (rapid) -> 0
      Referral.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: 'device-match' });
      Referral.countDocuments.mockResolvedValue(0);

      const result = await antiFraudService.checkFraud({
        referrerId: 'user-A',
        referredUserId: 'user-B',
        ipAddress: '10.0.0.1',
        deviceFingerprint: 'fp-abc'
      });

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('suspicious');
      expect(result.waitingPeriodDays).toBe(7);
    });
  });

  describe('Constants', () => {
    test('FRAUD_LIMITS are correctly defined', () => {
      expect(antiFraudService.FRAUD_LIMITS.sameIpMonthlyMax).toBe(10);
      expect(antiFraudService.FRAUD_LIMITS.rapidSignupsPerHour).toBe(5);
      expect(antiFraudService.FRAUD_LIMITS.inactivityDays).toBe(7);
    });

    test('SCORE_WEIGHTS match design spec', () => {
      expect(antiFraudService.SCORE_WEIGHTS.sameIP).toBe(30);
      expect(antiFraudService.SCORE_WEIGHTS.sameDevice).toBe(40);
      expect(antiFraudService.SCORE_WEIGHTS.rapidSignups).toBe(20);
      expect(antiFraudService.SCORE_WEIGHTS.inactiveReferral).toBe(10);
    });
  });
});
