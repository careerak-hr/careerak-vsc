# نظام الإحالة والمكافآت - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام الإحالة والمكافآت
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: قيد التصميم

## 1. Overview
نظام شامل للإحالة والمكافآت مع نقاط قابلة للاستبدال، لوحة متصدرين، ومنع الاحتيال.

## 2. Architecture
معمارية ثلاثية الطبقات:
- Presentation: Referral Dashboard, Rewards Store, Leaderboard
- Business Logic: Referral/Rewards/Leaderboard/AntiFraud Services
- Data: MongoDB + Redis (للتخزين المؤقت) + Analytics

## 3. Data Models

### Referral Model
```javascript
{
  referralCode: String,      // كود فريد (6-8 أحرف)
  referrerId: ObjectId,      // المحيل
  referredUserId: ObjectId,  // المُحال (بعد التسجيل)
  status: 'pending' | 'completed' | 'cancelled',
  source: 'whatsapp' | 'email' | 'direct' | 'other',
  ipAddress: String,
  deviceFingerprint: String,
  completedAt: Date,
  rewards: [{
    type: String,            // 'signup', 'first_course', 'job', etc.
    points: Number,
    awardedAt: Date
  }]
}
```

### PointsTransaction Model
```javascript
{
  userId: ObjectId,
  type: 'earn' | 'redeem' | 'expire',
  amount: Number,
  balance: Number,           // الرصيد بعد المعاملة
  source: String,            // 'referral', 'redemption', etc.
  referralId: ObjectId,      // إذا كان من إحالة
  redemptionId: ObjectId,    // إذا كان استبدال
  description: String,
  createdAt: Date
}
```

### RedemptionOption Model
```javascript
{
  optionId: String,
  name: String,
  description: String,
  pointsCost: Number,
  type: 'discount' | 'feature' | 'subscription',
  value: Number,             // قيمة الخصم أو الميزة
  isActive: Boolean,
  expiryDays: Number         // صلاحية الاستبدال
}
```

### Leaderboard Model
```javascript
{
  userId: ObjectId,
  period: 'monthly' | 'yearly' | 'alltime',
  referralCount: Number,
  totalPoints: Number,
  rank: Number,
  isVisible: Boolean,
  lastUpdated: Date
}
```

### FraudCheck Model
```javascript
{
  userId: ObjectId,
  referralId: ObjectId,
  suspicionScore: Number,    // 0-100
  flags: [String],           // ['same_ip', 'rapid_signups', etc.]
  status: 'clean' | 'suspicious' | 'blocked',
  reviewedBy: ObjectId,
  reviewedAt: Date
}
```

## 4. Correctness Properties

### Property 1: Unique Referral Code
*For any* user, their referral code must be unique across all users.
**Validates: Requirements 1.1**

### Property 2: Automatic Reward Grant
*For any* completed referral action (signup, course completion, job), the corresponding points should be automatically awarded within 1 minute.
**Validates: Requirements 2.1, 2.2**

### Property 3: Points Balance Consistency
*For any* user, the current points balance should equal the sum of all earned points minus all redeemed points.
**Validates: Requirements 2.4, 3.1**

### Property 4: Redemption Deduction
*For any* successful redemption, the exact points cost should be deducted from the user's balance immediately.
**Validates: Requirements 3.4**

### Property 5: Self-Referral Prevention
*For any* referral attempt, if the referrer and referred user have the same IP address or device fingerprint, the referral should be rejected.
**Validates: Requirements 6.1, 6.2**

### Property 6: Leaderboard Accuracy
*For any* user on the leaderboard, their displayed referral count and points should match their actual database records.
**Validates: Requirements 4.1, 4.4**

### Property 7: Reward Eligibility
*For any* referral, rewards should only be granted if the referred user completes the required action (e.g., email verification, course completion).
**Validates: Requirements 2.1**

### Property 8: Fraud Detection Threshold
*For any* user with more than 10 referrals from the same IP in a month, the account should be flagged for manual review.
**Validates: Requirements 6.4**

### Property 9: Redemption Availability
*For any* redemption option, it should only be available if the user has sufficient points balance.
**Validates: Requirements 3.1, 3.2**

### Property 10: Leaderboard Ranking
*For any* two users on the leaderboard, the user with more referrals (or points in case of tie) should have a better (lower number) rank.
**Validates: Requirements 4.2**

## 5. Services Implementation

### ReferralService
- generateReferralCode(): توليد كود فريد
- trackReferral(): تتبع إحالة جديدة
- completeReferral(): إكمال إحالة
- getReferralStats(): إحصائيات الإحالات

### RewardsService
- awardPoints(): منح نقاط
- redeemPoints(): استبدال نقاط
- getBalance(): جلب الرصيد
- getTransactionHistory(): سجل المعاملات

### LeaderboardService
- updateLeaderboard(): تحديث المتصدرين
- getRankings(): جلب الترتيب
- getMyRank(): ترتيبي
- updateVisibility(): إخفاء/إظهار

### AntiFraudService
- checkFraud(): فحص الاحتيال
- calculateSuspicionScore(): حساب درجة الشك
- flagSuspicious(): وضع علامة مشبوهة
- blockUser(): حظر مستخدم

### AnalyticsService
- trackConversion(): تتبع التحويل
- calculateROI(): حساب العائد
- generateReport(): توليد تقرير

## 6. Anti-Fraud Mechanisms

### Detection Rules
1. **Same IP**: أكثر من 3 إحالات من نفس IP
2. **Same Device**: نفس Device Fingerprint
3. **Rapid Signups**: أكثر من 5 إحالات في ساعة
4. **Inactive Referrals**: المُحال لم ينشط خلال 7 أيام
5. **Pattern Matching**: أنماط مشبوهة في البيانات

### Suspicion Score Calculation
```javascript
let score = 0;
if (sameIP) score += 30;
if (sameDevice) score += 40;
if (rapidSignups) score += 20;
if (inactiveReferral) score += 10;

if (score >= 70) status = 'blocked';
else if (score >= 40) status = 'suspicious';
else status = 'clean';
```

## 7. Testing Strategy
- Property-based tests using fast-check
- Unit tests for rewards calculation
- Integration tests for complete workflows
- Fraud detection tests with edge cases
- Load tests for leaderboard updates

**تاريخ الإنشاء**: 2026-02-17
