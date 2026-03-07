# شريط البحث الذكي - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. استخدام المكون (دقيقة واحدة)

```jsx
import SearchBar from '../components/Search/SearchBar';

function MyPage() {
  const handleSearch = (query) => {
    console.log('Search:', query);
    // تنفيذ البحث هنا
  };

  return (
    <SearchBar
      type="jobs"
      onSearch={handleSearch}
    />
  );
}
```

### 2. مع معالجة الاقتراحات (دقيقتان)

```jsx
import SearchBar from '../components/Search/SearchBar';

function MyPage() {
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    const response = await fetch(`/api/search/jobs?q=${query}`);
    const data = await response.json();
    setResults(data.data.results);
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log('Selected:', suggestion);
    handleSearch(suggestion);
  };

  return (
    <div>
      <SearchBar
        type="jobs"
        onSearch={handleSearch}
        onSuggestionSelect={handleSuggestionSelect}
        autoFocus={true}
      />
      
      {/* عرض النتائج */}
      <div>
        {results.map(job => (
          <div key={job._id}>{job.title}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 الميزات الأساسية

### ✅ ما يعمل تلقائياً
- اقتراحات ذكية بعد 3 أحرف
- تنقل بلوحة المفاتيح (↑ ↓ Enter Esc)
- Debounce (300ms)
- Loading indicator
- دعم RTL/LTR
- Dark Mode
- Accessibility

### ⚙️ ما يمكن تخصيصه
```jsx
<SearchBar
  type="jobs"              // 'jobs' أو 'courses'
  onSearch={handleSearch}  // مطلوب
  onSuggestionSelect={handleSuggestionSelect}  // اختياري
  placeholder="ابحث..."   // اختياري
  autoFocus={true}         // اختياري
  minChars={3}             // اختياري (افتراضي: 3)
  initialValue=""          // اختياري
/>
```

---

## 🔌 API Endpoint

### الطلب
```bash
GET /api/search/autocomplete?q=jav&type=jobs&limit=10
```

### الاستجابة
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "JavaScript Developer",
      "Java Developer",
      "React Developer"
    ],
    "query": "jav",
    "type": "jobs"
  }
}
```

---

## 🎨 التخصيص السريع

### تغيير الألوان
```css
.search-input-container {
  border-color: #your-color !important;
}

.search-button {
  background: #your-color !important;
}
```

### تغيير الحد الأدنى للأحرف
```jsx
<SearchBar minChars={2} />  // بدلاً من 3
```

---

## 🧪 الاختبار السريع

### 1. افتح المثال
```
http://localhost:5173/examples/smart-search-bar
```

### 2. اختبر الميزات
- ✅ اكتب "jav" وانتظر الاقتراحات
- ✅ استخدم ↑↓ للتنقل
- ✅ اضغط Enter للاختيار
- ✅ اضغط Esc للإغلاق

---

## 🐛 حل المشاكل السريع

### لا تظهر الاقتراحات؟
1. تأكد من كتابة 3 أحرف على الأقل
2. افتح Console وتحقق من الأخطاء
3. تحقق من أن Backend يعمل:
```bash
curl "http://localhost:5000/api/search/autocomplete?q=jav&type=jobs"
```

### الاقتراحات بطيئة؟
1. تحقق من اتصال الإنترنت
2. تحقق من أن Debounce مفعّل (300ms)
3. تحقق من سجلات Backend

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./SMART_SEARCH_BAR_IMPLEMENTATION.md)
- 📄 [مثال كامل](../../frontend/src/examples/SmartSearchBarExample.jsx)
- 📄 [كود المكون](../../frontend/src/components/Search/SearchBar.jsx)

---

**تاريخ الإنشاء**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
