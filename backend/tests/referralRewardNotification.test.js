/**
 * اختبارات إشعارات مكافآت الإحالة
 * المهمة 3.3: إشعار فوري للمحيل والمُحال
 * Validates: Requirements 2.2
 */

// Mock الخدمات الخارجية
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/models/NotificationPreference', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../src/models/Notification', () => {
  const MockNotification = jest.fn().mockImplementation(() => ({
    _id: 'mock-notification-id',
    save: jest.fn().mockResolvedValue(true)
  }));
  MockNotification.create = jest.fn().mockResolvedValue({ _id: 'mock-notification-id' });
  MockNotification.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue([])
  });
  MockNotification.countDocuments = jest.fn().mockResolvedValue(0);
  MockNotification.updateMany = jest.fn().mockResolvedValue({});
  MockNotification.findOneAndDelete = jest.fn().mockResolvedValue(null);
  return MockNotification;
});

const Notification = require('../src/models/Notification');
const NotificationPreference = require('../src/models/NotificationPreference');

// إعداد تفضيلات افتراضية تسمح بجميع الإشعارات
const defaultPreferences = {
  preferences: {
    referral_reward: { enabled: true, push: false },
    job_match: { enabled: true, push: false },
    system: { enabled: true, push: false }
  },
  quietHours: { enabled: false },
  pushSubscriptions: []
};

NotificationPreference.findOne.mockResolvedValue(defaultPreferences);
NotificationPreference.create.mockResolvedValue(defaultPreferences);

const notificationService = require('../src/services/notificationService');

describe('إشعارات مكافآت الإحالة - المهمة 3.3', () => {
  const referrerId = 'referrer-user-id-123';
  const referredUserId = 'referred-user-id-456';
  const referralId = 'referral-id-789';

  beforeEach(() => {
    jest.clearAllMocks();
    NotificationPreference.findOne.mockResolvedValue(defaultPreferences);
    NotificationPreference.create.mockResolvedValue(defaultPreferences);
    Notification.create.mockResolvedValue({ _id: 'mock-notification-id' });
  });

  describe('وجود الدالة', () => {
    test('يجب أن تكون sendReferralRewardNotification موجودة في notificationService', () => {
      expect(typeof notificationService.sendReferralRewardNotification).toBe('function');
    });
  });

  describe('إشعار التسجيل (signup)', () => {
    test('يجب إرسال إشعار للمحيل عند تسجيل المُحال', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, referredUserId, 'signup', 50, referralId
      );

      const calls = Notification.create.mock.calls;
      const referrerCall = calls.find(c => c[0].recipient === referrerId);
      expect(referrerCall).toBeDefined();
      expect(referrerCall[0].type).toBe('referral_reward');
      expect(referrerCall[0].priority).toBe('high');
    });

    test('يجب إرسال إشعار للمُحال عند التسجيل (مكافأة ترحيبية)', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, referredUserId, 'signup', 50, referralId
      );

      // يجب استدعاء create مرتين: مرة للمحيل ومرة للمُحال
      expect(Notification.create).toHaveBeenCalledTimes(2);

      const calls = Notification.create.mock.calls;
      const referredCall = calls.find(c => c[0].recipient === referredUserId);
      expect(referredCall).toBeDefined();
      expect(referredCall[0].type).toBe('referral_reward');
    });

    test('يجب أن يحتوي إشعار المحيل على عدد النقاط', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, referredUserId, 'signup', 50, referralId
      );

      const calls = Notification.create.mock.calls;
      const referrerCall = calls.find(c => c[0].recipient === referrerId);
      expect(referrerCall[0].message).toContain('50');
    });
  });

  describe('إشعار إكمال أول دورة (first_course)', () => {
    test('يجب إرسال إشعار للمحيل فقط عند إكمال المُحال أول دورة', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, null, 'first_course', 100, referralId
      );

      expect(Notification.create).toHaveBeenCalledTimes(1);
      const call = Notification.create.mock.calls[0][0];
      expect(call.recipient).toBe(referrerId);
      expect(call.type).toBe('referral_reward');
    });

    test('يجب أن يحتوي الإشعار على 100 نقطة', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, null, 'first_course', 100, referralId
      );

      const call = Notification.create.mock.calls[0][0];
      expect(call.message).toContain('100');
    });
  });

  describe('إشعار الحصول على وظيفة (job)', () => {
    test('يجب إرسال إشعار للمحيل عند حصول المُحال على وظيفة', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, null, 'job', 200, referralId
      );

      expect(Notification.create).toHaveBeenCalledTimes(1);
      const call = Notification.create.mock.calls[0][0];
      expect(call.recipient).toBe(referrerId);
      expect(call.type).toBe('referral_reward');
      expect(call.message).toContain('200');
    });
  });

  describe('إشعار الاشتراك المدفوع (paid_subscription)', () => {
    test('يجب إرسال إشعار للمحيل عند اشتراك المُحال المدفوع', async () => {
      await notificationService.sendReferralRewardNotification(
        referrerId, null, 'paid_subscription', 300, referralId
      );

      expect(Notification.create).toHaveBeenCalledTimes(1);
      const call = Notification.create.mock.calls[0][0];
      expect(call.recipient).toBe(referrerId);
      expect(call.type).toBe('referral_reward');
    });
  });

  describe('معالجة الأخطاء', () => {
    test('يجب أن لا تفشل الدالة عند نوع مكافأة غير معروف', async () => {
      await expect(
        notificationService.sendReferralRewardNotification(
          referrerId, null, 'unknown_type', 100, referralId
        )
      ).resolves.not.toThrow();
    });

    test('يجب أن لا تفشل الدالة عند عدم وجود referralId', async () => {
      await expect(
        notificationService.sendReferralRewardNotification(
          referrerId, referredUserId, 'signup', 50
        )
      ).resolves.not.toThrow();
    });
  });
});
