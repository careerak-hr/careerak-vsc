# خطوط تطبيق كاريرك - Careerak Fonts

## الخطوط المعتمدة

### 🔤 العربية - Arabic
- **الخط الأساسي**: `Amiri`
- **المصدر**: Google Fonts + ملفات محلية
- **الوصف**: خط تراثي فخم يعكس الأصالة والرقي
- **الاستخدام**: جميع النصوص العربية في التطبيق

### 🔤 الإنجليزية - English  
- **الخط الأساسي**: `Cormorant Garamond`
- **المصدر**: Google Fonts + ملفات محلية
- **الوصف**: خط كلاسيكي أنيق للنصوص الاحترافية
- **الاستخدام**: جميع النصوص الإنجليزية في التطبيق

### 🔤 الفرنسية - French
- **الخط الأساسي**: `EB Garamond`
- **المصدر**: Google Fonts + ملفات محلية
- **الوصف**: خط فرنسي أصيل يعكس الفخامة الأوروبية
- **الاستخدام**: جميع النصوص الفرنسية في التطبيق

## 📥 تحميل الخطوط المحلية

### الطريقة الأولى: السكريبت التلقائي (الأسهل)

```bash
# من مجلد frontend
cd frontend
npm run download-fonts
```

### الطريقة الثانية: التحميل اليدوي

1. **تحميل خط Amiri:**
   - اذهب إلى: https://fonts.google.com/specimen/Amiri
   - حمل الملفات: Regular, Bold, Italic, Bold Italic
   - ضعها في: `frontend/src/assets/fonts/amiri/`

2. **تحميل خط Cormorant Garamond:**
   - اذهب إلى: https://fonts.google.com/specimen/Cormorant+Garamond
   - حمل الملفات: Light, Regular, Medium, SemiBold, Bold
   - ضعها في: `frontend/src/assets/fonts/cormorant-garamond/`

3. **تحميل خط EB Garamond:**
   - اذهب إلى: https://fonts.google.com/specimen/EB+Garamond
   - حمل الملفات: Regular, Medium, SemiBold, Bold, ExtraBold + Italic versions
   - ضعها في: `frontend/src/assets/fonts/eb-garamond/`

### الطريقة الثالثة: استخدام Google Fonts Helper

1. اذهب إلى: https://gwfh.mranftl.com/fonts
2. ابحث عن كل خط واختر الأوزان المطلوبة
3. حمل الملفات وضعها في المجلدات المناسبة

## 🔧 هيكل المجلدات

```
frontend/src/assets/fonts/
├── fonts.css                    # تعريفات الخطوط المحلية
├── amiri/                       # خط أميري للعربية
│   ├── Amiri-Regular.woff2
│   ├── Amiri-Bold.woff2
│   ├── Amiri-Italic.woff2
│   └── Amiri-BoldItalic.woff2
├── cormorant-garamond/          # خط Cormorant للإنجليزية
│   ├── CormorantGaramond-Light.woff2
│   ├── CormorantGaramond-Regular.woff2
│   ├── CormorantGaramond-Medium.woff2
│   ├── CormorantGaramond-SemiBold.woff2
│   └── CormorantGaramond-Bold.woff2
└── eb-garamond/                 # خط EB Garamond للفرنسية
    ├── EBGaramond-Regular.woff2
    ├── EBGaramond-Medium.woff2
    ├── EBGaramond-SemiBold.woff2
    ├── EBGaramond-Bold.woff2
    ├── EBGaramond-ExtraBold.woff2
    ├── EBGaramond-Italic.woff2
    ├── EBGaramond-MediumItalic.woff2
    ├── EBGaramond-SemiBoldItalic.woff2
    ├── EBGaramond-BoldItalic.woff2
    └── EBGaramond-ExtraBoldItalic.woff2
```

## 🚀 التطبيق التلقائي

الخطوط تتغير تلقائياً حسب اللغة المختارة من قبل المستخدم:
- عند اختيار العربية → يتم تطبيق خط `Amiri`
- عند اختيار الإنجليزية → يتم تطبيق خط `Cormorant Garamond`  
- عند اختيار الفرنسية → يتم تطبيق خط `EB Garamond`

## 📋 الملفات المتأثرة

- `frontend/src/index.css` - الخطوط الأساسية والقواعد العامة
- `frontend/src/assets/fonts/fonts.css` - تعريفات الخطوط المحلية
- `frontend/tailwind.config.js` - تعريف الخطوط في Tailwind
- `frontend/src/context/AuthContext.js` - تطبيق الخطوط عند تغيير اللغة
- `frontend/src/components/FontProvider.jsx` - مزود الخطوط الذكي
- `frontend/src/utils/fontUtils.js` - أدوات مساعدة للخطوط

## 🎯 المزايا

### الخطوط المحلية:
- ✅ أداء أسرع (لا حاجة للإنترنت)
- ✅ تحميل فوري (لا انتظار)
- ✅ عمل في وضع عدم الاتصال
- ✅ تحكم كامل في الإصدارات

### الاحتياطي من Google Fonts:
- ✅ ضمان عمل الخطوط حتى لو فشل التحميل المحلي
- ✅ تحديثات تلقائية من Google
- ✅ دعم أوسع للمتصفحات القديمة

## 🔍 استكشاف الأخطاء

### إذا لم تظهر الخطوط:
1. تأكد من وجود ملفات الخطوط في المجلدات الصحيحة
2. تحقق من مسارات الملفات في `fonts.css`
3. افتح Developer Tools وتحقق من تحميل الخطوط
4. امسح cache المتصفح وأعد التحميل

### إذا فشل السكريبت:
1. تأكد من اتصال الإنترنت
2. تحقق من صلاحيات الكتابة في مجلد المشروع
3. جرب التحميل اليدوي كبديل

## 🛠️ الاستخدام في المكونات

```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { language } = useAuth();
  
  const fontStyle = {
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };
  
  return <div style={fontStyle}>النص هنا</div>;
};
```

## 📦 المكونات المساعدة

- `LanguageAwareText` - نص ذكي يطبق الخط المناسب تلقائياً
- `LanguageAwareHeading` - عنوان ذكي للعناوين
- `LanguageAwareBody` - نص عادي ذكي

```jsx
import { LanguageAwareHeading, LanguageAwareBody } from '../components/LanguageAwareText';

<LanguageAwareHeading>عنوان فخم</LanguageAwareHeading>
<LanguageAwareBody>نص عادي أنيق</LanguageAwareBody>
```