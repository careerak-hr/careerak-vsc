import React from 'react';
import CompanyResponseRate from '../components/CompanyResponseRate/CompanyResponseRate';

/**
 * أمثلة استخدام مكون معدل استجابة الشركة
 */
const CompanyResponseRateExample = () => {
  // مثال 1: استجابة سريعة
  const fastResponse = {
    label: 'fast',
    percentage: 85,
    averageResponseTime: 36, // 36 ساعة
    averageResponseDays: 2
  };

  // مثال 2: استجابة متوسطة
  const mediumResponse = {
    label: 'medium',
    percentage: 65,
    averageResponseTime: 120, // 120 ساعة = 5 أيام
    averageResponseDays: 5
  };

  // مثال 3: استجابة بطيئة
  const slowResponse = {
    label: 'slow',
    percentage: 40,
    averageResponseTime: 240, // 240 ساعة = 10 أيام
    averageResponseDays: 10
  };

  // مثال 4: بدون بيانات
  const noData = {
    label: null,
    percentage: null
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>أمثلة معدل استجابة الشركة</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* مثال 1: عرض بسيط */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>1. عرض بسيط (بدون تفاصيل)</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <CompanyResponseRate responseRate={fastResponse} />
            <CompanyResponseRate responseRate={mediumResponse} />
            <CompanyResponseRate responseRate={slowResponse} />
          </div>
        </section>

        {/* مثال 2: عرض مع تفاصيل */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>2. عرض مع تفاصيل</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CompanyResponseRate responseRate={fastResponse} showDetails={true} />
            <CompanyResponseRate responseRate={mediumResponse} showDetails={true} />
            <CompanyResponseRate responseRate={slowResponse} showDetails={true} />
          </div>
        </section>

        {/* مثال 3: في بطاقة الشركة */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>3. في بطاقة الشركة</h2>
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '0.5rem' 
              }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  شركة التقنية المتقدمة
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>شركة متوسطة</span>
                  <span>250 موظف</span>
                  <CompanyResponseRate responseRate={fastResponse} />
                </div>
              </div>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              شركة رائدة في مجال تطوير البرمجيات والحلول التقنية المبتكرة.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#304B60', 
                color: 'white', 
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                وظائف أخرى
              </button>
              <button style={{ 
                padding: '0.5rem 1rem', 
                border: '1px solid #304B60', 
                color: '#304B60', 
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}>
                الموقع الإلكتروني
              </button>
            </div>
          </div>
        </section>

        {/* مثال 4: في قائمة الوظائف */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>4. في قائمة الوظائف</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'مطور Full Stack', company: 'شركة التقنية', response: fastResponse },
              { title: 'مصمم UI/UX', company: 'شركة الإبداع', response: mediumResponse },
              { title: 'مدير مشروع', company: 'شركة الحلول', response: slowResponse }
            ].map((job, index) => (
              <div key={index} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{job.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{job.company}</p>
                </div>
                <CompanyResponseRate responseRate={job.response} />
              </div>
            ))}
          </div>
        </section>

        {/* مثال 5: بدون بيانات */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>5. بدون بيانات (لا يعرض شيء)</h2>
          <div style={{ 
            border: '1px dashed #e5e7eb', 
            borderRadius: '0.5rem', 
            padding: '1rem',
            backgroundColor: '#f9fafb'
          }}>
            <CompanyResponseRate responseRate={noData} />
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              (لا يوجد معدل استجابة - المكون لا يعرض شيء)
            </p>
          </div>
        </section>

        {/* مثال 6: استخدام مع API */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>6. استخدام مع API</h2>
          <div style={{ 
            backgroundColor: '#1f2937', 
            color: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
            <pre>{`// جلب معلومات الشركة من API
const response = await fetch('/api/companies/123/info');
const data = await response.json();

// عرض معدل الاستجابة
<CompanyResponseRate 
  responseRate={data.responseRate} 
  showDetails={true} 
/>`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompanyResponseRateExample;
