# Connection Quality Indicator - دليل المطور

## 🚀 البدء السريع

### التثبيت
لا يوجد تثبيت إضافي - جميع الملفات جاهزة!

### الاستخدام الأساسي

```jsx
import ConnectionQualityMonitor from '../../services/connectionQualityMonitor';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';

function VideoCall() {
  const [monitor, setMonitor] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({ ... });
    const mon = new ConnectionQualityMonitor(pc);
    mon.start(1000);
    setMonitor(mon);

    return () => mon.stop();
  }, []);

  return (
    <div>
      <video ref={videoRef} />
      {monitor && (
        <ConnectionQualityIndicator 
          qualityMonitor={monitor}
          language="ar"
        />
      )}
    </div>
  );
}
```

---

## 📊 Props

### ConnectionQualityIndicator

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `qualityMonitor` | `ConnectionQualityMonitor` | ✅ Yes | - | مثيل من ConnectionQualityMonitor |
| `language` | `'ar' \| 'en'` | ❌ No | `'ar'` | اللغة المستخدمة |

---

## 🎨 التخصيص

### تغيير الألوان

```css
/* في ConnectionQualityIndicator.css */
.quality-badge {
  background: rgba(48, 75, 96, 0.9);  /* لون الخلفية */
  border: 2px solid rgba(212, 129, 97, 0.3);  /* لون الإطار */
}

.quality-text {
  color: #E3DAD1;  /* لون النص */
}
```

### تغيير الموقع

```css
/* وضع المؤشر في الزاوية العلوية اليسرى */
.connection-quality-indicator {
  position: absolute;
  top: 20px;
  left: 20px;  /* بدلاً من right */
}
```

### تغيير فترة التحديث

```javascript
// كل نصف ثانية (أكثر دقة)
monitor.start(500);

// كل ثانيتين (أقل استهلاك)
monitor.start(2000);
```

---

## 📡 API

### ConnectionQualityMonitor

#### Methods

```javascript
// بدء المراقبة
monitor.start(intervalMs = 1000)

// إيقاف المراقبة
monitor.stop()

// الحصول على الإحصائيات الحالية
const stats = monitor.getStats()
// { latency, packetLoss, jitter, bitrate, framesPerSecond, resolution }

// حساب مستوى الجودة
const quality = monitor.calculateQuality()
// { level: 'excellent', score: 92, stats: {...} }

// إضافة مستمع
monitor.addListener((stats) => {
  console.log('Updated:', stats);
})

// إزالة مستمع
monitor.removeListener(callback)
```

---

## 🎯 المستويات

| Level | Score | Icon | Color |
|-------|-------|------|-------|
| `excellent` | 85-100 | 🟢 | Green |
| `good` | 70-84 | 🟡 | Yellow |
| `fair` | 50-69 | 🟠 | Orange |
| `poor` | 0-49 | 🔴 | Red |

---

## 📊 المقاييس

| Metric | Unit | Excellent | Good | Fair | Poor |
|--------|------|-----------|------|------|------|
| Latency | ms | < 150 | < 300 | < 500 | ≥ 500 |
| Packet Loss | % | < 1 | < 3 | < 5 | ≥ 5 |
| Jitter | ms | < 30 | < 50 | < 100 | ≥ 100 |
| Bitrate | bps | > 1M | > 500K | > 250K | ≤ 250K |

---

## 🔧 أمثلة متقدمة

### مع تنبيهات مخصصة

```javascript
monitor.addListener((stats) => {
  const quality = monitor.calculateQuality();
  
  if (quality.level === 'poor') {
    showAlert('جودة الاتصال ضعيفة!');
  }
});
```

### مع تسجيل السجل

```javascript
const history = [];

monitor.addListener((stats) => {
  history.push({
    timestamp: Date.now(),
    stats: { ...stats }
  });
  
  // احتفظ بآخر 100 قراءة فقط
  if (history.length > 100) {
    history.shift();
  }
});
```

### مع إرسال للـ Backend

```javascript
monitor.addListener(async (stats) => {
  const quality = monitor.calculateQuality();
  
  // أرسل كل 10 ثوانٍ
  if (Date.now() % 10000 < 1000) {
    await fetch('/api/quality-metrics', {
      method: 'POST',
      body: JSON.stringify({ quality, stats })
    });
  }
});
```

---

## 🐛 استكشاف الأخطاء

### المؤشر لا يظهر

```javascript
// تحقق من:
console.log('Monitor:', monitor);
console.log('PC:', peerConnection);
console.log('PC State:', peerConnection?.connectionState);
```

### قيم غير دقيقة

```javascript
// انتظر بضع ثوانٍ للحصول على قراءات مستقرة
setTimeout(() => {
  const stats = monitor.getStats();
  console.log('Stats after 5s:', stats);
}, 5000);
```

### استهلاك عالي للموارد

```javascript
// قلل تكرار التحديث
monitor.start(2000);  // كل ثانيتين

// أو أوقف عند عدم الحاجة
if (!isVideoActive) {
  monitor.stop();
}
```

---

## 📚 الملفات ذات الصلة

- `connectionQualityMonitor.js` - خدمة جمع الإحصائيات
- `ConnectionQualityIndicator.jsx` - مكون UI
- `ConnectionQualityIndicator.css` - التنسيقات
- `ConnectionQualityExample.jsx` - مثال كامل

---

## 📖 التوثيق الكامل

- [التوثيق الشامل](../../../docs/VIDEO_INTERVIEWS_CONNECTION_QUALITY.md)
- [دليل البدء السريع](../../../docs/VIDEO_INTERVIEWS_CONNECTION_QUALITY_QUICK_START.md)
- [ملخص التنفيذ](../../../docs/VIDEO_INTERVIEWS_CONNECTION_QUALITY_SUMMARY.md)

---

## ✅ Checklist

قبل الاستخدام في الإنتاج:

- [ ] اختبار على شبكات مختلفة (WiFi, 4G, 5G)
- [ ] اختبار على متصفحات مختلفة
- [ ] اختبار على أجهزة مختلفة (Desktop, Mobile, Tablet)
- [ ] تخصيص العتبات حسب احتياجاتك
- [ ] إضافة تنبيهات مخصصة
- [ ] إضافة تسجيل للسجل
- [ ] اختبار الأداء

---

**تم الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
