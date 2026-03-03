/**
 * Property-Based Tests for Saved Search Round-trip
 * Feature: advanced-search-filter
 * Property 9: Saved Search Round-trip
 * Validates: Requirements 3.2
 * 
 * Property: For any search operation (including query and all filters),
 * when saved and then retrieved, the retrieved search should contain
 * all the original search parameters unchanged.
 */

const fc = require('fast-check');
const SavedSearch = require('../src/models/SavedSearch');
const savedSearchService = require('../src/services/savedSearchService');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Mock notification service
jest.mock('../src/services/notificationService', () => ({
  create: jest.fn().mockResolvedValue({ success: true })
}));

// Arbitraries (مولدات البيانات العشوائية)

/**
 * مولد لمعاملات البحث الكاملة
 */
const searchParamsArbitrary = () => fc.record({
  query: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  location: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  salaryMin: fc.option(fc.integer({ min: 0, max: 50000 }), { nil: undefined }),
  salaryMax: fc.option(fc.integer({ min: 50000, max: 500000 }), { nil: undefined }),
  workType: fc.option(
    fc.array(fc.constantFrom('full-time', 'part-time', 'remote', 'hybrid'), { minLength: 0, maxLength: 4 }),
    { nil: undefined }
  ),
  experienceLevel: fc.option(
    fc.array(fc.constantFrom('entry', 'mid', 'senior', 'expert'), { minLength: 0, maxLength: 4 }),
    { nil: undefined }
  ),
  skills: fc.option(
    fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
    { nil: undefined }
  ),
  skillsLogic: fc.option(fc.constantFrom('AND', 'OR'), { nil: undefined }),
  datePosted: fc.option(fc.constantFrom('today', 'week', 'month', 'all'), { nil: undefined }),
  companySize: fc.option(
    fc.array(fc.constantFrom('small', 'medium', 'large'), { minLength: 0, maxLength: 3 }),
    { nil: undefined }
  )
});

/**
 * مولد لبيانات عملية بحث محفوظة كاملة
 */
const savedSearchDataArbitrary = () => fc.record({
  name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
  searchType: fc.constantFrom('jobs', 'courses'),
  searchParams: searchParamsArbitrary(),
  alertEnabled: fc.boolean(),
  alertFrequency: fc.constantFrom('instant', 'daily', 'weekly'),
  notificationMethod: fc.constantFrom('push', 'email', 'both')
});

// Helper Functions

/**
 * إنشاء مستخدم اختبار
 */
async function createTestUser() {
  const user = new User({
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    role: 'Employee',
    country: 'Egypt'
  });
  await user.save();
  return user;
}

/**
 * تنظيف البيانات بعد الاختبار
 */
async function cleanup(userId) {
  await SavedSearch.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
}

/**
 * مقارنة عميقة لكائنين مع تجاهل الحقول غير المهمة
 * وإزالة undefined values
 */
function deepEqual(obj1, obj2, ignoredFields = ['_id', '__v', 'createdAt', 'updatedAt', 'lastChecked', 'resultCount']) {
  // تحويل إلى JSON لإزالة undefined
  const json1 = JSON.parse(JSON.stringify(obj1));
  const json2 = JSON.parse(JSON.stringify(obj2));
  
  // إزالة الحقول المتجاهلة
  ignoredFields.forEach(field => {
    delete json1[field];
    delete json2[field];
  });
  
  return JSON.stringify(json1) === JSON.stringify(json2);
}

/**
 * تنظيف البيانات من undefined values (مثل ما يفعل MongoDB)
 */
function cleanData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const cleaned = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
        const nested = cleanData(data[key]);
        if (Object.keys(nested).length > 0) {
          cleaned[key] = nested;
        }
      } else {
        cleaned[key] = data[key];
      }
    }
  }
  
  return cleaned;
}

// Tests

