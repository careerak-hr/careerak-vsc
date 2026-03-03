const fc = require('fast-check');
const ScreenShareService = require('../src/services/screenShareService');

/**
 * Property-Based Tests for Screen Share Exclusivity
 * اختبارات خاصية الحصرية لمشاركة الشاشة
 * 
 * **Validates: Requirements 3.1**
 * 
 * Property 5: Screen Share Exclusivity
 * For any interview room, only one participant can share their screen at a time.
 */

describe('Screen Share Exclusivity Property Tests', () => {
  let screenShareService;

  beforeEach(() => {
    screenShareService = new ScreenShareService();
  });

  afterEach(() => {
    screenShareService.cleanup();
  });

  /**
   * Property 5: Screen Share Exclusivity
   * **Validates: Requirements 3.1**
   * 
   * For any interview room, only one participant can share their screen at a time.
   */
  describe('Property 5: Screen Share Exclusivity', () => {
    it('should allow only one active screen share per room', () => {
      fc.assert(
        fc.property(
          // Generator: room ID
          fc.string({ minLength: 5, maxLength: 20 }),
          // Generator: array of user IDs (2-10 users)
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
          (roomId, userIds) => {
            // Ensure unique user IDs
            const uniqueUserIds = [...new Set(userIds)];
            if (uniqueUserIds.length < 2) return; // Skip if not enough unique users

            // محاكاة محاولات متعددة لمشاركة الشاشة
            const mockStream = {
              getTracks: () => [{ stop: jest.fn() }]
            };

            let activeShareUserId = null;

            // كل مستخدم يحاول مشاركة الشاشة
            uniqueUserIds.forEach((userId, index) => {
              const isActive = screenShareService.isScreenShareActive(roomId);

              if (!isActive) {
                // لا توجد مشاركة نشطة، يجب أن ينجح
                screenShareService.activeScreenShares.set(roomId, {
                  userId,
                  stream: mockStream,
                  shareType: 'screen',
                  startedAt: