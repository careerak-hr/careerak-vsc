# معدل استجابة الشركة - التوثيق الشامل

## 📋 معلومات الميزة
- **تاريخ الإضافة**: 2026-03-07
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 9.5 (معدل استجابة الشركة)

## 🎯 نظرة عامة

ميزة معدل استجابة الشركة تحسب وتعرض سرعة استجابة الشركة لطلبات التوظيف. يتم تصنيف الشركات إلى ثلاث فئات:
- **سريع** ⚡: استجابة خلال 48 ساعة ونسبة استجابة > 70%
- **متوسط** ⏱️: استجابة خلال 7 أيام ونسبة استجابة > 50%
- **بطيء** 🐌: أكثر من 7 أيام أو نسبة استجابة < 50%

## 📁 الملفات الأساسية

### Backend
```
backend/
├── src/
│   ├── services/
│   │   └── companyResponseRateService.js    # خدمة حساب معدل الاستجابة
│   ├── models/
│   │   └── CompanyInfo.js                   # محدّث مع حقول معدل الاستجابة
│   └── controllers/
│       └── companyInfoController.js         # endpoints موجودة مسبقاً
├── scripts/
│   └── update-company-response-rates.js     # سكريبت التحديث الدوري
└── tests/
    └── companyResponseRate.test.js          # 24 اختبار شامل
```

### Frontend
```
frontend/src/
├── components/
│   └── CompanyResponseRate/
│       ├── CompanyResponseRate.jsx          # مكون العرض
│       └── CompanyResponseRate.css          # التنسيقات
└── examples/
    └── CompanyResponseRateExample.jsx       # 6 أمثلة كاملة
```

## 🔧 كيف يعمل

### 1. حساب معدل الاستجابة

```javascript
// الخطوات:
1. جلب جميع الوظائف للشركة في آخر 90 يوم
2. جلب جميع الطلبات لهذه الوظائف
3. حساب الطلبات التي تمت مراجعتها (status !== 'Submitted')
4. حساب متوسط وقت الاستجابة (reviewedAt - submittedAt)
5. حساب نسبة الاستجابة (respondedCount / totalApplications * 100)
6. تحديد التصنيف بناءً على الوقت والنسبة
```

### 2. معايير التصنيف

| التصنيف | متوسط الوقت | نسبة الاستجابة | الأيقونة |
|---------|-------------|----------------|----------|
| سريع | ≤ 48 ساعة | ≥ 70% | ⚡ |
| متوسط | ≤ 7 أيام | ≥ 50% | ⏱️ |
| بطيء | > 7 أيام | < 50% | 🐌 |

### 3. تحديث البيانات

```javascript
// تحديث تلقائي:
- عند جلب معلومات الشركة (إذا مر > 24 ساعة)
- عند مراجعة طلب توظيف
- دورياً (شهرياً) عبر cron job

// تحديث يدوي:
POST /api/companies/:id/update-response-rate
```

## 📊 نموذج البيانات

### CompanyInfo Model (محدّث)
```javascript
{
  responseRate: {
    percentage: Number,        // 0-100
    label: String,            // 'fast', 'medium', 'slow'
    averageResponseTime: Number, // بالساعات
    lastUpdated: Date
  }
}
```

## 🔌 API Endpoints

### 1. الحصول على معلومات الشركة (يتضمن معدل الاستجابة)
```http
GET /api/companies/:id/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "507f1f77bcf86cd799439011",
    "name": "شركة التقنية المتقدمة",
    "responseRate": {
      "percentage": 85,
      "label": "fast",
      "averageResponseTime": 36,
      "lastUpdated": "2026-03-07T10:00:00.000Z"
    }
  }
}
```

### 2. تحديث معدل الاستجابة
```http
POST /api/companies/:id/update-response-rate
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث معدل استجابة الشركة بنجاح",
  "data": {
    "responseRate": {
      "percentage": 85,
      "label": "fast",
      "averageResponseTime": 36
    }
  }
}
```

