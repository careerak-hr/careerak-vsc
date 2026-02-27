# 🚀 دليل البدء السريع - نظام تتبع التفاعلات

## ⚡ البدء في 5 دقائق

### 1. تسجيل تفاعل (30 ثانية)

```javascript
// Frontend - عند النقر على "إعجاب"
const handleLike = async (jobId) => {
  try {
    const response = await fetch('/api/user-interactions/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        itemType: 'job',
        itemId: jobId,
        action: 'like',
        options: {
          sourcePage: 'recommendations',
          displayType: 'card',
          position: 1,
          originalScore: 85
        }
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ تم تسجيل الإعجاب');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};
```

### 2. عرض الإحصاءات (1 دقيقة)

```javascript
// Frontend - عرض إحصاءات المستخدم
const fetchUserStats = async () => {
  try {
    const response = await fetch('/api/user-interactions/stats?itemType=job', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      const { summary } = data.data;
      console.log(`📊 المستوى: ${summary.level}`);
      console.log(`📈 التفاعلات: ${summary.totalInteractions}`);
      console.log(`⭐ درجة المشاركة: ${summary.engagementScore}/10`);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};
```

### 3. تحديث التوصيات (30 ثانية)

```javascript
// Frontend - تحديث التوصيات بناءً على التفاعلات
const updateRecommendations = async () => {
  try {
    const response = await fetch('/api/user-interactions/update-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        itemType: 'job'
      })
    });
    
    const data = await response.json();
    if (data.success && data.data.updated) {
      console.log('✅ تم تحديث التوصيات');
      console.log(`📊 بناءً على ${data.data.interactionCount} تفاعل`);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};
```

---

## 🎯 أمثلة سريعة

### مثال 1: تتبع المشاهدة مع المدة

```javascript
let viewStartTime = Date.now();

// عند مغادرة الصفحة
window.addEventListener('beforeunload', async () => {
  const duration = Math.floor((Date.now() - viewStartTime) / 1000);
  
  await fetch('/api/user-interactions/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      itemType: 'job',
      itemId: currentJobId,
      action: 'view',
      options: { duration }
    })
  });
});
```

### مثال 2: تتبع التقديم

```javascript
const handleApply = async (jobId) => {
  // تسجيل التفاعل
  await fetch('/api/user-interactions/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      itemType: 'job',
      itemId: jobId,
      action: 'apply',
      options: {
        sourcePage: 'job_details',
        displayType: 'detailed',
        originalScore: 92
      }
    })
  });
  
  // متابعة عملية التقديم
  // ...
};
```

### مثال 3: عرض معدل التحويل

```javascript
const ConversionRateWidget = () => {
  const [rate, setRate] = useState(null);
  
  useEffect(() => {
    const fetchRate = async () => {
      const response = await fetch('/api/user-interactions/conversion-rate?itemType=job', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setRate(data.data.conversionRate);
      }
    };
    
    fetchRate();
  }, []);
  
  if (!rate) return <div>جاري التحميل...</div>;
  
  return (
    <div className="conversion-widget">
      <h3>معدل التحويل</h3>
      <div>
        <span>مشاهدة → تقديم:</span>
        <strong>{rate.viewToApply.toFixed(1)}%</strong>
      </div>
      <div>
        <span>إعجاب → تقديم:</span>
        <strong>{rate.likeToApply.toFixed(1)}%</strong>
      </div>
      <p className="interpretation">
        {data.data.interpretation.suggestion}
      </p>
    </div>
  );
};
```

---

## 🔧 استكشاف الأخطاء

### خطأ: "بيانات ناقصة"
```javascript
// ❌ خطأ
{
  itemType: 'job',
  action: 'like'
  // itemId مفقود!
}

// ✅ صحيح
{
  itemType: 'job',
  itemId: '507f1f77bcf86cd799439011',
  action: 'like'
}
```

### خطأ: "action غير صالح"
```javascript
// ❌ خطأ
{ action: 'click' }  // غير مدعوم

// ✅ صحيح
{ action: 'like' }   // view, like, apply, ignore, save
```

### خطأ: "غير مصرح به"
```javascript
// تأكد من إرسال token
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## 📊 مكونات UI جاهزة

### 1. زر الإعجاب مع التتبع

```jsx
const LikeButton = ({ jobId, initialLiked = false }) => {
  const [liked, setLiked] = useState(initialLiked);
  
  const handleLike = async () => {
    try {
      await fetch('/api/user-interactions/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: 'job',
          itemId: jobId,
          action: liked ? 'ignore' : 'like'
        })
      });
      
      setLiked(!liked);
    } catch (error) {
      console.error('خطأ:', error);
    }
  };
  
  return (
    <button 
      onClick={handleLike}
      className={liked ? 'liked' : ''}
    >
      {liked ? '❤️' : '🤍'} إعجاب
    </button>
  );
};
```

### 2. بطاقة الإحصاءات

```jsx
const StatsCard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/user-interactions/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data.summary);
      }
    };
    
    fetchStats();
  }, []);
  
  if (!stats) return <div>جاري التحميل...</div>;
  
  return (
    <div className="stats-card">
      <h3>إحصاءاتك</h3>
      <div className="stat">
        <span>المستوى:</span>
        <strong>{stats.level}</strong>
      </div>
      <div className="stat">
        <span>التفاعلات:</span>
        <strong>{stats.totalInteractions}</strong>
      </div>
      <div className="stat">
        <span>درجة المشاركة:</span>
        <strong>{stats.engagementScore}/10</strong>
      </div>
      <div className="stat">
        <span>معدل التحويل:</span>
        <strong>{stats.viewToApplyRate.toFixed(1)}%</strong>
      </div>
    </div>
  );
};
```

---

## 🎨 CSS جاهز

```css
/* بطاقة الإحصاءات */
.stats-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stats-card h3 {
  margin: 0 0 16px 0;
  color: #304B60;
  font-size: 18px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #E3DAD1;
}

.stat:last-child {
  border-bottom: none;
}

.stat span {
  color: #666;
}

.stat strong {
  color: #304B60;
  font-weight: 600;
}

/* زر الإعجاب */
button.liked {
  background: #D48161;
  color: white;
}

button:not(.liked) {
  background: #E3DAD1;
  color: #304B60;
}
```

---

## ✅ Checklist

- [ ] تسجيل تفاعل view عند مشاهدة التوصية
- [ ] تسجيل تفاعل like عند الإعجاب
- [ ] تسجيل تفاعل apply عند التقديم
- [ ] تسجيل تفاعل save عند الحفظ
- [ ] تسجيل تفاعل ignore عند التجاهل
- [ ] حساب مدة المشاهدة
- [ ] إرسال السياق الكامل (sourcePage, position, etc.)
- [ ] عرض الإحصاءات للمستخدم
- [ ] تحديث التوصيات دورياً
- [ ] اختبار جميع endpoints

---

## 📚 المزيد من الموارد

- 📄 [التوثيق الكامل](./USER_INTERACTION_TRACKING.md)
- 🧪 [الاختبارات](../../backend/tests/userInteraction.test.js)
- 🔧 [الكود المصدري](../../backend/src/models/UserInteraction.js)

---

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ جاهز للاستخدام
