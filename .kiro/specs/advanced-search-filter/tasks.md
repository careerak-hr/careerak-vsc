# خطة التنفيذ: نظام الفلترة والبحث المتقدم

## 📋 معلومات الخطة

- **اسم الميزة**: نظام الفلترة والبحث المتقدم
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: جاهز للتنفيذ

---

## نظرة عامة

سيتم تنفيذ نظام الفلترة والبحث المتقدم على مراحل متدرجة، بدءاً من البحث الأساسي والفلترة، ثم إضافة الميزات المتقدمة مثل حفظ عمليات البحث والتنبيهات وعرض الخريطة. كل مرحلة تبني على المرحلة السابقة وتنتهي بنقطة تفتيش للتأكد من عمل كل شيء بشكل صحيح.

---

## المهام

- [ ] 1. إعداد البنية الأساسية والنماذج
  - إنشاء نماذج البيانات (SavedSearch, SearchAlert, SearchHistory)
  - إضافة indexes للبحث النصي والجغرافي على JobPosting
  - إعداد ملفات الخدمات الأساسية (SearchService, FilterService)
  - _Requirements: جميع المتطلبات التقنية_

- [ ] 2. تنفيذ محرك البحث الأساسي
  - [x] 2.1 إنشاء SearchService مع البحث النصي
    - تنفيذ البحث في الحقول المتعددة (title, description, skills, company.name)
    - دعم البحث بالعربية والإنجليزية
    - إضافة pagination و sorting
    - _Requirements: 1.1, 1.4_
  
  - [ ]* 2.2 كتابة property test للبحث متعدد الحقول
    - **Property 1: Multi-field Search Coverage**
    - **Validates: Requirements 1.1**
  
  - [x]* 2.3 كتابة property test للدعم ثنائي اللغة
    - **Property 3: Bilingual Search Support**
    - **Validates: Requirements 1.4**

- [ ] 3. تنفيذ نظام الاقتراحات التلقائية (Autocomplete)
  - [x] 3.1 إنشاء Autocomplete API endpoint
    - تنفيذ منطق الاقتراحات بناءً على البحث السابق
    - إضافة حد أدنى 3 أحرف للاقتراحات
    - تحسين الأداء مع caching
    - _Requirements: 1.3_
  
  - [ ]* 3.2 كتابة property test لحد الاقتراحات
    - **Property 2: Autocomplete Threshold**
    - **Validates: Requirements 1.3**


- [x] 4. تنفيذ نظام الفلترة المتقدم
  - [x] 4.1 إنشاء FilterService مع جميع أنواع الفلاتر
    - فلترة حسب الراتب (نطاق من-إلى)
    - فلترة حسب الموقع (المدينة/الدولة)
    - فلترة حسب نوع العمل (دوام كامل، جزئي، عن بعد، هجين)
    - فلترة حسب مستوى الخبرة
    - فلترة حسب تاريخ النشر
    - فلترة حسب حجم الشركة
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 4.2 كتابة property test لتطبيق فلاتر متعددة
    - **Property 4: Multiple Filter Application**
    - **Validates: Requirements 2.2**
  
  - [ ]* 4.3 كتابة property test لدقة عداد النتائج
    - **Property 6: Result Count Accuracy**
    - **Validates: Requirements 2.4**
  
  - [x] 4.4 تنفيذ حفظ الفلاتر في URL
    - إنشاء دوال serializeFiltersToURL و deserializeFiltersFromURL
    - دعم مشاركة الروابط مع الفلاتر
    - _Requirements: 2.3_
  
  - [ ]* 4.5 كتابة property test لـ round-trip الفلاتر
    - **Property 5: Filter URL Persistence**
    - **Validates: Requirements 2.3**
  
  - [x] 4.6 تنفيذ زر "مسح الفلاتر"
    - إعادة الحالة للوضع الافتراضي
    - _Requirements: 2.5_
  
  - [ ]* 4.7 كتابة property test لمسح الفلاتر
    - **Property 7: Clear Filters Reset**
    - **Validates: Requirements 2.5**

- [ ] 5. Checkpoint - التأكد من عمل البحث والفلترة
  - التأكد من نجاح جميع الاختبارات
  - اختبار يدوي للبحث والفلترة
  - سؤال المستخدم إذا كانت هناك أسئلة


