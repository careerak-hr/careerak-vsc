import React from 'react';
import { useFilterURL } from '../hooks/useFilterURL';

/**
 * مثال على استخدام Filter URL Serialization
 * 
 * يوضح كيفية:
 * - استخدام hook useFilterURL
 * - تحديث الفلاتر
 * - مشاركة الروابط
 * - مسح الفلاتر
 */
function FilterURLExample() {
  // الفلاتر الافتراضية
  const initialFilters = {
    q: '',
    location: '',
    salaryMin: null,
    salaryMax: null,
    workType: [],
    experienceLevel: [],
    skills: [],
    datePosted: 'all',
    companySize: []
  };

  // استخدام hook
  const {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    getShareableLink,
    copyLink,
    hasActiveFilters,
    activeFilterCount
  } = useFilterURL(initialFilters, {
    syncOnMount: true,
    updateOnChange: true,
    replaceState: false
  });

  // معالج نسخ الرابط
  const handleCopyLink = async () => {
    const success = await copyLink();
    if (success) {
      alert('تم نسخ الرابط إلى الحافظة!');
    } else {
      alert('فشل نسخ الرابط. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>مثال على Filter URL Serialization</h1>
      
      {/* معلومات الحالة */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>معلومات الحالة</h3>
        <p>عدد الفلاتر النشطة: <strong>{activeFilterCount()}</strong></p>
        <p>يوجد فلاتر نشطة: <strong>{hasActiveFilters() ? 'نعم' : 'لا'}</strong></p>
        <p>الرابط القابل للمشاركة:</p>
        <code style={{ 
          display: 'block', 
          padding: '10px', 
          backgroundColor: '#fff',
          borderRadius: '4px',
          wordBreak: 'break-all'
        }}>
          {getShareableLink()}
        </code>
        <button 
          onClick={handleCopyLink}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#D48161',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 نسخ الرابط
        </button>
      </div>

      {/* نموذج الفلاتر */}
      <div style={{ marginBottom: '20px' }}>
        <h3>الفلاتر</h3>
        
        {/* البحث النصي */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            البحث:
          </label>
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="ابحث عن وظيفة..."
            style={{
              width: '100%',
              padding: '8px',
              border: '2px solid #D4816180',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* الموقع */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            الموقع:
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            placeholder="المدينة أو الدولة"
            style={{
              width: '100%',
              padding: '8px',
              border: '2px solid #D4816180',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* نطاق الراتب */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            نطاق الراتب:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={filters.salaryMin || ''}
              onChange={(e) => updateFilters({ 
                salaryMin: e.target.value ? Number(e.target.value) : null 
              })}
              placeholder="من"
              style={{
                flex: 1,
                padding: '8px',
                border: '2px solid #D4816180',
                borderRadius: '4px'
              }}
            />
            <input
              type="number"
              value={filters.salaryMax || ''}
              onChange={(e) => updateFilters({ 
                salaryMax: e.target.value ? Number(e.target.value) : null 
              })}
              placeholder="إلى"
              style={{
                flex: 1,
                padding: '8px',
                border: '2px solid #D4816180',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* نوع العمل */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            نوع العمل:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['دوام كامل', 'دوام جزئي', 'عن بعد', 'هجين'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={filters.workType?.includes(type) || false}
                  onChange={(e) => {
                    const current = filters.workType || [];
                    const updated = e.target.checked
                      ? [...current, type]
                      : current.filter(t => t !== type);
                    updateFilter('workType', updated);
                  }}
                  style={{ marginLeft: '5px' }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* مستوى الخبرة */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            مستوى الخبرة:
          </label>
          <select
            multiple
            value={filters.experienceLevel || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter('experienceLevel', selected);
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '2px solid #D4816180',
              borderRadius: '4px',
              minHeight: '80px'
            }}
          >
            <option value="مبتدئ">مبتدئ</option>
            <option value="متوسط">متوسط</option>
            <option value="خبير">خبير</option>
          </select>
          <small style={{ color: '#666' }}>
            اضغط Ctrl/Cmd لاختيار عدة خيارات
          </small>
        </div>

        {/* تاريخ النشر */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            تاريخ النشر:
          </label>
          <select
            value={filters.datePosted || 'all'}
            onChange={(e) => updateFilter('datePosted', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '2px solid #D4816180',
              borderRadius: '4px'
            }}
          >
            <option value="all">الكل</option>
            <option value="today">اليوم</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
          </select>
        </div>

        {/* أزرار التحكم */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters()}
            style={{
              padding: '10px 20px',
              backgroundColor: hasActiveFilters() ? '#304B60' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: hasActiveFilters() ? 'pointer' : 'not-allowed'
            }}
          >
            🗑️ مسح الفلاتر
          </button>
          
          <button
            onClick={() => {
              // مثال على تطبيق فلاتر محددة مسبقاً
              updateFilters({
                q: 'مطور',
                location: 'القاهرة',
                workType: ['عن بعد'],
                experienceLevel: ['متوسط']
              });
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#D48161',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⚡ تطبيق فلاتر مثال
          </button>
        </div>
      </div>

      {/* عرض الفلاتر الحالية */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>الفلاتر الحالية (JSON)</h3>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>

      {/* تعليمات */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        borderRight: '4px solid #304B60'
      }}>
        <h3>💡 تعليمات الاستخدام</h3>
        <ul>
          <li>قم بتغيير أي فلتر - سيتم تحديث URL تلقائياً</li>
          <li>انسخ الرابط وشاركه - سيحتفظ بجميع الفلاتر</li>
          <li>استخدم زر الرجوع/التقدم في المتصفح - ستعمل الفلاتر بشكل صحيح</li>
          <li>أعد تحميل الصفحة - ستبقى الفلاتر كما هي</li>
        </ul>
      </div>
    </div>
  );
}

export default FilterURLExample;
