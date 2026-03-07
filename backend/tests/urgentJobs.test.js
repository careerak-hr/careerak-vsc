/**
 * اختبارات لميزة badge "عاجل" للوظائف
 */

const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');

describe('Urgent Jobs Badge Feature', () => {
  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await JobPosting.deleteMany({ title: /Test Urgent Job/ });
    await mongoose.connection.close();
  });

  describe('isUrgent Field', () => {
    it('should have isUrgent field with default value false', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 1',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId()
      });

      expect(job.isUrgent).toBe(false);
    });

    it('should have expiryDate field', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 2',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      });

      expect(job.expiryDate).toBeDefined();
      expect(job.expiryDate).toBeInstanceOf(Date);
    });
  });

  describe('isUrgent Calculation', () => {
    it('should set isUrgent to true when expiry is within 7 days', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 3',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(true);
    });

    it('should set isUrgent to true when expiry is exactly 7 days', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 4',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(true);
    });

    it('should set isUrgent to false when expiry is more than 7 days', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 5',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(false);
    });

    it('should set isUrgent to false when job is expired', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 6',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });

      await job.save();
      expect(job.isUrgent).toBe(false);
    });

    it('should set isUrgent to false when no expiryDate is provided', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 7',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId()
      });

      await job.save();
      expect(job.isUrgent).toBe(false);
    });
  });

  describe('isUrgent Update on Save', () => {
    it('should update isUrgent when expiryDate changes', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 8',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(false);

      // تحديث تاريخ الانتهاء إلى 5 أيام
      job.expiryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      await job.save();
      expect(job.isUrgent).toBe(true);
    });

    it('should update isUrgent from true to false when expiryDate is extended', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 9',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(true);

      // تمديد تاريخ الانتهاء إلى 15 يوم
      job.expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      await job.save();
      expect(job.isUrgent).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle expiryDate at exactly 1 day (should be urgent)', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 10',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
      });

      await job.save();
      expect(job.isUrgent).toBe(true);
    });

    it('should handle expiryDate at exactly 8 days (should not be urgent)', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 11',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(false);
    });

    it('should handle expiryDate with hours (5 days and 12 hours)', async () => {
      const job = new JobPosting({
        title: 'Test Urgent Job 12',
        description: 'Test description',
        requirements: 'Test requirements',
        postedBy: new mongoose.Types.ObjectId(),
        expiryDate: new Date(Date.now() + 5.5 * 24 * 60 * 60 * 1000) // 5.5 days from now
      });

      await job.save();
      expect(job.isUrgent).toBe(true);
    });
  });
});