- [ ] 6. تنفيذ نظام حفظ عمليات البحث
  - [x] 6.1 إنشاء SavedSearchService
    - تنفيذ CRUD operations لعمليات البحث المحفوظة
    - إضافة قيد 10 عمليات بحث كحد أقصى لكل مستخدم
    - _Requirements: 3.1, 3.2_
  
  - [x]* 6.2 كتابة property test لحد عمليات البحث المحفوظة
    - **Property 8: Saved Search Limit Enforcement**
    - **Validates: Requirements 3.1**
  
  - [x]* 6.3 كتابة property test لـ round-trip عمليات البحث
    - **Property 9: Saved Search Round-trip**
    - **Validates: Requirements 3.2**
  
  - [x] 6.4 إنشاء API endpoints لعمليات البحث المحفوظة
    - POST /api/search/saved - حفظ عملية بحث
    - GET /api/search/saved - جلب العمليات المحفوظة
    - PUT /api/search/saved/:id - تعديل عملية بحث
    - DELETE /api/search/saved/:id - حذف عملية بحث
    - _Requirements: 3.2_
  
  - [x] 6.5 إضافة إشعارات لعمليات الحفظ/التعديل/الحذف
    - دمج مع نظام الإشعارات الموجود
    - _Requirements: 3.4_
  
  - [ ]* 6.6 كتابة property test للإشعارات
    - **Property 10: Save Operation Notifications**
    - **Validates: Requirements 3.4**

- [ ] 7. تنفيذ نظام التنبيهات الذكية
  - [x] 7.1 إنشاء AlertService
    - تنفيذ منطق فحص النتائج الجديدة
    - دعم التنبيهات الفورية واليومية والأسبوعية
    - منع التنبيهات المكررة
    - _Requirements: 4.1, 4.4_
  
  - [ ]* 7.2 كتابة property test لتفعيل التنبيهات
    - **Property 11: Alert Triggering on New Match**
    - **Validates: Requirements 4.1**
  
  - [x]* 7.3 كتابة property test لمنع التكرار
    - **Property 14: Alert Deduplication**
    - **Validates: Requirements 4.4**
  
  - [ ] 7.4 إنشاء API endpoints للتنبيهات
    - POST /api/search/alerts - تفعيل تنبيه
    - GET /api/search/alerts - جلب التنبيهات
    - PUT /api/search/alerts/:id - تعديل تنبيه
    - DELETE /api/search/alerts/:id - حذف تنبيه
    - _Requirements: 4.2_
  
  - [x]* 7.5 كتابة property test لتفعيل/تعطيل التنبيهات
    - **Property 12: Alert Toggle Behavior**
    - **Validates: Requirements 4.2**
  
  - [x] 7.6 إضافة روابط مباشرة في الإشعارات
    - تضمين رابط الوظيفة في كل إشعار
    - _Requirements: 4.3_
  
  - [ ]* 7.7 كتابة property test لصحة الروابط
    - **Property 13: Alert Notification Link Validity**
    - **Validates: Requirements 4.3**
  
  - [ ] 7.8 إعداد Cron Jobs للتنبيهات المجدولة
    - تنفيذ جدولة التنبيهات اليومية والأسبوعية
    - استخدام node-cron أو مكتبة مشابهة
    - _Requirements: 4.1_

- [ ] 8. Checkpoint - التأكد من عمل الحفظ والتنبيهات
  - التأكد من نجاح جميع الاختبارات
  - اختبار يدوي لحفظ البحث والتنبيهات
  - سؤال المستخدم إذا كانت هناك أسئلة


- [ ] 9. تنفيذ نظام الفلترة المتقدمة للمهارات
  - [ ] 9.1 إضافة منطق AND/OR للمهارات في FilterService
    - تنفيذ filterBySkills مع دعم AND و OR
    - _Requirements: 6.2_
  
  - [ ]* 9.2 كتابة property test لمنطق المهارات
    - **Property 18: Skills Logic (AND/OR)**
    - **Validates: Requirements 6.2**
  
  - [ ] 9.3 إنشاء MatchingEngine لحساب نسبة المطابقة
    - تنفيذ calculateMatchPercentage
    - تنفيذ rankByMatch للترتيب حسب المطابقة
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 9.4 كتابة property test لحساب نسبة المطابقة
    - **Property 20: Match Percentage Calculation**
    - **Validates: Requirements 6.4**
  
  - [ ]* 9.5 كتابة property test لترتيب النتائج
    - **Property 19: Match Score Sorting**
    - **Validates: Requirements 6.3**

