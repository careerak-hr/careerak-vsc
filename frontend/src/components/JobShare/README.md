# JobShare Components

مكونات مشاركة الوظائف على وسائل التواصل الاجتماعي.

## المكونات

### ShareButton

زر مشاركة الوظيفة مع دعم Web Share API و fallback.

#### الاستخدام

```jsx
import { ShareButton } from './components/JobShare';

function JobCard({ job }) {
  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
  };

  return (
    <div>
      <h3>{job.title}</h3>
      <ShareButton 
        job={job}
        size="medium"
        variant="icon"
        onShare={handleShare}
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | **required** | بيانات الوظيفة (يجب أن تحتوي على id, title, company) |
| `size` | String | `'medium'` | حجم الزر: `'small'`, `'medium'`, `'large'` |
| `variant` | String | `'icon'` | نوع الزر: `'icon'`, `'text'`, `'both'` |
| `className` | String | `''` | CSS classes إضافية |
| `onShare` | Function | - | callback عند المشاركة، يستقبل platform |

### ShareModal

Modal يعرض خيارات المشاركة المختلفة.

#### الاستخدام

```jsx
import { ShareModal } from './components/JobShare';

function MyComponent({ job }) {
  const [showModal, setShowModal] = useState(false);

  const handleShare = (platform) => {
    console.log(`Shared on ${platform}`);
    setShowModal(false);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        مشاركة
      </button>

      {showModal && (
        <ShareModal
          job={job}
          onShare={handleShare}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | **required** | بيانات الوظيفة |
| `onShare` | Function | **required** | callback عند المشاركة |
| `onClose` | Function | **required** | callback عند الإغلاق |

## Share Utils

دوال مساعدة للمشاركة.

### shareJob

```javascript
import { shareJob } from '../../utils/shareUtils';

// مشاركة على منصة معينة
await shareJob(job, 'whatsapp');
await shareJob(job, 'linkedin');
await shareJob(job, 'twitter');
await shareJob(job, 'facebook');
await shareJob(job, 'copy');
await shareJob(job, 'native'); // Web Share API
```

### isNativeShareSupported

```javascript
import { isNativeShareSupported } from '../../utils/shareUtils';

if (isNativeShareSupported()) {
  // الجهاز يدعم Web Share API
}
```

### getJobUrl

```javascript
import { getJobUrl } from '../../utils/shareUtils';

const url = getJobUrl(job.id);
// https://careerak.com/jobs/123
```

## المنصات المدعومة

1. **نسخ الرابط** - نسخ رابط الوظيفة إلى الحافظة
2. **WhatsApp** - مشاركة عبر WhatsApp
3. **LinkedIn** - مشاركة عبر LinkedIn
4. **Twitter** - مشاركة عبر Twitter (X)
5. **Facebook** - مشاركة عبر Facebook
6. **Native Share** - Web Share API (للموبايل)

## الميزات

### Web Share API

- يستخدم Web Share API تلقائياً على الأجهزة المحمولة
- Fallback إلى Modal على Desktop
- دعم كامل لجميع المتصفحات الحديثة

### التتبع (Analytics)

- تتبع تلقائي لجميع المشاركات
- إرسال البيانات إلى Backend API
- لا يتطلب تسجيل دخول (اختياري)

### نسخ الرابط

- دعم Clipboard API الحديث
- Fallback للمتصفحات القديمة
- رسالة تأكيد عند النسخ

### التصميم

- تصميم متجاوب (Desktop, Tablet, Mobile)
- دعم RTL للعربية
- دعم Dark Mode
- Accessibility كامل
- Animations سلسة

## أمثلة

### مثال 1: زر بسيط

```jsx
<ShareButton job={job} />
```

### مثال 2: زر مع نص

```jsx
<ShareButton 
  job={job}
  variant="both"
  size="large"
/>
```

### مثال 3: زر صغير

```jsx
<ShareButton 
  job={job}
  size="small"
  variant="icon"
/>
```

### مثال 4: مع callback

```jsx
<ShareButton 
  job={job}
  onShare={(platform) => {
    console.log(`Shared on ${platform}`);
    // تتبع في Google Analytics
    gtag('event', 'share', {
      method: platform,
      content_type: 'job',
      item_id: job.id
    });
  }}
/>
```

## التكامل مع JobCard

تم تحديث `JobCardGrid` و `JobCardList` لاستخدام `ShareButton`:

```jsx
import ShareButton from '../JobShare/ShareButton';

// في JobCardGrid أو JobCardList
<ShareButton
  job={job}
  size="medium"
  variant="icon"
  onShare={onShare}
/>
```

## Backend API

يتطلب endpoint في Backend:

```javascript
POST /api/jobs/:id/share
Authorization: Bearer <token> (اختياري)

Body:
{
  "platform": "whatsapp" | "linkedin" | "twitter" | "facebook" | "copy" | "native"
}

Response:
{
  "success": true,
  "shareCount": 42
}
```

## المتطلبات

- React 18+
- lucide-react (للأيقونات)
- AppContext (للغة)

## الاختبار

```bash
# تشغيل الاختبارات
npm test -- ShareButton.test.jsx
npm test -- ShareModal.test.jsx
```

## الأداء

- Lazy loading للـ Modal
- SVG icons inline (لا external requests)
- CSS animations محسّنة
- No layout shifts

## Accessibility

- ARIA labels كاملة
- Keyboard navigation
- Focus management
- Screen reader support
- High contrast mode support

## المتصفحات المدعومة

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Chrome Mobile
- ✅ Safari iOS

## الترخيص

MIT
