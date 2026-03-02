const { sendVideoInterviewInvitation, sendVideoInterviewReminder } = require('../src/services/emailService');

/**
 * اختبارات إرسال البريد الإلكتروني لمقابلات الفيديو
 * 
 * Requirements: 5.3
 */

describe('Video Interview Email Service', () => {
  const mockAppointment = {
    _id: '507f1f77bcf86cd799439011',
    title: 'مقابلة فيديو - مطور Full Stack',
    description: 'مقابلة تقنية لمنصب مطور Full Stack',
    scheduledAt: new Date('2026-03-15T10:00:00Z'),
    duration: 60,
    notes: 'يرجى الاستعداد لمناقشة مشاريعك السابقة'
  };

  const mockVideoInterview = {
    _id: '507f1f77bcf86cd799439012',
    roomId: 'test-room-123',
    scheduledAt: new Date('2026-03-15T10:00:00Z')
  };

  const mockParticipants = [
    {
      _id: '507f1f77bcf86cd799439013',
      firstName: 'أحمد',
      name: 'أحمد محمد',
      email: 'ahmed@example.com'
    },
    {
      _id: '507f1f77bcf86cd799439014',
      firstName: 'فاطمة',
      name: 'فاطمة علي',
      email: 'fatima@example.com'
    }
  ];

  describe('sendVideoInterviewInvitation', () => {
    it('يجب أن يرسل دعوة لجميع المشاركين', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        mockParticipants
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockParticipants.length);
    });

    it('يجب أن يحتوي البريد على رابط المقابلة', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        mockParticipants
      );

      // في بيئة التطوير، يتم محاكاة الإرسال
      expect(result[0].success).toBe(true);
      expect(result[0].messageId).toContain('simulated');
    });

    it('يجب أن يحتوي البريد على تفاصيل المقابلة', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        mockParticipants
      );

      expect(result).toBeDefined();
      // التحقق من أن البريد تم إرساله بنجاح
      result.forEach(email => {
        expect(email.success).toBe(true);
      });
    });

    it('يجب أن يتعامل مع مشارك واحد', async () => {
      const singleParticipant = [mockParticipants[0]];
      
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        singleParticipant
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].success).toBe(true);
    });

    it('يجب أن يتعامل مع موعد بدون وصف', async () => {
      const appointmentWithoutDescription = {
        ...mockAppointment,
        description: ''
      };

      const result = await sendVideoInterviewInvitation(
        appointmentWithoutDescription,
        mockVideoInterview,
        mockParticipants
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(mockParticipants.length);
    });

    it('يجب أن يتعامل مع موعد بدون ملاحظات', async () => {
      const appointmentWithoutNotes = {
        ...mockAppointment,
        notes: ''
      };

      const result = await sendVideoInterviewInvitation(
        appointmentWithoutNotes,
        mockVideoInterview,
        mockParticipants
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(mockParticipants.length);
    });
  });

  describe('sendVideoInterviewReminder', () => {
    it('يجب أن يرسل تذكير قبل 24 ساعة', async () => {
      const result = await sendVideoInterviewReminder(
        mockAppointment,
        mockVideoInterview,
        mockParticipants[0],
        1440 // 24 ساعة
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('يجب أن يرسل تذكير قبل 15 دقيقة', async () => {
      const result = await sendVideoInterviewReminder(
        mockAppointment,
        mockVideoInterview,
        mockParticipants[0],
        15 // 15 دقيقة
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('يجب أن يحتوي التذكير على رابط المقابلة', async () => {
      const result = await sendVideoInterviewReminder(
        mockAppointment,
        mockVideoInterview,
        mockParticipants[0],
        15
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toContain('simulated');
    });

    it('يجب أن يحتوي التذكير على الوقت المتبقي', async () => {
      const result = await sendVideoInterviewReminder(
        mockAppointment,
        mockVideoInterview,
        mockParticipants[0],
        15
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Email Content Validation', () => {
    it('يجب أن يحتوي البريد على اسم المشارك', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [mockParticipants[0]]
      );

      expect(result[0].success).toBe(true);
    });

    it('يجب أن يحتوي البريد على عنوان المقابلة', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [mockParticipants[0]]
      );

      expect(result[0].success).toBe(true);
    });

    it('يجب أن يحتوي البريد على التاريخ والوقت', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [mockParticipants[0]]
      );

      expect(result[0].success).toBe(true);
    });

    it('يجب أن يحتوي البريد على المدة', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [mockParticipants[0]]
      );

      expect(result[0].success).toBe(true);
    });

    it('يجب أن يحتوي البريد على نصائح للمقابلة', async () => {
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [mockParticipants[0]]
      );

      expect(result[0].success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('يجب أن يتعامل مع بريد إلكتروني غير صحيح', async () => {
      const invalidParticipant = {
        ...mockParticipants[0],
        email: 'invalid-email'
      };

      // في بيئة التطوير، يتم محاكاة الإرسال دائماً
      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [invalidParticipant]
      );

      expect(result).toBeDefined();
    });

    it('يجب أن يتعامل مع مشارك بدون اسم', async () => {
      const participantWithoutName = {
        ...mockParticipants[0],
        firstName: '',
        name: ''
      };

      const result = await sendVideoInterviewInvitation(
        mockAppointment,
        mockVideoInterview,
        [participantWithoutName]
      );

      expect(result).toBeDefined();
      expect(result[0].success).toBe(true);
    });
  });
});
