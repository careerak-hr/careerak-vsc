# CV Parser - البدء السريع ⚡

## 🚀 في 3 خطوات فقط!

### 1️⃣ التثبيت (دقيقة واحدة)
```bash
cd backend
npm install pdf-parse mammoth
```

### 2️⃣ الاختبار (30 ثانية)
```bash
npm test -- cvParser.test.js
```

**✅ يجب أن ترى**: `Tests: 16 passed, 16 total`

### 3️⃣ الاستخدام (دقيقة واحدة)
```bash
# شغّل السيرفر
npm run dev

# في terminal آخر، جرب API:
curl -X POST http://localhost:5000/api/cv/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cv=@sample-cv.pdf"
```

## 📝 مثال سريع - Frontend

```jsx
// في React Component
const CVUploader = () => {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch('/api/cv/parse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Skills:', result.data.skills);
    console.log('Experience:', result.data.totalExperience, 'years');
  };

  return <input type="file" onChange={handleUpload} accept=".pdf,.docx,.txt" />;
};
```

## 🎯 API Endpoints

| Endpoint | الوصف |
|----------|-------|
| `POST /api/cv/parse` | تحليل CV كامل |
| `POST /api/cv/extract-skills` | استخراج المهارات فقط |
| `POST /api/cv/extract-experience` | استخراج الخبرات فقط |
| `POST /api/cv/extract-education` | استخراج التعليم فقط |
| `GET /api/cv/analysis` | الحصول على التحليل المحفوظ |

## 📊 ماذا يستخرج؟

- ✅ **معلومات الاتصال**: Email, Phone, LinkedIn, GitHub
- ✅ **المهارات**: 200+ مهارة تقنية (JavaScript, Python, React, etc.)
- ✅ **الخبرات**: المسمى الوظيفي، الفترة، الوصف
- ✅ **التعليم**: الدرجة، الجامعة، السنة
- ✅ **سنوات الخبرة**: حساب تلقائي

## 🔧 التخصيص السريع

### إضافة مهارات جديدة
```javascript
// في cvParserService.js - loadKnownSkills()
return [
  ...existingSkills,
  'your-new-skill',
  'another-skill',
];
```

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| `Cannot find module 'pdf-parse'` | `npm install pdf-parse mammoth` |
| `File type not supported` | استخدم PDF, DOCX, أو TXT فقط |
| `File too large` | الحد الأقصى 5MB |
| `Authentication required` | أضف `Authorization: Bearer TOKEN` |

## 📚 المزيد من التفاصيل

- 📄 [README_CV_PARSER.md](src/services/README_CV_PARSER.md) - دليل شامل
- 📄 [CV_PARSER_INSTALLATION.md](CV_PARSER_INSTALLATION.md) - دليل التثبيت الكامل
- 📄 [CV_PARSER_IMPLEMENTATION_SUMMARY.md](../docs/CV_PARSER_IMPLEMENTATION_SUMMARY.md) - ملخص التنفيذ

## ✅ جاهز!

الآن يمكنك:
- رفع CV وتحليله في ثوانٍ
- استخراج المهارات والخبرات تلقائياً
- استخدام البيانات في نظام التوصيات

---

**وقت الإعداد**: 3 دقائق  
**الاختبارات**: 16/16 ✅  
**الحالة**: جاهز للإنتاج 🚀
