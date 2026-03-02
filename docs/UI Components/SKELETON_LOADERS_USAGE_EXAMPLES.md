# أمثلة استخدام Skeleton Loaders

## 🎯 دليل سريع لتحديث المسارات

هذا الملف يوضح كيفية تحديث المسارات الموجودة لاستخدام Skeleton Loaders الجديدة.

---

## 📝 التحديثات المقترحة لـ AppRoutes.jsx

### 1. صفحات النماذج (Login, Auth, Settings)

```jsx
// ❌ قبل
<Route path="/login" element={
  <GuestRoute>
    <SuspenseWrapper><LoginPage /></SuspenseWrapper>
  </GuestRoute>
} />

// ✅ بعد
<Route path="/login" element={
  <GuestRoute>
    <SuspenseWrapper skeleton="form" skeletonProps={{ fields: 3 }}>
      <LoginPage />
    </SuspenseWrapper>
  </GuestRoute>
} />
```

```jsx
// ❌ قبل
<Route path="/auth" element={
  <GuestRoute>
    <SuspenseWrapper><AuthPage /></SuspenseWrapper>
  </GuestRoute>
} />

// ✅ بعد
<Route path="/auth" element={
  <GuestRoute>
    <SuspenseWrapper skeleton="form" skeletonProps={{ fields: 6 }}>
      <AuthPage />
    </SuspenseWrapper>
  </GuestRoute>
} />
```

---

### 2. صفحة الملف الشخصي

```jsx
// ❌ قبل
<Route path="/profile" element={
  <ProtectedRoute>
    <SuspenseWrapper><ProfilePage /></SuspenseWrapper>
  </ProtectedRoute>
} />

// ✅ بعد
<Route path="/profile" element={
  <ProtectedRoute>
    <SuspenseWrapper skeleton="profile">
      <ProfilePage />
    </SuspenseWrapper>
  </ProtectedRoute>
} />
```

---

### 3. لوحات التحكم (Admin Dashboard)

```jsx
// ❌ قبل
<Route path="/admin-dashboard" element={
  <AdminRoute>
    <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
  </AdminRoute>
} />

// ✅ بعد
<Route path="/admin-dashboard" element={
  <AdminRoute>
    <SuspenseWrapper skeleton="dashboard">
      <AdminDashboard />
    </SuspenseWrapper>
  </AdminRoute>
} />
```

---

### 4. صفحات الواجهات (Interface Pages)

إذا كانت تحتوي على قوائم وظائف أو دورات:

```jsx
// ✅ للوظائف
<Route path="/interface-individuals" element={
  <ProtectedRoute>
    <SuspenseWrapper skeleton="jobList" skeletonProps={{ count: 6 }}>
      <InterfaceIndividuals />
    </SuspenseWrapper>
  </ProtectedRoute>
} />

// ✅ للدورات
<Route path="/interface-companies" element={
  <ProtectedRoute>
    <SuspenseWrapper skeleton="courseList" skeletonProps={{ count: 6 }}>
      <InterfaceCompanies />
    </SuspenseWrapper>
  </ProtectedRoute>
} />
```

---

## 🔧 استخدام مباشر في المكونات

### مثال 1: صفحة قائمة الوظائف

```jsx
import React, { useState, useEffect } from 'react';
import { JobListSkeleton } from '../components/SkeletonLoaders';
import api from '../services/api';

function JobPostingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <JobListSkeleton count={8} />;
  }

  return (
    <div className="space-y-4 p-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

---

### مثال 2: صفحة الدورات

```jsx
import React, { useState, useEffect } from 'react';
import { CourseListSkeleton } from '../components/SkeletonLoaders';
import api from '../services/api';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <CourseListSkeleton count={9} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

---

### مثال 3: جدول المستخدمين (Admin)

```jsx
import React, { useState, useEffect } from 'react';
import { TableSkeleton } from '../components/SkeletonLoaders';
import api from '../services/api';

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <TableSkeleton rows={10} columns={6} hasActions={true} />;
  }

  return (
    <table className="w-full">
      {/* جدول المستخدمين */}
    </table>
  );
}
```

---

### مثال 4: صفحة الملف الشخصي

```jsx
import React, { useState, useEffect } from 'react';
import { ProfileSkeleton } from '../components/SkeletonLoaders';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* محتوى الملف الشخصي */}
    </div>
  );
}
```

---

## 🎨 تخصيص متقدم

### إنشاء Skeleton مخصص

إذا كنت بحاجة لـ skeleton مخصص لصفحة معينة:

```jsx
import React from 'react';

export const CustomPageSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📊 جدول مرجعي سريع

| نوع الصفحة | Skeleton المناسب | Props الشائعة |
|-----------|------------------|----------------|
| تسجيل دخول | `form` | `{ fields: 3 }` |
| تسجيل | `form` | `{ fields: 6 }` |
| ملف شخصي | `profile` | - |
| قائمة وظائف | `jobList` | `{ count: 8 }` |
| قائمة دورات | `courseList` | `{ count: 9 }` |
| لوحة تحكم | `dashboard` | - |
| جدول بيانات | `table` | `{ rows: 10, columns: 6 }` |
| إعدادات | `form` | `{ fields: 8, hasTitle: true }` |

---

## ✅ Checklist التحديث

عند تحديث صفحة لاستخدام Skeleton Loaders:

- [ ] حدد نوع الصفحة (form, profile, list, etc.)
- [ ] اختر skeleton المناسب
- [ ] حدد Props المناسبة (count, fields, etc.)
- [ ] اختبر في Light Mode
- [ ] اختبر في Dark Mode
- [ ] اختبر في RTL و LTR
- [ ] تأكد من الانتقال السلس للمحتوى الفعلي
- [ ] اختبر على أحجام شاشات مختلفة

---

## 🚀 نصائح للأداء

1. **Lazy Loading**: استخدم `React.lazy()` مع Skeleton Loaders
2. **Code Splitting**: قسّم الكود لتحسين وقت التحميل
3. **Prefetching**: استخدم prefetching للبيانات المتوقعة
4. **Caching**: احفظ البيانات المحملة في cache

```jsx
import React, { lazy, Suspense } from 'react';
import { ProfileSkeleton } from '../components/SkeletonLoaders';

// Lazy load الصفحة
const ProfilePage = lazy(() => import('./ProfilePage'));

function ProfileRoute() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
```

---

**آخر تحديث**: 2026-02-17
