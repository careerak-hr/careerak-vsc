# دليل Skeleton Loaders - Careerak

## 📋 نظرة عامة

تم إنشاء نظام Skeleton Loaders متقدم يوفر تجربة تحميل سلسة للمستخدمين. بدلاً من عرض spinner عام، يتم عرض هيكل يشبه المحتوى الفعلي أثناء التحميل.

**تاريخ الإضافة**: 2026-02-17  
**الحالة**: ✅ مكتمل ومفعّل

---

## 🎯 الميزات الرئيسية

- ✅ **مطابقة التخطيط**: كل skeleton يطابق تخطيط المحتوى الفعلي
- ✅ **رسوم متحركة**: استخدام `animate-pulse` من Tailwind
- ✅ **الوضع الداكن**: دعم كامل للـ Dark Mode
- ✅ **انتقال سلس**: تحول سلس من skeleton إلى المحتوى الفعلي
- ✅ **قابل للتخصيص**: props لتخصيص عدد العناصر والحقول
- ✅ **RTL/LTR**: دعم كامل للاتجاهات

---

## 📁 الملفات

```
frontend/src/components/SkeletonLoaders/
├── index.js                    # تصدير جميع المكونات
├── ProfileSkeleton.jsx         # skeleton للملف الشخصي
├── JobListSkeleton.jsx         # skeleton لقائمة الوظائف
├── CourseListSkeleton.jsx      # skeleton لقائمة الدورات
├── FormSkeleton.jsx            # skeleton للنماذج
├── DashboardSkeleton.jsx       # skeleton للوحة التحكم
└── TableSkeleton.jsx           # skeleton للجداول
```

---

## 🔧 الاستخدام

### 1. الاستخدام الأساسي مع SuspenseWrapper

```jsx
import { SuspenseWrapper } from './components/GlobalLoaders';
import ProfilePage from './pages/ProfilePage';

// استخدام skeleton محدد
<SuspenseWrapper skeleton="profile">
  <ProfilePage />
</SuspenseWrapper>
```

### 2. الاستخدام المباشر

```jsx
import { ProfileSkeleton } from './components/SkeletonLoaders';

// عرض skeleton مباشرة
{isLoading ? <ProfileSkeleton /> : <ProfileContent />}
```

### 3. الاستخدام مع Props

```jsx
// تخصيص عدد العناصر
<SuspenseWrapper skeleton="jobList" skeletonProps={{ count: 10 }}>
  <JobListingsPage />
</SuspenseWrapper>

// تخصيص عدد الحقول في النموذج
<SuspenseWrapper skeleton="form" skeletonProps={{ fields: 6, hasTitle: true }}>
  <RegistrationForm />
</SuspenseWrapper>

// تخصيص الجدول
<SuspenseWrapper skeleton="table" skeletonProps={{ rows: 10, columns: 6, hasActions: true }}>
  <DataTable />
</SuspenseWrapper>
```

---

## 📦 أنواع Skeleton المتاحة

### 1. ProfileSkeleton
**الاستخدام**: صفحات الملف الشخصي

**المكونات**:
- صورة شخصية دائرية
- اسم ونبذة
- إحصائيات (3 بطاقات)
- أقسام المحتوى
- مهارات/علامات

**مثال**:
```jsx
<SuspenseWrapper skeleton="profile">
  <ProfilePage />
</SuspenseWrapper>
```

---

### 2. JobListSkeleton
**الاستخدام**: صفحات قوائم الوظائف

**Props**:
- `count` (افتراضي: 5) - عدد بطاقات الوظائف

**المكونات**:
- شعار الشركة
- عنوان الوظيفة واسم الشركة
- تفاصيل الوظيفة (موقع، راتب، نوع)
- وصف
- علامات المهارات
- تاريخ وزر التقديم

**مثال**:
```jsx
<SuspenseWrapper skeleton="jobList" skeletonProps={{ count: 8 }}>
  <JobListingsPage />
</SuspenseWrapper>
```

---

### 3. CourseListSkeleton
**الاستخدام**: صفحات قوائم الدورات

**Props**:
- `count` (افتراضي: 6) - عدد بطاقات الدورات

**المكونات**:
- صورة الدورة
- شارة الفئة
- عنوان الدورة
- معلومات المدرب
- التقييم وعدد الطلاب
- السعر والمدة

**مثال**:
```jsx
<SuspenseWrapper skeleton="courseList" skeletonProps={{ count: 9 }}>
  <CoursesPage />
</SuspenseWrapper>
```

---

### 4. FormSkeleton
**الاستخدام**: صفحات النماذج (تسجيل دخول، تسجيل، إعدادات)

**Props**:
- `fields` (افتراضي: 4) - عدد حقول النموذج
- `hasTitle` (افتراضي: true) - عرض عنوان النموذج

**المكونات**:
- عنوان ووصف
- حقول الإدخال
- زر الإرسال
- روابط إضافية

**مثال**:
```jsx
<SuspenseWrapper skeleton="form" skeletonProps={{ fields: 5, hasTitle: true }}>
  <LoginPage />
</SuspenseWrapper>
```

---

### 5. DashboardSkeleton
**الاستخدام**: لوحات التحكم (Admin Dashboard)

