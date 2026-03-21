# Admin Dashboard API Documentation

## نظرة عامة

هذا التوثيق يغطي جميع API endpoints الخاصة بلوحة تحكم الأدمن في منصة Careerak. جميع الـ endpoints محمية وتتطلب authentication و authorization.

## المصادقة والتفويض

### المتطلبات الأساسية
- **Authentication**: جميع الـ endpoints تتطلب JWT token صالح
- **Authorization**: معظم الـ endpoints تتطلب دور Admin أو HR أو Moderator
- **Headers المطلوبة**:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```

### أدوار المستخدمين
- **Admin**: وصول كامل لجميع الميزات
- **HR**: وصول للإحصائيات وإدارة المحتوى
- **Moderator**: وصول للإحصائيات والإشعارات وسجل الأنشطة

### رموز الأخطاء الشائعة
- `401 Unauthorized`: Token غير صالح أو منتهي الصلاحية
- `403 Forbidden`: المستخدم ليس لديه الصلاحيات المطلوبة
- `404 Not Found`: المورد المطلوب غير موجود
- `422 Unprocessable Entity`: بيانات الإدخال غير صالحة
- `500 Internal Server Error`: خطأ في الخادم

## Base URL

```
Production: https://careerak.com/api/admin
Development: http://localhost:5000/api/admin
```

## جدول المحتويات

1. [Statistics API](#statistics-api) - إحصائيات المنصة
2. [Activity Log API](#activity-log-api) - سجل الأنشطة
3. [Notifications API](#notifications-api) - الإشعارات
4. [Dashboard Layout API](#dashboard-layout-api) - تخطيط لوحة التحكم
5. [Export API](#export-api) - تصدير البيانات
6. [Reports API](#reports-api) - التقارير
7. [User Management API](#user-management-api) - إدارة المستخدمين
8. [Content Management API](#content-management-api) - إدارة المحتوى

---


## Statistics API

### نظرة عامة
توفر إحصائيات في الوقت الفعلي عن المستخدمين، الوظائف، الدورات، والمراجعات.

**Base Path**: `/api/admin/statistics`  
**Authorization**: Admin, HR  
**Caching**: 30 seconds with ETag

---

### 1. Get Overview Statistics

احصل على نظرة عامة على إحصائيات المنصة.

**Endpoint**: `GET /statistics/overview`

**Query Parameters**: لا يوجد

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "activeUsers": 1250,
    "jobsToday": 45,
    "applicationsToday": 320,
    "coursesActive": 78,
    "reviewsToday": 12,
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 2.1-2.6, 11.2

---

### 2. Get User Statistics

احصل على إحصائيات المستخدمين مع نطاق زمني.

**Endpoint**: `GET /statistics/users`

**Query Parameters**:
- `timeRange` (optional): `daily` | `weekly` | `monthly` (default: `daily`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 15420,
    "newUsers": 245,
    "growthRate": 1.6,
    "usersByType": {
      "Employee": 12500,
      "HR": 2800,
      "Admin": 120
    },
    "verifiedUsers": 14200,
    "activeUsers": 8500,
    "timeRange": "daily",
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 2.1, 11.2

---

### 3. Get Job Statistics

احصل على إحصائيات الوظائف مع نطاق زمني.

**Endpoint**: `GET /statistics/jobs`

**Query Parameters**:
- `timeRange` (optional): `daily` | `weekly` | `monthly` (default: `daily`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalJobs": 3450,
    "activeJobs": 1250,
    "newJobs": 45,
    "growthRate": 3.6,
    "totalApplications": 28500,
    "newApplications": 320,
    "applicationGrowthRate": 1.1,
    "jobsByStatus": {
      "active": 1250,
      "closed": 2100,
      "pending": 100
    },
    "timeRange": "daily",
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 2.2, 11.2

---

### 4. Get Course Statistics

احصل على إحصائيات الدورات مع نطاق زمني.

**Endpoint**: `GET /statistics/courses`

**Query Parameters**:
- `timeRange` (optional): `daily` | `weekly` | `monthly` (default: `daily`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalCourses": 450,
    "activeCourses": 78,
    "newCourses": 5,
    "growthRate": 1.1,
    "totalEnrollments": 12500,
    "newEnrollments": 180,
    "enrollmentGrowthRate": 1.4,
    "coursesByCategory": {
      "Technical": 200,
      "Management": 150,
      "Soft Skills": 100
    },
    "timeRange": "daily",
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 2.3, 11.2

---

### 5. Get Review Statistics

احصل على إحصائيات المراجعات مع نطاق زمني.

**Endpoint**: `GET /statistics/reviews`

**Query Parameters**:
- `timeRange` (optional): `daily` | `weekly` | `monthly` (default: `daily`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalReviews": 8500,
    "newReviews": 12,
    "growthRate": 0.1,
    "averageRating": 4.2,
    "ratingDistribution": {
      "5": 4200,
      "4": 2800,
      "3": 1200,
      "2": 200,
      "1": 100
    },
    "reviewsByType": {
      "company": 5000,
      "employee": 3500
    },
    "timeRange": "daily",
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 2.4, 11.2

---


## Activity Log API

### نظرة عامة
يوفر سجل شامل لجميع أنشطة الأدمن مع إمكانيات البحث والتصفية.

**Base Path**: `/api/admin/activity-log`  
**Authorization**: Admin, Moderator

---

### 1. Get Activity Logs

احصل على سجل الأنشطة مع pagination وتصفية.

**Endpoint**: `GET /activity-log`

**Query Parameters**:
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد العناصر في الصفحة (default: 50, max: 100)
- `actionType` (optional): نوع الإجراء للتصفية
- `actorId` (optional): معرف المستخدم الذي قام بالإجراء
- `targetType` (optional): نوع الهدف (User, Job, Course, etc.)
- `startDate` (optional): تاريخ البداية (ISO format)
- `endDate` (optional): تاريخ النهاية (ISO format)
- `sortBy` (optional): حقل الترتيب (default: timestamp)
- `sortOrder` (optional): `asc` | `desc` (default: desc)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "65f1234567890abcdef12345",
        "actionType": "user_disabled",
        "actorId": {
          "_id": "65f1234567890abcdef11111",
          "name": "Admin User",
          "email": "admin@careerak.com"
        },
        "targetType": "User",
        "targetId": "65f1234567890abcdef22222",
        "details": "User account disabled due to policy violation",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "metadata": {
          "reason": "Spam activity detected"
        },
        "timestamp": "2026-02-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 45,
      "totalLogs": 2250,
      "limit": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Requirements**: 5.11-5.14

---

### 2. Search Activity Logs

ابحث في سجل الأنشطة باستخدام نص البحث.

**Endpoint**: `GET /activity-log/search`

**Query Parameters**:
- `q` أو `searchTerm` (required): نص البحث
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد العناصر (default: 50)
- `actionType` (optional): تصفية حسب نوع الإجراء
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {...},
    "searchTerm": "disabled"
  }
}
```

