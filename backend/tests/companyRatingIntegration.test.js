const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const CompanyInfo = require('../src/models/CompanyInfo');
const companyInfoService = require('../src/services/companyInfoService');

/**
 * اختبارات تكامل تقييم الشركة
 * 
 * هذه الاختبارات تتحقق من:
 * 1. تحديث تقييم الشركة من نظام التقييمات
 * 2. التحديث التلقائي عند إضافة تقييم جديد
 * 3. حساب المتوسطات بشكل صحيح
 */

describe('Company Rating Integration', () => {
  let companyId;
  let employeeId;
  let jobPostingId;
  let jobApplicationId;

  beforeAll(async () => {
    // Setup test data
    companyId = new mongoose.Types.ObjectId();
    employeeId = new mongoose.Types.ObjectId();
    jobPostingId = new mongoose.Types.ObjectId();
    jobApplicationId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    // Clean up test data
    await Review.deleteMany({ reviewee: companyId });
    await CompanyInfo.deleteMany({ companyId });
  });

  describe('updateCompanyRating', () => {
    test('should calculate average rating from reviews', async () => {
      // Create test reviews
      await Review.create([
        {
          reviewType: 'employee_to_company',
          reviewer: employeeId,
          reviewee: companyId,
          jobPosting: jobPostingId,
          jobApplication: jobApplicationId,
          rating: 4,
          detailedRatings: {
            workEnvironment: 4.5,
            management: 4.0,
            benefits: 3.5,
            careerGrowth: 4.0
          },
          comment: 'شركة جيدة للعمل بها',
          status: 'approved'
        },
        {
          reviewType: 'employee_to_company',
          reviewer: new mongoose.Types.ObjectId(),
          reviewee: companyId,
          jobPosting: jobPostingId,
          jobApplication: new mongoose.Types.ObjectId(),
          rating: 5,
          detailedRatings: {
            workEnvironment: 5.0,
            management: 4.5,
            benefits: 4.5,
            careerGrowth: 5.0
          },
          comment: 'شركة ممتازة جداً',
          status: 'approved'
        }
      ]);

      // Update company rating
      const companyInfo = await companyInfoService.updateCompanyRating(companyId);

      // Assertions
      expect(companyInfo).toBeDefined();
      expect(companyInfo.rating.average).toBe(4.5); // (4 + 5) / 2
      expect(companyInfo.rating.count).toBe(2);
      expect(companyInfo.rating.breakdown.culture).toBeCloseTo(4.8, 1); // (4.5 + 5.0) / 2
      expect(companyInfo.rating.breakdown.management).toBeCloseTo(4.3, 1); // (4.0 + 4.5) / 2
      expect(companyInfo.rating.breakdown.salary).toBeCloseTo(4.0, 1); // (3.5 + 4.5) / 2
      expect(companyInfo.rating.breakdown.workLife).toBeCloseTo(4.5, 1); // (4.0 + 5.0) / 2
    });

    test('should only count approved reviews', async () => {
      // Create test reviews with different statuses
      await Review.create([
        {
          reviewType: 'employee_to_company',
          reviewer: employeeId,
          reviewee: companyId,
          jobPosting: jobPostingId,
          jobApplication: jobApplicationId,
          rating: 4,
          comment: 'شركة جيدة للعمل',
          status: 'approved'
        },
        {
          reviewType: 'employee_to_company',
          reviewer: new mongoose.Types.ObjectId(),
          reviewee: companyId,
          jobPosting: jobPostingId,
          jobApplication: new mongoose.Types.ObjectId(),
          rating: 2,
          comment: 'شركة سيئة جداً',
          status: 'rejected'
        }
      ]);

      // Update company rating
      const companyInfo = await companyInfoService.updateCompanyRating(companyId);

      // Should only count the approved review
      expect(companyInfo.rating.average).toBe(4);
      expect(companyInfo.rating.count).toBe(1);
    });

    test('should handle no reviews gracefully', async () => {
      // Update company rating with no reviews
      const companyInfo = await companyInfoService.updateCompanyRating(companyId);

      // Should set defaults
      expect(companyInfo).toBeDefined();
      expect(companyInfo.rating.average).toBe(0);
      expect(companyInfo.rating.count).toBe(0);
    });

    test('should only count employee_to_company reviews', async () => {
      // Create reviews of different types
      await Review.create([
        {
          reviewType: 'employee_to_company',
          reviewer: employeeId,
          reviewee: companyId,
          jobPosting: jobPostingId,
          jobApplication: jobApplicationId,
          rating: 4,
          comment: 'شركة جيدة للعمل',
          status: 'approved'
        },
        {
          reviewType: 'company_to_employee',
          reviewer: companyId,
          reviewee: employeeId,
          jobPosting: jobPostingId,
          jobApplication: jobApplicationId,
          rating: 5,
          comment: 'موظف ممتاز جداً',
          status: 'approved'
        }
      ]);

      // Update company rating
      const companyInfo = await companyInfoService.updateCompanyRating(companyId);

      // Should only count employee_to_company review
      expect(companyInfo.rating.average).toBe(4);
      expect(companyInfo.rating.count).toBe(1);
    });
  });

  describe('getCompanyInfo', () => {
    test('should auto-update rating if older than 24 hours', async () => {
      // Create company info with old update time
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        rating: {
          average: 0,
          count: 0
        },
        updatedAt: oldDate
      });

      // Create a review
      await Review.create({
        reviewType: 'employee_to_company',
        reviewer: employeeId,
        reviewee: companyId,
        jobPosting: jobPostingId,
        jobApplication: jobApplicationId,
        rating: 4,
        comment: 'شركة جيدة للعمل',
        status: 'approved'
      });

      // Get company info (should trigger auto-update)
      const companyInfo = await companyInfoService.getCompanyInfo(companyId);

      // Rating should be updated
      expect(companyInfo.rating.average).toBe(4);
      expect(companyInfo.rating.count).toBe(1);
    });

    test('should not update rating if updated recently', async () => {
      // Create company info with recent update
      await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        rating: {
          average: 3,
          count: 5
        },
        updatedAt: new Date()
      });

      // Get company info (should NOT trigger update)
      const companyInfo = await companyInfoService.getCompanyInfo(companyId);

      // Rating should remain the same
      expect(companyInfo.rating.average).toBe(3);
      expect(companyInfo.rating.count).toBe(5);
    });
  });

  describe('Review post-save middleware', () => {
    test('should auto-update CompanyInfo when review is saved', async () => {
      // Create a review (triggers post-save middleware)
      const review = await Review.create({
        reviewType: 'employee_to_company',
        reviewer: employeeId,
        reviewee: companyId,
        jobPosting: jobPostingId,
        jobApplication: jobApplicationId,
        rating: 4,
        detailedRatings: {
          workEnvironment: 4.5,
          management: 4.0,
          benefits: 3.5,
          careerGrowth: 4.0
        },
        comment: 'شركة جيدة للعمل',
        status: 'approved'
      });

      // Wait for middleware to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if CompanyInfo was updated
      const companyInfo = await CompanyInfo.findOne({ companyId });
      
      expect(companyInfo).toBeDefined();
      expect(companyInfo.rating.average).toBe(4);
      expect(companyInfo.rating.count).toBe(1);
    });
  });
});

/**
 * تشغيل الاختبارات:
 * npm test -- companyRatingIntegration.test.js
 * 
 * النتيجة المتوقعة:
 * ✓ should calculate average rating from reviews
 * ✓ should only count approved reviews
 * ✓ should handle no reviews gracefully
 * ✓ should only count employee_to_company reviews
 * ✓ should auto-update rating if older than 24 hours
 * ✓ should not update rating if updated recently
 * ✓ should auto-update CompanyInfo when review is saved
 * 
 * 7 passing
 */
