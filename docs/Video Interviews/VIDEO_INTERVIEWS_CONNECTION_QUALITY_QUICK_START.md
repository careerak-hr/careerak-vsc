# دليل البدء السريع - مراقبة جودة الاتصال

## ⚡ البدء في 5 دقائق

### 1. التثبيت (30 ثانية)

لا يوجد تثبيت إضافي مطلوب! جميع الملفات جاهزة.

### 2. الإعداد الأساسي (دقيقتان)

```javascript
// في مكون المقابلة
import ConnectionQualityMonitor from '../services/connectionQualityMonitor';
import ConnectionQualityIndicator from '../components/VideoInterview/ConnectionQualityIndicator';

function VideoCall() {
  const [peerConnection, setPeerConnection] = useState(null);
  const [qualityMonitor, setQualityMonitor] = useState(null);

  useEffect(() => {
    // إنشاء peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    setPeerConnection(pc);

    // إنشاء monitor
    const monitor = new ConnectionQualityMonitor(pc);
    monitor.start(1000); // تحديث كل ثانية
    setQualityMonitor(monitor);

    return () => {
      monitor.stop();
      pc.close();
    };
  }, []);

  return (
    <div className="video-container">
      <video ref={videoRef} autoPlay />
      
      {/* المؤشر */}
      {qualityMonitor && (
        <ConnectionQualityIndicator 
          qualityMonitor={qualityMonitor}
          language="ar"
        />
      )}
    </div>
  );
}
```

### 3. الاختبار (دقيقة)

```bash
# اختبار Backend
cd backend
npm test -- connectionQuality.test.js

# النتيجة المتوقعة: ✅ 15/15 tests passed
```

### 4. التشغيل (دقيقة)

```bash
# تشغيل Frontend
cd frontend
npm start

# افتح المتصفح وانتقل إلى صفحة المقابلة
# يجب أن ترى المؤشر في الزاوية العلوية اليمنى
```

---

## 🎯 الاستخدام السريع

### عرض الجودة فقط

```jsx
<ConnectionQualityIndicator 
  qualityMonitor={monitor}
  language="ar"
/>
```

### الاستماع للتحديثات

```javascript
monitor.addListener((stats) => {
  console.log('Latency:', stats.latency, 'ms');
  console.log('Packet Loss:', stats.packetLoss, '%');
  console.log('Bitrate:', stats.bitrate, 'bps');
});
```

### الحصول على التوصيات

```javascript
const quality = monitor.calculateQuality();
const recommendations = service.getRecommendations(quality);

recommendations.forEach(rec => {
  console.log(rec.messageAr); // الرسالة بالعربية
});
```

---

## 📊 فهم المؤشر

| الأيقونة | المستوى | النقاط | المعنى |
|----------|---------|--------|---------|
| 🟢 | ممتاز | 85-100 | جودة رائعة، لا مشاكل |
| 🟡 | جيد | 70-84 | جودة جيدة، بعض التحسينات ممكنة |
| 🟠 | مقبول | 50-69 | جودة مقبولة، يحتاج تحسين |
| 🔴 | ضعيف | 0-49 | جودة ضعيفة، مشاكل كبيرة |

---

## 🔧 التخصيص السريع

### تغيير اللغة

```jsx
<ConnectionQualityIndicator 
  qualityMonitor={monitor}
  language="en"  // ar أو en
/>
```

### تغيير فترة التحديث

```javascript
monitor.start(500);   // كل نصف ثانية (أكثر دقة)
monitor.start(2000);  // كل ثانيتين (أقل استهلاك)
```

### إيقاف المراقبة

```javascript
monitor.stop();  // عند عدم الحاجة
```

---

## 🐛 حل المشاكل السريع

### المؤشر لا يظهر؟

```javascript
// تحقق من:
console.log('Monitor:', qualityMonitor);
console.log('PC State:', peerConnection?.connectionState);
```

### قيم غير منطقية؟

```javascript
// انتظر بضع ثوانٍ للحصول على قراءات دقيقة
setTimeout(() => {
  const stats = monitor.getStats();
  console.log('Stats after 5s:', stats);
}, 5000);
```

---

## 📚 الخطوات التالية

1. ✅ اقرأ التوثيق الكامل: `VIDEO_INTERVIEWS_CONNECTION_QUALITY.md`
2. ✅ جرب المثال: `frontend/src/examples/ConnectionQualityExample.jsx`
3. ✅ خصص العتبات حسب احتياجاتك
4. ✅ أضف تنبيهات مخصصة

---

## 💡 نصائح سريعة

- 🎯 استخدم فترة تحديث 1000ms للتوازن بين الدقة والأداء
- 🎯 أوقف المراقبة عند عدم الحاجة لتوفير الموارد
- 🎯 اعرض التوصيات للمستخدمين عند انخفاض الجودة
- 🎯 احفظ السجل التاريخي لتحليل الاتجاهات

---

**وقت الإعداد الإجمالي**: 5 دقائق  
**الحالة**: ✅ جاهز للاستخدام

تم إنشاء الدليل في: 2026-03-02