**Requirements**: 5.13, 5.14

---

### 3. Get Activity Log Statistics

احصل على إحصائيات سجل الأنشطة.

**Endpoint**: `GET /activity-log/stats`

**Query Parameters**:
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalLogs": 2250,
    "byActionType": {
      "user_disabled": 45,
      "user_enabled": 30,
      "content_approved": 120,
      "content_rejected": 25
    },
    "byTargetType": {
      "User": 150,
      "Job": 80,
      "Course": 60
    },
    "topActors": [
      {
        "actorId": "65f1234567890abcdef11111",
        "name": "Admin User",
        "count": 450
      }
    ]
  }
}
```

---

### 4. Get Action Types

احصل على قائمة بأنواع الإجراءات المتاحة.

**Endpoint**: `GET /activity-log/action-types`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "actionTypes": [
      "user_created",
      "user_updated",
      "user_disabled",
      "user_enabled",
      "user_deleted",
      "content_approved",
      "content_rejected",
      "content_deleted",
      "export_generated",
      "report_generated"
    ]
  }
}
```

---

### 5. Get User Activity Logs

احصل على سجل أنشطة مستخدم محدد.

**Endpoint**: `GET /activity-log/user/:userId`

**Path Parameters**:
- `userId` (required): معرف المستخدم

**Query Parameters**:
- `page`, `limit`, `actionType`, `startDate`, `endDate` (نفس المعاملات السابقة)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "65f1234567890abcdef22222",
    "logs": [...],
    "pagination": {...}
  }
}
```

---

### 6. Create Activity Log

إنشاء إدخال يدوي في سجل الأنشطة.

**Endpoint**: `POST /activity-log`

**Request Body**:
```json
{
  "actionType": "manual_action",
  "targetType": "User",
  "targetId": "65f1234567890abcdef22222",
  "details": "Manual intervention performed",
  "metadata": {
    "reason": "Customer support request"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "actionType": "manual_action",
    "actorId": "65f1234567890abcdef11111",
    "targetType": "User",
    "targetId": "65f1234567890abcdef22222",
    "details": "Manual intervention performed",
    "ipAddress": "192.168.1.1",
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 5.1-5.14

---


## Notifications API

### نظرة عامة
إدارة إشعارات الأدمن مع تفضيلات قابلة للتخصيص وساعات الهدوء.

**Base Path**: `/api/admin/notifications`  
**Authorization**: Admin, Moderator

---

### 1. Get Notifications

احصل على إشعارات الأدمن مع pagination وتصفية.

**Endpoint**: `GET /notifications`

**Query Parameters**:
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد العناصر (default: 20)
- `type` (optional): نوع الإشعار
- `priority` (optional): `low` | `medium` | `high` | `urgent`
- `isRead` (optional): `true` | `false`
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "65f1234567890abcdef12345",
        "adminId": "65f1234567890abcdef11111",
        "type": "new_user_registration",
        "priority": "medium",
        "title": "مستخدم جديد",
        "message": "تم تسجيل مستخدم جديد: John Doe",
        "actionUrl": "/admin/users/65f1234567890abcdef22222",
        "isRead": false,
        "createdAt": "2026-02-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalNotifications": 200,
      "limit": 20
    }
  }
}
```

**Requirements**: 6.8-6.12

---

### 2. Get Unread Count

احصل على عدد الإشعارات غير المقروءة.

**Endpoint**: `GET /notifications/unread-count`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "unreadCount": 15
  }
}
```

