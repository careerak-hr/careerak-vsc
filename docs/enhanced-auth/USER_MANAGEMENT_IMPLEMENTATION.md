# User Management Implementation

## Overview

تم تنفيذ نظام إدارة المستخدمين المحسّن (Enhanced User Management) بنجاح كجزء من تحسينات لوحة تحكم الأدمن. يوفر النظام أدوات قوية للبحث، التصفية، وإدارة حسابات المستخدمين.

**تاريخ الإضافة**: 2026-02-25  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 8.1-8.9

## الملفات المضافة/المحدثة

### Backend Files

```
backend/
├── src/
│   ├── services/
│   │   └── userManagementService.js       # خدمة إدارة المستخدمين (جديد)
│   ├── controllers/
│   │   └── userManagementController.js    # معالج طلبات إدارة المستخدمين (جديد)
│   ├── routes/
│   │   └── userManagementRoutes.js        # مسارات API (جديد)
│   ├── models/
│   │   └── User.js                        # محدّث (إضافة حقول تعطيل الحساب)
│   ├── middleware/
│   │   └── auth.js                        # محدّث (التحقق من حالة الحساب)
│   └── app.js                             # محدّث (إضافة المسارات)
└── tests/
    ├── user-management.property.test.js   # اختبارات الخصائص (جديد)
    └── user-management.unit.test.js       # اختبارات الوحدة (جديد)
```

## الميزات الرئيسية

### 1. البحث المتقدم (Multi-Field Search)

**الوظيفة**: `searchUsers(query, options)`

**البحث في الحقول التالية**:
- البريد الإلكتروني (email)
- رقم الهاتف (phone)
- الاسم الأول (firstName)
- الاسم الأخير (lastName)
- اسم الشركة (companyName)

**المميزات**:
- ✅ بحث غير حساس لحالة الأحرف (case-insensitive)
- ✅ دعم الأحرف الخاصة (@, ., +, -, _)
- ✅ Pagination مدمج
- ✅ معالجة آمنة لـ regex special characters

**مثال الاستخدام**:
```javascript
const result = await userManagementService.searchUsers('john', {
  page: 1,
  limit: 20
});

// النتيجة:
{
  users: [...],
  pagination: {
    total: 45,
    page: 1,
    limit: 20,
    totalPages: 3,
    hasMore: true
  }
}
```

### 2. التصفية المتقدمة (Advanced Filtering)

**الوظيفة**: `filterUsers(filters, options)`

**معايير التصفية المدعومة**:
- `type` - نوع المستخدم (Employee, HR, Admin)
- `isVerified` - حالة التحقق (true/false)
- `emailVerified` - حالة تحقق البريد (true/false)
- `startDate` - تاريخ البداية للتسجيل
- `endDate` - تاريخ النهاية للتسجيل
- `country` - الدولة
- `isSpecialNeeds` - ذوي الاحتياجات الخاصة (true/false)
- `twoFactorEnabled` - حالة المصادقة الثنائية (true/false)

**خيارات الترتيب والصفحات**:
- `sortBy` - حقل الترتيب (default: createdAt)
- `sortOrder` - اتجاه الترتيب (asc/desc, default: desc)
- `page` - رقم الصفحة (default: 1)
- `limit` - عدد النتائج (default: 20)

**مثال الاستخدام**:
```javascript
const result = await userManagementService.filterUsers({
  type: 'Employee',
  country: 'Egypt',
  isVerified: true,
  startDate: '2026-01-01',
  endDate: '2026-12-31'
}, {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 3. تعطيل الحساب (Disable Account)

**الوظيفة**: `disableUserAccount(userId, adminId, reason, ipAddress)`

**الإجراءات**:
1. تعطيل تسجيل الدخول للمستخدم
2. حفظ سبب التعطيل
3. تسجيل معلومات الأدمن الذي قام بالتعطيل
4. إنشاء سجل نشاط (Activity Log)

**الحقول المضافة للنموذج**:
```javascript
{
  accountDisabled: Boolean,
  accountDisabledAt: Date,
  accountDisabledReason: String,
  accountDisabledBy: ObjectId
}
```

**مثال الاستخدام**:
```javascript
const user = await userManagementService.disableUserAccount(
  userId,
  adminId,
  'Violation of terms of service',
  '192.168.1.1'
);
```

**التحقق في Middleware**:
```javascript
// في auth.js
if (user && user.accountDisabled) {
  return res.status(403).json({ 
    error: 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني.',
    accountDisabled: true
  });
}
```

### 4. تفعيل الحساب (Enable Account)

**الوظيفة**: `enableUserAccount(userId, adminId, ipAddress)`

**الإجراءات**:
1. إعادة تفعيل تسجيل الدخول
2. حذف معلومات التعطيل
3. إنشاء سجل نشاط (Activity Log)

**مثال الاستخدام**:
```javascript
const user = await userManagementService.enableUserAccount(
  userId,
  adminId,
  '192.168.1.1'
);
```

### 5. حذف الحساب (Delete Account)

**الوظيفة**: `deleteUserAccount(userId, adminId, reason, ipAddress)`

**الإجراءات**:
1. حذف جميع البيانات المرتبطة:
   - Job Applications (للموظفين)
   - Job Postings (للشركات)
   - Reviews (كمُقيِّم أو مُقيَّم)
2. إنشاء سجل نشاط قبل الحذف
3. حذف المستخدم نهائياً

**مثال الاستخدام**:
```javascript
const result = await userManagementService.deleteUserAccount(
  userId,
  adminId,
  'Account deletion requested by user',
  '192.168.1.1'
);

