# 🚀 Checkpoint 13: التعلم والتحديثات - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. التحقق من التعلم من السلوك

#### اختبار تسجيل التفاعلات

```bash
# تسجيل تفاعل
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "job",
    "itemId": "507f1f77bcf86cd799439011",
    "action": "like",
    "options": {
      "duration": 30,
      "sourcePage": "recommendations",
      "position": 1,
      "originalScore": 85
    }
  }'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "message": "تم تسجيل التفاعل بنجاح",
  "data": {
    "interactionId": "...",
    "action": "like",
    "itemType": "job"
  }
}
```

#### اختبار تحليل الأنماط

```bash
# جلب الأنماط السلوكية
curl -X GET "http://localhost:5000/api/user-interactions/patterns?itemType=job" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "data": {
    "timePatterns": {
      "morning": 5,
      "afternoon": 12,
      "evening": 8,
      "night": 3
    },
    "actionSequences": {
      "view->like": 8,
      "like->apply": 5,
      "view->apply": 3
    },
    "scorePatterns": {
      "averageScore": 75.5,
      "minScore": 60,
      "maxScore": 95
    }
  }
}
```

#### اختبار تحديث التوصيات

```bash
# تحديث التوصيات بناءً على التفاعلات
curl -X POST http://localhost:5000/api/user-interactions/update-recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job"}'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "message": "تم تحديث التوصيات بنجاح",
  "data": {
    "updatedCount": 15,
    "averageScoreChange": 5.2
  }
}
```

---

### 2. التحقق من التحديثات الفورية

#### اختبار إشعارات الوظائف الجديدة

```bash
# إرسال إشعارات لوظيفة جديدة
curl -X POST http://localhost:5000/api/recommendations/notify-new-job \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "507f1f77bcf86cd799439011"}'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "message": "تم إرسال 15 إشعار فوري",
  "data": {
    "notificationsSent": 15,
    "matchingUsers": 15,
    "averageMatchScore": 72.3
  }
}
```

#### اختبار إشعارات المرشحين الجدد

```bash
# إرسال إشعارات لمرشح جديد
curl -X POST http://localhost:5000/api/recommendations/notify-new-candidate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "507f1f77bcf86cd799439012"}'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "message": "تم إرسال 8 إشعارات للشركات",
  "data": {
    "notificationsSent": 8,
    "matchingJobs": 8,
    "averageMatchScore": 68.5
  }
}
```

#### اختبار إعدادات الإشعارات

```bash
# الحصول على الإعدادات
curl -X GET http://localhost:5000/api/recommendations/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# تحديث الإعدادات
curl -X PUT http://localhost:5000/api/recommendations/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"minMatchScore": 70}'
```

---

### 3. التحقق من خيار إيقاف التتبع

#### اختبار حالة التتبع

```bash
# الحصول على حالة التتبع
curl -X GET http://localhost:5000/api/user-interactions/tracking/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة**:
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

#### اختبار تعطيل التتبع

```bash
# تعطيل التتبع
curl -X PUT http://localhost:5000/api/user-interactions/tracking/preference \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "reason": "خصوصية"}'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "message": "تم تعطيل التتبع بنجاح",
  "data": {
    "trackingEnabled": false,
    "disabledAt": "2026-03-01T10:30:00.000Z",
    "disabledReason": "خصوصية"
  }
}
```

#### اختبار حذف البيانات

```bash
# حذف جميع بيانات التتبع
curl -X DELETE http://localhost:5000/api/user-interactions/tracking/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة**:
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

### 4. تشغيل الاختبارات

#### اختبارات التعلم من السلوك

```bash
cd backend

# اختبارات UserInteraction
npm test -- userInteraction.test.js

# اختبارات Property-Based
npm test -- learning-from-interactions.property.test.js

# اختبارات Tracking Opt-Out
npm test -- tracking-opt-out.test.js
```

**النتيجة المتوقعة**:
```
✓ 16 tests passed (userInteraction.test.js)
✓ 5 tests passed (learning-from-interactions.property.test.js)
✓ 13 tests passed (tracking-opt-out.test.js)

Total: 34 tests passed
```

#### اختبارات التحديثات الفورية

