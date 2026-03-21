# Forgot Password - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الوصول للصفحة
```
/forgot-password
```

### 2. الاستخدام
1. أدخل بريدك الإلكتروني
2. انقر "إرسال رابط إعادة التعيين"
3. تحقق من بريدك الإلكتروني
4. اتبع الرابط لإعادة تعيين كلمة المرور

---

## 📁 الملفات

```
frontend/src/pages/
├── ForgotPasswordPage.jsx           # المكون الرئيسي
└── ForgotPasswordPage.css           # التنسيقات
```

---

## ✅ الميزات

- ✅ EmailValidator component (تحقق فوري)
- ✅ Loading state (ButtonSpinner)
- ✅ Success state (رسالة تأكيد)
- ✅ دعم 3 لغات (ar, en, fr)
- ✅ SEO optimization
- ✅ Accessibility support
- ✅ Responsive design

---

## 🎨 التصميم

- متناسق مع LoginPage و AuthPage
- الألوان المعتمدة (#304B60, #E3DAD1, #D48161)
- إطارات نحاسية باهتة (#D4816180)

---

## 🔧 TODO - Task 13.2

### API Integration
```javascript
const apiUrl = import.meta.env.VITE_API_URL || '';
const response = await fetch(`${apiUrl}/auth/forgot-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
```

### Backend Endpoint
```javascript
// POST /auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);
```

---

## 📚 التوثيق الكامل

📄 `docs/Enhanced Auth/FORGOT_PASSWORD_PAGE.md`

---

تم إنشاء Forgot Password Page بنجاح - 2026-02-23
