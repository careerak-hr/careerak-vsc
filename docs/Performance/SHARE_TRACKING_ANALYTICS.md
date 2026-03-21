# نظام تتبع المشاركات (Share Tracking Analytics)

## 📋 معلومات النظام
- **تاريخ الإنشاء**: 2026-03-06
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 3.6 (تتبع عدد المشاركات)

---

## 🎯 نظرة عامة

نظام شامل لتتبع وتحليل مشاركات الوظائف على وسائل التواصل الاجتماعي. يوفر إحصائيات تفصيلية، اتجاهات، ومنع spam.

---

## 📁 الملفات الأساسية

```
backend/
├── src/
│   ├── models/
│   │   ├── JobShare.js                      # نموذج المشاركات
│   │   └── JobPosting.js                    # محدّث بـ shareCount
│   ├── services/
│   │   └── shareTrackingService.js          # خدمة التتبع (400+ سطر)
│   ├── controllers/
│   │   └── shareController.js               # معالج الطلبات
│   └── routes/
│       └── shareRoutes.js                   # مسارات API
└── tests/
    └── shareTracking.test.js                # 15 اختبار شامل
```

---

## 🔑 الميزات الرئيسية

### 1. تسجيل المشاركات
- ✅ تتبع تلقائي لجميع المشاركات
- ✅ دعم 6 منصات (WhatsApp, LinkedIn, Twitter, Facebook, Copy, Native)
- ✅ تسجيل metadata (device, browser, OS)
- ✅ منع spam (حد أقصى 10 مشاركات/يوم)

### 2. الإحصائيات
- ✅ إحصائيات لكل وظيفة
- ✅ إحصائيات لكل مستخدم
- ✅ أكثر الوظائف مشاركة
- ✅ اتجاهات المشاركة (trends)

### 3. التحليلات
- ✅ التوزيع حسب المنصة
- ✅ عدد المستخدمين الفريدين
- ✅ متوسط المشاركات لكل مستخدم
- ✅ مقارنة الفترات الزمنية

---

## 📊 نموذج البيانات (JobShare)

```javascript
{
  jobId: ObjectId,              // معرف الوظيفة
  userId: ObjectId,             // معرف المستخدم
  platform: String,             // المنصة (whatsapp, linkedin, etc.)
  timestamp: Date,              // وقت المشاركة
  ipAddress: String,            // عنوان IP
  userAgent: String,            // معلومات المتصفح
  metadata: {
    deviceType: String,         // mobile, tablet, desktop
    browser: String,            // Chrome, Safari, etc.
    os: String,                 // Windows, iOS, Android
    referrer: String            // المصدر
  }
}
```

---

## 🔌 API Endpoints

### 1. تسجيل مشاركة
```http
POST /api/jobs/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "linkedin",
  "metadata": {
    "deviceType": "mobile",
    "browser": "Chrome",
    "os": "Android"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Share tracked successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "jobId": "65f1234567890abcdef12346",
    "platform": "linkedin",
    "timestamp": "2026-03-06T10:30:00.000Z"
  },
  "shareCount": 15
}
```

---

### 2. إحصائيات وظيفة
```http
GET /api/jobs/:id/share-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "65f1234567890abcdef12346",
    "jobTitle": "Senior Full Stack Developer",
    "totalShares": 45,
    "uniqueSharers": 28,
    "sharesByPlatform": {
      "linkedin": 18,
      "whatsapp": 12,
      "twitter": 8,
      "facebook": 5,
      "copy": 2
    },
    "recentActivity": {
      "last7Days": 12,
      "last30Days": 45,
      "trend": "+25.0%"
    },
    "averageSharesPerUser": "1.61"
  }
}
```

---

### 3. إحصائيات المستخدم
```http
GET /api/users/me/share-stats?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "65f1234567890abcdef12347",
    "period": "30 days",
    "totalShares": 15,
    "platformCount": 4,
    "jobCount": 8
  }
}
```

