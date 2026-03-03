# التبديل بين منطق AND/OR للمهارات

## 📋 معلومات الميزة

- **تاريخ الإضافة**: 2026-03-03
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 6.2 (يمكن التبديل بين منطق AND/OR)

---

## 🎯 نظرة عامة

تتيح هذه الميزة للمستخدمين التبديل بين منطقين مختلفين عند البحث عن الوظائف بناءً على المهارات:

- **OR (أي مهارة)**: يكفي توفر أي مهارة من المهارات المحددة
- **AND (جميع المهارات)**: يجب توفر جميع المهارات المحددة

---

## 🔧 التنفيذ التقني

### Backend - FilterService

**الملف**: `backend/src/services/filterService.js`

```javascript
/**
 * فلترة حسب المهارات مع دعم منطق AND/OR
 * @param {Object} query - الاستعلام الحالي
 * @param {Array<string>} skills - قائمة المهارات
 * @param {string} logic - منطق الفلترة ('AND' أو 'OR')
 * @returns {Object} - الاستعلام المحدث
 */
filterBySkills(query, skills, logic = 'OR') {
  if (!Array.isArray(skills) || skills.length === 0) {
    return query;
  }

  // تنظيف المهارات
  const cleanedSkills = skills
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);

  if (cleanedSkills.length === 0) {
    return query;
  }

  if (logic === 'AND') {
    // يجب توفر جميع المهارات
    query.skills = { $all: cleanedSkills };
  } else {
    // يكفي توفر أي مهارة
    query.skills = { $in: cleanedSkills };
  }

  return query;
}
```

### Frontend - FilterPanel Component

**الملف**: `frontend/src/components/Search/FilterPanel.jsx`

```jsx
{/* Skills Logic Toggle */}
<div className="skills-logic-toggle">
  <label className="radio-label">
    <input
      type="radio"
      name="skillsLogic"
      value="OR"
      checked={localFilters.skillsLogic === 'OR' || !localFilters.skillsLogic}
      onChange={() => handleFilterChange('skillsLogic', 'OR')}
    />
    <span>{t.anySkill}</span>
  </label>
  <label className="radio-label">
    <input
      type="radio"
      name="skillsLogic"
      value="AND"
      checked={localFilters.skillsLogic === 'AND'}
      onChange={() => handleFilterChange('skillsLogic', 'AND')}
    />
    <span>{t.allSkills}</span>
  </label>
</div>
```

---

## 📝 الاستخدام

### Backend API

**Endpoint**: `GET /api/search/jobs`

**Query Parameters**:
```
skills=JavaScript,React,Node.js
skillsLogic=AND
```

**مثال 1 - OR Logic (أي مهارة)**:
```bash
GET /api/search/jobs?skills=JavaScript,React,Node.js&skillsLogic=OR
```

**النتيجة**: جميع الوظائف التي تتطلب JavaScript أو React أو Node.js

**مثال 2 - AND Logic (جميع المهارات)**:
```bash
GET /api/search/jobs?skills=JavaScript,React,Node.js&skillsLogic=AND
```

**النتيجة**: فقط الوظائف التي تتطلب JavaScript و React و Node.js معاً

### Frontend

```javascript
// في FilterPanel.jsx
const [filters, setFilters] = useState({
  skills: ['JavaScript', 'React'],
  skillsLogic: 'OR' // أو 'AND'
});

// عند التبديل
const handleSkillsLogicChange = (logic) => {
  setFilters(prev => ({
    ...prev,
    skillsLogic: logic
  }));
};
```

---

## 🧪 الاختبارات

**الملف**: `backend/tests/filterService.test.js`

```bash
# تشغيل الاختبارات
cd backend
npm test -- filterService.test.js --testNamePattern="filterBySkills"
```

**النتيجة المتوقعة**: ✅ 5/5 اختبارات نجحت

### الاختبارات المتاحة

1. ✅ **OR Logic**: يجب أن يفلتر بمنطق OR
2. ✅ **AND Logic**: يجب أن يفلتر بمنطق AND
3. ✅ **Trim Skills**: يجب أن يزيل المسافات من أسماء المهارات
4. ✅ **Filter Empty**: يجب أن يفلتر المهارات الفارغة
5. ✅ **Empty Array**: يجب أن يتعامل مع مصفوفة فارغة

---

## 🌍 دعم متعدد اللغات

### العربية
- **أي مهارة (OR)**: يكفي توفر أي مهارة من المهارات المحددة
- **جميع المهارات (AND)**: يجب توفر جميع المهارات المحددة

### English
- **Any Skill (OR)**: At least one of the selected skills
- **All Skills (AND)**: All selected skills required

### Français
- **N'importe quelle compétence (OR)**: Au moins une des compétences sélectionnées
- **Toutes les compétences (AND)**: Toutes les compétences sélectionnées requises

---

## 💡 أمثلة عملية

### مثال 1: مطور Full Stack

**المهارات المطلوبة**: JavaScript, React, Node.js