---

### 3. Get Notification Summary

احصل على ملخص الإشعارات حسب النوع والأولوية.

**Endpoint**: `GET /notifications/summary`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 200,
    "unread": 15,
    "byType": {
      "new_user_registration": 50,
      "content_flagged": 30,
      "system_alert": 10
    },
    "byPriority": {
      "urgent": 5,
      "high": 20,
      "medium": 100,
      "low": 75
    }
  }
}
```

---

### 4. Mark Notification as Read

حدد إشعار كمقروء.

**Endpoint**: `PATCH /notifications/:id/read`

**Path Parameters**:
- `id` (required): معرف الإشعار

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isRead": true,
    "readAt": "2026-02-23T10:35:00.000Z"
  }
}
```

---

### 5. Mark All as Read

حدد جميع الإشعارات كمقروءة.

**Endpoint**: `PATCH /notifications/mark-all-read`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 15
  }
}
```

---

### 6. Delete Notification

احذف إشعار.

**Endpoint**: `DELETE /notifications/:id`

**Path Parameters**:
- `id` (required): معرف الإشعار

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 7. Get Notification Preferences

احصل على تفضيلات الإشعارات.

**Endpoint**: `GET /notifications/preferences`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "adminId": "65f1234567890abcdef11111",
    "adminPreferences": {
      "new_user_registration": {
        "enabled": true,
        "push": true,
        "email": false
      },
      "content_flagged": {
        "enabled": true,
        "push": true,
        "email": true
      }
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

**Requirements**: 6.12

---

### 8. Update Notification Preferences

حدّث تفضيلات الإشعارات.

**Endpoint**: `PUT /notifications/preferences`

**Request Body**:
```json
{
  "adminPreferences": {
    "new_user_registration": {
      "enabled": true,
      "push": true,
      "email": false
    }
  },
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {...}
}
```

---

### 9. Update Specific Notification Type

حدّث نوع إشعار محدد.

**Endpoint**: `PATCH /notifications/preferences/:type`

**Path Parameters**:
- `type` (required): نوع الإشعار

**Request Body**:
```json
{
  "enabled": true,
  "push": true,
  "email": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification type updated",
  "data": {...}
}
```

---

### 10. Update Quiet Hours

حدّث ساعات الهدوء.

**Endpoint**: `PUT /notifications/preferences/quiet-hours`

**Request Body**:
```json
{
  "enabled": true,
  "start": "22:00",
  "end": "08:00"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Quiet hours updated",
  "data": {...}
}
```

---

### 11. Enable All Notifications

فعّل جميع أنواع الإشعارات.

**Endpoint**: `POST /notifications/preferences/enable-all`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications enabled"
}
```

---

### 12. Disable All Notifications

عطّل جميع أنواع الإشعارات.

**Endpoint**: `POST /notifications/preferences/disable-all`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications disabled"
}
```

---


## Dashboard Layout API

### نظرة عامة
إدارة تخطيط لوحة التحكم القابل للتخصيص لكل أدمن.

**Base Path**: `/api/admin/dashboard/layout`  
**Authorization**: Admin, Moderator

---

### 1. Get Dashboard Layout

احصل على تخطيط لوحة التحكم للأدمن الحالي.

**Endpoint**: `GET /dashboard/layout`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "adminId": "65f1234567890abcdef11111",
    "widgets": [
      {
        "id": "users-chart",
        "type": "chart",
        "title": "Users Growth",
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 4,
        "config": {
          "chartType": "line",
          "dataSource": "users",
          "timeRange": "weekly"
        }
      },
      {
        "id": "active-users",
        "type": "statistic",
        "title": "Active Users",
        "x": 6,
        "y": 0,
        "w": 3,
        "h": 2,
        "config": {
          "metric": "activeUsers",
          "showGrowth": true
        }
      }
    ],
    "theme": "light",
    "sidebarCollapsed": false,
    "updatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 4.8

---

### 2. Save Dashboard Layout

احفظ تخطيط لوحة التحكم.

**Endpoint**: `PUT /dashboard/layout`

**Request Body**:
```json
{
  "widgets": [
    {
      "id": "users-chart",
      "type": "chart",
      "title": "Users Growth",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 4,
      "config": {
        "chartType": "line",
        "dataSource": "users",
        "timeRange": "weekly"
      }
    }
  ],
  "theme": "dark",
  "sidebarCollapsed": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Layout saved successfully",
  "data": {...}
}
```

**Requirements**: 4.3, 4.7

---

### 3. Reset Dashboard Layout

أعد تعيين التخطيط إلى الإعدادات الافتراضية.

**Endpoint**: `POST /dashboard/layout/reset`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Layout reset to default",
  "data": {
    "widgets": [...],
    "theme": "light",
    "sidebarCollapsed": false
  }
}
```

