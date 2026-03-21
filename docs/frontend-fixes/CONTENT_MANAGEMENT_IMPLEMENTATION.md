# Content Management Implementation

**تاريخ الإضافة**: 2026-02-25  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 9.1-9.7

## نظرة عامة

تم تنفيذ نظام إدارة محتوى محسّن لمنصة Careerak يتيح للمسؤولين مراجعة والموافقة على أو رفض أو حذف المحتوى المعلق والمُبلغ عنه.

## الملفات المنفذة

### Backend Services
```
backend/src/
├── services/
│   └── contentManagementService.js       # خدمة إدارة المحتوى
├── controllers/
│   └── contentManagementController.js    # معالج طلبات API
└── routes/
    └── contentManagementRoutes.js        # مسارات API
```

### Tests
```
backend/tests/
├── content-management.test.js            # 13 اختبار unit
└── content-management.property.test.js   # Property tests
```

## الميزات الرئيسية

### 1. إدارة الوظائف المعلقة
- **GET /api/admin/content/pending-jobs**
- عرض الوظائف المعلقة (status: 'Closed')
- تصفية حسب: postedBy, postingType, location, dateRange
- دعم pagination

### 2. إدارة الدورات المعلقة
- **GET /api/admin/content/pending-courses**
- عرض الدورات المعلقة (status: 'Draft')
- تصفية حسب: instructor, category, level, dateRange
- دعم pagination

### 3. إدارة المحتوى المُبلغ عنه
- **GET /api/admin/content/flagged**
- عرض التقييمات المُبلغ عنها (status: 'flagged')
- تصفية حسب: reviewType, reviewer, reviewee, minReports, dateRange
- دعم pagination

### 4. الموافقة على المحتوى
- **PATCH /api/admin/content/:id/approve**
- تغيير حالة المحتوى:
  - Job: 'Closed' → 'Open'
  - Course: 'Draft' → 'Published'
  - Review: 'flagged' → 'approved'
- إنشاء activity log
- إرسال إشعار للمنشئ

### 5. رفض المحتوى
- **PATCH /api/admin/content/:id/reject**
- تغيير حالة المحتوى:
  - Job: → 'Closed'
  - Course: → 'Archived'
  - Review: → 'rejected' + moderationNote
- إنشاء activity log مع السبب
- إرسال إشعار للمنشئ مع السبب

### 6. حذف المحتوى
- **DELETE /api/admin/content/:id**
- حذف نهائي للمحتوى
- إنشاء activity log
- لا يتم إرسال إشعار (للأمان)

## API Endpoints

### Get Pending Jobs
```http
GET /api/admin/content/pending-jobs
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- postedBy: ObjectId
- postingType: string
- location: string
- startDate: ISO date
- endDate: ISO date

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Software Engineer",
      "description": "...",
      "status": "Closed",
      "postedBy": {
        "_id": "...",
        "name": "Company Name",
        "email": "company@example.com"
      },
      "createdAt": "2026-02-25T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

### Get Pending Courses
```http
GET /api/admin/content/pending-courses
Authorization: Bearer {token}

Query Parameters:
- page: number
- limit: number
- instructor: ObjectId
- category: string
- level: 'Beginner' | 'Intermediate' | 'Advanced'
- startDate: ISO date
- endDate: ISO date

Response: Similar to pending jobs
```

### Get Flagged Content
```http
GET /api/admin/content/flagged
Authorization: Bearer {token}

Query Parameters:
- page: number
- limit: number
- reviewType: 'company_to_employee' | 'employee_to_company'
- reviewer: ObjectId
- reviewee: ObjectId
- minReports: number
- startDate: ISO date
- endDate: ISO date

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "reviewType": "employee_to_company",
      "rating": 4,
      "comment": "...",
      "status": "flagged",
      "reports": [
        {
          "reportedBy": "...",
          "reason": "spam",
          "description": "...",
          "reportedAt": "2026-02-25T10:00:00.000Z"
        }
      ],
      "reviewer": { ... },
      "reviewee": { ... },
      "jobPosting": { ... }
    }
  ],
  "pagination": { ... }
}
```

### Approve Content
```http
PATCH /api/admin/content/:id/approve
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "contentType": "job" | "course" | "review"
}

Response:
{
  "success": true,
  "message": "job approved successfully",
  "data": {
    "_id": "...",
    "title": "...",
    "status": "Open",
    ...
  }
}
```

### Reject Content
```http
PATCH /api/admin/content/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "contentType": "job" | "course" | "review",
  "reason": "Rejection reason (required)"
}

Response:
{
  "success": true,
  "message": "job rejected successfully",
  "data": {
    "_id": "...",
    "title": "...",
    "status": "Closed",
    ...
  }
}
```

### Delete Content
```http
DELETE /api/admin/content/:id?contentType=job
Authorization: Bearer {token}

