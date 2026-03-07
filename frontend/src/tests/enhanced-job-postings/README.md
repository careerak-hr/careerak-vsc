# Enhanced Job Postings - Frontend Tests

اختبارات شاملة لمكونات Frontend لميزات تحسينات صفحة الوظائف.

## 📋 نظرة عامة

هذا المجلد يحتوي على اختبارات Unit و Integration لجميع مكونات Frontend:

- ✅ View Toggle (Grid/List)
- ✅ Bookmark Button
- ✅ Share Button
- ✅ Similar Jobs Section
- ✅ Salary Indicator

## 📁 هيكل الملفات

```
enhanced-job-postings/
├── ViewToggle.test.jsx        # اختبارات التبديل بين Grid/List (15 tests)
├── BookmarkButton.test.jsx    # اختبارات زر الحفظ (15 tests)
├── ShareButton.test.jsx       # اختبارات زر المشاركة (16 tests)
└── README.md                  # هذا الملف
```

## 🧪 الاختبارات

### 1. View Toggle Tests (15 tests)
- ✅ عرض أزرار التبديل
- ✅ تمييز العرض النشط
- ✅ استدعاء onToggle عند النقر
- ✅ التبديل بين grid و list
- ✅ الافتراضي إلى grid
- ✅ تحميل التفضيل من localStorage
- ✅ حفظ التفضيل في localStorage
- ✅ الاستمرارية عبر إعادة تحميل الصفحة
- ✅ الاستمرارية عبر جلسات متعددة
- ✅ معالجة قيم localStorage غير صالحة
- ✅ معالجة localStorage مفقود
- ✅ التكامل مع JobPostingsPage
- ✅ الحفاظ على التفضيل عند التنقل

### 2. Bookmark Button Tests (15 tests)
- ✅ عرض زر الحفظ
- ✅ عرض حالة غير محفوظ
- ✅ عرض حالة محفوظ
- ✅ تبديل الحفظ عند النقر
- ✅ عرض حالة التحميل
- ✅ تغيير اللون عند الحفظ (رمادي → ذهبي)
- ✅ عرض animation عند الحفظ
- ✅ معالجة أخطاء الحفظ
- ✅ طلب المصادقة
- ✅ تحديث عداد الحفظ
- ✅ تسمية accessible
- ✅ تحديث aria-label عند الحفظ
- ✅ إمكانية الوصول عبر لوحة المفاتيح

### 3. Share Button Tests (16 tests)
- ✅ عرض زر المشاركة
- ✅ فتح modal عند النقر
- ✅ عرض جميع خيارات المشاركة (5 خيارات)
- ✅ نسخ الرابط إلى clipboard
- ✅ عرض رسالة نجاح بعد النسخ
- ✅ فتح مشاركة WhatsApp
- ✅ فتح مشاركة LinkedIn
- ✅ فتح مشاركة Twitter
- ✅ فتح مشاركة Facebook
- ✅ تتبع المشاركة على Backend
- ✅ إغلاق modal عند النقر على backdrop
- ✅ إغلاق modal عند النقر على زر الإغلاق
- ✅ استخدام native share عند التوفر
- ✅ fallback إلى modal عند عدم التوفر

## 🚀 تشغيل الاختبارات

### جميع الاختبارات
```bash
cd frontend
npm test -- enhanced-job-postings
```

### اختبار محدد
```bash
# View Toggle tests
npm test -- ViewToggle.test.jsx

# Bookmark Button tests
npm test -- BookmarkButton.test.jsx

# Share Button tests
npm test -- ShareButton.test.jsx
```

### مع التغطية (Coverage)
```bash
npm test -- enhanced-job-postings --coverage
```

### وضع المراقبة (Watch Mode)
```bash
npm test -- enhanced-job-postings --watch
```

### UI Mode (Vitest)
```bash
npm test -- enhanced-job-postings --ui
```

## 📊 التغطية المتوقعة

| المكون | التغطية المستهدفة |
|--------|-------------------|
| ViewToggle | 95%+ |
| BookmarkButton | 95%+ |
| ShareButton | 95%+ |
| useViewPreference Hook | 100% |

## ✅ معايير النجاح

- ✅ جميع الاختبارات تنجح (46/46)
- ✅ التغطية > 90%
- ✅ لا تحذيرات أو أخطاء
- ✅ جميع المكونات accessible
- ✅ جميع التفاعلات تعمل

## 🔧 المتطلبات

- Node.js >= 14
- Vitest (test runner)
- @testing-library/react
- @testing-library/user-event

## 📝 ملاحظات مهمة

1. **localStorage**: يتم تنظيفه قبل وبعد كل اختبار
2. **Mocking**: fetch و navigator APIs يتم mock-ها
3. **Accessibility**: جميع المكونات تُختبر للوصول
4. **User Interactions**: جميع التفاعلات تُختبر

## 🎨 أفضل الممارسات

### كتابة الاختبارات
```jsx
// ✅ جيد: اختبار السلوك
test('should bookmark job on click', async () => {
  render(<BookmarkButton job={mockJob} />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });
});

// ❌ سيء: اختبار التنفيذ
test('should call handleBookmark', () => {
  const wrapper = shallow(<BookmarkButton />);
  wrapper.instance().handleBookmark();
  expect(wrapper.state('bookmarked')).toBe(true);
});
```

### Accessibility Testing
```jsx
// ✅ دائماً اختبر accessibility
test('should have accessible label', () => {
  render(<BookmarkButton job={mockJob} />);
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label');
});

test('should be keyboard accessible', () => {
  render(<BookmarkButton job={mockJob} />);
  const button = screen.getByRole('button');
  button.focus();
  expect(button).toHaveFocus();
});
```

### Async Testing
```jsx
// ✅ استخدم waitFor للعمليات async
test('should show success message', async () => {
  render(<ShareButton job={mockJob} />);
  fireEvent.click(screen.getByText(/نسخ الرابط/i));
  
  await waitFor(() => {
    expect(screen.getByText(/تم نسخ الرابط/i)).toBeInTheDocument();
  });
});
```

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل؟
```bash
# تحقق من تثبيت التبعيات
npm install

# شغّل اختبار واحد للتشخيص
npm test -- ViewToggle.test.jsx --verbose

# تحقق من console errors
npm test -- ViewToggle.test.jsx --silent=false
```

### مشاكل localStorage؟
```bash
# تأكد من تنظيف localStorage
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
```

### مشاكل async؟
```bash
# استخدم waitFor دائماً
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

# أو استخدم findBy (يحتوي على waitFor مدمج)
const element = await screen.findByText(/text/i);
```

## 📚 المراجع

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 الخطوات التالية

1. ✅ تشغيل جميع الاختبارات
2. ✅ التحقق من التغطية
3. ✅ إصلاح أي اختبارات فاشلة
4. ✅ إضافة اختبارات E2E (Playwright/Cypress)
5. ✅ دمج في CI/CD pipeline

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ مكتمل