**Requirements**: 4.9

---

### 4. Get Default Widgets

احصل على تكوينات الـ widgets الافتراضية.

**Endpoint**: `GET /dashboard/layout/defaults`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "users-chart",
        "type": "chart",
        "title": "Users Growth",
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 4,
        "config": {
          "chartType": "line",
          "dataSource": "users",
          "timeRange": "weekly"
        }
      }
    ],
    "theme": "light",
    "sidebarCollapsed": false
  }
}
```

---


## Export API

### نظرة عامة
تصدير البيانات بصيغ متعددة (Excel, CSV, PDF) مع تصفية متقدمة.

**Base Path**: `/api/admin/export`  
**Authorization**: Admin only

---

### 1. Export Users

صدّر بيانات المستخدمين.

**Endpoint**: `POST /export/users`

**Request Body**:
```json
{
  "format": "excel",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-02-23"
  },
  "filters": {
    "type": "Employee",
    "isVerified": true,
    "country": "Saudi Arabia"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/api/admin/export/download/users_2026-02-23_abc123.xlsx",
    "filename": "users_2026-02-23_abc123.xlsx",
    "expiresAt": "2026-02-24T10:30:00.000Z",
    "recordCount": 1250
  }
}
```

**Requirements**: 3.1-3.9

---

### 2. Export Jobs

صدّر بيانات الوظائف.

**Endpoint**: `POST /export/jobs`

**Request Body**:
```json
{
  "format": "csv",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-02-23"
  },
  "filters": {
    "status": "active",
    "postingType": "Full-time",
    "location": "Riyadh"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/api/admin/export/download/jobs_2026-02-23_def456.csv",
    "filename": "jobs_2026-02-23_def456.csv",
    "expiresAt": "2026-02-24T10:30:00.000Z",
    "recordCount": 450
  }
}
```

---

### 3. Export Applications

صدّر بيانات طلبات التوظيف.

**Endpoint**: `POST /export/applications`

**Request Body**:
```json
{
  "format": "pdf",
  "dateRange": {
    "start": "2026-02-01",
    "end": "2026-02-23"
  },
  "filters": {
    "status": "pending",
    "jobId": "65f1234567890abcdef12345"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/api/admin/export/download/applications_2026-02-23_ghi789.pdf",
    "filename": "applications_2026-02-23_ghi789.pdf",
    "expiresAt": "2026-02-24T10:30:00.000Z",
    "recordCount": 320
  }
}
```

---

### 4. Export Courses

صدّر بيانات الدورات.

**Endpoint**: `POST /export/courses`

**Request Body**:
```json
{
  "format": "excel",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-02-23"
  },
  "filters": {
    "status": "active",
    "category": "Technical",
    "level": "Intermediate"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/api/admin/export/download/courses_2026-02-23_jkl012.xlsx",
    "filename": "courses_2026-02-23_jkl012.xlsx",
    "expiresAt": "2026-02-24T10:30:00.000Z",
    "recordCount": 78
  }
}
```

---

### 5. Export Activity Log

صدّر سجل الأنشطة.

**Endpoint**: `POST /export/activity-log`

**Request Body**:
```json
{
  "format": "csv",
  "dateRange": {
    "start": "2026-02-20",
    "end": "2026-02-23"
  },
  "filters": {
    "actionType": "user_disabled",
    "actorId": "65f1234567890abcdef11111"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/api/admin/export/download/activity-log_2026-02-23_mno345.csv",
    "filename": "activity-log_2026-02-23_mno345.csv",
    "expiresAt": "2026-02-24T10:30:00.000Z",
    "recordCount": 150
  }
}
```

---

### 6. Download Export

حمّل ملف التصدير.

**Endpoint**: `GET /export/download/:filename`

**Path Parameters**:
- `filename` (required): اسم الملف

**Response** (200 OK):
- يعيد الملف مباشرة للتحميل
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (Excel)
- Content-Type: text/csv (CSV)
- Content-Type: application/pdf (PDF)

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "File not found or expired"
}
```

---

### Export Format Details

#### Excel Format
- Multi-sheet support
- Formatted headers
- Auto-column width
- Filters enabled
- Freeze panes

#### CSV Format
- UTF-8 encoding with BOM
- Comma delimiter
- Quoted strings
- Header row included

#### PDF Format
- Careerak logo
- Timestamp
- Page numbers
- Table format
- Landscape orientation for wide data

---


## Reports API

### نظرة عامة
توليد تقارير شاملة مع إحصائيات وتحليلات مفصلة.

**Base Path**: `/api/admin/reports`  
**Authorization**: Admin, Moderator

---

### 1. Generate Users Report

ولّد تقرير المستخدمين.

**Endpoint**: `GET /reports/users`

