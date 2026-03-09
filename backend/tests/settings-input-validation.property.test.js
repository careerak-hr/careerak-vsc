/**
 * Property-Based Tests for Settings Input Validation
 * Feature: settings-page-enhancements
 * Property 2: Input Validation Rejection
 * Validates: Requirements 2.1, 2.3, 2.5, 5.2
 * 
 * Property: For any invalid input (empty name, invalid email format, oversized image,
 * weak password), the system should reject it and return a specific error message.
 */

const fc = require('fast-check');
const settingsService = require('../src/services/settingsService');
const UserSettings = require('../src/models/UserSettings');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Mock Cloudinary
jest.mock('../src/config/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg'
  })
}));

// ==================== Arbitraries (مولدات البيانات العشوائية) ====================

/**
 * مولد لأسماء فارغة أو تحتوي على مسافات فقط
 */
const emptyOrWhitespaceNameArbitrary = () => fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.constant('\t'),
  fc.constant('\n'),
  fc.constant('  \t  \n  ')
);

/**
 * مولد لأسماء طويلة جداً (> 100 حرف)
 */
const tooLongNameArbitrary = () => fc.string({ minLength: 101, maxLength: 200 });

/**
 * مولد لأرقام هواتف غير صحيحة
 */
const invalidPhoneArbitrary = () => fc.oneof(
  fc.constant('123'),                    // قصير جداً
  fc.constant('abc123456789'),           // يحتوي على حروف
  fc.constant('12345678901234567890'),   // طويل جداً (> 15 رقم)
  fc.constant('+20-123-456-789'),        // يحتوي على شرطات
  fc.constant('(02) 1234567'),           // يحتوي على أقواس ومسافات
  fc.constant(''),                       // فارغ
  fc.constant('   ')                     // مسافات فقط
);

/**
 * مولد لصور كبيرة جداً (> 5MB)
 */
const oversizedImageArbitrary = () => {
  const size = 6 * 1024 * 1024; // 6MB
  return fc.constant(Buffer.alloc(size, 'a'));
};

/**
 * مولد للغات غير مدعومة
 */
const invalidLanguageArbitrary = () => fc.oneof(
  fc.constant('es'),
  fc.constant('de'),
  fc.constant('it'),
  fc.constant('zh'),
  fc.constant('invalid'),
  fc.constant(''),
  fc.constant('arabic')
);

/**
 * مولد لقيم رؤية الملف الشخصي غير صحيحة
 */
const invalidProfileVisibilityArbitrary = () => fc.oneof(
  fc.constant('public'),
  fc.constant('private'),
  fc.constant('friends'),
  fc.constant(''),
  fc.constant('invalid'),
  fc.constant(123),
  fc.constant(null)
);

/**
 * مولد لقيم أذونات الرسائل غير صحيحة
 */
const invalidMessagePermissionsArbitrary = () => fc.oneof(
  fc.constant('all'),
  fc.constant('friends'),
  fc.constant('nobody'),
  fc.constant(''),
  fc.constant('invalid'),
  fc.constant(true),
  fc.constant(null)
);

/**
 * مولد لقيم منطقية غير صحيحة (ليست boolean)
 */
const invalidBooleanArbitrary = () => fc.oneof(
  fc.constant('true'),
  fc.constant('false'),
  fc.constant(1),
  fc.constant(0),
  fc.constant('yes'),
  fc.constant('no'),
  fc.constant(null),
  fc.constant(undefined)
);

/**
 * مولد لقيم تكرار الإشعارات غير صحيحة
 */
const invalidFrequencyArbitrary = () => fc.oneof(
  fc.constant('hourly'),
  fc.constant('monthly'),
  fc.constant('realtime'),
  fc.constant(''),
  fc.constant('invalid'),
  fc.constant(123),
  fc.constant(null)
);

/**
 * مولد لصيغ وقت غير صحيحة
 */