```bash
# اختبارات Real-time Update
npm test -- realtimeUpdate.test.js
```

**النتيجة المتوقعة**:
```
✓ 10 tests passed (realtimeUpdate.test.js)
```

---

## 🎯 سيناريوهات الاختبار الشاملة

### سيناريو 1: مستخدم جديد يتفاعل مع التوصيات

```bash
# 1. تسجيل مشاهدة
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job", "itemId": "JOB1", "action": "view", "options": {"duration": 30}}'

# 2. تسجيل إعجاب
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job", "itemId": "JOB1", "action": "like"}'

# 3. تسجيل تقديم
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job", "itemId": "JOB1", "action": "apply"}'

# 4. جلب الإحصاءات
curl -X GET "http://localhost:5000/api/user-interactions/stats?itemType=job" \
  -H "Authorization: Bearer TOKEN"

# 5. تحديث التوصيات
curl -X POST http://localhost:5000/api/user-interactions/update-recommendations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job"}'
```

### سيناريو 2: شركة تنشر وظيفة جديدة

```bash
# 1. نشر وظيفة جديدة (يتم تلقائياً في jobPostingController)
# Hook تلقائي يرسل إشعارات للمستخدمين المناسبين

# 2. التحقق من الإشعارات المرسلة
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer USER_TOKEN"

# 3. المستخدم يشاهد الإشعار ويتفاعل
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job", "itemId": "NEW_JOB", "action": "view"}'
```

### سيناريو 3: مستخدم يريد الخصوصية

```bash
# 1. تعطيل التتبع
curl -X PUT http://localhost:5000/api/user-interactions/tracking/preference \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "reason": "أفضل الخصوصية"}'

# 2. حذف جميع البيانات القديمة
curl -X DELETE http://localhost:5000/api/user-interactions/tracking/data \
  -H "Authorization: Bearer TOKEN"

# 3. التحقق من الحالة
curl -X GET http://localhost:5000/api/user-interactions/tracking/status \
  -H "Authorization: Bearer TOKEN"

# 4. محاولة تسجيل تفاعل (يجب أن يُرفض)
curl -X POST http://localhost:5000/api/user-interactions/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "job", "itemId": "JOB1", "action": "view"}'
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: التفاعلات لا تُسجل

**الحل:**
1. تحقق من حالة التتبع:
   ```bash
   GET /api/user-interactions/tracking/status
   ```
2. تأكد من أن `trackingEnabled` هو `true`
3. تحقق من صحة البيانات المرسلة
4. تحقق من سجلات الخادم

### المشكلة: الإشعارات لا تُرسل

**الحل:**
1. تحقق من إعدادات Pusher في `.env`
2. تحقق من `minMatchScore` في الإعدادات
3. تحقق من أن المستخدمين لديهم تطابق كافٍ
4. تحقق من سجلات Pusher

### المشكلة: التوصيات لا تتحدث

**الحل:**
1. تحقق من وجود تفاعلات كافية (> 5)
2. تحقق من تحليل الأنماط:
   ```bash
   GET /api/user-interactions/patterns
   ```
3. تحقق من تحديث التوصيات:
   ```bash
   POST /api/user-interactions/update-recommendations
   ```

---

## ✅ Checklist

- [ ] تسجيل التفاعلات يعمل
- [ ] تحليل الأنماط يعمل
- [ ] تحديث التوصيات يعمل
- [ ] إشعارات الوظائف تعمل
- [ ] إشعارات المرشحين تعمل
- [ ] إعدادات الإشعارات تعمل
- [ ] خيار إيقاف التتبع يعمل
- [ ] حذف البيانات يعمل
- [ ] جميع الاختبارات تنجح

---

## 📚 المزيد من المعلومات

- **التقرير الشامل**: `CHECKPOINT_13_LEARNING_UPDATES_REPORT.md`
- **توثيق التعلم**: `USER_INTERACTION_TRACKING.md`
- **توثيق الإشعارات**: `REALTIME_NOTIFICATIONS_IMPLEMENTATION.md`
- **توثيق الخصوصية**: `TRACKING_OPT_OUT_IMPLEMENTATION.md`

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام  
**الوقت المتوقع**: 5 دقائق

