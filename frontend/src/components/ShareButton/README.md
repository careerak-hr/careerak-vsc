# ShareButton Component

مكون مشاركة الوظائف على وسائل التواصل الاجتماعي.

## الميزات

- ✅ 5 خيارات مشاركة: نسخ الرابط، WhatsApp، LinkedIn، Twitter، Facebook
- ✅ Web Share API للأجهزة المحمولة
- ✅ رسالة تأكيد عند نسخ الرابط
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم RTL/LTR
- ✅ Dark Mode Support
- ✅ Accessibility كامل
- ✅ Animations سلسة
- ✅ 3 أحجام: small, medium, large
- ✅ 4 أنماط: default, primary, outline, icon-only

## الاستخدام الأساسي

```jsx
import ShareButton from './components/ShareButton';

function JobCard({ job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <ShareButton job={job} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | required | بيانات الوظيفة (يجب أن تحتوي على `_id`, `title`, `company.name`) |
| `variant` | String | `'default'` | نمط الزر: `'default'`, `'primary'`, `'outline'`, `'icon-only'` |
| `size` | String | `'medium'` | حجم الزر: `'small'`, `'medium'`, `'large'` |
| `className` | String | `''` | CSS class إضافي |

## الأحجام

```jsx
// صغير
<ShareButton job={job} size="small" />

// متوسط (افتراضي)
<ShareButton job={job} size="medium" />

// كبير
<ShareButton job={job} size="large" />
```

## الأنماط

```jsx
// افتراضي (أبيض مع حدود)
<ShareButton job={job} variant="default" />

// أساسي (نحاسي)
<ShareButton job={job} variant="primary" />

// محدد (شفاف مع حدود)
<ShareButton job={job} variant="outline" />

// أيقونة فقط (دائري)
<ShareButton job={job} variant="icon-only" />
```

## أمثلة متقدمة

### في بطاقة وظيفة

```jsx
<div className="job-card">
  <div className="job-info">
    <h3>{job.title}</h3>
    <p>{job.company.name}</p>
  </div>
  <div className="job-actions">
    <button className="apply-button">تقديم</button>
    <ShareButton job={job} variant="outline" />
  </div>
</div>
```

### في صفحة تفاصيل الوظيفة

```jsx
<div className="job-detail-header">
  <h1>{job.title}</h1>
  <div className="job-actions">
    <button className="apply-button">تقديم الآن</button>
    <button className="bookmark-button">حفظ</button>
    <ShareButton job={job} variant="primary" size="large" />
  </div>
</div>
```

### مع Custom Styling

```jsx
<ShareButton 
  job={job} 
  className="my-custom-share-button"
  variant="outline"
  size="small"
/>
```

## بنية بيانات الوظيفة

```javascript
const job = {
  _id: '507f1f77bcf86cd799439011',  // مطلوب
  title: 'مطور Full Stack',         // مطلوب
  company: {
    name: 'شركة التقنية'             // مطلوب
  },
  // حقول اختيارية
  location: {
    city: 'الرياض',
    country: 'السعودية'
  },
  salary: 15000,
  experienceLevel: 'متوسط'
};
```

## خيارات المشاركة

### 1. نسخ الرابط
- ينسخ رابط الوظيفة إلى الحافظة
- يعرض رسالة تأكيد لمدة 1.5 ثانية
- يدعم Fallback للمتصفحات القديمة

### 2. WhatsApp
- يفتح WhatsApp مع رابط الوظيفة
- يعمل على Desktop و Mobile

### 3. LinkedIn
- يفتح LinkedIn Share Dialog
- مثالي للمشاركة المهنية

### 4. Twitter
- يفتح Twitter مع tweet جاهز
- يتضمن عنوان الوظيفة والرابط

### 5. Facebook
- يفتح Facebook Share Dialog
- يدعم Open Graph tags

### 6. Web Share API (Mobile)
- يظهر تلقائياً على الأجهزة المحمولة
- يعرض خيارات المشاركة الأصلية للنظام

## Accessibility

- ✅ ARIA labels واضحة
- ✅ Focus states مرئية
- ✅ Keyboard navigation كامل
- ✅ Screen reader friendly
- ✅ Touch targets >= 44px

## Responsive Design

### Desktop (>= 1024px)
- حجم كامل
- Hover effects
- Modal في المنتصف

### Tablet (640px - 1023px)
- حجم متوسط
- Touch-friendly
- Modal متكيف

### Mobile (< 640px)
- حجم مصغر
- Touch-optimized
- Modal ملء الشاشة تقريباً
- Web Share API متاح

## Dark Mode

يدعم المكون Dark Mode تلقائياً:

```css
@media (prefers-color-scheme: dark) {
  /* تطبيق تلقائي للألوان الداكنة */
}
```

## RTL Support

يدعم المكون RTL تلقائياً:

```css
[dir="rtl"] .share-button {
  /* تطبيق تلقائي لـ RTL */
}
```

## Performance

- ✅ Lazy loading للـ Modal
- ✅ Event delegation
- ✅ CSS animations (GPU-accelerated)
- ✅ No layout shifts

## Browser Support

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet
- ✅ Opera

## Testing

```bash
# تشغيل المثال
npm start

# فتح المتصفح على
http://localhost:3000/examples/share-button
```

## Troubleshooting

### المشكلة: Modal لا يفتح
**الحل**: تأكد من تمرير `job` prop صحيح مع `_id`, `title`, `company.name`

### المشكلة: نسخ الرابط لا يعمل
**الحل**: تأكد من استخدام HTTPS (Clipboard API يتطلب HTTPS)

### المشكلة: Web Share API لا يظهر
**الحل**: Web Share API متاح فقط على HTTPS وعلى الأجهزة المحمولة

## License

MIT

## المساهمة

مرحباً بالمساهمات! يرجى فتح issue أو pull request.

## الدعم

للدعم، يرجى فتح issue على GitHub أو التواصل عبر البريد الإلكتروني.