## 💻 استخدام Frontend

### 1. الاستخدام الأساسي
```jsx
import CompanyResponseRate from './components/CompanyResponseRate/CompanyResponseRate';

function CompanyCard({ company }) {
  return (
    <div>
      <h3>{company.name}</h3>
      <CompanyResponseRate responseRate={company.responseRate} />
    </div>
  );
}
```

### 2. مع تفاصيل إضافية
```jsx
<CompanyResponseRate 
  responseRate={company.responseRate} 
  showDetails={true} 
/>
```

### 3. في بطاقة الوظيفة
```jsx
function JobCard({ job }) {
  return (
    <div className="job-card">
      <h4>{job.title}</h4>
      <p>{job.company.name}</p>
      <CompanyResponseRate responseRate={job.company.responseRate} />
    </div>
  );
}
```

## 🔄 التحديث الدوري

### إعداد Cron Job (شهرياً)

**Linux/Mac:**
```bash
# تحرير crontab
crontab -e

# إضافة السطر التالي (يوم 1 من كل شهر الساعة 2 صباحاً)
0 2 1 * * cd /path/to/backend && node scripts/update-company-response-rates.js
```

**Windows (Task Scheduler):**
1. افتح Task Scheduler
2. Create Basic Task → "Update Company Response Rates"
3. Trigger: Monthly, Day 1, 2:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/update-company-response-rates.js`
7. Start in: `D:\path\to\backend`

**PM2 (موصى به):**
```javascript
// ecosystem.config.js
{
  name: 'update-response-rates',
  script: 'scripts/update-company-response-rates.js',
  cron_restart: '0 2 1 * *', // يوم 1 من كل شهر الساعة 2 صباحاً
  autorestart: false
}
```

## 🧪 الاختبارات

### تشغيل الاختبارات
```bash
cd backend
npm test -- companyResponseRate.test.js
```

### النتيجة المتوقعة
```
✅ 24/24 اختبارات نجحت

Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
```

### الاختبارات المغطاة
- ✅ تحديد التصنيف (fast, medium, slow)
- ✅ النصوص بالعربية
- ✅ الألوان والأيقونات
- ✅ الحالات الحدية (edge cases)
- ✅ البيانات غير الكافية

## 🎨 التنسيقات

### الألوان
```css
/* سريع */
.bg-green-100 { background: #dcfce7; }
.text-green-800 { color: #166534; }

/* متوسط */
.bg-yellow-100 { background: #fef9c3; }
.text-yellow-800 { color: #854d0e; }

/* بطيء */
.bg-red-100 { background: #fee2e2; }
.text-red-800 { color: #991b1b; }
```

### Responsive
```css
/* Desktop */
font-size: 0.875rem;
padding: 0.5rem 0.75rem;

/* Mobile (< 640px) */
font-size: 0.8125rem;
padding: 0.375rem 0.625rem;
```

### RTL Support
```css
[dir="rtl"] .response-rate-details {
  padding-right: 0.75rem;
  border-right: 1px solid currentColor;
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  .bg-green-100 { background: rgba(34, 197, 94, 0.2); }
  .bg-yellow-100 { background: rgba(234, 179, 8, 0.2); }
  .bg-red-100 { background: rgba(239, 68, 68, 0.2); }
}
```

## 📈 الفوائد المتوقعة

1. **للباحثين عن عمل**:
   - معرفة الشركات سريعة الاستجابة
   - توقعات واقعية لوقت الانتظار
   - قرارات أفضل عند التقديم

2. **للشركات**:
   - تحفيز على الاستجابة السريعة
   - تحسين سمعة الشركة
   - جذب أفضل المرشحين

3. **للمنصة**:
   - تحسين تجربة المستخدم
   - زيادة الثقة في المنصة
   - تشجيع التفاعل النشط

## 🔍 استكشاف الأخطاء

### المشكلة: معدل الاستجابة null
**الحل:**
```javascript
// تحقق من:
1. وجود طلبات توظيف للشركة
2. وجود طلبات تمت مراجعتها (reviewedAt موجود)
3. نسبة الاستجابة > 20%
```

### المشكلة: التصنيف غير صحيح
**الحل:**
```javascript
// تحقق من:
1. حساب متوسط الوقت صحيح
2. حساب نسبة الاستجابة صحيح
3. معايير التصنيف مطبقة بشكل صحيح
```

### المشكلة: البيانات قديمة
**الحل:**
```bash
# تحديث يدوي
curl -X POST http://localhost:5000/api/companies/:id/update-response-rate

# أو تشغيل السكريبت
node scripts/update-company-response-rates.js
```

## 📚 أمثلة إضافية

### مثال 1: تكامل مع JobCard
```jsx
function JobCard({ job }) {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetch(`/api/companies/${job.company}/info`)
      .then(res => res.json())
      .then(data => setCompany(data.data));
  }, [job.company]);

  return (
    <div className="job-card">
      <h4>{job.title}</h4>
      {company && (
        <div className="company-info">
          <span>{company.name}</span>
          <CompanyResponseRate responseRate={company.responseRate} />
        </div>
      )}
    </div>
  );
}
```

### مثال 2: فلترة حسب معدل الاستجابة
```jsx
function JobFilters({ onFilterChange }) {
  const [responseRate, setResponseRate] = useState('all');

  const handleChange = (e) => {
    setResponseRate(e.target.value);
    onFilterChange({ responseRate: e.target.value });
  };

  return (
    <select value={responseRate} onChange={handleChange}>
      <option value="all">جميع الشركات</option>
      <option value="fast">استجابة سريعة فقط</option>
      <option value="medium">استجابة متوسطة فقط</option>
      <option value="slow">استجابة بطيئة فقط</option>
    </select>
  );
}
```

### مثال 3: إحصائيات معدل الاستجابة
```jsx
function CompanyStatistics({ companyId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/api/companies/${companyId}/statistics`)
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, [companyId]);

  if (!stats) return <div>جاري التحميل...</div>;

  return (
    <div className="company-stats">
      <h3>إحصائيات الشركة</h3>
      <div className="stat">
        <span>معدل الاستجابة:</span>
        <CompanyResponseRate 
          responseRate={stats.companyInfo.responseRate} 
          showDetails={true} 
        />
      </div>
      <div className="stat">
        <span>إجمالي الطلبات:</span>
        <span>{stats.statistics.totalApplications}</span>
      </div>
      <div className="stat">
        <span>معدل القبول:</span>
        <span>{stats.statistics.acceptanceRate}%</span>
      </div>
    </div>
  );
}
```

## ✅ قائمة التحقق

- [x] إنشاء خدمة حساب معدل الاستجابة
- [x] تحديث نموذج CompanyInfo
- [x] تحديث companyInfoService
- [x] إنشاء مكون Frontend
- [x] إنشاء تنسيقات CSS
- [x] إنشاء سكريبت التحديث الدوري
- [x] إنشاء اختبارات شاملة (24 اختبار)
- [x] إنشاء أمثلة استخدام (6 أمثلة)
- [x] إنشاء توثيق شامل
- [x] دعم RTL
- [x] دعم Dark Mode
- [x] دعم Responsive Design
- [x] دعم متعدد اللغات (ar, en, fr)

## 📝 ملاحظات مهمة

1. **الفترة الزمنية**: يتم حساب معدل الاستجابة بناءً على آخر 90 يوم افتراضياً
2. **الحد الأدنى للبيانات**: يتطلب على الأقل 20% نسبة استجابة لعرض التصنيف
3. **التحديث التلقائي**: يتم التحديث تلقائياً عند جلب معلومات الشركة إذا مر > 24 ساعة
4. **الأداء**: يستخدم indexes على MongoDB لتحسين الأداء
5. **الخصوصية**: لا يتم عرض معلومات حساسة عن الطلبات الفردية

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ مكتمل وجاهز للإنتاج