**Query Parameters**:
- `startDate` (optional): تاريخ البداية (ISO format)
- `endDate` (optional): تاريخ النهاية (ISO format)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reportType": "users",
    "dateRange": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-02-23T23:59:59.999Z"
    },
    "summary": {
      "totalUsers": 15420,
      "newUsers": 2450,
      "activeUsers": 8500,
      "verifiedUsers": 14200,
      "growthRate": 18.9
    },
    "byType": {
      "Employee": 12500,
      "HR": 2800,
      "Admin": 120
    },
    "byCountry": {
      "Saudi Arabia": 8500,
      "UAE": 3200,
      "Egypt": 2100,
      "Other": 1620
    },
    "registrationTrend": [
      {
        "date": "2026-01-01",
        "count": 45
      },
      {
        "date": "2026-01-02",
        "count": 52
      }
    ],
    "generatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 7.1-7.8

---

### 2. Generate Jobs Report

ولّد تقرير الوظائف.

**Endpoint**: `GET /reports/jobs`

**Query Parameters**:
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reportType": "jobs",
    "dateRange": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-02-23T23:59:59.999Z"
    },
    "summary": {
      "totalJobs": 3450,
      "activeJobs": 1250,
      "closedJobs": 2100,
      "pendingJobs": 100,
      "totalApplications": 28500,
      "averageApplicationsPerJob": 8.3
    },
    "byPostingType": {
      "Full-time": 2100,
      "Part-time": 800,
      "Contract": 400,
      "Internship": 150
    },
    "byLocation": {
      "Riyadh": 1200,
      "Jeddah": 850,
      "Dubai": 600,
      "Other": 800
    },
    "byField": {
      "Technology": 1500,
      "Healthcare": 800,
      "Finance": 600,
      "Other": 550
    },
    "applicationTrend": [
      {
        "date": "2026-01-01",
        "applications": 320
      }
    ],
    "generatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

---

### 3. Generate Courses Report

ولّد تقرير الدورات.

**Endpoint**: `GET /reports/courses`

**Query Parameters**:
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reportType": "courses",
    "dateRange": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-02-23T23:59:59.999Z"
    },
    "summary": {
      "totalCourses": 450,
      "activeCourses": 78,
      "completedCourses": 350,
      "totalEnrollments": 12500,
      "averageEnrollmentsPerCourse": 27.8,
      "completionRate": 68.5
    },
    "byCategory": {
      "Technical": 200,
      "Management": 150,
      "Soft Skills": 100
    },
    "byLevel": {
      "Beginner": 180,
      "Intermediate": 200,
      "Advanced": 70
    },
    "enrollmentTrend": [
      {
        "date": "2026-01-01",
        "enrollments": 180
      }
    ],
    "topCourses": [
      {
        "courseId": "65f1234567890abcdef12345",
        "title": "Advanced JavaScript",
        "enrollments": 450,
        "completionRate": 75.2
      }
    ],
    "generatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

---

### 4. Generate Reviews Report

ولّد تقرير المراجعات.

**Endpoint**: `GET /reports/reviews`

**Query Parameters**:
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reportType": "reviews",
    "dateRange": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-02-23T23:59:59.999Z"
    },
    "summary": {
      "totalReviews": 8500,
      "averageRating": 4.2,
      "flaggedReviews": 45,
      "verifiedReviews": 7800
    },
    "byType": {
      "company": 5000,
      "employee": 3500
    },
    "ratingDistribution": {
      "5": 4200,
      "4": 2800,
      "3": 1200,
      "2": 200,
      "1": 100
    },
    "reviewTrend": [
      {
        "date": "2026-01-01",
        "count": 12,
        "averageRating": 4.1
      }
    ],
    "topReviewedCompanies": [
      {
        "companyId": "65f1234567890abcdef12345",
        "companyName": "Tech Corp",
        "reviewCount": 250,
        "averageRating": 4.5
      }
    ],
    "generatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 7.1-7.8

---


## User Management API

### نظرة عامة
إدارة شاملة للمستخدمين مع بحث متقدم وتصفية وإجراءات إدارية.

**Base Path**: `/api/admin/users`  
**Authorization**: Admin only

---

### 1. Search Users

ابحث عن المستخدمين باستخدام بحث متعدد الحقول.

**Endpoint**: `GET /users/search`

**Query Parameters**:
- `q` (required): نص البحث
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "65f1234567890abcdef12345",
        "name": "John Doe",
        "email": "john@example.com",
        "type": "Employee",
        "isVerified": true,
        "emailVerified": true,
        "country": "Saudi Arabia",
        "createdAt": "2026-01-15T10:30:00.000Z",
        "lastLogin": "2026-02-23T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 95,
      "limit": 20
    },
    "searchTerm": "john"
  }
}
```

**Requirements**: 8.1

---

### 2. Get Users with Filters

احصل على المستخدمين مع تصفية متقدمة.

**Endpoint**: `GET /users`

**Query Parameters**:
- `type` (optional): `Employee` | `HR` | `Admin`
- `isVerified` (optional): `true` | `false`
- `emailVerified` (optional): `true` | `false`
- `startDate` (optional): تاريخ التسجيل من
- `endDate` (optional): تاريخ التسجيل إلى
- `country` (optional): الدولة
- `isSpecialNeeds` (optional): `true` | `false`
- `twoFactorEnabled` (optional): `true` | `false`
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 20)
- `sortBy` (optional): حقل الترتيب (default: createdAt)
- `sortOrder` (optional): `asc` | `desc` (default: desc)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...},
    "filters": {
      "type": "Employee",
      "isVerified": true
    }
  }
}
```

