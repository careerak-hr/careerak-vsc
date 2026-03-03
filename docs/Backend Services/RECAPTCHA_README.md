# reCAPTCHA Service - دليل الاستخدام

## 📋 نظرة عامة

خدمة reCAPTCHA توفر حماية ضد البوتات باستخدام Google reCAPTCHA v3.

## 🚀 الاستخدام السريع

### 1. في Routes

```javascript
const { verifyRecaptcha } = require('../middleware/recaptcha');

// تحقق إجباري
router.post('/register', verifyRecaptcha, authController.register);

// تحقق شرطي (فقط عند الاشتباه بنشاط مشبوه)
router.post('/login', verifyRecaptchaConditional, authController.login);
```

### 2. في Controller

```javascript
async register(req, res) {
  // النتيجة متاحة في req.recaptcha
  const { score, action } = req.recaptcha;
  
  console.log(`reCAPTCHA Score: ${score}`);
  
  // يمكنك حفظها في قاعدة البيانات
  await User.create({
    ...userData,
    recaptchaScore: score
  });
}
```

## 🔧 الإعداد

في `.env`:

```env
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_MIN_SCORE=0.5
```

## 📊 فهم النتائج

- **0.9+**: مستخدم حقيقي جداً ✅
- **0.7-0.9**: مستخدم حقيقي على الأرجح ✅
- **0.5-0.7**: مشبوه قليلاً ⚠️
- **0.3-0.5**: مشبوه ⚠️
- **0.0-0.3**: بوت على الأرجح ❌

## 📚 المزيد

راجع:
- `docs/RECAPTCHA_INTEGRATION.md` - دليل شامل
- `docs/RECAPTCHA_QUICK_START.md` - دليل البدء السريع