---

### 4. أكثر الوظائف مشاركة
```http
GET /api/analytics/most-shared-jobs?limit=10&days=30
```

**Response:**
```json
{
  "success": true,
  "period": "30 days",
  "data": [
    {
      "jobId": "65f1234567890abcdef12346",
      "title": "Senior Full Stack Developer",
      "company": "Tech Corp",
      "shareCount": 45,
      "uniqueSharers": 28,
      "platformsUsed": 5,
      "averageSharesPerUser": "1.61"
    },
    {
      "jobId": "65f1234567890abcdef12348",
      "title": "Product Manager",
      "company": "Startup Inc",
      "shareCount": 38,
      "uniqueSharers": 25,
      "platformsUsed": 4,
      "averageSharesPerUser": "1.52"
    }
  ]
}
```

---

### 5. اتجاهات المشاركة
```http
GET /api/analytics/share-trends?jobId=65f1234567890abcdef12346&days=7
```

**Response:**
```json
{
  "success": true,
  "period": "7 days",
  "jobId": "65f1234567890abcdef12346",
  "data": [
    {
      "date": "2026-03-01",
      "total": 8,
      "byPlatform": {
        "linkedin": 4,
        "whatsapp": 2,
        "twitter": 2
      }
    },
    {
      "date": "2026-03-02",
      "total": 12,
      "byPlatform": {
        "linkedin": 6,
        "whatsapp": 3,
        "twitter": 2,
        "facebook": 1
      }
    }
  ]
}
```

---

### 6. حذف السجلات القديمة (Admin)
```http
DELETE /api/analytics/cleanup-shares?days=365
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 1250 share records older than 365 days",
  "deletedCount": 1250
}
```

---

## 🛡️ منع Spam

### القواعد
- حد أقصى: 10 مشاركات لنفس الوظيفة في 24 ساعة
- يتم التحقق تلقائياً قبل كل مشاركة
- رسالة خطأ واضحة عند تجاوز الحد

### Response عند Spam
```json
{
  "success": false,
  "error": "Share limit exceeded. Maximum 10 shares per job per day.",
  "spam": true
}
```

**HTTP Status**: 429 (Too Many Requests)

---

## 📈 الاستخدام في Frontend

### تسجيل مشاركة
```javascript
async function shareJob(jobId, platform) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        platform,
        metadata: {
          deviceType: getDeviceType(),
          browser: getBrowser(),
          os: getOS()
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Share tracked! New count: ${data.shareCount}`);
      updateShareCount(data.shareCount);
    } else if (data.spam) {
      showError('لقد تجاوزت الحد الأقصى للمشاركات اليوم');
    }
  } catch (error) {
    console.error('Error tracking share:', error);
  }
}
```

### عرض الإحصائيات
```javascript
async function loadShareStats(jobId) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/share-stats`);
    const data = await response.json();
    
    if (data.success) {
      const stats = data.data;
      
      // عرض العدد الإجمالي
      document.getElementById('total-shares').textContent = stats.totalShares;
      
      // عرض التوزيع حسب المنصة
      renderPlatformChart(stats.sharesByPlatform);
      
      // عرض الاتجاه
      document.getElementById('trend').textContent = stats.recentActivity.trend;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات
```bash
cd backend
npm test -- shareTracking.test.js
```

### الاختبارات المتاحة (15 اختبار)
1. ✅ تسجيل مشاركة بنجاح
2. ✅ رفض مشاركة لوظيفة غير موجودة
3. ✅ منع spam (> 10 مشاركات/يوم)
4. ✅ تحديث shareCount في الوظيفة
5. ✅ إحصائيات وظيفة صحيحة
6. ✅ رفض معرف وظيفة غير صالح
7. ✅ رفض وظيفة غير موجودة
8. ✅ إحصائيات مستخدم صحيحة
9. ✅ إحصائيات فارغة لمستخدم جديد
10. ✅ أكثر الوظائف مشاركة
11. ✅ اتجاهات المشاركة لوظيفة
12. ✅ اتجاهات لجميع الوظائف
13. ✅ حذف السجلات القديمة
14. ✅ getShareCount
15. ✅ getSharesByPlatform

**النتيجة**: ✅ 15/15 اختبارات نجحت

---

## 📊 مؤشرات الأداء (KPIs)

### الأهداف
- 📈 معدل المشاركة: > 10% من المشاهدات
- 📈 متوسط المشاركات لكل وظيفة: > 5
- 📈 تنوع المنصات: استخدام 3+ منصات
- ⚡ وقت الاستجابة: < 200ms

### المقاييس المتتبعة
- إجمالي المشاركات
- المشاركات حسب المنصة
- عدد المستخدمين الفريدين
- الاتجاهات الزمنية
- معدل النمو

---

## 🔧 الصيانة

### تنظيف دوري
```bash
# حذف السجلات الأقدم من سنة (يدوياً)
curl -X DELETE "http://localhost:5000/api/analytics/cleanup-shares?days=365" \
  -H "Authorization: Bearer <admin-token>"
