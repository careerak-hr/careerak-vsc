# دليل البدء السريع - JobCardList

## 🚀 البدء في 5 دقائق

### 1. التثبيت (مكتمل بالفعل)

المكونات موجودة في:
```
frontend/src/components/JobCard/
├── JobCardGrid.jsx
├── JobCardList.jsx
├── JobCard.css
└── index.js
```

### 2. الاستيراد

```jsx
import { JobCardGrid, JobCardList } from './components/JobCard';
import ViewToggle from './components/ViewToggle/ViewToggle';
import './components/JobCard/JobCard.css';
```

### 3. الاستخدام الأساسي

```jsx
function JobsPage() {
  const [view, setView] = useState('grid');
  
  const jobs = [
    {
      id: 1,
      title: 'مطور Full Stack',
      company: { name: 'شركة التقنية', logo: null },
      description: 'وصف الوظيفة...',
      location: { city: 'الرياض' },
      type: 'دوام كامل',
      salary: 15000,
      createdAt: new Date(),
      requiredSkills: ['React', 'Node.js'],
      isNew: true,
      applicantCount: 45,
      matchPercentage: 85
    }
  ];

  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      
      <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
        {jobs.map(job => (
          view === 'grid' ? (
            <JobCardGrid key={job.id} job={job} />
          ) : (
            <JobCardList key={job.id} job={job} />
          )
        ))}
      </div>
    </div>
  );
}
```

### 4. إضافة Bookmark و Share

```jsx
function JobsPage() {
  const [view, setView] = useState('grid');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

  const handleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleShare = (job) => {
    alert(`مشاركة: ${job.title}`);
  };

  const handleJobClick = (job) => {
    console.log('تم النقر على:', job.title);
  };

  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      
      <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
        {jobs.map(job => (
          view === 'grid' ? (
            <JobCardGrid
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          ) : (
            <JobCardList
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          )
        ))}
      </div>
    </div>
  );
}
```

### 5. حفظ التفضيل في localStorage

```jsx
const [view, setView] = useState(() => {
  return localStorage.getItem('jobViewPreference') || 'grid';
});

const handleToggleView = (newView) => {
  setView(newView);
  localStorage.setItem('jobViewPreference', newView);
};
```

## 📱 التصميم المتجاوب

### Desktop (≥1024px)
- Grid: 3 أعمدة
- List: صف واحد كامل

### Tablet (640px - 1023px)
- Grid: عمودين
- List: صف واحد مع تعديلات

### Mobile (<640px)
- Grid: عمود واحد
- List: عرض عمودي

## 🎨 التخصيص السريع

### تغيير الألوان

```css
:root {
  --primary-color: #304B60;    /* كحلي */
  --secondary-color: #E3DAD1;  /* بيج */
  --accent-color: #D48161;     /* نحاسي */
}
```

### تغيير Breakpoints

```css
/* في JobCard.css */
@media (max-width: 1023px) and (min-width: 640px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 🧪 الاختبار

```bash
cd frontend
npm test -- JobCard.test.jsx --run
```

## 📚 مثال كامل

راجع: `frontend/src/examples/JobCardsExample.jsx`

## 🔗 روابط مفيدة

- [التوثيق الكامل](./JOB_CARD_LIST_IMPLEMENTATION.md)
- [README](../../frontend/src/components/JobCard/README.md)
- [Requirements](.kiro/specs/enhanced-job-postings/requirements.md)

## ❓ أسئلة شائعة

### كيف أضيف معلومات إضافية؟

أضف الحقول في job object:
```jsx
const job = {
  // ... الحقول الموجودة
  applicantCount: 45,      // عدد المتقدمين
  matchPercentage: 85      // نسبة التطابق
};
```

### كيف أخفي عدد المتقدمين؟

لا تضف `applicantCount` في job object، أو اجعله `undefined`.

### كيف أغير حجم Logo؟

في `JobCard.css`:
```css
.job-card-list-logo {
  width: 80px;   /* بدلاً من 64px */
  height: 80px;
}
```

### كيف أضيف animation عند التبديل؟

استخدم Framer Motion أو CSS transitions:
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {/* JobCard */}
</motion.div>
```

## 🎉 جاهز!

الآن يمكنك استخدام JobCardList في مشروعك! 🚀

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ جاهز للاستخدام