**المكونات**:
- عنوان الصفحة
- بطاقات الإحصائيات (4 بطاقات)
- رسوم بيانية (2 رسم)
- جدول النشاط الأخير

**مثال**:
```jsx
<SuspenseWrapper skeleton="dashboard">
  <AdminDashboard />
</SuspenseWrapper>
```

---

### 6. TableSkeleton
**الاستخدام**: صفحات الجداول

**Props**:
- `rows` (افتراضي: 5) - عدد الصفوف
- `columns` (افتراضي: 5) - عدد الأعمدة
- `hasActions` (افتراضي: true) - عرض عمود الإجراءات

**المكونات**:
- رأس الجدول
- صفوف البيانات
- أزرار الإجراءات
- Pagination

**مثال**:
```jsx
<SuspenseWrapper skeleton="table" skeletonProps={{ rows: 10, columns: 7, hasActions: true }}>
  <UsersTable />
</SuspenseWrapper>
```

---

## 🎨 التخصيص

### تخصيص الألوان

جميع Skeletons تستخدم ألوان Tailwind القياسية:
- **Light Mode**: `bg-gray-200`
- **Dark Mode**: `bg-gray-700`

لتخصيص الألوان، يمكنك تعديل الملفات مباشرة أو استخدام Tailwind config.

### تخصيص الرسوم المتحركة

الرسوم المتحركة تستخدم `animate-pulse` من Tailwind. لتخصيص السرعة:

```css
/* في tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

---

## 📝 أمثلة عملية

### مثال 1: صفحة الملف الشخصي

```jsx
import React, { lazy } from 'react';
import { SuspenseWrapper } from '../components/GlobalLoaders';

const ProfilePage = lazy(() => import('./ProfilePage'));

function ProfileRoute() {
  return (
    <SuspenseWrapper skeleton="profile">
      <ProfilePage />
    </SuspenseWrapper>
  );
}
```

### مثال 2: صفحة الوظائف مع تحميل بيانات

```jsx
import React, { useState, useEffect } from 'react';
import { JobListSkeleton } from '../components/SkeletonLoaders';
import JobCard from '../components/JobCard';

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <JobListSkeleton count={8} />;
  }

  return (
    <div className="space-y-4 p-4">
      {jobs.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
```

### مثال 3: Admin Dashboard

```jsx
import React, { lazy } from 'react';
import { SuspenseWrapper } from '../components/GlobalLoaders';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

function AdminRoute() {
  return (
    <SuspenseWrapper skeleton="dashboard">
      <AdminDashboard />
    </SuspenseWrapper>
  );
}
```

---

## 🔄 التكامل مع AppRoutes

يمكن تحديث `AppRoutes.jsx` لاستخدام skeletons محددة:

```jsx
// قبل
<Route path="/profile" element={
  <ProtectedRoute>
    <SuspenseWrapper><ProfilePage /></SuspenseWrapper>
  </ProtectedRoute>
} />

// بعد
<Route path="/profile" element={
  <ProtectedRoute>
    <SuspenseWrapper skeleton="profile"><ProfilePage /></SuspenseWrapper>
  </ProtectedRoute>
} />
```

---

## ✅ الفوائد

1. **تجربة مستخدم أفضل**: المستخدم يرى هيكل الصفحة أثناء التحميل
2. **تقليل الإحباط**: لا مزيد من الشاشات الفارغة أو spinners عامة
3. **احترافية**: تصميم حديث يشبه التطبيقات الكبرى
4. **أداء محسّن**: إحساس بسرعة أكبر حتى مع نفس وقت التحميل
5. **سهولة الصيانة**: مكونات منفصلة وقابلة لإعادة الاستخدام

---

## 🎯 أفضل الممارسات

1. **استخدم skeleton مطابق**: اختر skeleton يطابق تخطيط المحتوى الفعلي
2. **عدد العناصر**: اجعل عدد عناصر skeleton قريباً من العدد المتوقع
3. **لا تبالغ**: استخدم skeleton للصفحات الرئيسية فقط، ليس كل شيء
4. **اختبر الأداء**: تأكد أن skeleton لا يؤثر على الأداء
5. **Dark Mode**: اختبر في الوضعين الفاتح والداكن

---

## 🐛 استكشاف الأخطاء

### المشكلة: Skeleton لا يظهر
**الحل**: تأكد من استيراد `SuspenseWrapper` من `GlobalLoaders`

### المشكلة: الألوان غير صحيحة في Dark Mode
**الحل**: تأكد من وجود `dark:` prefix في جميع الـ classes

### المشكلة: الرسوم المتحركة لا تعمل
**الحل**: تأكد من تفعيل `animate-pulse` في Tailwind config

### المشكلة: Skeleton لا يطابق المحتوى
**الحل**: راجع تخطيط المحتوى الفعلي وعدّل skeleton ليطابقه

---

## 📚 المراجع

- [Tailwind CSS - Animation](https://tailwindcss.com/docs/animation)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Skeleton Screens Best Practices](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a)

---

## 🔄 التحديثات المستقبلية

- [ ] إضافة skeleton للـ Chat
- [ ] إضافة skeleton للـ Notifications
- [ ] تحسين الرسوم المتحركة
- [ ] إضافة shimmer effect
- [ ] دعم custom skeletons

---

**آخر تحديث**: 2026-02-17  
**الإصدار**: 1.0.0