**Requirements**: 8.2

---

### 3. Get User by ID

احصل على تفاصيل مستخدم محدد مع إحصائيات كاملة.

**Endpoint**: `GET /users/:id`

**Path Parameters**:
- `id` (required): معرف المستخدم

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "Employee",
      "isVerified": true,
      "emailVerified": true,
      "phoneNumber": "+966501234567",
      "country": "Saudi Arabia",
      "city": "Riyadh",
      "dateOfBirth": "1990-05-15",
      "gender": "Male",
      "specialization": "Software Engineering",
      "interests": ["Web Development", "AI"],
      "skills": ["JavaScript", "React", "Node.js"],
      "computerSkills": ["MS Office", "Adobe Photoshop"],
      "twoFactorEnabled": true,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "lastLogin": "2026-02-23T09:00:00.000Z"
    },
    "statistics": {
      "jobApplications": 15,
      "coursesEnrolled": 5,
      "reviewsGiven": 3,
      "reviewsReceived": 8,
      "averageRating": 4.5
    },
    "activitySummary": {
      "totalActions": 120,
      "lastActivity": "2026-02-23T09:00:00.000Z"
    }
  }
}
```

**Requirements**: 8.3

---

### 4. Disable User Account

عطّل حساب مستخدم (منع تسجيل الدخول).

**Endpoint**: `PATCH /users/:id/disable`

**Path Parameters**:
- `id` (required): معرف المستخدم

**Request Body**:
```json
{
  "reason": "Violation of terms of service"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User account disabled successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isVerified": false,
    "disabledAt": "2026-02-23T10:30:00.000Z",
    "disabledReason": "Violation of terms of service"
  }
}
```

**Requirements**: 8.5

---

### 5. Enable User Account

فعّل حساب مستخدم (استعادة الوصول).

**Endpoint**: `PATCH /users/:id/enable`

**Path Parameters**:
- `id` (required): معرف المستخدم

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User account enabled successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isVerified": true,
    "enabledAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 8.6

---

### 6. Delete User Account

احذف حساب مستخدم نهائياً.

**Endpoint**: `DELETE /users/:id`

**Path Parameters**:
- `id` (required): معرف المستخدم

**Request Body**:
```json
{
  "reason": "User requested account deletion"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User account deleted successfully",
  "data": {
    "deletedUserId": "65f1234567890abcdef12345",
    "deletedAt": "2026-02-23T10:30:00.000Z",
    "relatedDataDeleted": {
      "jobApplications": 15,
      "courses": 5,
      "reviews": 3
    }
  }
}
```

**Requirements**: 8.7

---

### 7. Get User Activity

احصل على سجل أنشطة مستخدم محدد.

**Endpoint**: `GET /users/:id/activity`

**Path Parameters**:
- `id` (required): معرف المستخدم

**Query Parameters**:
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 50)
- `actionType` (optional): نوع الإجراء للتصفية
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "65f1234567890abcdef12345",
    "userName": "John Doe",
    "activities": [
      {
        "_id": "65f1234567890abcdef99999",
        "actionType": "job_application_submitted",
        "targetType": "JobApplication",
        "targetId": "65f1234567890abcdef88888",
        "details": "Applied for Software Engineer position",
        "timestamp": "2026-02-23T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalActivities": 120,
      "limit": 50
    }
  }
}
```

**Requirements**: 8.8, 8.9

---


## Content Management API

### نظرة عامة
إدارة ومراجعة المحتوى المعلق والمُبلغ عنه (وظائف، دورات، مراجعات).

**Base Path**: `/api/admin/content`  
**Authorization**: Admin, Moderator

---

### 1. Get Pending Jobs

احصل على الوظائف المعلقة التي تحتاج مراجعة.

**Endpoint**: `GET /content/pending-jobs`

