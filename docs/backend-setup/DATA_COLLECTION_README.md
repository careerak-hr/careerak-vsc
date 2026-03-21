# 🤖 Data Collection Service - دليل الاستخدام

## نظرة عامة

خدمة جمع البيانات لنظام التوصيات الذكية. تجمع البيانات من قاعدة البيانات لاستخدامها في نماذج التعلم الآلي.

**المتطلبات**: Requirements 6.1 (جمع البيانات)

---

## الميزات الرئيسية

- ✅ جمع بيانات المستخدمين (الملفات الشخصية)
- ✅ جمع بيانات الوظائف
- ✅ جمع بيانات الدورات التعليمية
- ✅ جمع بيانات التفاعلات
- ✅ بناء User-Item Matrix
- ✅ جمع إحصائيات شاملة
- ✅ معالجة وتنظيف البيانات
- ✅ استخراج المهارات تلقائياً
- ✅ حساب اكتمال الملف الشخصي

---

## الاستخدام

### 1. جمع بيانات المستخدمين

```javascript
const dataCollectionService = require('./services/dataCollectionService');

// جمع جميع المستخدمين
const users = await dataCollectionService.collectUserData();

// مع خيارات
const users = await dataCollectionService.collectUserData({
  limit: 100,              // عدد المستخدمين
  skip: 0,                 // تخطي
  includeInactive: false,  // تضمين المستخدمين غير النشطين
  minCompleteness: 50      // حد أدنى لاكتمال الملف (0-100)
});

// البيانات المُرجعة
console.log(users[0]);
/*
{
  userId: ObjectId,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  skills: ['JavaScript', 'Python', 'React'],
  experiences: [{
    company: 'Tech Corp',
    position: 'Software Engineer',
    duration: 24 // بالأشهر
  }],
  education: [{
    level: 'Bachelor',
    degree: 'Computer Science'
  }],
  completeness: 85 // نسبة اكتمال الملف
}
*/
```

### 2. جمع بيانات الوظائف

```javascript
// جمع جميع الوظائف
const jobs = await dataCollectionService.collectJobData();

// مع خيارات
const jobs = await dataCollectionService.collectJobData({
  limit: 100,            // عدد الوظائف
  skip: 0,               // تخطي
  status: 'Open',        // حالة الوظيفة
  includeExpired: false  // تضمين الوظائف القديمة (> 90 يوم)
});

// البيانات المُرجعة
console.log(jobs[0]);
/*
{
  jobId: ObjectId,
  title: 'Software Engineer',
  description: '...',
  requirements: '...',
  requiredSkills: ['JavaScript', 'React', 'Node.js'],
  company: {
    id: ObjectId,
    name: 'Tech Corp',
    industry: 'Technology'
  },
  location: 'Cairo, Egypt',
  salary: { min: 5000, max: 8000 }
}
*/
```

### 3. جمع بيانات الدورات

```javascript
// جمع جميع الدورات
const courses = await dataCollectionService.collectCourseData();

// مع خيارات
const courses = await dataCollectionService.collectCourseData({
  limit: 100,            // عدد الدورات
  skip: 0,               // تخطي
  status: 'Published',   // حالة الدورة
  includeExpired: false  // تضمين الدورات المنتهية
});

// البيانات المُرجعة
console.log(courses[0]);
/*
{
  courseId: ObjectId,
  title: 'Advanced JavaScript',
  description: '...',
  skills: ['JavaScript', 'ES6', 'React'],
  instructor: {
    id: ObjectId,
    name: 'Jane Smith'
  },
  level: 'Advanced',
  duration: { value: 40, unit: 'hours' }
}
*/
```

### 4. جمع بيانات التفاعلات

```javascript
// جمع جميع التفاعلات
const interactions = await dataCollectionService.collectInteractionData();

// مع خيارات
const interactions = await dataCollectionService.collectInteractionData({
  limit: 1000,
  skip: 0,
  userId: ObjectId,      // تفاعلات مستخدم محدد
  itemType: 'job',       // نوع العنصر (job, course, candidate)
  action: 'apply',       // نوع التفاعل (view, like, apply, ignore, save)
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// البيانات المُرجعة
console.log(interactions[0]);
/*
{
  interactionId: ObjectId,
  userId: ObjectId,
  itemType: 'job',
  itemId: ObjectId,
  action: 'apply',
  duration: 30, // بالثواني
  timestamp: Date,
  context: {
    sourcePage: 'recommendations',
    position: 1,
    originalScore: 85
  },
  weight: 2.0 // وزن التفاعل
}
*/
```

