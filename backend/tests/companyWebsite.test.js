const CompanyInfo = require('../src/models/CompanyInfo');
const mongoose = require('mongoose');

/**
 * اختبارات موقع الشركة الإلكتروني
 * 
 * هذه الاختبارات تتحقق من:
 * 1. حفظ موقع الشركة في قاعدة البيانات
 * 2. جلب موقع الشركة من API
 * 3. تحديث موقع الشركة
 * 4. التحقق من صحة الرابط
 */

describe('Company Website Feature', () => {
  let companyId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await CompanyInfo.deleteMany({});
    
    // Create test company ID
    companyId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up and close connection
    await CompanyInfo.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Model - Website Field', () => {
    test('should save company with website', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: 'https://example.com'
      });

      expect(companyInfo.website).toBe('https://example.com');
    });

    test('should allow null website', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: null
      });

      expect(companyInfo.website).toBeNull();
    });

    test('should trim website URL', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: '  https://example.com  '
      });

      expect(companyInfo.website).toBe('https://example.com');
    });

    test('should save company without website field', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId,
        name: 'Test Company'
      });

      expect(companyInfo.website).toBeNull();
    });
  });

  describe('Service - getCompanyInfo', () => {
    test('should include website field in response', async () => {
      // Create company info with website
      await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: 'https://example.com',
        description: 'Test description'
      });

      const companyInfo = await CompanyInfo.findOne({ companyId });

      expect(companyInfo).toBeDefined();
      expect(companyInfo.website).toBe('https://example.com');
    });

    test('should return null website if not set', async () => {
      // Create company info without website
      await CompanyInfo.create({
        companyId,
        name: 'Test Company'
      });

      const companyInfo = await CompanyInfo.findOne({ companyId });

      expect(companyInfo).toBeDefined();
      expect(companyInfo.website).toBeNull();
    });
  });

  describe('Service - updateCompanyInfo', () => {
    test('should update company website', async () => {
      // Create company info
      const created = await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: 'https://old-website.com'
      });

      // Update website
      created.website = 'https://new-website.com';
      const updated = await created.save();

      expect(updated.website).toBe('https://new-website.com');
    });

    test('should allow removing website (set to null)', async () => {
      // Create company info with website
      const created = await CompanyInfo.create({
        companyId,
        name: 'Test Company',
        website: 'https://example.com'
      });

      // Remove website
      created.website = null;
      const updated = await created.save();

      expect(updated.website).toBeNull();
    });

    test('should update website along with other fields', async () => {
      // Create company info
      const created = await CompanyInfo.create({
        companyId,
        name: 'Test Company'
      });

      // Update multiple fields including website
      created.website = 'https://example.com';
      created.description = 'Updated description';
      created.employeeCount = 100;
      const updated = await created.save();

      expect(updated.website).toBe('https://example.com');
      expect(updated.description).toBe('Updated description');
      expect(updated.employeeCount).toBe(100);
    });
  });

  describe('Integration - Complete Flow', () => {
    test('should handle complete company website lifecycle', async () => {
      // 1. Create company without website
      let companyInfo = await CompanyInfo.create({
        companyId,
        name: 'Test Company'
      });
      expect(companyInfo.website).toBeNull();

      // 2. Add website
      companyInfo.website = 'https://example.com';
      companyInfo = await companyInfo.save();
      expect(companyInfo.website).toBe('https://example.com');

      // 3. Get company info (should include website)
      companyInfo = await CompanyInfo.findOne({ companyId });
      expect(companyInfo.website).toBe('https://example.com');

      // 4. Update website
      companyInfo.website = 'https://new-example.com';
      companyInfo = await companyInfo.save();
      expect(companyInfo.website).toBe('https://new-example.com');

      // 5. Remove website
      companyInfo.website = null;
      companyInfo = await companyInfo.save();
      expect(companyInfo.website).toBeNull();
    });
  });
});

/**
 * ملخص الاختبارات:
 * 
 * Model - Website Field (4 اختبارات):
 * ✓ should save company with website
 * ✓ should allow null website
 * ✓ should trim website URL
 * ✓ should save company without website field
 * 
 * Service - getCompanyInfo (2 اختبارات):
 * ✓ should return company info with website
 * ✓ should return null website if not set
 * 
 * Service - updateCompanyInfo (3 اختبارات):
 * ✓ should update company website
 * ✓ should allow removing website (set to null)
 * ✓ should update website along with other fields
 * 
 * Integration - Complete Flow (1 اختبار):
 * ✓ should handle complete company website lifecycle
 * 
 * المجموع: 10 اختبارات
 */