// النتيجة:
{
  success: true,
  message: 'User account deleted successfully',
  deletedUser: {
    email: 'user@example.com',
    phone: '+201234567890',
    userType: 'Employee',
    name: 'John Doe'
  }
}
```

### 6. سجل النشاطات (Activity History)

**الوظيفة**: `getUserActivity(userId, options)`

**خيارات التصفية**:
- `actionType` - نوع النشاط
- `startDate` - تاريخ البداية
- `endDate` - تاريخ النهاية
- `page` - رقم الصفحة
- `limit` - عدد النتائج (default: 50)

**مثال الاستخدام**:
```javascript
const result = await userManagementService.getUserActivity(userId, {
  actionType: 'user_modified',
  startDate: '2026-01-01',
  page: 1,
  limit: 50
});
```

### 7. إحصائيات المستخدم (User Statistics)

**الوظيفة**: `getUserStatistics(userId)`

**الإحصائيات المتاحة**:
- معلومات الحساب (تاريخ الإنشاء، حالة التحقق، 2FA)
- إحصائيات التقييمات (متوسط التقييم، عدد التقييمات)
- عدد النشاطات
- للموظفين: عدد الطلبات، توزيع الطلبات حسب الحالة
- للشركات: عدد الوظائف المنشورة، عدد الطلبات المستلمة

**مثال الاستخدام**:
```javascript
const stats = await userManagementService.getUserStatistics(userId);

