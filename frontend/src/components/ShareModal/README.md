# ShareModal Component

نظام مشاركة شامل للوظائف مع 5 خيارات للمشاركة.

## 🚀 الاستخدام السريع

```jsx
import ShareButton from '../ShareButton/ShareButton';

<ShareButton job={job} />
```

## 📦 المكونات

### ShareButton (موصى به)

```jsx
import ShareButton from '../ShareButton/ShareButton';

<ShareButton 
  job={job}
  variant="default"  // default | primary | icon-only
  size="medium"      // small | medium | large
/>
```

### ShareModal (للتحكم الكامل)

```jsx
import ShareModal from '../ShareModal/ShareModal';

const [isOpen, setIsOpen] = useState(false);

<ShareModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  job={job}
/>
```

## 🎯 الميزات

- ✅ نسخ الرابط مع رسالة تأكيد
- ✅ مشاركة على WhatsApp
- ✅ مشاركة على LinkedIn
- ✅ مشاركة على Twitter
- ✅ مشاركة على Facebook
- ✅ Web Share API (للموبايل)
- ✅ Responsive Design
- ✅ RTL Support
- ✅ Dark Mode
- ✅ Accessibility

## 📋 المتطلبات

```javascript
const job = {
  _id: String,         // مطلوب
  title: String,       // مطلوب
  company: {
    name: String       // مطلوب
  }
};
```

## 📚 التوثيق الكامل

- [التوثيق الشامل](../../../../docs/Enhanced%20Job%20Postings/SHARE_SYSTEM_IMPLEMENTATION.md)
- [دليل البدء السريع](../../../../docs/Enhanced%20Job%20Postings/SHARE_SYSTEM_QUICK_START.md)
- [مثال كامل](../../examples/ShareModalExample.jsx)

## 🎨 التخصيص

### CSS Classes

```css
.share-modal              /* Modal container */
.share-modal-overlay      /* Background overlay */
.share-modal-header       /* Header section */
.share-modal-options      /* Options container */
.share-option             /* Individual option button */
.share-option-copy        /* Copy link button */
.share-option-whatsapp    /* WhatsApp button */
.share-option-linkedin    /* LinkedIn button */
.share-option-twitter     /* Twitter button */
.share-option-facebook    /* Facebook button */
```

### Props

**ShareButton**:
- `job` (Object, required): كائن الوظيفة
- `variant` (String): default | primary | icon-only
- `size` (String): small | medium | large
- `className` (String): CSS classes إضافية

**ShareModal**:
- `isOpen` (Boolean, required): حالة فتح/إغلاق
- `onClose` (Function, required): دالة الإغلاق
- `job` (Object, required): كائن الوظيفة

## 🐛 استكشاف الأخطاء

### "Cannot read property '_id' of undefined"

```jsx
{job && <ShareButton job={job} />}
```

### "Clipboard write failed"

استخدم HTTPS في Production.

## 📱 دعم المتصفحات

- ✅ Chrome (Desktop + Mobile)
- ✅ Firefox (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Edge
- ✅ Samsung Internet

---

**الحالة**: ✅ مكتمل ومفعّل  
**التاريخ**: 2026-03-06