### 5. جمع جميع البيانات دفعة واحدة

```javascript
const allData = await dataCollectionService.collectAllData({
  users: { limit: 100, minCompleteness: 50 },
  jobs: { status: 'Open' },
  courses: { status: 'Published' },
  interactions: { startDate: '2024-01-01' }
});

console.log(allData);
/*
{
  users: [...],
  jobs: [...],
  courses: [...],
  interactions: [...],
  metadata: {
    collectedAt: Date,
    counts: {
      users: 100,
      jobs: 50,
      courses: 30,
      interactions: 500
    }
  }
}
*/
```

### 6. بناء User-Item Matrix

```javascript
// بناء مصفوفة User-Item للوظائف
const result = await dataCollectionService.collectUserItemMatrix({
  itemType: 'job'
});

console.log(result);
/*
{
  matrix: {
    'userId1': {
      'jobId1': 1.5,  // like weight
      'jobId2': 2.0   // apply weight
    },
    'userId2': {
      'jobId1': 2.0   // apply weight
    }
  },
  metadata: {
    itemType: 'job',
    totalUsers: 2,
    totalItems: 2,
    totalInteractions: 3,
    collectedAt: Date
  }
}
*/
```

### 7. جمع إحصائيات البيانات

```javascript
const stats = await dataCollectionService.collectDataStatistics();

console.log(stats);
/*
{
  users: {
    total: 1000,
    active: 850,
    inactive: 150
  },
  jobs: {
    total: 500,
    open: 300,
    closed: 200
  },
  courses: {
    total: 200,
    published: 150,
    unpublished: 50
  },
  interactions: {
    total: 10000,
    recent: 2000,  // آخر 30 يوم
    old: 8000
  },
  collectedAt: Date
}
*/
```

---

## أوزان التفاعلات

الخدمة تحسب أوزان تلقائية للتفاعلات:

| التفاعل | الوزن | الوصف |
|---------|-------|-------|
| `apply` | 2.0 | تقديم - وزن عالي جداً |
| `like` | 1.5 | إعجاب - وزن متوسط عالي |
| `save` | 1.2 | حفظ - وزن متوسط |
| `view` | 0.5 | مشاهدة - وزن منخفض |
| `ignore` | -1.0 | تجاهل - وزن سلبي |

---

## استخراج المهارات

الخدمة تستخرج المهارات تلقائياً من:

### مصادر المهارات للمستخدمين:
- `computerSkills` - مهارات الحاسوب
- `softwareSkills` - مهارات البرامج
- `otherSkills` - مهارات أخرى

### مصادر المهارات للوظائف والدورات:
- العنوان (`title`)
- الوصف (`description`)
- المتطلبات (`requirements`)
- المحتوى (`content`)

### قائمة المهارات المدعومة:

**البرمجة**: JavaScript, Python, Java, C++, C#, PHP, Ruby, Swift, Kotlin, TypeScript, Go, Rust, Scala, R, MATLAB

**تطوير الويب**: HTML, CSS, React, Angular, Vue, Node.js, Express, Django, Flask, Spring, Laravel, ASP.NET, jQuery, Bootstrap, Tailwind

**تطوير الموبايل**: Android, iOS, React Native, Flutter, Xamarin, Ionic

**قواعد البيانات**: SQL, MySQL, PostgreSQL, MongoDB, Redis, Oracle, SQLite, Cassandra, Elasticsearch

**DevOps والسحابة**: Docker, Kubernetes, AWS, Azure, GCP, Jenkins, Git, CI/CD, Terraform, Ansible

**علم البيانات والذكاء الاصطناعي**: Machine Learning, Deep Learning, TensorFlow, PyTorch, scikit-learn, Pandas, NumPy, Data Analysis, Statistics, NLP, Computer Vision

**التصميم**: Photoshop, Illustrator, Figma, Sketch, Adobe XD, UI/UX

**الأعمال**: Excel, Word, PowerPoint, Outlook, Project Management, Agile, Scrum, Jira, Trello

**المهارات الناعمة**: Communication, Leadership, Teamwork, Problem Solving, Time Management, Critical Thinking, Creativity

---

## حساب اكتمال الملف الشخصي

الخدمة تحسب نسبة اكتمال الملف بناءً على:

### الحقول الأساسية (9 حقول):
- firstName
- lastName
- email
- phone
- country
- city
- specialization
- bio
- profileImage

### الحقول المصفوفة (8 حقول):
- interests
- educationList
- experienceList
- trainingList
- languages
- computerSkills
- softwareSkills
- otherSkills

