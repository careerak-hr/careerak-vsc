const mongoose = require('mongoose');
const Appointment = require('../src/models/Appointment');
const VideoInterview = require('../src/models/VideoInterview');
const { User, Individual, Company } = require('../src/models/User');
const appointmentReminderService = require('../src/services/appointmentReminderService');
const notificationService = require('../src/services/notificationService');

// Mock notificationService
jest.mock('../src/services/notificationService');
jest.mock('../src/services/pusherService', () => ({
  isEnabled: () => false,
  sendNotificationToUser: jest.fn()
}));

describe('Appointment Reminder Service', () => {
  let organizer, participant, appointment, videoInterview;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await Appointment.deleteMany({});
    await VideoInterview.deleteMany({});
    await User.deleteMany({});

    // إنشاء مستخدمين للاختبار
    organizer = await Company.create({
      email: 'company@test.com',
      password: 'password123',
      companyName: 'Test Company',
      userType: 'company'
    });

    participant = await Individual.create({
      email: 'candidate@test.com',
      password: 'password123',
      firstName: 'أحمد',
      lastName: 'محمد',
      userType: 'individual'
    });

    // إنشاء مقابلة فيديو
    videoInterview = await VideoInterview.create({
      roomId: 'test-room-123',
      hostId: organizer._id,
      participants: [
        { userId: participant._id, role: 'participant' }
      ],
      status: 'scheduled'
    });

    // مسح جميع الـ mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await Appointment.deleteMany({});
    await VideoInterview.deleteMany({});
    await User.deleteMany({});
  });

  describe('send24HourReminders', () => {
    test('يجب إرسال تذكير قبل 24 ساعة من المقابلة', async () => {
      // إنشاء موعد بعد 24 ساعة
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in24Hours,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      // تشغيل الخدمة
      const result = await appointmentReminderService.send24HourReminders();

      // التحقق من النتائج
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      // التحقق من إرسال الإشعارات
      expect(notificationService.createNotification).toHaveBeenCalledTimes(2); // للمنظم والمشارك

      // التحقق من تحديث حالة التذكير
      const updatedAppointment = await Appointment.findById(appointment._id);
      expect(updatedAppointment.reminders.reminder24h.sent).toBe(true);
      expect(updatedAppointment.reminders.reminder24h.sentAt).toBeDefined();
    });

    test('يجب عدم إرسال تذكير إذا تم إرساله مسبقاً', async () => {
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in24Hours,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id,
        reminders: {
          reminder24h: {
            sent: true,
            sentAt: new Date()
          }
        }
      });

      const result = await appointmentReminderService.send24HourReminders();

      expect(result.count).toBe(0);
      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });

    test('يجب عدم إرسال تذكير للمواعيد الملغاة', async () => {
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in24Hours,
        duration: 60,
        status: 'cancelled',
        videoInterviewId: videoInterview._id
      });

      const result = await appointmentReminderService.send24HourReminders();

      expect(result.count).toBe(0);
      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });

    test('يجب إرسال تذكير للمشاركين المقبولين فقط', async () => {
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const participant2 = await Individual.create({
        email: 'candidate2@test.com',
        password: 'password123',
        firstName: 'سارة',
        lastName: 'أحمد',
        userType: 'individual'
      });

      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' },
          { userId: participant2._id, status: 'declined' }
        ],
        scheduledAt: in24Hours,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      const result = await appointmentReminderService.send24HourReminders();

      expect(result.count).toBe(1);
      // 2 إشعارات: للمنظم والمشارك المقبول فقط
      expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('send15MinuteReminders', () => {
    test('يجب إرسال تذكير قبل 15 دقيقة من المقابلة', async () => {
      const in15Minutes = new Date(Date.now() + 15 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in15Minutes,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      const result = await appointmentReminderService.send15MinuteReminders();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      expect(notificationService.createNotification).toHaveBeenCalledTimes(2);

      const updatedAppointment = await Appointment.findById(appointment._id);
      expect(updatedAppointment.reminders.reminder15m.sent).toBe(true);
      expect(updatedAppointment.reminders.reminder15m.sentAt).toBeDefined();
    });

    test('يجب تضمين رابط المقابلة في التذكير', async () => {
      const in15Minutes = new Date(Date.now() + 15 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in15Minutes,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      await appointmentReminderService.send15MinuteReminders();

      const calls = notificationService.createNotification.mock.calls;
      
      // التحقق من أن الإشعار يحتوي على رابط المقابلة
      calls.forEach(call => {
        const notification = call[0];
        expect(notification.relatedData.meetingLink).toBeDefined();
        expect(notification.relatedData.canJoinNow).toBe(true);
      });
    });

    test('يجب أن يكون التذكير urgent priority', async () => {
      const in15Minutes = new Date(Date.now() + 15 * 60 * 1000);
      
      appointment = await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        organizerId: organizer._id,
        participants: [
          { userId: participant._id, status: 'accepted' }
        ],
        scheduledAt: in15Minutes,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      await appointmentReminderService.send15MinuteReminders();

      const calls = notificationService.createNotification.mock.calls;
      
      calls.forEach(call => {
        const notification = call[0];
        expect(notification.priority).toBe('urgent');
        expect(notification.type).toBe('interview_reminder_15m');
      });
    });
  });

  describe('runAllReminders', () => {
    test('يجب تشغيل جميع التذكيرات معاً', async () => {
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const in15Minutes = new Date(Date.now() + 15 * 60 * 1000);
      
      // موعد بعد 24 ساعة
      await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة 1',
        organizerId: organizer._id,
        participants: [{ userId: participant._id, status: 'accepted' }],
        scheduledAt: in24Hours,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview._id
      });

      // موعد بعد 15 دقيقة
      const videoInterview2 = await VideoInterview.create({
        roomId: 'test-room-456',
        hostId: organizer._id,
        participants: [{ userId: participant._id, role: 'participant' }],
        status: 'scheduled'
      });

      await Appointment.create({
        type: 'video_interview',
        title: 'مقابلة 2',
        organizerId: organizer._id,
        participants: [{ userId: participant._id, status: 'accepted' }],
        scheduledAt: in15Minutes,
        duration: 60,
        status: 'scheduled',
        videoInterviewId: videoInterview2._id
      });

      const result = await appointmentReminderService.runAllReminders();

      expect(result.success).toBe(true);
      expect(result.reminders24h).toBe(1);
      expect(result.reminders15m).toBe(1);
      
      // 4 إشعارات: 2 للموعد الأول (24h) + 2 للموعد الثاني (15m)
      expect(notificationService.createNotification).toHaveBeenCalledTimes(4);
    });
  });
});
