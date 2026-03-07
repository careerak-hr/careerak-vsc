const CompanyInfo = require('../src/models/CompanyInfo');
const companyInfoService = require('../src/services/companyInfoService');
const mongoose = require('mongoose');

describe('Company Size Feature', () => {
  let testCompanyId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }
    
    // Create test company ID
    testCompanyId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data
    await CompanyInfo.deleteMany({ companyId: testCompanyId });
    await mongoose.connection.close();
  });

  describe('Company Size Determination', () => {
    test('should classify company with < 50 employees as small', () => {
      expect(companyInfoService.determineCompanySize(10)).toBe('small');
      expect(companyInfoService.determineCompanySize(49)).toBe('small');
    });

    test('should classify company with 50-500 employees as medium', () => {
      expect(companyInfoService.determineCompanySize(50)).toBe('medium');
      expect(companyInfoService.determineCompanySize(250)).toBe('medium');
      expect(companyInfoService.determineCompanySize(500)).toBe('medium');
    });

    test('should classify company with > 500 employees as large', () => {
      expect(companyInfoService.determineCompanySize(501)).toBe('large');
      expect(companyInfoService.determineCompanySize(1000)).toBe('large');
      expect(companyInfoService.determineCompanySize(10000)).toBe('large');
    });
  });

  describe('Company Size in Model', () => {
    test('should have default size as small', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId: testCompanyId,
        name: 'Test Company'
      });

      expect(companyInfo.size).toBe('small');
    });

    test('should only accept valid size values', async () => {
      const validSizes = ['small', 'medium', 'large'];
      
      for (const size of validSizes) {
        const companyInfo = await CompanyInfo.create({
          companyId: new mongoose.Types.ObjectId(),
          name: `Test Company ${size}`,
          size
        });
        
        expect(companyInfo.size).toBe(size);
      }
    });

    test('should reject invalid size values', async () => {
      await expect(
        CompanyInfo.create({
          companyId: new mongoose.Types.ObjectId(),
          name: 'Test Company',
          size: 'invalid'
        })
      ).rejects.toThrow();
    });
  });

  describe('Auto Size Determination on Update', () => {
    test('should auto-determine size when employeeCount is provided', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId: testCompanyId,
        name: 'Test Company'
      });

      // Update with small employee count
      await companyInfoService.updateCompanyInfo(testCompanyId, {
        employeeCount: 30
      });
      
      let updated = await CompanyInfo.findOne({ companyId: testCompanyId });
      expect(updated.size).toBe('small');
      expect(updated.employeeCount).toBe(30);

      // Update with medium employee count
      await companyInfoService.updateCompanyInfo(testCompanyId, {
        employeeCount: 200
      });
      
      updated = await CompanyInfo.findOne({ companyId: testCompanyId });
      expect(updated.size).toBe('medium');
      expect(updated.employeeCount).toBe(200);

      // Update with large employee count
      await companyInfoService.updateCompanyInfo(testCompanyId, {
        employeeCount: 1000
      });
      
      updated = await CompanyInfo.findOne({ companyId: testCompanyId });
      expect(updated.size).toBe('large');
      expect(updated.employeeCount).toBe(1000);
    });
  });

  describe('Company Size Display', () => {
    test('should include size in company info response', async () => {
      const companyInfo = await CompanyInfo.create({
        companyId: testCompanyId,
        name: 'Test Company',
        size: 'medium',
        employeeCount: 150
      });

      const result = await CompanyInfo.findOne({ companyId: testCompanyId });
      
      expect(result.size).toBe('medium');
      expect(result.employeeCount).toBe(150);
    });
  });

  describe('Size Index', () => {
    test('should have index on size field for efficient queries', async () => {
      const indexes = await CompanyInfo.collection.getIndexes();
      const sizeIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'size')
      );
      
      expect(sizeIndex).toBeDefined();
    });
  });
});
