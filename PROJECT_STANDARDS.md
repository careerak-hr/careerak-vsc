# معايير وقواعد مشروع Careerak

> **ملاحظة**: هذا الملف مناسب للقراءة في جميع البرامج:
> - ✅ Kiro AI Assistant (يقرأه من `.kiro/steering/project-standards.md`)
> - ✅ VSCode
> - ✅ Cursor
> - ✅ Android Studio
> - ✅ أي محرر نصوص يدعم Markdown
>
> **الموقع**: يوجد نسختان من هذا الملف:
> - `PROJECT_STANDARDS.md` - في المجلد الرئيسي (للقراءة العامة)
> - `.kiro/steering/project-standards.md` - لـ Kiro AI (يُحمّل تلقائياً)

---

## 📁 قاعدة التوثيق الأساسية

**القاعدة الذهبية**: جميع ملفات التوثيق والتقارير يجب أن تكون في مجلد `docs/`

### ✅ الصحيح:
```
docs/
├── Performance/
│   ├── BUNDLE_SIZE_MONITORING.md
│   └── COMPRESSION_CONFIGURATION.md
├── Accessibility/
│   └── COLOR_CONTRAST_AUDIT.md
├── PWA/
│   └── SERVICE_WORKER_IMPLEMENTATION.md
└── AI Recommendations/
    └── CHECKPOINT_4_REPORT.md
```

### ❌ الخطأ:
```
backend/
├── HOW_TO_START.md          ❌ يجب نقله إلى docs/backend-setup/
├── QUICK_START.md            ❌ يجب نقله إلى docs/backend-setup/
└── SOME_REPORT.md            ❌ يجب نقله إلى docs/

frontend/
└── PERFORMANCE_GUIDE.md      ❌ يجب نقله إلى docs/Performance/
```

### الاستثناءات المسموح بها:
- ✅ `README.md` في المجلد الرئيسي أو مجلدات المشروع
- ✅ `CORE_RULES.md` في المجلد الرئيسي
- ✅ `PROJECT_STANDARDS.md` في المجلد الرئيسي (هذا الملف)
- ✅ ملفات الإعداد: `package.json`, `.gitignore`, إلخ

### 📂 هيكل مجلد docs المنظم (محدّث 2026-03-02):
```
docs/
├── Performance/           # تحسين الأداء (50+ ملف)
├── Accessibility/         # إمكانية الوصول (44 ملف)
├── PWA/                   # Progressive Web App (31 ملف)
├── Error Handling/        # معالجة الأخطاء (29 ملف)
├── Caching/               # التخزين المؤقت (18 ملف)
├── Analytics/             # التحليلات (5 ملفات)
├── AI Recommendations/    # التوصيات الذكية (40+ ملف)
├── Video Interviews/      # المقابلات المرئية (30+ ملف)
├── Enhanced Auth/         # المصادقة المحسّنة (20+ ملف)
├── Backend Setup/         # إعداد Backend (15+ ملف)
├── Build & Deploy/        # البناء والنشر (10+ ملف)
├── Systems/               # الأنظمة (15+ ملف)
├── SEO/                   # تحسين محركات البحث (10+ ملف)
├── Frontend Fixes/        # إصلاحات Frontend (40+ ملف)
├── Audio System/          # نظام الصوت (12+ ملف)
├── Admin Dashboard/       # لوحة التحكم (7 ملفات)
├── OAuth Integration/     # تكامل OAuth (4 ملفات)
├── Testing/               # الاختبار (3 ملفات)
├── Documentation/         # التوثيق (4 ملفات)
├── Git/                   # إدارة Git (4 ملفات)
├── General/               # عام (15+ ملف)
├── DOCUMENTATION_INDEX.md # الفهرس الشامل
├── README.md              # نظرة عامة
└── QUICK_SEARCH_GUIDE.md  # دليل البحث السريع
```

### 🔍 كيف تجد التوثيق:
1. **للبحث السريع**: افتح `docs/QUICK_SEARCH_GUIDE.md`
2. **للفهرس الشامل**: افتح `docs/DOCUMENTATION_INDEX.md`
3. **للبدء**: افتح `docs/README.md`

---

## 🔑 قاعدة الحفظ التلقائي (لـ Kiro AI)

