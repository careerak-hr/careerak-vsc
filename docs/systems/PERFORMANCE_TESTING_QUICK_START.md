# Settings Page Performance Testing - Quick Start Guide

## 5-Minute Quick Start

دليل سريع لتشغيل اختبارات الأداء لنظام تحسينات صفحة الإعدادات.

---

## Prerequisites

```bash
# تأكد من تثبيت التبعيات
cd backend
npm install
```

---

## Run Tests

### Option 1: Basic Test Run

```bash
npm run test:settings:performance
```

**النتيجة المتوقعة**:
```
PASS  src/tests/performance/settings-performance.test.js
  GET Response Time Tests
    ✓ GET /api/settings/privacy should respond in < 200ms (45ms)
    ✓ GET /api/settings/notifications should respond in < 200ms (38ms)
    ✓ GET /api/settings/sessions should respond in < 200ms (52ms)
    ✓ GET /api/settings/login-history should respond in < 200ms (48ms)
  
  POST Response Time Tests
    ✓ PUT /api/settings/profile should respond in < 500ms (120ms)
    ✓ PUT /api/settings/privacy should respond in < 500ms (95ms)
    ✓ PUT /api/settings/notifications should respond in < 500ms (110ms)
    ✓ POST /api/settings/data/export should respond in < 500ms (180ms)
  
  Concurrent Users Tests
    ✓ should handle 100 concurrent GET requests (2500ms)
    ✓ should handle 100 concurrent POST requests (8500ms)
    ✓ should handle mixed concurrent requests (GET + POST) (5500ms)
  
  Database Query Optimization Tests
    ✓ should use index for userId query (12ms)
    ✓ should efficiently paginate large result sets (25ms)
    ✓ should use projection to reduce data transfer (15ms)
    ✓ should efficiently count documents (8ms)
  
  Data Export Time Tests
    ✓ should create export request quickly (180ms)
    ✓ should estimate export completion time
    ✓ should track export progress
    ✓ should handle large export requests efficiently (250ms)
  
  Memory & Resource Usage Tests
    ✓ should not leak memory during repeated operations
    ✓ should handle large payloads efficiently (120ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Time:        15.2s
```

### Option 2: Detailed Report

```bash
npm run test:settings:performance:report
```

**النتيجة المتوقعة**:
```
╔════════════════════════════════════════════════════════════╗
║         Settings Page Performance Tests                   ║
╚════════════════════════════════════════════════════════════╝

Starting performance tests...

Thresholds:
  - GET Response Time: < 200ms
  - POST Response Time: < 500ms
  - Concurrent Users: 1000 users
  - Data Export Time: < 48 hours
  - Memory per Operation: < 100KB

────────────────────────────────────────────────────────────
Running Jest Tests
────────────────────────────────────────────────────────────

[Test output...]

╔════════════════════════════════════════════════════════════╗
║         Performance Test Summary                          ║
╚════════════════════════════════════════════════════════════╝

Total Duration: 15.2s
Timestamp: 2026-03-09T10:30:00.000Z

───────────────────────────────────────────────────────────
Test Results
───────────────────────────────────────────────────────────
Total Tests: 21
✅ Passed: 21
❌ Failed: 0
⏭️  Skipped: 0

───────────────────────────────────────────────────────────
Response Time Statistics
───────────────────────────────────────────────────────────

GET Requests:
  Min: 38ms
  Max: 52ms
  Avg: 45.75ms
  Median: 46.5ms
  Status: ✅ PASS (< 200ms)

POST Requests:
  Min: 95ms
  Max: 180ms
  Avg: 126.25ms
  Median: 115ms
  Status: ✅ PASS (< 500ms)

───────────────────────────────────────────────────────────
Database Query Statistics
───────────────────────────────────────────────────────────
  Min: 8ms
  Max: 25ms
  Avg: 15ms
  Median: 13.5ms
  Status: ✅ Optimized with indexes

───────────────────────────────────────────────────────────
Report Location
───────────────────────────────────────────────────────────
Report saved to: backend/.performance-reports/performance-report-1234567890.json

════════════════════════════════════════════════════════════

✅ All performance tests passed!
```

### Option 3: Watch Mode

```bash
npm run test:settings:performance:watch
```

---

## Understanding Results

### Response Time

| Status | GET | POST | Meaning |
|--------|-----|------|---------|
| ✅ PASS | < 200ms | < 500ms | Excellent performance |
| ⚠️ WARNING | 200-300ms | 500-750ms | Acceptable, room for improvement |
| ❌ FAIL | > 300ms | > 750ms | Needs optimization |

### Concurrency

| Status | Concurrent Users | Meaning |
|--------|------------------|---------|
| ✅ PASS | 100+ | Can handle high load |
| ⚠️ WARNING | 50-100 | Moderate load capacity |
| ❌ FAIL | < 50 | Cannot handle load |

### Database

| Status | Query Time | Meaning |
|--------|------------|---------|
| ✅ PASS | < 50ms | Optimized with indexes |
| ⚠️ WARNING | 50-100ms | May need optimization |
| ❌ FAIL | > 100ms | Missing indexes |

---

## Quick Fixes

### Slow Response Times

```bash
# 1. تحقق من indexes
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.db.collection('activesessions').getIndexes().then(console.log);
"

# 2. أضف indexes المفقودة
# في model file:
# schema.index({ userId: 1 });
```

### High Concurrency Issues

```javascript
// في mongoose connection
mongoose.connect(uri, {
  maxPoolSize: 100,  // زيادة من 50
  minPoolSize: 20
});
```

### Database Performance

```javascript
// استخدم lean() للقراءة فقط
const docs = await Model.find().lean();

// استخدم select() لتقليل البيانات
const docs = await Model.find().select('field1 field2').lean();

// استخدم limit() لتقليل النتائج
const docs = await Model.find().limit(20).lean();
```

---

## Common Issues

### "MongoDB connection failed"

```bash
# تحقق من .env
cat backend/.env | grep MONGODB_URI

# أو استخدم MongoDB Memory Server (للاختبار)
# يتم تلقائياً في الاختبارات
```

### "Tests timeout"

```bash
# زيادة timeout في jest.config.js
module.exports = {
  testTimeout: 30000  // 30 seconds
};
```

### "Memory leak detected"

```javascript
// استخدم lean() لتقليل استخدام الذاكرة
const docs = await Model.find().lean();

// أغلق cursors
cursor.close();

// نظف الكاش
cache.flushAll();
```

---

## Next Steps

1. ✅ شغّل الاختبارات بانتظام (أسبوعياً)
2. ✅ راقب الاتجاهات
3. ✅ حسّن endpoints البطيئة
4. ✅ راجع التوثيق الكامل: [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md)

---

## Resources

- 📄 [Full Documentation](./PERFORMANCE_TESTING.md)
- 📄 [Requirements](../../.kiro/specs/settings-page-enhancements/requirements.md)
- 📄 [Design](../../.kiro/specs/settings-page-enhancements/design.md)
- 📄 [Tasks](../../.kiro/specs/settings-page-enhancements/tasks.md)

---

**آخر تحديث**: 2026-03-09
