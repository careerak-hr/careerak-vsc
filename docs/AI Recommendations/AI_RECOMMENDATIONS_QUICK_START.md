# نظام التوصيات الذكية - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. إعداد Python Environment

```bash
cd backend/ml
python setup.py
```

هذا سيقوم بـ:
- ✅ إنشاء virtual environment
- ✅ تثبيت جميع المكتبات
- ✅ تحميل نماذج spaCy
- ✅ إنشاء المجلدات
- ✅ إنشاء ملف .env

### 2. تفعيل البيئة الافتراضية

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. تشغيل Redis

```bash
redis-server
```

### 4. تحديث ملف .env

```env
MONGODB_URI=mongodb://localhost:27017/careerak
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. تشغيل Celery

```bash
celery -A celery_app worker --beat --loglevel=info
```

---

## 📦 النماذج المتاحة

### Recommendation Model
```javascript
const Recommendation = require('./models/Recommendation');

// جلب توصيات
const recs = await Recommendation.getUserRecommendations(userId, {
  itemType: 'job',
  limit: 20
});
```

### UserInteraction Model
```javascript
const UserInteraction = require('./models/UserInteraction');

// تسجيل تفاعل
await UserInteraction.logInteraction(userId, 'job', jobId, 'view', {
  duration: 45
});
```

### MLModel Model
```javascript
const MLModel = require('./models/MLModel');

// الحصول على النموذج النشط
const model = await MLModel.getActiveModel('content_based');
```

---

## 💾 Redis Cache

```javascript
const { cacheSet, cacheGet, CacheKeys } = require('./config/redis');

// حفظ
await cacheSet(CacheKeys.userRecommendations(userId, 'job'), data, 3600);

// جلب
const cached = await cacheGet(CacheKeys.userRecommendations(userId, 'job'));
```

---

## 🔄 Celery Tasks

```python
from tasks.recommendation_tasks import generate_user_recommendations

# توليد توصيات
result = generate_user_recommendations.delay(user_id='123', item_type='job')
```

---

## 📊 المراقبة

### Flower (Celery UI)
```bash
pip install flower
celery -A celery_app flower
```
افتح: http://localhost:5555

### Redis Commander
```bash
npm install -g redis-commander
redis-commander
```
افتح: http://localhost:8081

---

## 🧪 الاختبار

```bash
# اختبار Celery
python -c "from celery_app import debug_task; print(debug_task.delay().get())"

# اختبار Redis
redis-cli ping
```

---

## 📚 التوثيق الكامل

- 📄 `docs/AI_RECOMMENDATIONS_TASK1_SETUP.md` - دليل شامل
- 📄 `backend/ml/README.md` - توثيق ML/AI
- 📄 `.kiro/specs/ai-recommendations/` - المواصفات الكاملة

---

## 🆘 استكشاف الأخطاء

### Redis لا يعمل
```bash
redis-cli ping  # يجب أن يرجع PONG
```

### Celery لا يتصل
تحقق من `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### نماذج spaCy مفقودة
```bash
python -m spacy download en_core_web_sm
python -m spacy download ar_core_news_sm
```

---

**الحالة**: ✅ جاهز للاستخدام  
**تاريخ**: 2026-02-28
