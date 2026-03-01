# Careerak ML/AI Environment
# بيئة التعلم الآلي والذكاء الاصطناعي لكاريرك

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع مكونات التعلم الآلي والذكاء الاصطناعي لنظام التوصيات الذكية في كاريرك.

## 🏗️ البنية

```
ml/
├── celery_app.py           # تطبيق Celery الرئيسي
├── requirements.txt        # متطلبات Python
├── setup.py               # سكريبت الإعداد
├── .env                   # المتغيرات البيئية
├── tasks/                 # مهام Celery الخلفية
│   ├── __init__.py
│   ├── recommendation_tasks.py
│   ├── training_tasks.py
│   ├── analysis_tasks.py
│   ├── feature_tasks.py
│   └── maintenance_tasks.py
├── models/                # نماذج ML المدربة
├── data/                  # البيانات
│   ├── raw/              # بيانات خام
│   ├── processed/        # بيانات معالجة
│   └── features/         # ميزات مستخرجة
├── logs/                  # سجلات
└── cache/                 # كاش مؤقت
```

## 🚀 الإعداد السريع

### 1. تثبيت Python

تأكد من تثبيت Python 3.8 أو أحدث:

```bash
python --version
```

### 2. تشغيل سكريبت الإعداد

```bash
cd backend/ml
python setup.py
```

هذا السكريبت سيقوم بـ:
- ✅ التحقق من إصدار Python
- ✅ إنشاء بيئة افتراضية (virtual environment)
- ✅ تثبيت جميع المتطلبات من requirements.txt
- ✅ تحميل نماذج spaCy للغة العربية والإنجليزية
- ✅ إنشاء المجلدات الضرورية
- ✅ إنشاء ملف .env

### 3. تفعيل البيئة الافتراضية

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. تحديث ملف .env

افتح ملف `.env` وحدث الإعدادات:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/careerak

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Model Settings
MODEL_VERSION=1.0.0
MODEL_PATH=./models
```

## 🔧 تشغيل Celery

### تشغيل Celery Worker

```bash
# تفعيل البيئة الافتراضية أولاً
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows

# تشغيل Worker
celery -A celery_app worker --loglevel=info
```

### تشغيل Celery Beat (للمهام المجدولة)

```bash
celery -A celery_app beat --loglevel=info
```

### تشغيل Worker و Beat معاً

```bash
celery -A celery_app worker --beat --loglevel=info
```

### تشغيل مع قوائم انتظار محددة

```bash
# قائمة التوصيات فقط
celery -A celery_app worker -Q recommendations --loglevel=info

# قائمة التدريب فقط
celery -A celery_app worker -Q training --loglevel=info

# قوائم متعددة
celery -A celery_app worker -Q recommendations,training,analysis --loglevel=info
```

## 📦 المتطلبات

### Core ML Libraries
- **scikit-learn**: خوارزميات ML الأساسية
- **pandas**: معالجة البيانات
- **numpy**: عمليات رياضية

### NLP Libraries
- **spaCy**: معالجة اللغة الطبيعية
- **nltk**: أدوات NLP إضافية
- **camel-tools**: معالجة اللغة العربية
- **sentence-transformers**: تحويل النصوص إلى embeddings

### Document Processing
- **pdfplumber**: قراءة ملفات PDF
- **python-docx**: قراءة ملفات Word
- **PyPDF2**: معالجة PDF

## 🎯 المهام المتاحة

### مهام التوصيات (Recommendation Tasks)

```python
from tasks.recommendation_tasks import generate_user_recommendations

# توليد توصيات لمستخدم
result = generate_user_recommendations.delay(user_id='123', item_type='job')
```

### مهام التدريب (Training Tasks)

```python
from tasks.training_tasks import train_content_based_model

# تدريب نموذج
result = train_content_based_model.delay()
```

### مهام التحليل (Analysis Tasks)

```python
from tasks.analysis_tasks import analyze_cv

# تحليل CV
result = analyze_cv.delay(user_id='123', cv_path='/path/to/cv.pdf')
```

## 📊 المهام المجدولة

| المهمة | الجدول | الوصف |
|--------|--------|-------|
| `update-recommendations-daily` | يومياً 2:00 ص | تحديث التوصيات لجميع المستخدمين |
| `retrain-models-weekly` | الإثنين 3:00 ص | إعادة تدريب النماذج |
| `update-features-6h` | كل 6 ساعات | تحديث الميزات |
| `cleanup-cache-daily` | يومياً 4:00 ص | تنظيف الكاش القديم |
| `analyze-performance-weekly` | الأحد 5:00 ص | تحليل أداء النماذج |

## 🔍 المراقبة

### Flower (واجهة مراقبة Celery)

```bash
pip install flower
celery -A celery_app flower
```

ثم افتح: http://localhost:5555

### سجلات Celery

السجلات تُحفظ في مجلد `logs/`:
- `celery_worker.log`: سجلات Worker
- `celery_beat.log`: سجلات Beat
- `ml.log`: سجلات ML العامة

## 🧪 الاختبار

```bash
# تشغيل مهمة تجريبية
python -c "from celery_app import debug_task; print(debug_task.delay().get())"
```

## 🐛 استكشاف الأخطاء

### Redis لا يعمل

```bash
# تحقق من حالة Redis
redis-cli ping
# يجب أن يرجع: PONG

# إذا لم يعمل، شغّل Redis
redis-server
```

### Celery لا يتصل بـ Redis

تحقق من إعدادات Redis في `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### خطأ في استيراد الوحدات

تأكد من تفعيل البيئة الافتراضية:
```bash
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### نماذج spaCy مفقودة

```bash
python -m spacy download en_core_web_sm
python -m spacy download ar_core_news_sm
```

## 📚 الموارد

- [Celery Documentation](https://docs.celeryproject.org/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [spaCy Documentation](https://spacy.io/)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 المساهمة

عند إضافة مهام جديدة:
1. أضف المهمة في المجلد المناسب في `tasks/`
2. سجّل المهمة في `celery_app.py` إذا كانت مجدولة
3. أضف اختبارات في `tests/`
4. حدّث هذا الملف

## 📝 ملاحظات

- جميع المهام تستخدم `bind=True` للوصول إلى `self`
- المهام تدعم إعادة المحاولة تلقائياً عند الفشل
- استخدم `logger` للسجلات بدلاً من `print`
- احفظ النماذج المدربة في مجلد `models/`
- استخدم Redis للكاش المؤقت

---

**تاريخ الإنشاء**: 2026-02-28  
**الحالة**: جاهز للتطوير