const invalidTimeFormatArbitrary = () => fc.oneof(
  fc.constant('25:00'),           // ساعة غير صحيحة
  fc.constant('12:60'),           // دقيقة غير صحيحة
  fc.constant('1:30'),            // بدون صفر بادئ
  fc.constant('12:5'),            // بدون صفر بادئ للدقائق
  fc.constant('12:30:00'),        // يحتوي على ثواني
  fc.constant('12-30'),           // فاصل خاطئ
  fc.constant('12.30'),           // فاصل خاطئ
  fc.constant('noon'),            // نص
  fc.constant(''),                // فارغ
  fc.constant('invalid')
);

/**
 * مولد لكلمات مرور ضعيفة (لا تلبي المتطلبات)
 */
const weakPasswordArbitrary = () => fc.oneof(
  fc.constant('short'),                    // قصيرة جداً (< 8 أحرف)
  fc.constant('alllowercase'),             // حروف صغيرة فقط
  fc.constant('ALLUPPERCASE'),             // حروف كبيرة فقط
  fc.constant('NoNumbers'),                // بدون أرقام
  fc.constant('NoSpecial123'),             // بدون أحرف خاصة
  fc.constant('12345678'),                 // أرقام فقط
  fc.constant('!@#$%^&*'),                 // أحرف خاصة فقط
  fc.constant(''),                         // فارغة
  fc.constant('   ')                       // مسافات فقط
);

// ==================== Helper Functions ====================

/**
 * إنشاء مستخدم اختبار
 */
async function createTestUser(userType = 'Employee') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const userData = {
    email: `test${timestamp}${random}@example.com`,
    password: 'Test@123456',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    country: 'Egypt',
    role: userType,
    userType
  };

  if (userType === 'Employee') {
    userData.firstName = 'Test';
    userData.lastName = 'User';
  } else if (userType === 'HR') {
    userData.companyName = 'Test Company';
  }

  const user = new User(userData);
  await user.save();
  return user;
}

/**
 * تنظيف البيانات بعد الاختبار
 */
async function cleanup(userId) {
  await UserSettings.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
}

// ==================== Tests ====================

