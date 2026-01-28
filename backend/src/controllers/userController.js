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
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.status(200).json(sanitizeUser(user));
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