**Query Parameters**:
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 20)
- `postedBy` (optional): معرف الناشر
- `postingType` (optional): نوع الوظيفة
- `location` (optional): الموقع
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "postingType": "Full-time",
        "location": "Riyadh",
        "salary": "15000-20000 SAR",
        "description": "We are looking for...",
        "requirements": ["5+ years experience", "React", "Node.js"],
        "postedBy": {
          "_id": "65f1234567890abcdef11111",
          "name": "HR Manager",
          "email": "hr@techcorp.com"
        },
        "status": "pending",
        "createdAt": "2026-02-23T08:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalJobs": 100,
      "limit": 20
    }
  }
}
```

**Requirements**: 9.1

---

### 2. Get Pending Courses

احصل على الدورات المعلقة التي تحتاج مراجعة.

**Endpoint**: `GET /content/pending-courses`

**Query Parameters**:
- `page`, `limit`, `instructor`, `category`, `level`, `startDate`, `endDate`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "65f1234567890abcdef12345",
        "title": "Advanced JavaScript",
        "instructor": {
          "_id": "65f1234567890abcdef11111",
          "name": "John Instructor",
          "email": "john@example.com"
        },
        "category": "Technical",
        "level": "Advanced",
        "duration": "40 hours",
        "price": 500,
        "description": "Learn advanced JavaScript concepts...",
        "status": "pending",
        "createdAt": "2026-02-23T08:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

**Requirements**: 9.2

---

### 3. Get Flagged Content

احصل على المحتوى المُبلغ عنه (مراجعات).

**Endpoint**: `GET /content/flagged`

**Query Parameters**:
- `page`, `limit`, `reviewType`, `reviewer`, `reviewee`, `minReports`, `startDate`, `endDate`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "flaggedContent": [
      {
        "_id": "65f1234567890abcdef12345",
        "reviewType": "company",
        "reviewer": {
          "_id": "65f1234567890abcdef11111",
          "name": "John Doe"
        },
        "reviewee": {
          "_id": "65f1234567890abcdef22222",
          "name": "Tech Corp"
        },
        "rating": 1,
        "title": "Terrible experience",
        "comment": "Very bad company...",
        "reportCount": 5,
        "reports": [
          {
            "reportedBy": "65f1234567890abcdef33333",
            "reason": "Inappropriate content",
            "reportedAt": "2026-02-23T09:00:00.000Z"
          }
        ],
        "status": "flagged",
        "createdAt": "2026-02-22T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

**Requirements**: 9.3

---

### 4. Approve Content

وافق على محتوى معلق.

**Endpoint**: `PATCH /content/:id/approve`

**Path Parameters**:
- `id` (required): معرف المحتوى

**Request Body**:
```json
{
  "contentType": "job"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Content approved successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "status": "active",
    "approvedBy": "65f1234567890abcdef99999",
    "approvedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 9.4

---

### 5. Reject Content

ارفض محتوى معلق مع سبب.

**Endpoint**: `PATCH /content/:id/reject`

**Path Parameters**:
- `id` (required): معرف المحتوى

**Request Body**:
```json
{
  "contentType": "course",
  "reason": "Content does not meet quality standards"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Content rejected successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "status": "rejected",
    "rejectedBy": "65f1234567890abcdef99999",
    "rejectedAt": "2026-02-23T10:30:00.000Z",
    "rejectionReason": "Content does not meet quality standards"
  }
}
```

**Requirements**: 9.5

---

### 6. Delete Content

احذف محتوى نهائياً.

**Endpoint**: `DELETE /content/:id`

**Path Parameters**:
- `id` (required): معرف المحتوى

**Query Parameters**:
- `contentType` (required): `job` | `course` | `review`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Content deleted successfully",
  "data": {
    "deletedContentId": "65f1234567890abcdef12345",
    "contentType": "review",
    "deletedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Requirements**: 9.6, 9.7

---


## Error Handling

### Error Response Format

جميع الأخطاء تتبع نفس التنسيق:

```json
{
  "success": false,
  "error": "Error message here",
  "details": {
    "field": "Specific error details"
  }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | تحقق من صحة البيانات المرسلة |
| 401 | Unauthorized | تحقق من JWT token |
| 403 | Forbidden | تحقق من صلاحيات المستخدم |
| 404 | Not Found | تحقق من معرف المورد |
| 422 | Validation Error | تحقق من حقول الإدخال المطلوبة |
| 429 | Too Many Requests | انتظر قبل إعادة المحاولة |
| 500 | Server Error | اتصل بالدعم الفني |

---

## Rate Limiting

### الحدود
- **Statistics API**: 60 requests/minute
- **Activity Log API**: 100 requests/minute
- **Export API**: 10 requests/minute
- **Other APIs**: 100 requests/minute

### Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1708684800
```

---

## Caching

### Cache Headers

**Statistics API** (30 seconds):
```
Cache-Control: public, max-age=30
ETag: "abc123def456"
```

**Other APIs** (no cache):
```
Cache-Control: no-cache, no-store, must-revalidate
```

### ETag Support

استخدم ETag للتحقق من التغييرات:

**Request**:
```
GET /api/admin/statistics/overview
If-None-Match: "abc123def456"
```

**Response** (304 Not Modified):
```
304 Not Modified
ETag: "abc123def456"
```

---

## Pagination

### Standard Pagination

جميع الـ endpoints التي تدعم pagination تستخدم نفس التنسيق:

**Query Parameters**:
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد العناصر (default: 20, max: 100)

**Response**:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Filtering and Sorting

### Date Filtering

استخدم ISO 8601 format:
```
startDate=2026-01-01T00:00:00.000Z
endDate=2026-02-23T23:59:59.999Z
```

### Sorting

```
sortBy=createdAt
sortOrder=desc
```

**Supported sortBy fields**:
- `createdAt`, `updatedAt`, `name`, `email`, `timestamp`

**Supported sortOrder values**:
- `asc` (ascending)
- `desc` (descending)

---

## Real-Time Updates (Pusher)

### Pusher Configuration

**Channels**:
- `admin-statistics` - تحديثات الإحصائيات
- `admin-notifications-{adminId}` - إشعارات الأدمن
- `admin-activity-log` - سجل الأنشطة

**Events**:
- `statistics-updated` - تحديث الإحصائيات
- `new-notification` - إشعار جديد
- `new-activity` - نشاط جديد

### Example (JavaScript)

```javascript
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.PUSHER_KEY, {
  cluster: process.env.PUSHER_CLUSTER
});

// Subscribe to statistics channel
const statsChannel = pusher.subscribe('admin-statistics');
statsChannel.bind('statistics-updated', (data) => {
  console.log('Statistics updated:', data);
  // Update UI with new statistics
});

// Subscribe to notifications channel
const notifChannel = pusher.subscribe(`admin-notifications-${adminId}`);
notifChannel.bind('new-notification', (notification) => {
  console.log('New notification:', notification);
  // Show notification in UI
});
```

---

## Postman Collection

### Import Collection

استخدم الملف التالي لاستيراد جميع الـ endpoints إلى Postman:

**File**: `docs/Admin Dashboard/Careerak_Admin_Dashboard_API.postman_collection.json`

### Environment Variables

أضف المتغيرات التالية في Postman Environment:

```json
{
  "base_url": "https://careerak.com/api/admin",
  "jwt_token": "your_jwt_token_here"
}
```

### Pre-request Script

أضف هذا السكريبت لإضافة JWT token تلقائياً:

```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('jwt_token')
});
```

---

## Testing

### Unit Tests

```bash
cd backend
npm test -- --grep "Admin Dashboard"
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

---

## Performance Benchmarks

### Response Times (Target)

| Endpoint | Target | Actual |
|----------|--------|--------|
| Statistics Overview | < 500ms | ~300ms |
| Activity Log | < 1s | ~600ms |
| Export (small) | < 2s | ~1.5s |
| Export (large) | < 10s | ~8s |
| Reports | < 3s | ~2s |

### Database Indexes

جميع الـ queries محسّنة باستخدام indexes:

- `ActivityLog`: `{ timestamp: -1, actionType: 1 }`
- `AdminNotification`: `{ adminId: 1, isRead: 1, createdAt: -1 }`
- `DashboardLayout`: `{ adminId: 1 }`
- `User`: `{ type: 1, isVerified: 1, createdAt: -1 }`

---

## Security

### Authentication

- JWT tokens مع expiration (24 hours)
- Refresh tokens للجلسات الطويلة
- Session expiration handling

### Authorization

- Role-based access control (RBAC)
- Admin, HR, Moderator roles
- Fine-grained permissions

### Data Protection

- Input validation على جميع الـ endpoints
- SQL injection protection
- XSS protection
- CSRF protection
- Rate limiting

### Audit Trail

- جميع الإجراءات الإدارية مسجلة في Activity Log
- IP address و User Agent tracking
- Timestamp لكل إجراء

---

## Support

### Documentation

- **API Docs**: `docs/Admin Dashboard/ADMIN_DASHBOARD_API_DOCUMENTATION.md`
- **User Guide**: `docs/Admin Dashboard/ADMIN_DASHBOARD_USER_GUIDE.md`
- **Deployment**: `docs/Admin Dashboard/ADMIN_DASHBOARD_DEPLOYMENT.md`

### Contact

- **Email**: careerak.hr@gmail.com
- **GitHub Issues**: [github.com/careerak/issues](https://github.com/careerak/issues)

---

## Changelog

### Version 1.0.0 (2026-02-23)

- ✅ Initial release
- ✅ Statistics API with real-time updates
- ✅ Activity Log with search and filtering
- ✅ Notifications with preferences
- ✅ Dashboard Layout customization
- ✅ Export in multiple formats (Excel, CSV, PDF)
- ✅ Comprehensive Reports
- ✅ User Management
- ✅ Content Management

---

## Appendix

### Glossary

- **Admin**: مستخدم بصلاحيات إدارية كاملة
- **HR**: مستخدم موارد بشرية
- **Moderator**: مستخدم بصلاحيات مراجعة المحتوى
- **Widget**: عنصر قابل للتخصيص في لوحة التحكم
- **Activity Log**: سجل جميع الأنشطة الإدارية
- **Quiet Hours**: ساعات عدم إرسال الإشعارات

### Abbreviations

- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **RBAC**: Role-Based Access Control
- **TTL**: Time To Live
- **CSV**: Comma-Separated Values
- **PDF**: Portable Document Format

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0  
**Author**: Careerak Development Team

