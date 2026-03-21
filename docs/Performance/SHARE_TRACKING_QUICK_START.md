# نظام تتبع المشاركات - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. إضافة Routes إلى التطبيق (دقيقة واحدة)

```javascript
// في backend/src/app.js أو server.js
const shareRoutes = require('./routes/shareRoutes');

// إضافة المسارات
app.use('/api', shareRoutes);
```

### 2. تسجيل مشاركة (30 ثانية)

```javascript
// Frontend
async function shareJob(jobId, platform) {
  const response = await fetch(`/api/jobs/${jobId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ platform })
  });
  
  const data = await response.json();
  console.log('Share tracked:', data);
}

// استخدام
shareJob('65f1234567890abcdef12346', 'linkedin');
```

### 3. عرض الإحصائيات (دقيقة واحدة)

```javascript
// الحصول على إحصائيات وظيفة
async function getStats(jobId) {
  const response = await fetch(`/api/jobs/${jobId}/share-stats`);
  const data = await response.json();
  
  console.log('Total shares:', data.data.totalShares);
  console.log('By platform:', data.data.sharesByPlatform);
  console.log('Trend:', data.data.recentActivity.trend);
}
```

### 4. مكون React بسيط (دقيقتان)

```jsx
import { useState, useEffect } from 'react';

function ShareButton({ jobId }) {
  const [shareCount, setShareCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // جلب العدد الحالي
    fetch(`/api/jobs/${jobId}/share-stats`)
      .then(res => res.json())
      .then(data => setShareCount(data.data.totalShares));
  }, [jobId]);

  const handleShare = async (platform) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ platform })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShareCount(data.shareCount);
        alert('تم تسجيل المشاركة!');
      } else if (data.spam) {
        alert('لقد تجاوزت الحد الأقصى للمشاركات اليوم');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-section">
      <div className="share-count">
        {shareCount} مشاركة
      </div>
      
      <div className="share-buttons">
        <button onClick={() => handleShare('linkedin')} disabled={loading}>
          LinkedIn
        </button>
        <button onClick={() => handleShare('whatsapp')} disabled={loading}>
          WhatsApp
        </button>
        <button onClick={() => handleShare('twitter')} disabled={loading}>
          Twitter
        </button>
        <button onClick={() => handleShare('facebook')} disabled={loading}>
          Facebook
        </button>
      </div>
    </div>
  );
}

export default ShareButton;
```

---

## 🧪 اختبار سريع

```bash
# 1. تشغيل الاختبارات
cd backend
npm test -- shareTracking.test.js

# 2. اختبار API يدوياً
# تسجيل مشاركة
curl -X POST "http://localhost:5000/api/jobs/YOUR_JOB_ID/share" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "linkedin"}'

# الحصول على الإحصائيات
curl "http://localhost:5000/api/jobs/YOUR_JOB_ID/share-stats"
```

---

## 📊 أمثلة سريعة

### أكثر الوظائف مشاركة
```javascript
fetch('/api/analytics/most-shared-jobs?limit=5&days=7')
  .then(res => res.json())
  .then(data => {
    console.log('Top 5 shared jobs this week:');
    data.data.forEach((job, i) => {
      console.log(`${i+1}. ${job.title} - ${job.shareCount} shares`);
    });
  });
```

### اتجاهات المشاركة
```javascript
fetch('/api/analytics/share-trends?days=7')
  .then(res => res.json())
  .then(data => {
    console.log('Share trends (last 7 days):');
    data.data.forEach(day => {
      console.log(`${day.date}: ${day.total} shares`);
    });
  });
```

---

## ⚠️ نصائح سريعة

1. **منع Spam**: الحد الأقصى 10 مشاركات/يوم لنفس الوظيفة
2. **Authentication**: معظم endpoints تتطلب تسجيل دخول
3. **Performance**: جميع الاستعلامات محسّنة بـ indexes
4. **Cleanup**: احذف السجلات القديمة شهرياً

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- [التوثيق الشامل](./SHARE_TRACKING_ANALYTICS.md)
- [Requirements](../.kiro/specs/enhanced-job-postings/requirements.md)
- [Design](../.kiro/specs/enhanced-job-postings/design.md)

---

**تم الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