Query Parameters:
- contentType: "job" | "course" | "review" (required)

Response:
{
  "success": true,
  "message": "job deleted successfully",
  "data": {
    "_id": "...",
    "title": "...",
    ...
  }
}
```

## الأمان والصلاحيات

### Authentication
- جميع endpoints محمية بـ `protect` middleware
- يتطلب JWT token صالح

### Authorization
- GET endpoints: Admin أو Moderator
- PATCH endpoints: Admin أو Moderator
- DELETE endpoint: Admin فقط

### Activity Logging
- جميع الإجراءات تُسجل في activity log
- يتضمن: actorId, actionType, targetType, targetId, details

### Notifications
- الموافقة: إشعار بالموافقة
- الرفض: إشعار مع السبب
- الحذف: لا إشعار (للأمان)

## الاختبارات

### Unit Tests (13 اختبار)
```bash
npm test -- content-management.test.js
```

**الاختبارات المنفذة**:
1. ✅ Approve job with notification
2. ✅ Approve course with notification
3. ✅ Approve review with notification
4. ✅ Reject job with reason
5. ✅ Reject course with reason
6. ✅ Reject review with moderationNote
7. ✅ Reject without reason (error)
8. ✅ Delete job (no notification)
9. ✅ Delete course (no notification)
10. ✅ Delete review (no notification)
11. ✅ Filter jobs by posting type
12. ✅ Filter courses by level
13. ✅ Pagination

### Property Tests
```bash
npm test -- content-management.property.test.js
```

**Property 25: Content Moderation Actions**
- Approve updates status, logs, and notifies
- Reject updates status, logs with reason, and notifies
- Delete removes content, logs, no notification

**Property 26: Content Filtering by Status**
- getPendingJobs returns only Closed jobs
- getPendingCourses returns only Draft courses
- getFlaggedContent returns only flagged reviews

## أمثلة الاستخدام

### Frontend Integration

```javascript
import axios from 'axios';

// Get pending jobs
const getPendingJobs = async (filters = {}) => {
  const response = await axios.get('/api/admin/content/pending-jobs', {
    params: filters,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Approve content
const approveContent = async (contentId, contentType) => {
  const response = await axios.patch(
    `/api/admin/content/${contentId}/approve`,
    { contentType },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Reject content
const rejectContent = async (contentId, contentType, reason) => {
  const response = await axios.patch(
    `/api/admin/content/${contentId}/reject`,
    { contentType, reason },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Delete content
const deleteContent = async (contentId, contentType) => {
  const response = await axios.delete(
    `/api/admin/content/${contentId}`,
    {
      params: { contentType },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

function ContentManagement() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadPendingJobs();
  }, []);
  
  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      const data = await getPendingJobs();
      setPendingJobs(data.data);
    } catch (error) {
      console.error('Failed to load pending jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (jobId) => {
    try {
      await approveContent(jobId, 'job');
      alert('Job approved successfully');
      loadPendingJobs(); // Reload
    } catch (error) {
      alert('Failed to approve job');
    }
  };
  
  const handleReject = async (jobId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await rejectContent(jobId, 'job', reason);
      alert('Job rejected successfully');
      loadPendingJobs(); // Reload
    } catch (error) {
      alert('Failed to reject job');
    }
  };
  
  return (
    <div>
      <h2>Pending Jobs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {pendingJobs.map(job => (
            <li key={job._id}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <button onClick={() => handleApprove(job._id)}>
                Approve
              </button>
              <button onClick={() => handleReject(job._id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## الفوائد المتوقعة

- 🛡️ تحسين جودة المحتوى (90%+ محتوى عالي الجودة)
- ⚡ معالجة أسرع للمحتوى المعلق (< 24 ساعة)
- 📊 شفافية أكبر في عملية المراجعة
- 🔍 تتبع كامل لجميع إجراءات المراجعة
- ✅ تجربة أفضل للمستخدمين والمسؤولين

## ملاحظات مهمة

- جميع endpoints محمية بـ authentication و authorization
- الحذف متاح للـ Admin فقط
- جميع الإجراءات تُسجل في activity log
- الإشعارات تُرسل تلقائياً للمنشئين
- دعم pagination لجميع قوائم المحتوى
- التصفية المتقدمة لجميع أنواع المحتوى

## التكامل مع الأنظمة الموجودة

- ✅ Activity Log Service
- ✅ Admin Notification Service
- ✅ Job Posting Model
- ✅ Educational Course Model
- ✅ Review Model
- ✅ Authentication Middleware
- ✅ Authorization Middleware

تم إضافة Content Management Implementation بنجاح - 2026-02-25
