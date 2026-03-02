# 🚀 Tracking Opt-Out - Quick Start Guide

## ⚡ البدء السريع (5 دقائق)

### 1. Backend Setup

**لا يحتاج إعداد!** الميزة جاهزة للاستخدام فوراً.

الحقل `preferences.tracking` موجود في User model بالفعل مع القيم الافتراضية:

```javascript
preferences: {
  tracking: {
    enabled: true,  // مفعّل افتراضياً
    disabledAt: null,
    disabledReason: null
  }
}
```

---

### 2. API Endpoints

#### الحصول على حالة التتبع

```bash
GET /api/user-interactions/tracking/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingEnabled": true,
    "disabledAt": null,
    "disabledReason": null
  }
}
```

#### تعطيل التتبع

```bash
PUT /api/user-interactions/tracking/preference
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": false,
  "reason": "أفضل الخصوصية"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تعطيل التتبع بنجاح",
  "data": {
    "trackingEnabled": false,
    "disabledAt": "2026-02-27T10:30:00.000Z",
    "disabledReason": "أفضل الخصوصية"
  }
}
```

#### إعادة تفعيل التتبع

```bash
PUT /api/user-interactions/tracking/preference
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true
}
```

#### حذف جميع بيانات التتبع

```bash
DELETE /api/user-interactions/tracking/data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم حذف 150 تفاعل بنجاح",
  "data": {
    "deletedCount": 150
  }
}
```

---

### 3. Frontend Integration

#### استيراد المكون

```jsx
import TrackingPreference from './components/TrackingPreference';
```

#### الاستخدام في صفحة الإعدادات

```jsx
function SettingsPage() {
  return (
    <div className="settings-container">
      <h1>الإعدادات</h1>
      
      {/* قسم الخصوصية */}
      <section className="privacy-section">
        <TrackingPreference />
      </section>
      
      {/* أقسام أخرى */}
    </div>
  );
}
```

---

### 4. اختبار الميزة

#### اختبار يدوي سريع

1. **افتح صفحة الإعدادات**
   - انتقل إلى `/settings` أو الصفحة التي تحتوي على `TrackingPreference`

2. **تعطيل التتبع**
   - اضغط على Toggle لتعطيل التتبع
   - يجب أن ترى رسالة "تم تعطيل التتبع بنجاح"
   - الحالة تتغير إلى "معطّل"

3. **محاولة تسجيل تفاعل**
   - افتح Console في المتصفح
   - جرب التفاعل مع وظيفة أو دورة
   - يجب أن ترى في Network tab:
     ```json
     {
       "success": true,
       "message": "التتبع معطل. لم يتم تسجيل التفاعل",
       "data": {
         "trackingDisabled": true
       }
     }
     ```

4. **حذف البيانات**
   - اضغط على "حذف البيانات"
   - أكد الحذف في النافذة المنبثقة
   - يجب أن ترى رسالة "تم حذف جميع بيانات التتبع بنجاح"

5. **إعادة تفعيل التتبع**
   - اضغط على Toggle مرة أخرى
   - يجب أن ترى رسالة "تم تفعيل التتبع بنجاح"
   - الحالة تتغير إلى "مفعّل"

---

### 5. اختبار API مع cURL

#### الحصول على حالة التتبع

```bash
curl -X GET http://localhost:5000/api/user-interactions/tracking/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### تعطيل التتبع

```bash
curl -X PUT http://localhost:5000/api/user-interactions/tracking/preference \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "reason": "خصوصية"}'
```

#### حذف البيانات

```bash
curl -X DELETE http://localhost:5000/api/user-interactions/tracking/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. اختبار Unit Tests

```bash
cd backend
npm test -- tracking-opt-out.test.js
```

**النتيجة المتوقعة:**
```
✓ should have tracking enabled by default
✓ should allow disabling tracking
✓ should allow re-enabling tracking
✓ should log interaction when tracking is enabled
✓ should not log interaction when tracking is disabled
✓ should delete all user interactions
✓ should preserve tracking preference after deleting interactions
✓ should record when tracking was disabled
✓ should allow optional reason for disabling tracking
✓ should still provide basic recommendations when tracking is disabled
✓ should not use interaction history when tracking is disabled
✓ should handle missing tracking preference gracefully
✓ should handle null/undefined tracking values

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

---

## 🎯 حالات الاستخدام الشائعة

### 1. مستخدم يريد الخصوصية الكاملة

```javascript
// تعطيل التتبع
PUT /api/user-interactions/tracking/preference
{ "enabled": false, "reason": "أفضل الخصوصية" }

// حذف جميع البيانات القديمة
DELETE /api/user-interactions/tracking/data
```

### 2. مستخدم يريد البدء من جديد

```javascript
// حذف البيانات القديمة
DELETE /api/user-interactions/tracking/data

// الإبقاء على التتبع مفعلاً
// (لا حاجة لإجراء - التتبع مفعّل بالفعل)
```

### 3. مستخدم يريد تجربة بدون تتبع

```javascript
// تعطيل مؤقت
PUT /api/user-interactions/tracking/preference
{ "enabled": false }

// بعد فترة - إعادة التفعيل
PUT /api/user-interactions/tracking/preference
{ "enabled": true }
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: التتبع لا يزال يعمل بعد التعطيل

**الحل:**
1. تحقق من حالة التتبع:
   ```bash
   GET /api/user-interactions/tracking/status
   ```
2. تأكد من أن `trackingEnabled` هو `false`
3. تحقق من أن الـ token صحيح
4. تحقق من أن الـ userId صحيح

### المشكلة: لا يمكن حذف البيانات

**الحل:**
1. تحقق من الصلاحيات (يجب أن يكون المستخدم مسجل دخول)
2. تحقق من الـ token
3. تحقق من سجلات الخادم للأخطاء

### المشكلة: المكون لا يظهر

**الحل:**
1. تأكد من استيراد المكون:
   ```jsx
   import TrackingPreference from './components/TrackingPreference';
   ```
2. تأكد من استيراد CSS:
   ```jsx
   import './components/TrackingPreference.css';
   ```
3. تحقق من Console للأخطاء

---

## 📊 مراقبة الاستخدام

### إحصاءات مفيدة

```javascript
// عدد المستخدمين الذين عطلوا التتبع
const disabledCount = await User.countDocuments({
  'preferences.tracking.enabled': false
});

// نسبة التعطيل
const totalUsers = await User.countDocuments();
const disabledPercentage = (disabledCount / totalUsers) * 100;

console.log(`${disabledPercentage.toFixed(2)}% من المستخدمين عطلوا التتبع`);
```

### أسباب التعطيل الشائعة

```javascript
const reasons = await User.aggregate([
  { $match: { 'preferences.tracking.enabled': false } },
  { $group: {
    _id: '$preferences.tracking.disabledReason',
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
]);

console.log('أسباب التعطيل:', reasons);
```

---

## ✅ Checklist

- [ ] Backend endpoints تعمل
- [ ] Frontend component يظهر بشكل صحيح
- [ ] Toggle يعمل
- [ ] حذف البيانات يعمل
- [ ] الرسائل تظهر بشكل صحيح
- [ ] دعم اللغات يعمل
- [ ] التصميم المتجاوب يعمل
- [ ] الاختبارات تنجح

---

## 📚 المزيد من المعلومات

- **التوثيق الكامل**: `docs/TRACKING_OPT_OUT_IMPLEMENTATION.md`
- **Requirements**: `.kiro/specs/ai-recommendations/requirements.md` (6.4)
- **Tests**: `backend/tests/tracking-opt-out.test.js`

---

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ جاهز للاستخدام