**OR Logic**:
- ✅ وظيفة تتطلب: JavaScript فقط
- ✅ وظيفة تتطلب: React + Vue
- ✅ وظيفة تتطلب: Node.js + Python
- ✅ وظيفة تتطلب: JavaScript + React + Node.js

**AND Logic**:
- ❌ وظيفة تتطلب: JavaScript فقط
- ❌ وظيفة تتطلب: React + Vue
- ❌ وظيفة تتطلب: Node.js + Python
- ✅ وظيفة تتطلب: JavaScript + React + Node.js

### مثال 2: مصمم UI/UX

**المهارات المطلوبة**: Figma, Adobe XD

**OR Logic**:
- ✅ وظيفة تتطلب: Figma فقط
- ✅ وظيفة تتطلب: Adobe XD فقط
- ✅ وظيفة تتطلب: Figma + Adobe XD

**AND Logic**:
- ❌ وظيفة تتطلب: Figma فقط
- ❌ وظيفة تتطلب: Adobe XD فقط
- ✅ وظيفة تتطلب: Figma + Adobe XD

---

## 🎨 واجهة المستخدم

### التصميم

```
┌─────────────────────────────────────┐
│ المهارات                            │
├─────────────────────────────────────┤
│ ○ أي مهارة (OR)                     │
│ ● جميع المهارات (AND)               │
├─────────────────────────────────────┤
│ [ابحث عن مهارة...]                 │
├─────────────────────────────────────┤
│ ☑ JavaScript                        │
│ ☑ React                             │
│ ☑ Node.js                           │
└─────────────────────────────────────┘
```

### الألوان والخطوط

- **الألوان**: من palette المشروع (#304B60, #E3DAD1, #D48161)
- **الخطوط**: Amiri للعربية، Cormorant Garamond للإنجليزية
- **Responsive**: يعمل على جميع الأجهزة

---

## 📊 MongoDB Queries

### OR Logic ($in)

```javascript
{
  skills: {
    $in: ['JavaScript', 'React', 'Node.js']
  }
}
```

**يطابق**: أي وثيقة تحتوي على واحدة أو أكثر من المهارات

### AND Logic ($all)

```javascript
{
  skills: {
    $all: ['JavaScript', 'React', 'Node.js']
  }
}
```

**يطابق**: فقط الوثائق التي تحتوي على جميع المهارات

---

## ⚡ الأداء

### Indexes

```javascript
// في JobPosting model
JobPostingSchema.index({ skills: 1 });
```

### التحسينات

- ✅ تنظيف المهارات (trim, filter empty)
- ✅ استخدام MongoDB operators ($in, $all)
- ✅ Indexes على حقل skills
- ✅ Caching للنتائج الشائعة (اختياري)

---

## 🔒 الأمان

### Input Validation

```javascript
// التحقق من صحة المدخلات
if (!Array.isArray(skills)) {
  throw new ValidationError('Skills must be an array');
}

if (skills.length > 20) {
  throw new ValidationError('Maximum 20 skills allowed');
}

if (!['AND', 'OR'].includes(logic)) {
  throw new ValidationError('Invalid skills logic');
}
```

### Sanitization

```javascript
// تنظيف المهارات
const cleanedSkills = skills
  .map(skill => skill.trim())
  .filter(skill => skill.length > 0);
```

---

## 📈 الفوائد المتوقعة

- 🎯 **دقة أعلى**: نتائج بحث أكثر دقة حسب احتياجات المستخدم
- ⚡ **مرونة أكبر**: المستخدم يتحكم في منطق البحث
- 📊 **تجربة أفضل**: واجهة بسيطة وواضحة
- 🔍 **نتائج أفضل**: تقليل النتائج غير المرغوبة

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر نتائج مع AND Logic

**السبب**: لا توجد وظائف تتطلب جميع المهارات المحددة

**الحل**: 
1. جرب OR Logic بدلاً من AND
2. قلل عدد المهارات المحددة
3. تحقق من صحة أسماء المهارات

### المشكلة: نتائج كثيرة جداً مع OR Logic

**السبب**: OR Logic يعرض جميع الوظائف التي تحتوي على أي مهارة

**الحل**:
1. استخدم AND Logic لتضييق النتائج
2. أضف فلاتر إضافية (الموقع، الراتب، إلخ)
3. حدد مهارات أكثر تخصصاً

---

## 📚 المراجع

- 📄 `backend/src/services/filterService.js` - التنفيذ الأساسي
- 📄 `backend/tests/filterService.test.js` - الاختبارات
- 📄 `frontend/src/components/Search/FilterPanel.jsx` - واجهة المستخدم
- 📄 `.kiro/specs/advanced-search-filter/requirements.md` - المتطلبات
- 📄 `.kiro/specs/advanced-search-filter/design.md` - التصميم التقني

---

## ✅ الحالة النهائية

- ✅ Backend: مكتمل ويعمل
- ✅ Frontend: مكتمل ويعمل
- ✅ الاختبارات: 5/5 نجحت
- ✅ التوثيق: شامل
- ✅ دعم اللغات: 3 لغات (ar, en, fr)

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل بنجاح