**كلمة السر**: عندما يقول المستخدم:
- "احفظها عندك"
- "احفظ هذا"
- "احفظ ذلك"
- أو أي صيغة مشابهة

**الإجراء**: يجب إضافة المعلومة تلقائياً في ملف `.kiro/steering/project-standards.md` في القسم المناسب، أو إنشاء قسم جديد إذا لزم الأمر.

---

## 🎨 معايير التصميم والخطوط

### الخطوط المعتمدة
- **العربية**: Amiri, Cairo, serif
- **الإنجليزية**: Cormorant Garamond, serif
- **الفرنسية**: EB Garamond, serif

### الألوان الرسمية
- **Primary (كحلي)**: #304B60
- **Secondary (بيج)**: #E3DAD1
- **Accent (نحاسي)**: #D48161

### 🔒 قاعدة إطارات الحقول (محرّم تغييرها)
**القاعدة الذهبية**: جميع إطارات حقول الإدخال (input, select, textarea) يجب أن تكون باللون النحاسي الباهت دائماً.

**اللون المعتمد**: `#D4816180` (نحاسي باهت - 50% شفافية)

**التطبيق:**
```css
/* ✅ الطريقة الصحيحة */
.input-field {
  border: 2px solid #D4816180; /* نحاسي باهت دائماً */
}

.input-field:focus {
  border: 2px solid #D4816180; /* نحاسي باهت حتى عند التركيز */
}

/* ❌ ممنوع منعاً باتاً */
.input-field {
  border: 2px solid #304B60; /* كحلي - ممنوع! */
}
```

---

## 📁 تنظيم الملفات

### قاعدة التوثيق
**جميع ملفات التوثيق والتقارير يجب أن تكون في مجلد `docs/`**

#### هيكل مجلد docs:
```
docs/
├── BACKEND_DOCS_INDEX.md           # فهرس توثيق Backend
├── Backend Setup/
│   ├── BACKEND_NOW_RUNNING.md
│   ├── BACKEND_PERMANENT_RUNNING.md
│   ├── HOW_TO_START.md
│   ├── QUICK_START.md
│   └── PM2_QUICK_START.md
├── Systems/
│   ├── NOTIFICATION_SYSTEM.md
│   ├── CHAT_SYSTEM.md
│   └── REVIEW_SYSTEM.md
├── Design/
│   ├── RESPONSIVE_DESIGN_FIX.md
│   └── AUTH_PAGE_*.md
└── audio-system/
    └── (ملفات نظام الصوت)
```

---

## 🔧 معايير البناء والتطوير

### أوامر البناء
- **البناء الكامل**: `build_careerak_optimized.bat`
- **إصلاح Gradle**: `fix_gradle_issues.bat`

---

## 🔐 معايير Git

### معلومات المطور
- **الاسم**: Eng.AlaaUddien
- **البريد**: careerak.hr@gmail.com

---

## 👤 بيانات الاختبار

### حساب الأدمن
- **اسم المستخدم**: admin01
- **كلمة المرور**: admin123

---

## 📝 معايير الكود

### مكتبات قص الصور
**المكتبة المعتمدة**: `react-easy-crop`

### React Components
- استخدام functional components مع hooks
- تطبيق RTL/LTR support
- استخدام `useApp()` للغة والسياق

### معايير CSS
- استخدام Tailwind classes
- الألوان من palette المشروع
- responsive design

### معايير الترجمة
- دعم 3 لغات: ar, en, fr
- استخدام objects للترجمات
- fallback للعربية دائماً

---

## 🚫 ممنوعات

### لا تفعل:
- ❌ إنشاء ملفات توثيق خارج مجلد `docs/`
- ❌ استخدام خطوط غير معتمدة
- ❌ ألوان خارج palette المشروع
- ❌ **تغيير لون إطارات الحقول من النحاسي - محرّم تماماً**
- ❌ نسيان RTL support
- ❌ **المساس بسياسة الخصوصية الرسمية - محرّم تماماً**

---

## 📋 Checklist قبل Commit

- [ ] جميع ملفات التوثيق في `docs/`
- [ ] الخطوط مطبقة صحيحاً
- [ ] الألوان من palette المشروع
- [ ] دعم اللغات الثلاث
- [ ] RTL/LTR يعمل
- [ ] لا توجد أخطاء في console
- [ ] تم الاختبار على الجهاز

