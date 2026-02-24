const { User } = require('../models/User');
const twoFactorService = require('../services/twoFactorService');
const bcrypt = require('bcryptjs');

/**
 * معالج طلبات المصادقة الثنائية (2FA)
 */

/**
 * إعداد 2FA - توليد السر و QR code
 * POST /auth/2fa/setup
 */
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.userId;

    // جلب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من أن 2FA غير مفعل بالفعل
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'المصادقة الثنائية مفعلة بالفعل'
      });
    }

    // توليد سر جديد
    const { secret, otpauth_url } = twoFactorService.generateSecret(user.email);

    // توليد QR code
    const qrCode = await twoFactorService.generateQRCode(otpauth_url);

    // حفظ السر مؤقتاً (لن يتم تفعيله حتى التحقق)
    user.twoFactorSecret = secret;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم توليد رمز QR بنجاح',
      data: {
        secret,
        qrCode,
        manualEntryKey: secret // للإدخال اليدوي في التطبيق
      }
    });
  } catch (error) {
    console.error('خطأ في إعداد 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إعداد المصادقة الثنائية',
      error: error.message
    });
  }
};

/**
 * تفعيل 2FA - التحقق من الرمز وتفعيل الميزة
 * POST /auth/2fa/enable
 */
exports.enable2FA = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'الرمز مطلوب'
      });
    }

    // جلب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من وجود السر
    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'يجب إعداد المصادقة الثنائية أولاً'
      });
    }

    // التحقق من الرمز
    const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'الرمز غير صحيح'
      });
    }

    // تفعيل 2FA
    user.twoFactorEnabled = true;

    // توليد رموز احتياطية
    const backupCodes = twoFactorService.generateBackupCodes(10);
    
    // تشفير الرموز الاحتياطية وحفظها
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );
    
    user.backupCodes = hashedBackupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تفعيل المصادقة الثنائية بنجاح',
      data: {
        backupCodes // إرسال الرموز الاحتياطية مرة واحدة فقط
      }
    });
  } catch (error) {
    console.error('خطأ في تفعيل 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تفعيل المصادقة الثنائية',
      error: error.message
    });
  }
};

/**
 * تعطيل 2FA
 * POST /auth/2fa/disable
 */
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, token } = req.body;

    // التحقق من وجود كلمة المرور
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور مطلوبة'
      });
    }

    // جلب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    // التحقق من الرمز إذا كان 2FA مفعل
    if (user.twoFactorEnabled && token) {
      const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'الرمز غير صحيح'
        });
      }
    }

    // تعطيل 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تعطيل المصادقة الثنائية بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تعطيل 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تعطيل المصادقة الثنائية',
      error: error.message
    });
  }
};

/**
 * التحقق من رمز 2FA أثناء تسجيل الدخول
 * POST /auth/2fa/verify
 */
exports.verify2FA = async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body;

    // التحقق من البيانات المطلوبة
    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم والرمز مطلوبان'
      });
    }

    // جلب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من أن 2FA مفعل
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'المصادقة الثنائية غير مفعلة'
      });
    }

    let isValid = false;

    if (isBackupCode) {
      // التحقق من الرمز الاحتياطي
      if (!user.backupCodes || user.backupCodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'لا توجد رموز احتياطية متاحة'
        });
      }

      // البحث عن الرمز الاحتياطي المطابق
      for (let i = 0; i < user.backupCodes.length; i++) {
        const match = await bcrypt.compare(token, user.backupCodes[i]);
        if (match) {
          isValid = true;
          // حذف الرمز المستخدم
          user.backupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    } else {
      // التحقق من رمز OTP
      isValid = twoFactorService.verifyToken(token, user.twoFactorSecret);
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'الرمز غير صحيح'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم التحقق بنجاح',
      data: {
        remainingBackupCodes: user.backupCodes ? user.backupCodes.length : 0
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق',
      error: error.message
    });
  }
};

/**
 * الحصول على حالة 2FA للمستخدم
 * GET /auth/2fa/status
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // جلب المستخدم
    const user = await User.findById(userId).select('twoFactorEnabled backupCodes');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled,
        hasBackupCodes: user.backupCodes && user.backupCodes.length > 0,
        remainingBackupCodes: user.backupCodes ? user.backupCodes.length : 0
      }
    });
  } catch (error) {
    console.error('خطأ في جلب حالة 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب حالة المصادقة الثنائية',
      error: error.message
    });
  }
};

/**
 * توليد رموز احتياطية جديدة
 * POST /auth/2fa/regenerate-backup-codes
 */
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // التحقق من وجود كلمة المرور
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور مطلوبة'
      });
    }

    // جلب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من أن 2FA مفعل
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'المصادقة الثنائية غير مفعلة'
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    // توليد رموز احتياطية جديدة
    const backupCodes = twoFactorService.generateBackupCodes(10);
    
    // تشفير الرموز الاحتياطية وحفظها
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );
    
    user.backupCodes = hashedBackupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم توليد رموز احتياطية جديدة بنجاح',
      data: {
        backupCodes
      }
    });
  } catch (error) {
    console.error('خطأ في توليد رموز احتياطية:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء توليد الرموز الاحتياطية',
      error: error.message
    });
  }
};



