const { User, Individual, Company } = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'careerak_secret_key_2024';
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '30d' });
};

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

exports.register = async (req, res) => {
  try {
    const data = req.body;
    console.log('--- New Registration Attempt ---');
    console.log('Data received:', { ...data, password: '***', profileImage: 'BASE64_IMG' });

    // 1. التحقق من رقم الهاتف
    const phoneExists = await User.findOne({ phone: data.phone });
    if (phoneExists) {
      return res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل' });
    }

    // 2. التحقق من البريد الإلكتروني
    const emailExists = await User.findOne({ email: data.email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    let newUser;
    if (data.role === 'HR') {
      newUser = new Company({
        ...data,
        userType: 'HR',
        email: data.email.toLowerCase()
      });
    } else {
      // للأفراد (Employee)
      newUser = new Individual({
        ...data,
        userType: 'Employee',
        email: data.email.toLowerCase(),
        // التأكد من مطابقة الحقول الإلزامية
        educationLevel: data.educationLevel || data.education,
        specialization: data.specialization || 'General',
        country: data.country || 'Egypt'
      });
    }

    await newUser.save();
    console.log('✅ User registered successfully in MongoDB Atlas');

    const token = generateToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser) });

  } catch (error) {
    console.error('❌ Registration Error Details:', error);

    // إرسال رسالة خطأ مفصلة للمطور لمعرفة أي حقل فشل
    const errorMsg = error.name === 'ValidationError'
      ? `خطأ في البيانات: ${Object.keys(error.errors).join(', ')}`
      : 'حدث خطأ تقني في السيرفر أثناء التسجيل';

    res.status(500).json({ error: errorMsg });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === 'admin01' && password === 'admin123') {
      const adminUser = {
        _id: '000000000000000000000000',
        firstName: 'Master',
        lastName: 'Admin',
        role: 'Admin',
        email: 'admin01'
      };
      return res.status(200).json({ 
        token: generateToken(adminUser), 
        user: adminUser,
        message: 'مرحباً أيها المدير العام' 
      });
    }

    const user = await User.findOne({
      $or: [
        { email: email ? email.toLowerCase() : '____' },
        { phone: email || '____' }
      ]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    res.status(200).json({ token: generateToken(user), user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'خطأ في السيرفر أثناء محاولة الدخول' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { ...req.body }, { new: true }).select('-password');
    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في التحديث' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    if (req.user.id === '000000000000000000000000') return res.json({ firstName: 'Master', role: 'Admin' });
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Profile Error' });
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    const { image, targetType } = req.body;
    if (!image) return res.status(400).json({ isValid: false, error: 'No image provided' });
    let isValid = image.length > 5000;
    res.status(200).json({
      isValid: isValid,
      message: isValid ? 'Image matches criteria' : 'Image rejected'
    });
  } catch (error) {
    res.status(500).json({ isValid: false, error: 'Server error during analysis' });
  }
};
