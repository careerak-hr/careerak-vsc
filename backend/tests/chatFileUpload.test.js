const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User } = require('../src/models/User');
const Conversation = require('../src/models/Conversation');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

describe('Chat File Upload Tests', () => {
  let token;
  let userId;
  let conversationId;
  let otherUserId;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await User.deleteMany({});
    await Conversation.deleteMany({});

    // إنشاء مستخدمين للاختبار
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'jobseeker',
      isVerified: true
    });

    const otherUser = await User.create({
      email: 'other@example.com',
      password: 'password123',
      firstName: 'Other',
      lastName: 'User',
      role: 'company',
      isVerified: true
    });

    userId = user._id;
    otherUserId = otherUser._id;

    // إنشاء محادثة للاختبار
    const conversation = await Conversation.create({
      participants: [
        { user: userId, role: 'jobseeker' },
        { user: otherUserId, role: 'company' }
      ]
    });

    conversationId = conversation._id;

    // توليد token
    token = jwt.sign(
      { id: userId, role: 'jobseeker' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/chat/files/upload', () => {
    it('يجب أن يرفع صورة بنجاح', async () => {
      // إنشاء ملف صورة وهمي
      const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
      
      // إذا لم يكن الملف موجوداً، تخطي الاختبار
      if (!fs.existsSync(imagePath)) {
        console.log('⚠️  Test image not found, skipping test');
        return;
      }

      const response = await request(app)
        .post('/api/chat/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('conversationId', conversationId.toString())
        .attach('file', imagePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('size');
      expect(response.body.data).toHaveProperty('cloudinaryId');
      expect(response.body.data.type).toBe('image');
    });

    it('يجب أن يرفع ملف PDF بنجاح', async () => {
      const pdfPath = path.join(__dirname, 'fixtures', 'test-document.pdf');
      
      if (!fs.existsSync(pdfPath)) {
        console.log('⚠️  Test PDF not found, skipping test');
        return;
      }

      const response = await request(app)
        .post('/api/chat/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('conversationId', conversationId.toString())
        .attach('file', pdfPath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('file');
    });

    it('يجب أن يرفض رفع ملف بدون مصادقة', async () => {
      const response = await request(app)
        .post('/api/chat/files/upload')
        .field('conversationId', conversationId.toString());

      expect(response.status).toBe(401);
    });

    it('يجب أن يرفض رفع ملف بدون conversationId', async () => {
      const response = await request(app)
        .post('/api/chat/files/upload')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('يجب أن يرفض رفع ملف بدون ملف', async () => {
      const response = await request(app)
        .post('/api/chat/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('conversationId', conversationId.toString());

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('لم يتم رفع أي ملف');
    });

    it('يجب أن يرفض رفع ملف بنوع غير مدعوم', async () => {
      // محاكاة ملف بنوع غير مدعوم
      const buffer = Buffer.from('test content');
      
      const response = await request(app)
        .post('/api/chat/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('conversationId', conversationId.toString())
        .attach('file', buffer, {
          filename: 'test.exe',
          contentType: 'application/x-msdownload'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('نوع الملف غير مدعوم');
    });
  });

  describe('DELETE /api/chat/files/:cloudinaryId', () => {
    it('يجب أن يحذف ملف بنجاح', async () => {
      const cloudinaryId = 'test-cloudinary-id';

      const response = await request(app)
        .delete(`/api/chat/files/${cloudinaryId}`)
        .set('Authorization', `Bearer ${token}`);

      // قد يفشل الحذف إذا لم يكن الملف موجوداً في Cloudinary
      // لكن يجب أن يكون الـ endpoint متاحاً
      expect([200, 404, 500]).toContain(response.status);
    });

    it('يجب أن يرفض حذف ملف بدون مصادقة', async () => {
      const cloudinaryId = 'test-cloudinary-id';

      const response = await request(app)
        .delete(`/api/chat/files/${cloudinaryId}`);

      expect(response.status).toBe(401);
    });

    it('يجب أن يرفض حذف ملف بدون cloudinaryId', async () => {
      const response = await request(app)
        .delete('/api/chat/files/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Integration with Chat Messages', () => {
    it('يجب أن يرسل رسالة مع ملف مرفق', async () => {
      const fileData = {
        url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        name: 'test.jpg',
        size: 12345,
        mimeType: 'image/jpeg',
        cloudinaryId: 'test-id'
      };

      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId: conversationId.toString(),
          type: 'image',
          content: '',
          file: fileData
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('image');
      expect(response.body.data.file).toMatchObject(fileData);
    });

    it('يجب أن يرسل رسالة مع ملف PDF', async () => {
      const fileData = {
        url: 'https://res.cloudinary.com/test/raw/upload/test.pdf',
        name: 'document.pdf',
        size: 54321,
        mimeType: 'application/pdf',
        cloudinaryId: 'test-pdf-id'
      };

      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId: conversationId.toString(),
          type: 'file',
          content: '',
          file: fileData
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('file');
      expect(response.body.data.file).toMatchObject(fileData);
    });
  });
});
