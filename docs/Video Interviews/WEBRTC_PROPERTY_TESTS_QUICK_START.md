# دليل البدء السريع: اختبارات خصائص WebRTC
# Quick Start: WebRTC Property Tests

⏱️ **الوقت المتوقع**: 5 دقائق

---

## 🚀 التشغيل السريع

```bash
cd backend

# تشغيل جميع اختبارات الخصائص
npm test -- property/webrtc

# أو اختبار واحد فقط
npm test -- webrtc-connection-establishment.property.test.js
npm test -- webrtc-video-quality.property.test.js
```

---

## 📊 النتيجة المتوقعة

```
PASS  tests/property/webrtc-connection-establishment.property.test.js
  Property Test: WebRTC Connection Establishment
    ✓ Property: Connection establishment time < 5 seconds (1234ms)
    ✓ Property: Connection success rate = 100% (987ms)
    ✓ Property: Connection establishment is idempotent (654ms)
    ✓ Property: Connection is symmetric (876ms)
    ✓ Property: Connection transitivity in mesh network (1543ms)

PASS  tests/property/webrtc-video-quality.property.test.js
  Property Test: WebRTC Video Quality
    ✓ Property: Video resolution >= 720p with good network (876ms)
    ✓ Property: Frame rate >= 24 fps (654ms)
    ✓ Property: Bitrate adapts to network conditions (789ms)
    ✓ Property: Graceful degradation with poor network (543ms)
    ✓ Property: Audio-video sync offset < 100ms (432ms)
    ✓ Property: Quality consistency over time (1234ms)
    ✓ Property: Multi-participant quality distribution (987ms)

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Time:        45.678 s
```

---

## 🎯 ما الذي يتم اختباره؟

### Property 1: Connection Establishment
✅ الاتصال يُنشأ خلال 5 ثواني  
✅ معدل نجاح 100%  
✅ الاتصال متماثل (A↔B)  
✅ الاتصال متعدي (A→B→C)  
✅ إعادة الاتصال تعمل

### Property 2: Video Quality
✅ دقة >= 720p مع شبكة جيدة  
✅ معدل إطارات >= 24 fps  
✅ Bitrate يتكيف مع الشبكة  
✅ تدهور تدريجي مع شبكة ضعيفة  
✅ تزامن صوت/فيديو < 100ms  
✅ جودة متسقة عبر الوقت  
✅ جودة مناسبة لجميع المشاركين

---

## 🔧 الإعدادات

### تغيير عدد التشغيلات
```javascript
// في الملف
{
  numRuns: 3,  // غيّر هذا الرقم (3-50)
  timeout: 30000
}
```

### زيادة Timeout
```bash
npm test -- property/webrtc --testTimeout=120000
```

---

## 🐛 استكشاف الأخطاء

### "MongoDB connection failed"
```bash
# تأكد من تشغيل MongoDB
mongod --version

# تحقق من .env.test
cat .env.test | grep MONGODB_TEST_URI
```

### "Test timeout"
```bash
# زد الـ timeout
npm test -- property/webrtc --testTimeout=180000

# أو قلل عدد التشغيلات في الملف
```

### "Property failed"
```bash
# شغّل مع verbose mode
npm test -- property/webrtc --verbose

# سيعرض جميع القيم الفاشلة
```

---

## 📚 التوثيق الكامل

📄 [WEBRTC_PROPERTY_TESTS.md](./WEBRTC_PROPERTY_TESTS.md) - دليل شامل

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