- [ ] 10. تنفيذ عرض الخريطة التفاعلية
  - [x] 10.1 إضافة Geo indexes لـ JobPosting
    - إضافة 2dsphere index للإحداثيات
    - تحديث نموذج JobPosting بحقل location.coordinates
    - _Requirements: 5.1_
  
  - [x] 10.2 إنشاء Map Search API endpoint
    - GET /api/search/map - البحث بناءً على حدود جغرافية
    - دعم البحث داخل دائرة أو مربع
    - _Requirements: 5.2_
  
  - [ ]* 10.3 كتابة property test لاكتمال العلامات
    - **Property 15: Map Marker Completeness**
    - **Validates: Requirements 5.1**
  
  - [ ]* 10.4 كتابة property test للفلترة الجغرافية
    - **Property 16: Geographic Boundary Filtering**
    - **Validates: Requirements 5.2**
  
  - [x] 10.5 إضافة دعم ثنائي اللغة للخريطة
    - تعريب واجهة الخريطة
    - _Requirements: 5.4_
  
  - [ ]* 10.6 كتابة property test للدعم ثنائي اللغة
    - **Property 17: Map Bilingual Support**
    - **Validates: Requirements 5.4**

- [ ] 11. Checkpoint - التأكد من عمل المهارات والخريطة
  - التأكد من نجاح جميع الاختبارات
  - اختبار يدوي للمهارات وعرض الخريطة
  - سؤال المستخدم إذا كانت هناك أسئلة


- [ ] 12. تنفيذ واجهة المستخدم الأمامية (Frontend)
  - [ ] 12.1 إنشاء SearchBar Component
    - شريط بحث مع autocomplete
    - دعم RTL/LTR
    - تطبيق الخطوط والألوان من project standards
    - _Requirements: 1.1, 1.3_
  
  - [ ] 12.2 إنشاء FilterPanel Component
    - لوحة فلاتر جانبية مع جميع أنواع الفلاتر
    - عداد النتائج
    - زر مسح الفلاتر
    - responsive design
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  
  - [ ] 12.3 إنشاء ResultsList Component
    - عرض النتائج في قائمة أو بطاقات
    - عرض نسبة المطابقة لكل وظيفة
    - pagination
    - _Requirements: 6.4_
  
  - [x] 12.4 إنشاء MapView Component
    - تكامل مع Google Maps أو Mapbox
    - عرض علامات الوظائف
    - clustering للعلامات
    - info windows عند النقر
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 12.5 إنشاء SavedSearchesPanel Component
    - قائمة بعمليات البحث المحفوظة
    - أزرار تعديل/حذف
    - مؤشر التنبيهات
    - _Requirements: 3.3_
  
  - [ ] 12.6 إنشاء AlertsManager Component
    - إدارة التنبيهات
    - تفعيل/تعطيل التنبيهات
    - اختيار التكرار وطريقة الإشعار
    - _Requirements: 4.2_
  
  - [x] 12.7 إنشاء SearchPage الرئيسية
    - دمج جميع المكونات
    - التبديل بين عرض القائمة والخريطة
    - حفظ حالة البحث في URL
    - _Requirements: جميع متطلبات UI_

- [ ] 13. تحسين الأداء والأمان
  - [ ] 13.1 إضافة Caching للبحث
    - استخدام Redis لتخزين نتائج البحث الشائعة
    - TTL 5 دقائق
    - _Requirements: 1.2_
  
  - [ ] 13.2 إضافة Rate Limiting
    - حد 30 طلب بحث في الدقيقة لكل مستخدم
    - _Requirements: الأمان_
  
  - [ ] 13.3 إضافة Input Validation
    - التحقق من صحة جميع المدخلات
    - sanitization للنصوص
    - _Requirements: الأمان_
  
  - [ ] 13.4 تحسين Database Queries
    - استخدام lean() و select()
    - تحليل الاستعلامات بـ explain()
    - _Requirements: 1.2_

- [ ] 14. كتابة اختبارات التكامل
  - [ ]* 14.1 اختبار workflow البحث الكامل
    - من البحث إلى الحفظ إلى التنبيه
    - _Requirements: جميع المتطلبات_
  
  - [ ]* 14.2 اختبار الأداء
    - التأكد من سرعة البحث < 500ms
    - اختبار الحمل المتزامن
    - _Requirements: 1.2_

- [ ] 15. Checkpoint النهائي - التأكد من عمل كل شيء
  - التأكد من نجاح جميع الاختبارات
  - اختبار شامل لجميع الميزات
  - مراجعة الأداء والأمان
  - سؤال المستخدم إذا كانت هناك أسئلة

---

## ملاحظات

- المهام المميزة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تشير إلى المتطلبات المرتبطة بها
- نقاط التفتيش (Checkpoints) تضمن التحقق التدريجي
- اختبارات Property تتحقق من الخصائص العامة للنظام
- اختبارات Unit تتحقق من أمثلة محددة وحالات الحافة

---

**تاريخ الإنشاء**: 2026-02-17  
**آخر تحديث**: 2026-02-17  
**الحالة**: جاهز للتنفيذ
