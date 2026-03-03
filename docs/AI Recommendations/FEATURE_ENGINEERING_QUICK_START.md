# 🚀 Feature Engineering - دليل البدء السريع

## 📋 معلومات
- **المهمة**: Task 2.2
- **الوقت المتوقع**: 5 دقائق
- **المتطلبات**: Node.js, MongoDB

---

## ⚡ البدء السريع

### 1. الاستيراد

```javascript
const featureEngineeringService = require('./src/services/featureEngineeringService');
```

### 2. استخراج User Features

```javascript
const user = {
  userId: 'user123',
  skills: ['JavaScript', 'React', 'NodeJS'],
  experiences: [{ duration: 36, jobLevel: 'senior' }],
  education: [{ level: 'Bachelor' }],
  languages: [{ language: 'Arabic', proficiency: 'native' }]
};

const features = featureEngineeringService.extractUserFeatures(user);

console.log('Skills:', features.features.skills);
console.log('Experience:', features.features.experience.totalYears, 'years');
```

### 3. استخراج Job Features

```javascript
const job = {
  jobId: 'job123',
  title: 'Senior Developer',
  description: 'Looking for React developer',
  requirements: 'Bachelor degree, 5+ years',
  salary: 8000,
  requiredSkills: ['React', 'NodeJS', 'MongoDB']
};

const features = featureEngineeringService.extractJobFeatures(job);

console.log('Skills:', features.features.skills);
console.log('Salary Range:', features.features.salary.range);
```

### 4. إنشاء User-Item Matrix

```javascript
const interactions = [
  { userId: 'user1', itemId: 'job1', action: 'apply', weight: 2.0, duration: 120 },
  { userId: 'user1', itemId: 'job2', action: 'like', weight: 1.5, duration: 60 },
  { userId: 'user2', itemId: 'job1', action: 'view', weight: 0.5, duration: 30 }
];

const matrix = featureEngineeringService.createUserItemMatrix(interactions, 'job');

console.log('Matrix Size:', matrix.metadata.totalUsers, 'x', matrix.metadata.totalItems);
console.log('Sparsity:', (matrix.metadata.sparsity * 100).toFixed(2) + '%');
```

### 5. حساب TF-IDF Embeddings

```javascript
const documents = [
  { id: 'job1', text: 'JavaScript developer with React experience' },
  { id: 'job2', text: 'Python developer with Django and Flask' }
];

const result = featureEngineeringService.computeTfIdfEmbeddings(documents);

console.log('Vocabulary Size:', result.metadata.vocabularySize);
console.log('Document 1 Terms:', Object.keys(result.embeddings[0].vector).length);
```

---

## 🎯 حالات استخدام شائعة

### حساب التطابق بين مستخدم ووظيفة

```javascript
// 1. استخراج Features
const userFeatures = featureEngineeringService.extractUserFeatures(user);
const jobFeatures = featureEngineeringService.extractJobFeatures(job);

// 2. حساب التشابه في المهارات
const userSkills = Object.keys(userFeatures.features.skills);
const jobSkills = Object.keys(jobFeatures.features.skills);

const matchingSkills = userSkills.filter(skill => jobSkills.includes(skill));
const matchPercentage = (matchingSkills.length / jobSkills.length) * 100;

console.log('Skill Match:', matchPercentage.toFixed(1) + '%');
console.log('Matching Skills:', matchingSkills);
```

### معالجة دفعة من البيانات

```javascript
const dataCollectionService = require('./src/services/dataCollectionService');

// جمع البيانات
const users = await dataCollectionService.collectUserData({ limit: 100 });
const jobs = await dataCollectionService.collectJobData({ limit: 50 });

// معالجة دفعة
const userFeatures = featureEngineeringService.batchProcessUsers(users);
const jobFeatures = featureEngineeringService.batchProcessJobs(jobs);

console.log('Processed:', userFeatures.length, 'users');
console.log('Processed:', jobFeatures.length, 'jobs');
```

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
cd backend
npm test -- featureEngineering.test.js

# تشغيل الأمثلة
node examples/featureEngineeringExample.js
```

---

## 📊 Feature Vectors

### User Features

```javascript
{
  skills: { javascript: 1, react: 1, nodejs: 1 },
  experience: { totalYears: 3, levels: { senior: 1 } },
  education: { highestLevel: 3, highestLevelName: 'bachelor' },
  location: { country: 'saudi arabia', city: 'riyadh' },
  completeness: 85,
  textEmbedding: { experienced: 0.8, developer: 0.9 },
  languages: { languages: { arabic: 1.0, english: 1.0 } }
}
```

### Job Features

```javascript
{
  skills: { react: 1, nodejs: 1, mongodb: 1 },
  jobType: { postingType: 'job', isFullTime: true },
  location: { country: 'uae', city: 'dubai' },
  salary: { amount: 8000, range: 'high', hasSalary: true },
  textEmbedding: { developer: 0.9, experienced: 0.7 },
  company: { hasCompany: true, industry: 'technology' }
}
```

---

## 🔍 نصائح مهمة

### ✅ افعل

- استخدم Batch Processing للدفعات الكبيرة
- تحقق من البيانات قبل الاستخراج
- خزّن Features المستخرجة مؤقتاً
- استخدم Sparse Matrix للبيانات الكبيرة

### ❌ لا تفعل

- لا تستخرج Features لكل طلب
- لا تستخدم Dense Matrix للبيانات الكبيرة
- لا تتجاهل معالجة الأخطاء
- لا تنسى تطبيع البيانات

---

## 📚 الخطوات التالية

1. ✅ **Task 2.2 مكتمل** - Feature Engineering
2. ⏭️ **Task 3.1** - Content-Based Filtering
3. ⏭️ **Task 5.1** - User-Item Matrix للـ Collaborative Filtering

---

## 🆘 المساعدة

### الوثائق الكاملة
📄 `backend/docs/FEATURE_ENGINEERING_IMPLEMENTATION.md`

### الأمثلة
📄 `backend/examples/featureEngineeringExample.js`

### الاختبارات
📄 `backend/tests/featureEngineering.test.js`

---

**تاريخ الإنشاء**: 2026-02-28  
**الحالة**: ✅ جاهز للاستخدام