describe('Settings Page Enhancements - Property 2: Input Validation Rejection', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ==================== Profile Updates Validation ====================

  /**
   * Property Test: رفض الأسماء الفارغة أو التي تحتوي على مسافات فقط
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject empty or whitespace-only names with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        emptyOrWhitespaceNameArbitrary(),
        async (invalidName) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. محاولة تحديث الاسم بقيمة غير صحيحة
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateProfile(userId, { name: invalidName });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            // 3. التحقق من رفض القيمة مع رسالة خطأ محددة
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain('الاسم');
            expect(errorMessage.toLowerCase()).toMatch(/فارغ|empty/i);
            
            // 4. التنظيف
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض الأسماء الطويلة جداً (> 100 حرف)
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject names longer than 100 characters with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        tooLongNameArbitrary(),
        async (longName) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateProfile(userId, { name: longName });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain('الاسم');
            expect(errorMessage.toLowerCase()).toMatch(/طويل|long|100/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض أرقام الهواتف غير الصحيحة
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject invalid phone numbers with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidPhoneArbitrary(),
        async (invalidPhone) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateProfile(userId, { phone: invalidPhone });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain('الهاتف');
            expect(errorMessage.toLowerCase()).toMatch(/صيغة|format|invalid/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض الصور الكبيرة جداً (> 5MB)
   * Validates: Requirements 2.3, 2.5
   */
  it('should reject oversized images (> 5MB) with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        oversizedImageArbitrary(),
        async (oversizedImage) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateProfile(userId, { photoBuffer: oversizedImage });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain('الصورة');
            expect(errorMessage.toLowerCase()).toMatch(/كبير|size|5mb/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض اللغات غير المدعومة
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject unsupported languages with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidLanguageArbitrary(),
        async (invalidLanguage) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateProfile(userId, { language: invalidLanguage });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain('اللغة');
            expect(errorMessage.toLowerCase()).toMatch(/مدعوم|supported|ar.*en.*fr/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  // ==================== Privacy Settings Validation ====================

  /**
   * Property Test: رفض قيم رؤية الملف الشخصي غير الصحيحة
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject invalid profile visibility values with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidProfileVisibilityArbitrary(),
        async (invalidVisibility) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updatePrivacySettings(userId, { 
                profileVisibility: invalidVisibility 
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage.toLowerCase()).toMatch(/رؤية|visibility|profile/i);
            expect(errorMessage.toLowerCase()).toMatch(/صحيح|invalid|correct/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض قيم أذونات الرسائل غير الصحيحة
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject invalid message permissions values with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidMessagePermissionsArbitrary(),
        async (invalidPermissions) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updatePrivacySettings(userId, { 
                messagePermissions: invalidPermissions 
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage.toLowerCase()).toMatch(/رسائل|message|permissions/i);
            expect(errorMessage.toLowerCase()).toMatch(/صحيح|invalid|correct/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض القيم المنطقية غير الصحيحة في إعدادات الخصوصية
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject non-boolean values for privacy boolean fields with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('showEmail', 'showPhone', 'showOnlineStatus', 'allowSearchEngineIndexing'),
        invalidBooleanArbitrary(),
        async (field, invalidBoolean) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updatePrivacySettings(userId, { 
                [field]: invalidBoolean 
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain(field);
            expect(errorMessage.toLowerCase()).toMatch(/منطقية|boolean|true.*false/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  // ==================== Notification Preferences Validation ====================

  /**
   * Property Test: رفض قيم تكرار الإشعارات غير الصحيحة
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject invalid notification frequency values with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidFrequencyArbitrary(),
        async (invalidFrequency) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateNotificationPreferences(userId, { 
                frequency: invalidFrequency 
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage.toLowerCase()).toMatch(/تكرار|frequency|notification/i);
            expect(errorMessage.toLowerCase()).toMatch(/صحيح|invalid|correct/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض صيغ الوقت غير الصحيحة في ساعات الهدوء
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject invalid time formats in quiet hours with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('start', 'end'),
        invalidTimeFormatArbitrary(),
        async (field, invalidTime) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateNotificationPreferences(userId, { 
                quietHours: { [field]: invalidTime }
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage.toLowerCase()).toMatch(/وقت|time|صيغة|format/i);
            expect(errorMessage.toLowerCase()).toMatch(/hh:mm|صحيح|correct/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  /**
   * Property Test: رفض القيم المنطقية غير الصحيحة في إعدادات الإشعارات
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject non-boolean values for notification boolean fields with specific error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('job', 'course', 'chat', 'review', 'system'),
        fc.constantFrom('enabled', 'inApp', 'email', 'push'),
        invalidBooleanArbitrary(),
        async (notificationType, field, invalidBoolean) => {
          let userId;
          
          try {
            const user = await createTestUser();
            userId = user._id;
            
            let errorThrown = false;
            let errorMessage = '';
            
            try {
              await settingsService.updateNotificationPreferences(userId, { 
                [notificationType]: { [field]: invalidBoolean }
              });
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toContain(notificationType);
            expect(errorMessage).toContain(field);
            expect(errorMessage.toLowerCase()).toMatch(/منطقية|boolean|true.*false/i);
            
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
        numRuns: 100,
        timeout: 30000
      }
    );
  }, 120000);

  // ==================== Unit Tests for Specific Cases ====================

  /**
   * Unit Test: رفض صورة ليست من نوع Buffer
   * Validates: Requirements 2.3, 2.5
   */
  it('should reject non-Buffer photo with specific error', async () => {
    let userId;
    
    try {
      const user = await createTestUser();
      userId = user._id;
      
      let errorThrown = false;
      let errorMessage = '';
      
      try {
        await settingsService.updateProfile(userId, { 
          photoBuffer: 'not a buffer' 
        });
      } catch (error) {
        errorThrown = true;
        errorMessage = error.message;
      }
      
      expect(errorThrown).toBe(true);
      expect(errorMessage).toContain('الصورة');
      expect(errorMessage.toLowerCase()).toMatch(/buffer/i);
      
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });

  /**
   * Unit Test: رفض رقم هاتف مكرر
   * Validates: Requirements 2.1, 2.5
   */
  it('should reject duplicate phone number with specific error', async () => {
    let userId1, userId2;
    
    try {
      // إنشاء مستخدمين
      const user1 = await createTestUser();
      userId1 = user1._id;
      
      const user2 = await createTestUser();
      userId2 = user2._id;
      
      // تحديث رقم هاتف المستخدم الأول
      const phone = '+201999999999';
      await settingsService.updateProfile(userId1, { phone });
      
      // محاولة استخدام نفس الرقم للمستخدم الثاني
      let errorThrown = false;
      let errorMessage = '';
      
      try {
        await settingsService.updateProfile(userId2, { phone });
      } catch (error) {
        errorThrown = true;
        errorMessage = error.message;
      }
      
      expect(errorThrown).toBe(true);
      expect(errorMessage).toContain('الهاتف');
      expect(errorMessage.toLowerCase()).toMatch(/مستخدم|used|already/i);
      
      await cleanup(userId1);
      await cleanup(userId2);
    } catch (error) {
      if (userId1) await cleanup(userId1);
      if (userId2) await cleanup(userId2);
      throw error;
    }
  });

  /**
   * Unit Test: رفض جميع أنواع المدخلات غير الصحيحة معاً
   * Validates: Requirements 2.1, 2.3, 2.5
   */
  it('should reject multiple invalid inputs with specific errors', async () => {
    let userId;
    
    try {
      const user = await createTestUser();
      userId = user._id;
      
      // اختبار اسم فارغ
      await expect(
        settingsService.updateProfile(userId, { name: '' })
      ).rejects.toThrow(/الاسم.*فارغ/i);
      
      // اختبار رقم هاتف غير صحيح
      await expect(
        settingsService.updateProfile(userId, { phone: 'invalid' })
      ).rejects.toThrow(/الهاتف.*صيغة/i);
      
      // اختبار لغة غير مدعومة
      await expect(
        settingsService.updateProfile(userId, { language: 'invalid' })
      ).rejects.toThrow(/اللغة.*مدعوم/i);
      
      // اختبار رؤية ملف شخصي غير صحيحة
      await expect(
        settingsService.updatePrivacySettings(userId, { profileVisibility: 'invalid' })
      ).rejects.toThrow(/رؤية.*صحيح/i);
      
      // اختبار تكرار إشعارات غير صحيح
      await expect(
        settingsService.updateNotificationPreferences(userId, { frequency: 'invalid' })
      ).rejects.toThrow(/تكرار.*صحيح/i);
      
      // اختبار صيغة وقت غير صحيحة
      await expect(
        settingsService.updateNotificationPreferences(userId, { 
          quietHours: { start: '25:00' }
        })
      ).rejects.toThrow(/وقت.*صيغة/i);
      
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });

  /**
   * Unit Test: التحقق من أن المدخلات الصحيحة تُقبل
   * Validates: Requirements 2.1, 2.2
   */
  it('should accept valid inputs without errors', async () => {
    let userId;
    
    try {
      const user = await createTestUser();
      userId = user._id;
      
      // تحديثات صحيحة للملف الشخصي
      await expect(
        settingsService.updateProfile(userId, {
          phone: '+201234567890',
          country: 'Egypt',
          city: 'Cairo',
          language: 'ar',
          timezone: 'Africa/Cairo'
        })
      ).resolves.toBeDefined();
      
      // إعدادات خصوصية صحيحة
      await expect(
        settingsService.updatePrivacySettings(userId, {
          profileVisibility: 'everyone',
          showEmail: true,
          showPhone: false,
          messagePermissions: 'contacts',
          showOnlineStatus: true,
          allowSearchEngineIndexing: false
        })
      ).resolves.toBeDefined();
      
      // تفضيلات إشعارات صحيحة
      await expect(
        settingsService.updateNotificationPreferences(userId, {
          job: { enabled: true, inApp: true, email: false, push: false },
          quietHours: { enabled: true, start: '22:00', end: '08:00' },
          frequency: 'daily'
        })
      ).resolves.toBeDefined();
      
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });
});