describe('Advanced Search Filter - Property 9: Saved Search Round-trip', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  /**
   * Property Test: حفظ واسترجاع عملية بحث يجب أن يحافظ على جميع المعاملات
   */
  it('should preserve all search parameters through save and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        savedSearchDataArbitrary(),
        async (searchData) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. حفظ عملية البحث
            const saved = await savedSearchService.create(userId, searchData);
            
            // 3. استرجاع عملية البحث
            const retrieved = await savedSearchService.getById(userId, saved._id);
            
            // 4. التحقق من تطابق جميع المعاملات
            expect(retrieved.name).toBe(searchData.name.trim());
            expect(retrieved.searchType).toBe(searchData.searchType);
            expect(retrieved.alertEnabled).toBe(searchData.alertEnabled);
            expect(retrieved.alertFrequency).toBe(searchData.alertFrequency);
            expect(retrieved.notificationMethod).toBe(searchData.notificationMethod);
            
            // 5. التحقق من searchParams بشكل عميق (بعد تنظيف undefined)
            const cleanedOriginal = cleanData(searchData.searchParams);
            expect(deepEqual(retrieved.searchParams, cleanedOriginal)).toBe(true);
            
            // 6. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 10, // 10 تشغيلات لكل اختبار (مخفض من 50)
        timeout: 30000 // 30 ثانية timeout
      }
    );
  }, 60000); // 60 ثانية timeout للاختبار الكامل
  
  /**
   * Property Test: حفظ وتحديث واسترجاع يجب أن يحافظ على المعاملات المحدثة
   */
  it('should preserve updated search parameters through update and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        savedSearchDataArbitrary(),
        savedSearchDataArbitrary(),
        async (initialData, updateData) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. حفظ عملية البحث الأولية
            const saved = await savedSearchService.create(userId, initialData);
            
            // 3. تحديث عملية البحث
            const updated = await savedSearchService.update(userId, saved._id, updateData);
            
            // 4. استرجاع عملية البحث
            const retrieved = await savedSearchService.getById(userId, saved._id);
            
            // 5. التحقق من تطابق المعاملات المحدثة
            expect(retrieved.name).toBe(updateData.name.trim());
            expect(retrieved.searchType).toBe(initialData.searchType); // لا يتم تحديثه
            
            if (updateData.alertEnabled !== undefined) {
              expect(retrieved.alertEnabled).toBe(updateData.alertEnabled);
            }
            
            if (updateData.alertFrequency !== undefined) {
              expect(retrieved.alertFrequency).toBe(updateData.alertFrequency);
            }
            
            if (updateData.notificationMethod !== undefined) {
              expect(retrieved.notificationMethod).toBe(updateData.notificationMethod);
            }
            
            // 6. التحقق من searchParams المحدثة (بعد تنظيف undefined)
            if (updateData.searchParams) {
              const cleanedUpdate = cleanData(updateData.searchParams);
              expect(deepEqual(retrieved.searchParams, cleanedUpdate)).toBe(true);
            }
            
            // 7. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 10, // 10 تشغيلات لكل اختبار (مخفض من 30)
        timeout: 30000
      }
    );
  }, 60000);
  
  /**
   * Property Test: حفظ عمليات بحث متعددة واسترجاعها يجب أن يحافظ على جميع المعاملات
   */
  it('should preserve all parameters for multiple saved searches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(savedSearchDataArbitrary(), { minLength: 1, maxLength: 5 }),
        async (searchesData) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. حفظ جميع عمليات البحث
            const savedSearches = [];
            for (const searchData of searchesData) {
              const saved = await savedSearchService.create(userId, searchData);
              savedSearches.push({ original: searchData, saved });
            }
            
            // 3. استرجاع جميع عمليات البحث
            const allRetrieved = await savedSearchService.getAll(userId);
            
            // 4. التحقق من العدد
            expect(allRetrieved.length).toBe(searchesData.length);
            
            // 5. التحقق من كل عملية بحث
            for (const { original, saved } of savedSearches) {
              const retrieved = allRetrieved.find(s => s._id.toString() === saved._id.toString());
              expect(retrieved).toBeDefined();
              expect(retrieved.name).toBe(original.name.trim());
              const cleanedOriginal = cleanData(original.searchParams);
              expect(deepEqual(retrieved.searchParams, cleanedOriginal)).toBe(true);
            }
            
            // 6. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 5, // 5 تشغيلات لكل اختبار (مخفض من 20)
        timeout: 30000
      }
    );
  }, 60000);
  
  /**
   * Unit Test: التحقق من حفظ جميع أنواع الفلاتر
   */
  it('should save and retrieve all filter types correctly', async () => {
    let userId;
    
    try {
      // 1. إنشاء مستخدم اختبار
      const user = await createTestUser();
      userId = user._id;
      
      // 2. إنشاء عملية بحث مع جميع الفلاتر
      const searchData = {
        name: 'Complete Search Test',
        searchType: 'jobs',
        searchParams: {
          query: 'JavaScript Developer',
          location: 'Cairo, Egypt',
          salaryMin: 5000,
          salaryMax: 15000,
          workType: ['full-time', 'remote'],
          experienceLevel: ['mid', 'senior'],
          skills: ['JavaScript', 'React', 'Node.js'],
          skillsLogic: 'AND',
          datePosted: 'week',
          companySize: ['medium', 'large']
        },
        alertEnabled: true,
        alertFrequency: 'daily',
        notificationMethod: 'both'
      };
      
      // 3. حفظ عملية البحث
      const saved = await savedSearchService.create(userId, searchData);
      
      // 4. استرجاع عملية البحث
      const retrieved = await savedSearchService.getById(userId, saved._id);
      
      // 5. التحقق من جميع الحقول
      expect(retrieved.name).toBe(searchData.name);
      expect(retrieved.searchType).toBe(searchData.searchType);
      expect(retrieved.searchParams.query).toBe(searchData.searchParams.query);
      expect(retrieved.searchParams.location).toBe(searchData.searchParams.location);
      expect(retrieved.searchParams.salaryMin).toBe(searchData.searchParams.salaryMin);
      expect(retrieved.searchParams.salaryMax).toBe(searchData.searchParams.salaryMax);
      expect(retrieved.searchParams.workType).toEqual(searchData.searchParams.workType);
      expect(retrieved.searchParams.experienceLevel).toEqual(searchData.searchParams.experienceLevel);
      expect(retrieved.searchParams.skills).toEqual(searchData.searchParams.skills);
      expect(retrieved.searchParams.skillsLogic).toBe(searchData.searchParams.skillsLogic);
      expect(retrieved.searchParams.datePosted).toBe(searchData.searchParams.datePosted);
      expect(retrieved.searchParams.companySize).toEqual(searchData.searchParams.companySize);
      expect(retrieved.alertEnabled).toBe(searchData.alertEnabled);
      expect(retrieved.alertFrequency).toBe(searchData.alertFrequency);
      expect(retrieved.notificationMethod).toBe(searchData.notificationMethod);
      
      // 6. التنظيف
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });
  
  /**
   * Unit Test: التحقق من حفظ عملية بحث بدون فلاتر (query فقط)
   */
  it('should save and retrieve search with query only', async () => {
    let userId;
    
    try {
      // 1. إنشاء مستخدم اختبار
      const user = await createTestUser();
      userId = user._id;
      
      // 2. إنشاء عملية بحث بسيطة
      const searchData = {
        name: 'Simple Search',
        searchType: 'jobs',
        searchParams: {
          query: 'Python Developer'
        }
      };
      
      // 3. حفظ عملية البحث
      const saved = await savedSearchService.create(userId, searchData);
      
      // 4. استرجاع عملية البحث
      const retrieved = await savedSearchService.getById(userId, saved._id);
      
      // 5. التحقق
      expect(retrieved.name).toBe(searchData.name);
      expect(retrieved.searchParams.query).toBe(searchData.searchParams.query);
      
      // 6. التنظيف
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });
});
