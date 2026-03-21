# نظام الـ Badges - دليل الاستخدام

## 📋 نظرة عامة

نظام شامل للإنجازات (Badges) يحفز المستخدمين ويكافئهم على تحقيق إنجازات معينة في المنصة.

## 🎯 أنواع الـ Badges (10 أنواع)

### 1. المبتدئ (Beginner) 🌱
- **المعيار**: إكمال أول دورة تدريبية
- **الندرة**: Common
- **النقاط**: 10
- **الفئة**: Learning

### 2. المتعلم النشط (Active Learner) 🎓
- **المعيار**: إكمال 5 دورات تدريبية
- **الندرة**: Common
- **النقاط**: 50
- **الفئة**: Learning

### 3. الخبير (Expert) 🏆
- **المعيار**: إكمال 10 دورات تدريبية
- **الندرة**: Rare
- **النقاط**: 100
- **الفئة**: Achievement

### 4. السريع (Speed Learner) ⚡
- **المعيار**: إكمال دورة في أقل من 7 أيام
- **الندرة**: Rare
- **النقاط**: 75
- **الفئة**: Achievement

### 5. المتميز (Outstanding) 🌟
- **المعيار**: الحصول على تقييم 5 نجوم في 3 دورات
- **الندرة**: Epic
- **النقاط**: 150
- **الفئة**: Achievement

### 6. المتخصص (Specialist) 📚
- **المعيار**: إكمال 3 دورات في نفس المجال
- **الندرة**: Rare
- **النقاط**: 80
- **الفئة**: Learning

### 7. المثابر (Persistent) 🎯
- **المعيار**: تسجيل دخول يومي لمدة 30 يوم
- **الندرة**: Epic
- **النقاط**: 120
- **الفئة**: Engagement

### 8. المحترف (Professional) 💼
- **المعيار**: الحصول على وظيفة بعد إكمال دورة
- **الندرة**: Legendary
- **النقاط**: 200
- **الفئة**: Career

### 9. جامع الشهادات (Certificate Collector) 📜
- **المعيار**: الحصول على 15 شهادة
- **الندرة**: Epic
- **النقاط**: 180
- **الفئة**: Achievement

### 10. متقن المهارات (Skills Master) 🎨
- **المعيار**: إتقان 20 مهارة مختلفة
- **الندرة**: Legendary
- **النقاط**: 250
- **الفئة**: Learning

## 🔧 الاستخدام

### تهيئة الـ Badges

```bash
# تشغيل سكريبت التهيئة
node scripts/initialize-badges.js
```

### Backend API

```javascript
const badgeService = require('./services/badgeService');

// فحص ومنح badges للمستخدم
const newBadges = await badgeService.checkAndAwardBadges(userId);

// حساب التقدم
const progress = await badgeService.calculateProgress(userId);

// الحصول على badges المستخدم
const badges = await badgeService.getBadgesByUser(userId, 'ar');
```

### API Endpoints

```
GET    /api/badges                    # جميع الـ badges
GET    /api/badges/user/:userId       # badges المستخدم
GET    /api/badges/progress           # تقدم المستخدم
POST   /api/badges/check              # فحص ومنح badges
PATCH  /api/badges/:id/display        # إخفاء/إظهار badge
GET    /api/badges/stats              # إحصائيات
GET    /api/badges/leaderboard        # لوحة المتصدرين
POST   /api/badges/initialize         # تهيئة (Admin)
```

### Frontend Example

```jsx
import { BadgesGallery, BadgeStats } from './examples/BadgeSystemExample';

function ProfilePage() {
  return (
    <div>
      <BadgeStats token={token} />
      <BadgesGallery token={token} />
    </div>
  );
}
```

## 📊 مستويات الندرة

- **Common** (عادي): سهل الحصول عليه
- **Rare** (نادر): يتطلب جهد متوسط
- **Epic** (ملحمي): يتطلب جهد كبير
- **Legendary** (أسطوري): صعب جداً

## 🎨 الألوان

- Common: `#4CAF50` (أخضر)
- Rare: `#FF9800` (برتقالي)
- Epic: `#9C27B0` (بنفسجي)
- Legendary: `#304B60` (كحلي)

## 📝 ملاحظات

- يتم فحص الـ badges تلقائياً عند إكمال دورة
- يمكن للمستخدم إخفاء/إظهار badges في ملفه الشخصي
- يتم إرسال إشعار عند الحصول على badge جديد
- النقاط تُستخدم في لوحة المتصدرين

## 🔄 التكامل

يتكامل نظام الـ Badges مع:
- نظام الدورات (CourseEnrollment)
- نظام الشهادات (Certificate)
- نظام الإشعارات (Notification)
- نظام المستخدمين (User)

## ✅ الفوائد المتوقعة

- 📈 زيادة engagement بنسبة 40%
- 🎯 تحفيز المستخدمين على إكمال الدورات
- 🏆 خلق روح المنافسة الإيجابية
- ✨ تحسين تجربة المستخدم
