# التبديل بين منطق AND/OR للمهارات - دليل البدء السريع

## ⚡ 5 دقائق للبدء

---

## 🎯 ما هذا؟

ميزة تتيح للمستخدمين اختيار منطق البحث عن الوظائف بناءً على المهارات:
- **OR**: أي مهارة من المهارات المحددة
- **AND**: جميع المهارات المحددة

---

## 🚀 الاستخدام السريع

### Backend API

```bash
# OR Logic (أي مهارة)
GET /api/search/jobs?skills=JavaScript,React&skillsLogic=OR

# AND Logic (جميع المهارات)
GET /api/search/jobs?skills=JavaScript,React&skillsLogic=AND
```

### Frontend

```jsx
// في FilterPanel
<input
  type="radio"
  name="skillsLogic"
  value="OR"
  checked={filters.skillsLogic === 'OR'}
  onChange={() => setFilters({...filters, skillsLogic: 'OR'})}
/>
<span>أي مهارة (OR)</span>

<input
  type="radio"
  name="skillsLogic"
  value="AND"
  checked={filters.skillsLogic === 'AND'}
  onChange={() => setFilters({...filters, skillsLogic: 'AND'})}
/>
<span>جميع المهارات (AND)</span>
```

---

## 🧪 الاختبار

```bash
cd backend
npm test -- filterService.test.js --testNamePattern="filterBySkills"
```

**النتيجة**: ✅ 5/5 اختبارات نجحت

---

## 💡 أمثلة سريعة

### مثال 1: OR Logic

**المهارات**: JavaScript, React

**النتائج**:
- ✅ وظيفة تتطلب JavaScript فقط
- ✅ وظيفة تتطلب React فقط
- ✅ وظيفة تتطلب JavaScript + React

### مثال 2: AND Logic

**المهارات**: JavaScript, React

**النتائج**:
- ❌ وظيفة تتطلب JavaScript فقط
- ❌ وظيفة تتطلب React فقط
- ✅ وظيفة تتطلب JavaScript + React

---

## 📊 MongoDB Queries

```javascript
// OR Logic
{ skills: { $in: ['JavaScript', 'React'] } }

// AND Logic
{ skills: { $all: ['JavaScript', 'React'] } }
```

---

## 📚 التوثيق الكامل

📄 `docs/Advanced Search Filter/SKILLS_LOGIC_TOGGLE.md`

---

## ✅ الحالة

- ✅ Backend: يعمل
- ✅ Frontend: يعمل
- ✅ الاختبارات: 5/5 نجحت
- ✅ دعم 3 لغات

---

**تاريخ الإنشاء**: 2026-03-03
