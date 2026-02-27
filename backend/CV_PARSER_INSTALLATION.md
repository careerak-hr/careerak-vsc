# تثبيت CV Parser - دليل سريع

## 📦 الخطوة 1: تثبيت المكتبات

```bash
cd backend
npm install pdf-parse mammoth
```

## ✅ الخطوة 2: التحقق من التثبيت

```bash
# تشغيل الاختبارات
npm test -- cvParser.test.js
```

**النتيجة المتوقعة:**
```
PASS  tests/cvParser.test.js
  CV Parser Service
    extractContactInfo
      ✓ يجب استخراج البريد الإلكتروني بشكل صحيح
      ✓ يجب استخراج رقم الهاتف بشكل صحيح
      ✓ يجب استخراج LinkedIn profile
      ✓ يجب استخراج GitHub profile
    extractSkills
      ✓ يجب استخراج المهارات التقنية
      ✓ يجب استخراج المهارات بالعربية
      ✓ يجب عدم تكرار المهارات
      ✓ يجب استخراج قواعد البيانات
    extractExperience
      ✓ يجب استخراج الخبرات مع التواريخ
      ✓ يجب استخراج الخبرات الحالية
    extractEducation
      ✓ يجب استخراج الدرجات العلمية
      ✓ يجب استخراج الدرجات بالعربية
    calculateTotalExperience
      ✓ يجب حساب سنوات الخبرة بشكل صحيح
      ✓ يجب حساب الخبرة الحالية
    parseCV - Integration
      ✓ يجب تحليل CV نصي بنجاح
      ✓ يجب التعامل مع نوع ملف غير مدعوم

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

## 🚀 الخطوة 3: تشغيل السيرفر

```bash
# Development
npm run dev

# Production
npm start
```

## 🧪 الخطوة 4: اختبار API

### باستخدام cURL

```bash
# تحليل CV
curl -X POST http://localhost:5000/api/cv/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cv=@/path/to/your/cv.pdf"
```

### باستخدام Postman

1. افتح Postman
2. أنشئ طلب POST جديد
3. URL: `http://localhost:5000/api/cv/parse`
4. Headers: `Authorization: Bearer YOUR_TOKEN`
5. Body: form-data
   - Key: `cv`
   - Type: File
   - Value: اختر ملف CV
6. اضغط Send

## 📝 الخطوة 5: التكامل مع Frontend

```javascript
// في React Component
const handleCVUpload = async (file) => {
  const formData = new FormData();
  formData.append('cv', file);

  try {
    const response = await fetch('/api/cv/parse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ CV parsed successfully!');
      console.log('Skills:', result.data.skills);
      console.log('Experience:', result.data.totalExperience, 'years');
      
      // استخدم البيانات في التطبيق
      setUserSkills(result.data.skills);
      setUserExperience(result.data.experience);
    }
  } catch (error) {
    console.error('❌ Error parsing CV:', error);
  }
};
```

## ✅ التحقق من النجاح

### 1. تحقق من السيرفر
```bash
# يجب أن ترى:
✅ MongoDB connected
✅ Server running on port 5000
```

### 2. تحقق من المسارات
```bash
curl http://localhost:5000/api/cv/analysis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. تحقق من الاختبارات
```bash
npm test -- cvParser.test.js
# يجب أن تنجح جميع الاختبارات (16/16)
```

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot find module 'pdf-parse'"
```bash
# الحل:
npm install pdf-parse mammoth
```

### خطأ: "File type not supported"
```bash
# تأكد من أن الملف من الأنواع المدعومة:
# - PDF (.pdf)
# - DOCX (.docx)
# - TXT (.txt)
```

### خطأ: "File too large"
```bash
# الحد الأقصى: 5MB
# قلل حجم الملف أو زد الحد في cvParserRoutes.js:
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
}
```

### خطأ: "Authentication required"
```bash
# تأكد من إرسال token في header:
Authorization: Bearer YOUR_TOKEN
```

## 📚 الخطوات التالية

1. ✅ اقرأ [README_CV_PARSER.md](src/services/README_CV_PARSER.md) للتفاصيل الكاملة
2. ✅ جرب جميع endpoints
3. ✅ خصص قائمة المهارات حسب احتياجك
4. ✅ أضف المزيد من الاختبارات
5. ✅ كامل التكامل مع Frontend

## 🎉 تم التثبيت بنجاح!

الآن يمكنك:
- ✅ رفع CV وتحليله تلقائياً
- ✅ استخراج المهارات والخبرات والتعليم
- ✅ حساب سنوات الخبرة
- ✅ حفظ البيانات في ملف المستخدم
- ✅ استخدام البيانات في نظام التوصيات

---

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ جاهز للاستخدام