```

### Cron Job (موصى به)
```bash
# كل شهر في الساعة 2 صباحاً
0 2 1 * * curl -X DELETE "http://localhost:5000/api/analytics/cleanup-shares?days=365" \
  -H "Authorization: Bearer <admin-token>"
```

---

## 🎨 أمثلة UI

### عرض عداد المشاركات
```jsx
function ShareCounter({ jobId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/share-stats`)
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, [jobId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="share-stats">
      <div className="total-shares">
        <FaShare />
        <span>{stats.totalShares} مشاركة</span>
      </div>
      
      <div className="platform-breakdown">
        {Object.entries(stats.sharesByPlatform).map(([platform, count]) => (
          <div key={platform} className="platform-stat">
            <PlatformIcon platform={platform} />
            <span>{count}</span>
          </div>
        ))}
      </div>
      
      <div className="trend">
        <span className={stats.recentActivity.trend.startsWith('+') ? 'positive' : 'negative'}>
          {stats.recentActivity.trend}
        </span>
        <span className="period">آخر 7 أيام</span>
      </div>
    </div>
  );
}
```

---

## 🚀 الفوائد المتوقعة

### للمنصة
- 📊 فهم أفضل لسلوك المستخدمين
- 📈 تحديد الوظائف الأكثر جاذبية
- 🎯 تحسين استراتيجية المحتوى
- 💡 رؤى قيمة للتسويق

### للشركات
- 📈 قياس مدى انتشار إعلاناتهم
- 🎯 فهم أي منصات أكثر فعالية
- 💼 تحسين استراتيجية التوظيف
- 📊 ROI أفضل للإعلانات

### للباحثين عن عمل
- 🌟 اكتشاف الوظائف الشائعة
- 🤝 مشاركة الفرص مع الأصدقاء
- 📱 سهولة المشاركة على جميع المنصات

---

## ⚠️ ملاحظات مهمة

1. **الخصوصية**: لا يتم تخزين معلومات شخصية حساسة
2. **الأداء**: جميع الاستعلامات محسّنة بـ indexes
3. **Spam**: حماية تلقائية من الإساءة
4. **Scalability**: يدعم ملايين المشاركات
5. **Analytics**: بيانات في الوقت الفعلي

---

## 📚 المراجع

- [Requirements 3.6](../.kiro/specs/enhanced-job-postings/requirements.md#3-مشاركة-الوظيفة-على-وسائل-التواصل)
- [Design Document](../.kiro/specs/enhanced-job-postings/design.md#6-share-system)
- [Tasks](../.kiro/specs/enhanced-job-postings/tasks.md#5-تنفيذ-نظام-المشاركة)

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل
