/**
 * اختبارات إشعار الطرف الآخر عند إلغاء أو تعديل موعد
 * 
 * Validates: Requirements 4.3 - إشعار تلقائي للطرف الآخر
 * User Story 4: إلغاء وتعديل المواعيد
 */

const notificationService = require('../src/services/notificationService');

// Mock notificationService
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
}));

// Mock pusherService
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue({}),
}));

// Mock Appointment model
jest.mock('../src/models/Appointment', () => {
  const mockAppointment = {
    _id: 'appt-123',
    title: 'مقابلة عمل',
    organizerId: { toString: () => 'organizer-id' },
    participants: [
      { userId: { toString: () => 'participant-id' } },
    ],
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // بعد 3 ساعات
    duration: 60,
    status: 'scheduled',
    rescheduleHistory: [],
    cancel: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
  };

  const MockAppointment = jest.fn().mockImplementation(() => mockAppointment);
  MockAppointment.findById = jest.fn().mockResolvedValue(mockAppointment);
  MockAppointment.findOne = jest.fn().mockResolvedValue(null);

  return MockAppointment;
});

// Mock logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const appointmentService = require('../src/services/appointmentService');

describe('إشعار الطرف الآخر عند الإلغاء', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('عند إلغاء المنظم (الشركة) → يُرسل إشعار للمشارك (الباحث)', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      cancel: jest.fn().mockResolvedValue(true),
    };
    Appointment.findById.mockResolvedValue(mockAppt);

    await appointmentService.cancelAppointment('appt-123', 'organizer-id', 'سبب الإلغاء');

    // يجب أن يُرسل إشعار للمشارك (الطرف الآخر)
    const calls = notificationService.createNotification.mock.calls;
    const participantNotification = calls.find(
      call => call[0].recipient.toString() === 'participant-id'
    );
    expect(participantNotification).toBeDefined();
    expect(participantNotification[0].type).toBe('appointment_cancelled');
  });

  it('عند إلغاء المشارك (الباحث) → يُرسل إشعار للمنظم (الشركة)', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      cancel: jest.fn().mockResolvedValue(true),
    };
    Appointment.findById.mockResolvedValue(mockAppt);

    await appointmentService.cancelAppointment('appt-123', 'participant-id', 'لا أستطيع الحضور');

    // يجب أن يُرسل إشعار للمنظم (الطرف الآخر)
    const calls = notificationService.createNotification.mock.calls;
    const organizerNotification = calls.find(
      call => call[0].recipient.toString() === 'organizer-id'
    );
    expect(organizerNotification).toBeDefined();
    expect(organizerNotification[0].type).toBe('appointment_cancelled');
  });

  it('يجب أن يحتوي الإشعار على سبب الإلغاء', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      cancel: jest.fn().mockResolvedValue(true),
    };
    Appointment.findById.mockResolvedValue(mockAppt);

    const reason = 'ظروف طارئة';
    await appointmentService.cancelAppointment('appt-123', 'organizer-id', reason);

    const calls = notificationService.createNotification.mock.calls;
    const notification = calls.find(call => call[0].type === 'appointment_cancelled');
    expect(notification).toBeDefined();
    expect(notification[0].relatedData.reason).toBe(reason);
  });

  it('يجب رفض الإلغاء إذا كان الموعد أقل من ساعة', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // بعد 30 دقيقة فقط
      duration: 60,
      status: 'scheduled',
      cancel: jest.fn(),
    };
    Appointment.findById.mockResolvedValue(mockAppt);

    await expect(
      appointmentService.cancelAppointment('appt-123', 'organizer-id', '')
    ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });

    // لا يجب إرسال أي إشعار
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });
});

describe('إشعار الطرف الآخر عند إعادة الجدولة', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('عند إعادة جدولة المنظم → يُرسل إشعار للمشاركين', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // بعد يومين
      duration: 60,
      status: 'scheduled',
      rescheduleHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    const mockNewAppt = {
      _id: 'new-appt-456',
      scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      duration: 60,
      rescheduleHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Appointment.findById.mockResolvedValue(mockAppt);
    Appointment.findOne.mockResolvedValue(null); // لا تعارض
    Appointment.mockImplementation(() => mockNewAppt);

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await appointmentService.rescheduleAppointment('appt-123', 'organizer-id', newDateTime, 'تغيير الجدول');

    // يجب أن يُرسل إشعار للمشارك (الطرف الآخر)
    const calls = notificationService.createNotification.mock.calls;
    const participantNotification = calls.find(
      call => call[0].recipient.toString() === 'participant-id' &&
              call[0].type === 'appointment_rescheduled'
    );
    expect(participantNotification).toBeDefined();
  });

  it('نوع الإشعار يجب أن يكون appointment_rescheduled', async () => {
    const Appointment = require('../src/models/Appointment');
    const mockAppt = {
      _id: 'appt-123',
      title: 'مقابلة عمل',
      organizerId: { toString: () => 'organizer-id' },
      participants: [
        { userId: { toString: () => 'participant-id' } },
      ],
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      rescheduleHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    const mockNewAppt = {
      _id: 'new-appt-456',
      scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      duration: 60,
      rescheduleHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    Appointment.findById.mockResolvedValue(mockAppt);
    Appointment.findOne.mockResolvedValue(null);
    Appointment.mockImplementation(() => mockNewAppt);

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await appointmentService.rescheduleAppointment('appt-123', 'organizer-id', newDateTime);

    const calls = notificationService.createNotification.mock.calls;
    const rescheduleNotifications = calls.filter(call => call[0].type === 'appointment_rescheduled');
    expect(rescheduleNotifications.length).toBeGreaterThan(0);
  });
});