---

## 🏢 ميزة حجم الشركة (Company Size)

### معلومات النظام
**تاريخ الإضافة**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 6.3 (حجم الشركة)

### الميزات الرئيسية
- ✅ تصنيف الشركات إلى 3 فئات (صغيرة، متوسطة، كبيرة)
- ✅ تحديد تلقائي للحجم بناءً على عدد الموظفين
- ✅ عرض احترافي في CompanyCard
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ 9 اختبارات شاملة (كلها نجحت ✅)

### التصنيفات
| الحجم | عدد الموظفين |
|-------|--------------|
| **صغيرة (Small)** | < 50 |
| **متوسطة (Medium)** | 50-500 |
| **كبيرة (Large)** | > 500 |

### الاستخدام السريع

**Backend - الحصول على معلومات الشركة**:
```bash
GET /api/companies/:id/info
```

**Backend - تحديث حجم الشركة**:
```bash
PUT /api/companies/:id/info
Authorization: Bearer <token>

{
  "employeeCount": 200
}
```

**Frontend - عرض حجم الشركة**:
```jsx
import CompanyCard from './components/CompanyCard/CompanyCard';

<CompanyCard companyId={companyId} jobId={jobId} />
```

### التوثيق الكامل
- 📄 `docs/COMPANY_SIZE_FEATURE.md` - دليل شامل (500+ سطر)
- 📄 `docs/COMPANY_SIZE_QUICK_START.md` - دليل البدء السريع (5 دقائق)
- 📄 `docs/COMPANY_SIZE_IMPLEMENTATION_SUMMARY.md` - ملخص التنفيذ
- 📄 `docs/COMPANY_SIZE_COMPLETION_REPORT.md` - تقرير الإكمال
- 📄 `backend/tests/README_COMPANY_SIZE.md` - دليل الاختبارات

### الاختبارات
```bash
cd backend
npm test -- companySize.test.js
```

**النتيجة**: ✅ 9/9 اختبارات نجحت

### الفوائد المتوقعة
- 🎯 فهم أفضل لحجم الشركة
- 📊 اتخاذ قرارات مستنيرة
- 🔍 فلترة الوظائف حسب حجم الشركة
- 📈 تجربة مستخدم أفضل

### ملاحظات مهمة
- التحديد التلقائي للحجم عند تحديث employeeCount
- فقط صاحب الشركة يمكنه تحديث المعلومات
- Index على حقل size للاستعلامات السريعة
- جميع الاختبارات نجحت (9/9 ✅)

تم إضافة ميزة حجم الشركة بنجاح - 2026-03-06


---

## 🔄 التحديثات

**آخر تحديث**: 2026-03-07

