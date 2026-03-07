# View Transition Animations - دليل البدء السريع

## 🚀 البدء في 5 دقائق

### 1. التثبيت (إذا لم يكن مثبتاً)

```bash
cd frontend
npm install framer-motion
```

### 2. الاستخدام الأساسي

```jsx
import JobsContainer from './components/JobsContainer/JobsContainer';
import { useViewPreference } from './hooks/useViewPreference';

function JobsPage() {
  const [view, toggleView] = useViewPreference();
  const jobs = [/* ... */];

  return (
    <div>
      <button onClick={toggleView}>
        {view === 'grid' ? 'List' : 'Grid'}
      </button>
      
      <JobsContainer
        jobs={jobs}
        view={view}
      />
    </div>
  );
}
```

### 3. تشغيل المثال

```bash
cd frontend
npm start

# افتح المتصفح على:
# http://localhost:3000/examples/jobs-container
```

---

## 📦 الملفات المهمة

```
frontend/src/
├── components/JobsContainer/
│   ├── JobsContainer.jsx          # المكون الرئيسي
│   └── JobsContainer.css          # التنسيقات
└── examples/
    └── JobsContainerExample.jsx   # مثال كامل
```

---

## 🎯 الميزات الرئيسية

- ✅ انتقال سلس (< 300ms)
- ✅ Spring animation
- ✅ Stagger effect
- ✅ GPU-accelerated
- ✅ Reduced motion support

---

## 🧪 الاختبار

```bash
npm test -- JobsContainer.test.jsx
```

---

## 📚 التوثيق الكامل

انظر `VIEW_TRANSITION_ANIMATIONS.md` للتفاصيل الكاملة.

---

## 💡 نصائح سريعة

1. استخدم `useViewPreference` لحفظ التفضيل
2. مرر `bookmarkedJobs` لتتبع الوظائف المحفوظة
3. استخدم callbacks للتفاعل مع البطاقات
4. جرب على أجهزة مختلفة

---

**تاريخ الإنشاء:** 2026-03-06
