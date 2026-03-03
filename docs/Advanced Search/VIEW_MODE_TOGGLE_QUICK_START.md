# دليل البدء السريع - التبديل بين عرض القائمة والخريطة

## ⚡ البدء السريع (5 دقائق)

### 1. استيراد الصفحة

```jsx
import SearchPage from './pages/SearchPage';
```

### 2. إضافة Route

```jsx
<Route path="/search" element={<SearchPage />} />
```

### 3. استخدام الروابط

```jsx
// عرض قائمة
<Link to="/search?view=list">البحث</Link>

// عرض خريطة
<Link to="/search?view=map">الخريطة</Link>
```

---

## 🎯 الميزات الرئيسية

✅ زر تبديل واضح بين القائمة والخريطة  
✅ حفظ الوضع في URL (يمكن مشاركته)  
✅ تصميم متجاوب (Desktop, Tablet, Mobile)  
✅ دعم RTL/LTR  
✅ ألوان من palette المشروع  

---

## 📱 التجاوب

- **Desktop**: أزرار كاملة مع نص وأيقونات
- **Mobile**: أيقونات فقط

---

## 🔗 الملفات

- `frontend/src/pages/SearchPage.jsx` - المكون الرئيسي
- `frontend/src/pages/SearchPage.css` - التنسيقات
- `frontend/src/examples/SearchPageExample.jsx` - مثال توضيحي

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
📄 `docs/Advanced Search/VIEW_MODE_TOGGLE_IMPLEMENTATION.md`

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ مكتمل