### سجل التغييرات:
- 2026-03-07: **🎯 احتمالية القبول للوظائف** - نظام كامل لحساب احتمالية قبول المرشح (Backend Service + Controller + Routes + Frontend Component + 3 Hooks + 6 أمثلة + 17 اختبار + 3 توثيقات شاملة + خوارزمية weighted average بـ 5 عوامل + 3 مستويات + شرح واضح + نصائح للتحسين)
- 2026-03-06: **🏢 ميزة حجم الشركة** - تصنيف الشركات إلى 3 فئات (صغيرة، متوسطة، كبيرة) + تحديد تلقائي + 9 اختبارات ✅ + 5 توثيقات شاملة
- 2026-03-03: **🔍 نظام البحث المتقدم - دعم ثنائي اللغة** - تنفيذ كامل للبحث بالعربية والإنجليزية (MongoDB text index + SearchService + 18 اختبار ✅ + 3 توثيقات شاملة + أداء ممتاز < 200ms)
- 2026-03-03: **🗂️ إعادة تنظيم شاملة للتوثيق** - نقل ~150 ملف توثيق من backend/، frontend/، والمجلد الرئيسي إلى docs/ مع تصنيف موضوعي (Backend Setup, Backend Services, Backend Tests, Frontend Performance, Frontend Components, Frontend Tests, Frontend Accessibility) + حذف مجلد .kiro/specs/video-interviews بعد اكتمال الميزة + تنظيف كامل للمشروع من الملفات المبعثرة
- 2026-03-02: **✅ نظام الفيديو للمقابلات - اختبارات شاملة** - مجموعة كاملة من الاختبارات (120+ اختبار: 55 Unit + 36 Integration + 20 E2E + 10 Property Tests + 93%+ تغطية + 100% معدل نجاح + 4 توثيقات شاملة + 6 سكريبتات npm)
- 2026-03-02: **🌍 نظام الفيديو للمقابلات - دعم كامل للعربية والإنجليزية** - نظام ترجمة مركزي شامل (200+ مفتاح ترجمة + 14 قسم + Custom Hook + 20+ اختبار ✅ + 5 توثيقات شاملة + مثال تفاعلي)
- 2026-03-02: **📂 تنظيم شامل للتوثيق** - إنشاء 6 مجلدات جديدة (Performance, Accessibility, PWA, Error Handling, Caching, Analytics) + نقل 177+ ملف + إنشاء 5 ملفات فهرس شاملة
- 2026-03-02: **📹 نظام الفيديو للمقابلات - إزالة المشارك** - ميزة كاملة للمضيف لإزالة أي مشارك من المقابلة (تأكيد قبل الإزالة + إشعارات فورية + أمان محكم + 21 اختبار ✅ + 2 توثيقات شاملة)
- 2026-03-01: **📹 نظام الفيديو للمقابلات - جودة 1080p لمشاركة الشاشة** - تحسين جودة مشاركة الشاشة إلى Full HD (1920x1080) مع دعم حتى 4K (3840x2160) + 20 اختبار شامل + 3 توثيقات كاملة
- 2026-03-01: **📹 نظام الفيديو للمقابلات - تبديل الكاميرا** - ميزة كاملة لتبديل الكاميرا الأمامية/الخلفية على الموبايل (3 دوال جديدة + زر UI + 10 اختبارات + 3 توثيقات شاملة)
- 2026-02-28: **🌍 AI Recommendations - دعم كامل للعربية والإنجليزية** - نظام ترجمة مركزي شامل (100+ رسالة مترجمة + كشف تلقائي للغة + دعم 3 لغات في Frontend + 2 توثيقات شاملة)
- 2026-02-28: **📱 AI Recommendations - التصميم المتجاوب** - تصميم متجاوب شامل لجميع مكونات التوصيات (5 breakpoints + Touch optimization + Safe area support + 15+ جهاز مدعوم + 6+ متصفح + 2 توثيقات شاملة)
- 2026-02-28: **🤖 AI Recommendations - شرح واضح لكل توصية** - نظام Explainable AI كامل (7 أنواع أسباب + 3 مستويات قوة + 6 اختبارات ✅ + دعم 3 لغات + تصميم متجاوب + 3 توثيقات شاملة)
- 2026-02-27: **🔄 قاعدة تشغيل السيرفرات الدائم** - إلزامية استخدام PM2 لجميع السيرفرات، ممنوع التشغيل اليدوي بـ npm run dev
- 2026-02-17: **📁 تنظيم مجلد docs في مجلدات فرعية** - 8 مجلدات حسب الموضوع (117+ ملف)
- 2026-02-17: **📍 نقل PROJECT_STANDARDS.md للوصول العام** - إضافة نسخة في المجلد الرئيسي
- 2026-02-17: **📁 تنظيم ملفات التوثيق** - نقل جميع ملفات .md إلى docs/ وإنشاء فهرس شامل
- 2026-02-17: **تحديث project-standards.md** - جعله مناسباً لجميع البرامج (Kiro, VSCode, Cursor, Android Studio)
- 2026-02-17: **تنظيف ملفات .bat** - حذف 8 ملفات غير ضرورية، الإبقاء على ملفين فقط
- 2026-02-17: **✅ Backend يعمل الآن بشكل دائم!** - تم تشغيل Backend بنجاح مع PM2

---

## 🎯 احتمالية القبول للوظائف

### معلومات النظام
**تاريخ الإضافة**: 2026-03-07  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 9.6 (احتمالية القبول)

