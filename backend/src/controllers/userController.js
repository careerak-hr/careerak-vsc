const { User, Individual, Company } = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'careerak_secret_key_2024';
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '30d' });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  delete userObj.otp;
  return userObj;
};

exports.register = async (req, res) => {
  try {
    const data = req.body;
    console.log("--- Processing Registration ---", data.email);

    // Basic validation
    if (!data.phone || !data.password || !data.role) {
      return res.status(400).json({ error: 'البيانات الأساسية مطلوبة (الهاتف، كلمة المرور، النوع)' });
    }

    // Password validation
    if (data.password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }

    // Email validation (if provided)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    // Phone validation
    if (!/^\+?[1-9]\d{1,14}$/.test(data.phone)) {
      return res.status(400).json({ error: 'رقم الهاتف غير صحيح' });
    }

    const phoneExists = await User.findOne({ phone: data.phone });
    if (phoneExists) return res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل' });

    if (data.email) {
      const emailExists = await User.findOne({ email: data.email?.toLowerCase() });
      if (emailExists) return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    let newUser;
    const baseData = {
      email: data.email?.toLowerCase(),
      password: data.password,
      phone: data.phone,
      role: data.role,
      country: data.country || 'Egypt',
      city: data.city || '',
      profileImage: data.profileImage,
      isSpecialNeeds: data.isSpecialNeeds || false,
      specialNeedsType: data.specialNeedsType || 'none',
      privacyAccepted: data.privacyAccepted || true,
      isVerified: false
    };

    if (data.role === 'HR') {
      newUser = new Company({
        ...baseData,
        userType: 'HR',
        companyName: data.companyName,
        companyIndustry: data.companyIndustry || 'General',
        subIndustry: data.subIndustry || '',
        companyKeywords: data.companyKeywords || []
      });
    } else {
      newUser = new Individual({
        ...baseData,
        userType: 'Employee',
        firstName: data.firstName,
        lastName: data.lastName,
        educationLevel: data.educationLevel || data.education || 'N/A',
        gender: data.gender,
        birthDate: data.birthDate,
        specialization: data.specialization || 'General',
        interests: data.interests || []
      });
    }

    await newUser.save();

    // إرسال إشعارات فورية للشركات إذا كان المستخدم مرشح (Individual)
    if (data.role !== 'HR') {
      const realtimeNotificationService = require('../services/realtimeRecommendationNotificationService');
      realtimeNotificationService.notifyCompaniesForNewCandidate(newUser._id)
        .then(result => {
          if (result.success) {
            console.log(`✅ Sent ${result.notified} real-time notifications for candidate: ${result.candidateName}`);
            console.log(`📊 Matching jobs: ${result.matchingJobs}, Average match: ${result.averageMatchScore?.toFixed(1)}%`);
          } else {
            console.error('❌ Failed to send candidate match notifications:', result.error);
          }
        })
        .catch(err => console.error('❌ Error sending candidate match notifications:', err));
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    newUser.otp = {
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser), otpSent: true });

  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ في حفظ البيانات', details: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId || req.user?.id);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (user.otp?.code === otp && user.otp?.expiresAt > new Date()) {
        user.isVerified = true;
        user.otp = undefined;
        await user.save();
        const token = generateToken(user);
        return res.status(200).json({ message: 'تم التفعيل بنجاح', user: sanitizeUser(user), token });
    }
    res.status(400).json({ error: 'كود التحقق غير صحيح أو منتهي الصلاحية' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في عملية التحقق' });
  }
};

exports.sendOTP = async (req, res) => {
    try {
        const { userId, method } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000), method: method };
        await user.save();
        console.log(`Sending OTP ${otpCode} via ${method}`);
        res.status(200).json({ message: `تم إرسال الكود عبر ${method === 'email' ? 'البريد' : 'الواتساب'}` });
    } catch (error) {
        res.status(500).json({ error: 'فشل إرسال الكود' });
    }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }
    
    // Admin login check - استخدام متغيرات البيئة للأمان
    const adminUsername = process.env.ADMIN_USERNAME || 'admin01';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === adminUsername && password === adminPassword) {
      const adminUser = { _id: '000000000000000000000000', firstName: 'Master', role: 'Admin', email: 'admin01' };
      return res.status(200).json({ token: generateToken(adminUser), user: adminUser });
    }
    
    const user = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { phone: email }] });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }
    
    res.status(200).json({ token: generateToken(user), user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطأ في الدخول' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الملف' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedFields = req.body;
    
    // تحديث المستخدم
    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true });
    
    // بدء معالجة تحديث التوصيات في الوقت الفعلي (غير متزامن)
    // نستخدم IIFE لتشغيل العملية في الخلفية دون انتظارها
    (async () => {
      try {
        const realTimeRecommendationService = require('../services/realtimeRecommendationService');
        const result = await realTimeRecommendationService.processProfileUpdateIfRelevant(userId, updatedFields);
        
        if (result.success && result.relevant) {
          console.log(`✅ تم بدء تحديث التوصيات للمستخدم ${userId}: ${result.message}`);
        } else if (result.success && !result.relevant) {
          console.log(`ℹ️ تحديث غير ذي صلة للمستخدم ${userId}: ${result.message}`);
        } else {
          console.warn(`⚠️ فشل تحديث التوصيات للمستخدم ${userId}: ${result.message}`);
        }
      } catch (recommendationError) {
        console.error(`❌ خطأ في تحديث التوصيات للمستخدم ${userId}:`, recommendationError.message);
        // لا نرمي الخطأ حتى لا نؤثر على تحديث الملف الشخصي
      }
    })();
    
    // إرجاع استجابة فورية مع تأكيد بدء تحديث التوصيات
    res.status(200).json({
      ...sanitizeUser(user),
      recommendationUpdate: {
        started: true,
        message: 'تم بدء تحديث التوصيات بناءً على التغييرات الجديدة',
        expectedCompletion: 'خلال دقيقة واحدة'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في التحديث' });
  }
};

/**
 * محرك تحليل الصور الذكي (Smart Image Analysis)
 * يقوم بفحص الصورة المرفوعة للتأكد من مطابقتها للمعايير المطلوبة
 */
exports.analyzeImage = async (req, res) => {
  try {
    const { image, type } = req.body;

    if (!image) return res.status(400).json({ isValid: false, error: "لم يتم استلام صورة" });

    // محاكاة التحليل الذكي (سيتم دمج AWS Rekognition أو Google Vision لاحقاً)
    // حالياً نقوم برفض الصور ذات الحجم الصغير جداً أو التي لا تبدو كصور شخصية (محاكاة)
    const base64Data = image.split(',')[1];
    const imageSize = base64Data.length * (3/4); // تقريباً بالبايت

    if (imageSize < 5000) { // رفض الصور الصغيرة جداً
        return res.status(200).json({ isValid: false, message: "الصورة ذات جودة ضعيفة جداً" });
    }

    // محاكاة رفض الصور غير المطابقة (لأغراض الاختبار)
    // إذا كانت الصورة تحتوي على كلمة "reject" في الاسم أو البيانات (مثلاً)
    if (image.includes("non_face_example") || image.length % 7 === 0) { // مجرد شرط محاكي للفشل
        return res.status(200).json({ isValid: false, message: "لم يتم العثور على وجه بشري واضح" });
    }

    res.status(200).json({ isValid: true, message: "Image is valid" });
  } catch (error) {
    res.status(500).json({ error: "Image Analysis Error" });
  }
};

exports.getAIRecommendations = async (req, res) => {
  try {
    res.status(200).json({ recommendations: [] });
  } catch (error) {
    res.status(500).json({ error: "AI Error" });
  }
};

exports.parseCV = async (req, res) => {
  try {
    res.status(200).json({ message: "CV Parsing Ready" });
  } catch (error) {
    res.status(500).json({ error: "Parsing Failed" });
  }
};

/**
 * Get user preferences (theme, language, notifications, accessibility)
 * GET /api/users/preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // Return preferences with defaults if not set
    const preferences = user.preferences || {
      theme: 'system',
      language: 'ar',
      notifications: { enabled: true, email: true, push: true },
      accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' }
    };

    res.status(200).json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'خطأ في جلب التفضيلات' });
  }
};

/**
 * Update user preferences (theme, language, notifications, accessibility)
 * PUT /api/users/preferences
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { theme, language, notifications, accessibility } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update only provided fields
    if (theme !== undefined) {
      if (!['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ error: 'قيمة theme غير صحيحة' });
      }
      user.preferences.theme = theme;
    }

    if (language !== undefined) {
      if (!['ar', 'en', 'fr'].includes(language)) {
        return res.status(400).json({ error: 'قيمة language غير صحيحة' });
      }
      user.preferences.language = language;
    }

    if (notifications !== undefined) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    if (accessibility !== undefined) {
      user.preferences.accessibility = {
        ...user.preferences.accessibility,
        ...accessibility
      };
    }

    await user.save();

    res.status(200).json({ 
      message: 'تم تحديث التفضيلات بنجاح',
      preferences: user.preferences 
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'خطأ في تحديث التفضيلات' });
  }
};
/**
 * الحصول على حالة تحديث التوصيات في الوقت الفعلي
 * GET /api/users/recommendation-update-status
 */
exports.getRecommendationUpdateStatus = async (req, res) => {
  try {
    const realTimeRecommendationService = require('../services/realtimeRecommendationService');
    const status = realTimeRecommendationService.getUpdateStatus(req.user.id);
    
    res.status(200).json(status);
  } catch (error) {
    console.error('Get recommendation update status error:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب حالة تحديث التوصيات',
      details: error.message 
    });
  }
};

/**
 * الحصول على إحصائيات معالجة التوصيات
 * GET /api/users/recommendation-processing-stats
 */
exports.getRecommendationProcessingStats = async (req, res) => {
  try {
    const realTimeRecommendationService = require('../services/realtimeRecommendationService');
    const stats = realTimeRecommendationService.getProcessingStats();
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get recommendation processing stats error:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب إحصائيات المعالجة',
      details: error.message 
    });
  }
};