// النتيجة:
{
  accountInfo: {
    createdAt: '2026-01-15T10:30:00.000Z',
    isVerified: true,
    emailVerified: true,
    twoFactorEnabled: false,
    accountDisabled: false
  },
  reviewStats: {
    averageRating: 4.5,
    totalReviews: 12
  },
  activityCount: 45,
  applicationsCount: 8,
  applicationsByStatus: {
    pending: 2,
    reviewed: 3,
    hired: 2,
    rejected: 1
  }
}
```

## API Endpoints

### 1. البحث عن المستخدمين

```
GET /api/admin/users/search?q=john&page=1&limit=20
```

**Query Parameters**:
- `q` - Search query (required)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response**:
```json
{
  "success": true,
  "query": "john",
  "users": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### 2. جلب المستخدمين مع التصفية

```
GET /api/admin/users?type=Employee&country=Egypt&isVerified=true&page=1&limit=20
```

**Query Parameters**:
- `type` - User type (Employee, HR, Admin)
- `isVerified` - Verification status (true/false)
- `emailVerified` - Email verification status (true/false)
- `startDate` - Registration start date
- `endDate` - Registration end date
- `country` - Country filter
- `isSpecialNeeds` - Special needs status (true/false)
- `twoFactorEnabled` - 2FA status (true/false)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

### 3. جلب مستخدم بالـ ID

```
GET /api/admin/users/:id
```

**Response**:
```json
{
  "success": true,
  "user": {...},
  "stats": {...}
}
```

### 4. تعطيل حساب مستخدم

```
PATCH /api/admin/users/:id/disable
```

**Body**:
```json
{
  "reason": "Violation of terms of service"
}
```

### 5. تفعيل حساب مستخدم

```
PATCH /api/admin/users/:id/enable
```

### 6. حذف حساب مستخدم

```
DELETE /api/admin/users/:id
```

**Body**:
```json
{
  "reason": "Account deletion requested by user"
}
```

### 7. جلب سجل نشاطات المستخدم

```
GET /api/admin/users/:id/activity?page=1&limit=50&actionType=user_modified
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `actionType` - Filter by action type
- `startDate` - Activity start date
- `endDate` - Activity end date

## الأمان والصلاحيات

### Authentication & Authorization

جميع endpoints محمية بـ:
1. **Authentication Middleware** (`auth`)
2. **Admin Role Check** (`checkRole('Admin')`)

```javascript
router.use(auth);
router.use(checkRole('Admin'));
```

### منع تسجيل الدخول للحسابات المعطلة

```javascript
// في auth.js middleware
if (decoded.role !== 'Admin') {
  const user = await User.findById(decoded.id).select('accountDisabled');
  if (user && user.accountDisabled) {
    return res.status(403).json({ 
      error: 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني.',
      accountDisabled: true
    });
  }
}
```

### Activity Logging

جميع الإجراءات الإدارية تُسجل في ActivityLog:
- تعطيل الحساب
- تفعيل الحساب
- حذف الحساب

## الاختبارات

### Property-Based Tests (10 اختبارات)

**Property 21: User Search Comprehensiveness**
- البحث في جميع الحقول المحددة
- نتائج فارغة للاستعلامات غير المطابقة
- معالجة الأحرف الخاصة

**Property 23: User Account State Management**
- تعطيل الحساب يمنع تسجيل الدخول
- تفعيل الحساب يستعيد الوصول
- دورة التعطيل-التفعيل idempotent
- رفض تعطيل حساب معطل بالفعل
- رفض تفعيل حساب مفعّل بالفعل

### Unit Tests (15+ اختبار)

**البحث مع الأحرف الخاصة**:
- البريد الإلكتروني مع أحرف خاصة
- الهاتف مع أحرف خاصة
- الأسماء مع أحرف خاصة
- معالجة آمنة لـ regex special characters

**التصفية مع معايير متعددة**:
- تصفية بمعيار واحد
- تصفية بمعايير متعددة (AND logic)
- تصفية بنطاق تاريخي
- دمج التصفيات مع النطاق التاريخي
- نتائج فارغة عند عدم التطابق
- دعم الترتيب
- دعم الصفحات

**الحذف مع تنظيف البيانات المرتبطة**:
- حذف موظف وطلباته
- حذف شركة ووظائفها
- حذف مستخدم وتقييماته
- حذف مستخدم بدون بيانات مرتبطة
- خطأ عند حذف مستخدم غير موجود

### تشغيل الاختبارات

```bash
cd backend

# اختبارات الخصائص
npm test -- user-management.property.test.js

# اختبارات الوحدة
npm test -- user-management.unit.test.js

# جميع الاختبارات
npm test
```

## أفضل الممارسات

### ✅ افعل

1. **استخدم البحث للاستعلامات العامة**:
```javascript
const result = await userManagementService.searchUsers('john');
```

2. **استخدم التصفية للاستعلامات المحددة**:
```javascript
const result = await userManagementService.filterUsers({
  type: 'Employee',
  country: 'Egypt',
  isVerified: true
});
```

3. **قدم سبباً واضحاً عند التعطيل/الحذف**:
```javascript
await userManagementService.disableUserAccount(
  userId,
  adminId,
  'Violation of terms: spam content',
  ipAddress
);
```

4. **تحقق من الإحصائيات قبل الحذف**:
```javascript
const stats = await userManagementService.getUserStatistics(userId);
// راجع البيانات المرتبطة قبل الحذف
```

### ❌ لا تفعل

1. **لا تحذف المستخدمين بدون سبب**
2. **لا تتخطى Activity Logging**
3. **لا تعطل حسابات الأدمن**
4. **لا تستخدم البحث للتصفية المعقدة** (استخدم filterUsers)

## الأداء

### Indexes المحسّنة

```javascript
// في User model
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ firstName: 1 });
userSchema.index({ lastName: 1 });
userSchema.index({ companyName: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ country: 1 });
```

### Pagination

جميع الاستعلامات تدعم pagination لتحسين الأداء:
- Default limit: 20 للبحث والتصفية
- Default limit: 50 لسجل النشاطات
- يمكن تخصيص الـ limit حسب الحاجة

## استكشاف الأخطاء

### "User not found"
```javascript
// تحقق من صحة userId
const user = await User.findById(userId);
if (!user) {
  throw new Error('User not found');
}
```

### "Account is already disabled"
```javascript
// تحقق من حالة الحساب قبل التعطيل
if (user.accountDisabled) {
  throw new Error('Account is already disabled');
}
```

### "Failed to search users"
```javascript
// تحقق من صحة query
if (!q || q.trim().length === 0) {
  return res.status(400).json({ error: 'Search query is required' });
}
```

## الفوائد المتوقعة

- 🔍 **بحث أسرع**: بحث متعدد الحقول مع indexes محسّنة
- 📊 **تصفية قوية**: معايير متعددة مع AND logic
- 🛡️ **أمان محسّن**: تعطيل الحسابات المخالفة
- 📝 **تدقيق كامل**: Activity logging لجميع الإجراءات
- 🗑️ **حذف آمن**: تنظيف تلقائي للبيانات المرتبطة
- ⚡ **أداء عالي**: Pagination و indexes محسّنة

## ملاحظات مهمة

1. جميع endpoints تتطلب صلاحيات Admin
2. الحسابات المعطلة لا يمكنها تسجيل الدخول
3. حذف المستخدم يحذف جميع البيانات المرتبطة
4. جميع الإجراءات مسجلة في ActivityLog
5. البحث والتصفية يدعمان pagination
6. الاختبارات تغطي جميع الحالات الحرجة

## التحديثات المستقبلية

- [ ] إضافة bulk operations (تعطيل/تفعيل/حذف متعدد)
- [ ] إضافة export للمستخدمين (Excel, CSV)
- [ ] إضافة تصفية متقدمة بـ OR logic
- [ ] إضافة إشعارات للمستخدمين عند التعطيل/التفعيل
- [ ] إضافة soft delete (حذف مؤقت)

---

تم إضافة User Management Implementation بنجاح - 2026-02-25