### الملفات الأساسية
```
backend/src/
├── services/acceptanceProbabilityService.js    # خدمة الحساب (300+ سطر)
├── controllers/acceptanceProbabilityController.js  # 3 endpoints
└── routes/acceptanceProbabilityRoutes.js       # المسارات

frontend/src/
├── components/AcceptanceProbability/
│   ├── AcceptanceProbability.jsx               # المكون الرئيسي
│   └── AcceptanceProbability.css               # التنسيقات
├── hooks/useAcceptanceProbability.js           # 3 hooks
└── examples/AcceptanceProbabilityExample.jsx   # 6 أمثلة

backend/tests/
└── acceptanceProbability.test.js               # 17 اختبار

docs/
├── ACCEPTANCE_PROBABILITY_IMPLEMENTATION.md    # توثيق شامل
├── ACCEPTANCE_PROBABILITY_QUICK_START.md       # دليل البدء السريع
└── ACCEPTANCE_PROBABILITY_SUMMARY.md           # ملخص التنفيذ
```

### الميزات الرئيسية
- ✅ حساب ذكي بناءً على 5 عوامل (Match 40%, Skills 25%, Experience 20%, Competition 10%, Education 5%)
- ✅ 3 مستويات (High 70%+, Medium 40-70%, Low <40%)
- ✅ شرح واضح (3-4 عوامل مؤثرة)
- ✅ نصائح للتحسين
- ✅ عرض كامل ومضغوط
- ✅ RTL/LTR Support
- ✅ Dark Mode Support
- ✅ Responsive Design

### API Endpoints
```
GET  /api/acceptance-probability/:jobId
POST /api/acceptance-probability/bulk
GET  /api/acceptance-probability/all?page=1&limit=20
```

### الاستخدام السريع
```jsx
import AcceptanceProbability from '../components/AcceptanceProbability/AcceptanceProbability';
import { useAcceptanceProbability } from '../hooks/useAcceptanceProbability';

function JobCard({ jobId }) {
  const { probability, loading } = useAcceptanceProbability(jobId);

  return (
    <div>
      {!loading && probability && (
        <AcceptanceProbability
          probability={probability.probability}
          level={probability.level}
          compact={true}
        />
      )}
    </div>
  );
}
```

### المستويات
| المستوى | النطاق | اللون | المعنى |
|---------|--------|-------|--------|
| عالي | 70%+ | 🟢 | قدّم الآن! |
| متوسط | 40-70% | 🟡 | حسّن مهاراتك |
| منخفض | < 40% | 🔴 | ابحث عن وظائف أخرى |

### التوثيق الكامل
- 📄 `docs/ACCEPTANCE_PROBABILITY_IMPLEMENTATION.md` - توثيق شامل (500+ سطر)
- 📄 `docs/ACCEPTANCE_PROBABILITY_QUICK_START.md` - دليل البدء السريع (5 دقائق)
- 📄 `docs/ACCEPTANCE_PROBABILITY_SUMMARY.md` - ملخص التنفيذ

### الاختبارات
```bash
cd backend
npm test -- acceptanceProbability.test.js
```

### الفوائد المتوقعة
- 🎯 قرارات أفضل للباحثين عن عمل
- ⏱️ توفير الوقت (تقليل التقديم على وظائف غير مناسبة)
- 📊 شفافية كاملة (شرح واضح للأسباب)
- 💡 نصائح للتحسين
- 📈 زيادة معدل التوظيف الناجح

### ملاحظات مهمة
- يتطلب ملف شخصي كامل (مهارات، خبرة، تعليم)
- يعتمد على Content-Based Filtering
- ديناميكي (يتغير مع تحديث البيانات)
- غير مضمون (تقديري وليس ضماناً)

تم إضافة احتمالية القبول للوظائف بنجاح - 2026-03-07

---

## 📚 المراجع

- 📄 [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md) - الفهرس الشامل لجميع التوثيق
- 📄 [docs/README.md](docs/README.md) - نظرة عامة على التوثيق
- 📄 [docs/QUICK_SEARCH_GUIDE.md](docs/QUICK_SEARCH_GUIDE.md) - دليل البحث السريع
- 📄 [docs/DOCUMENTATION_ORGANIZATION_REPORT.md](docs/DOCUMENTATION_ORGANIZATION_REPORT.md) - تقرير التنظيم الشامل
- 📄 [CORE_RULES.md](CORE_RULES.md) - القواعد الأساسية

---

**المطور**: Eng.AlaaUddien  
**البريد**: careerak.hr@gmail.com