**الحساب**: `(عدد الحقول المملوءة / 17) × 100`

---

## معالجة البيانات

### بيانات المستخدم:
- ✅ استخراج جميع المهارات في قائمة واحدة
- ✅ حساب مدة الخبرات بالأشهر
- ✅ تنظيف وتنسيق التعليم
- ✅ حساب نسبة اكتمال الملف
- ✅ إزالة البيانات الحساسة (password, otp, tokens)

### بيانات الوظائف:
- ✅ استخراج المهارات المطلوبة من النص
- ✅ تضمين معلومات الشركة
- ✅ تنظيف وتنسيق البيانات

### بيانات الدورات:
- ✅ استخراج المهارات من المحتوى
- ✅ تضمين معلومات المدرب
- ✅ حساب عدد المسجلين

### بيانات التفاعلات:
- ✅ حساب وزن التفاعل تلقائياً
- ✅ استخراج السياق المهم
- ✅ تنظيف البيانات الزائدة

---

## الأداء والتحسين

### نصائح للأداء:
1. **استخدم limit و skip للصفحات الكبيرة**
   ```javascript
   const page1 = await collectUserData({ limit: 100, skip: 0 });
   const page2 = await collectUserData({ limit: 100, skip: 100 });
   ```

2. **استخدم الفلاتر لتقليل البيانات**
   ```javascript
   const activeUsers = await collectUserData({ 
     includeInactive: false,
     minCompleteness: 70
   });
   ```

3. **جمع البيانات بشكل دوري**
   ```javascript
   // كل 24 ساعة
   setInterval(async () => {
     const data = await collectAllData();
     // حفظ في cache أو ملف
   }, 24 * 60 * 60 * 1000);
   ```

4. **استخدم collectAllData للحصول على جميع البيانات دفعة واحدة**
   ```javascript
   // أسرع من استدعاء كل دالة على حدة
   const allData = await collectAllData();
   ```

---

## معالجة الأخطاء

جميع الدوال ترمي أخطاء واضحة:

```javascript
try {
  const users = await dataCollectionService.collectUserData();
} catch (error) {
  console.error('Error:', error.message);
  // Error: Failed to collect user data: <سبب الخطأ>
}
```

---

## الاختبارات

الخدمة تحتوي على 19 اختبار شامل:

```bash
npm test -- dataCollectionService.test.js
```

### الاختبارات المغطاة:
- ✅ جمع بيانات المستخدمين (5 اختبارات)
- ✅ جمع بيانات الوظائف (4 اختبارات)
- ✅ جمع بيانات الدورات (3 اختبارات)
- ✅ جمع بيانات التفاعلات (4 اختبارات)
- ✅ جمع جميع البيانات (1 اختبار)
- ✅ بناء User-Item Matrix (1 اختبار)
- ✅ جمع الإحصائيات (1 اختبار)

---

## الاستخدام في ML Pipeline

```javascript
// 1. جمع البيانات
const allData = await dataCollectionService.collectAllData({
  users: { minCompleteness: 60 },
  jobs: { status: 'Open' },
  interactions: { 
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // آخر 90 يوم
  }
});

// 2. بناء User-Item Matrix
const matrix = await dataCollectionService.collectUserItemMatrix({
  itemType: 'job'
});

// 3. استخدام البيانات في Feature Engineering
const features = extractFeatures(allData.users, allData.jobs);

// 4. تدريب النموذج
const model = trainModel(features, matrix);

// 5. حفظ النموذج
saveModel(model);
```

---

## الملاحظات المهمة

1. **الخصوصية**: الخدمة تزيل تلقائياً البيانات الحساسة (passwords, tokens)
2. **الأداء**: استخدم limit و skip للبيانات الكبيرة
3. **التحديث**: يُنصح بجمع البيانات بشكل دوري (يومياً أو أسبوعياً)
4. **التخزين المؤقت**: يمكن حفظ البيانات في Redis للوصول السريع
5. **الفلترة**: استخدم الفلاتر لتقليل حجم البيانات المُرجعة

---

## التوثيق الإضافي

- 📄 `dataCollectionService.js` - الكود المصدري
- 📄 `dataCollectionService.test.js` - الاختبارات
- 📄 `.kiro/specs/ai-recommendations/requirements.md` - المتطلبات
- 📄 `.kiro/specs/ai-recommendations/design.md` - التصميم التقني

---

**تاريخ الإنشاء**: 2026-02-28  
**الحالة**: ✅ مكتمل ومختبر  
**المتطلبات**: Requirements 6.1
