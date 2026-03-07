import React from 'react';
import ApplicantCounter from '../components/JobPostings/ApplicantCounter';
import ApplicantCountToggle from '../components/JobPostings/ApplicantCountToggle';

/**
 * ApplicantCounterExample
 * مثال شامل لاستخدام مكونات عداد المتقدمين
 * Requirements: 9.2 (عداد المتقدمين)
 */
const ApplicantCounterExample = () => {
  const handleToggle = (newValue) => {
    console.log('Applicant count visibility changed:', newValue);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>عداد المتقدمين - أمثلة الاستخدام</h1>

      {/* مثال 1: عرض العداد في بطاقة الوظيفة */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>1. عرض العداد في بطاقة الوظيفة</h2>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          backgroundColor: 'white'
        }}>
          <h3>مطور Full Stack</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            شركة التقنية المتقدمة - الرياض، السعودية
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ApplicantCounter jobId="507f1f77bcf86cd799439011" />
            <span style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}>
              دوام كامل
            </span>
            <span style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}>
              خبرة متوسطة
            </span>
          </div>
        </div>
      </section>

      {/* مثال 2: عرض العداد بشكل مضمّن (inline) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>2. عرض العداد بشكل مضمّن</h2>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>مصمم UI/UX</h3>
            <ApplicantCounter jobId="507f1f77bcf86cd799439012" inline={true} />
          </div>
          <p style={{ color: '#6b7280' }}>
            شركة الإبداع الرقمي - جدة، السعودية
          </p>
        </div>
      </section>

      {/* مثال 3: عدة وظائف بأعداد مختلفة */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>3. عدة وظائف بأعداد مختلفة</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            { id: '507f1f77bcf86cd799439013', title: 'مدير مشروع', company: 'شركة البناء' },
            { id: '507f1f77bcf86cd799439014', title: 'محلل بيانات', company: 'شركة التحليلات' },
            { id: '507f1f77bcf86cd799439015', title: 'مطور موبايل', company: 'شركة التطبيقات' }
          ].map((job) => (
            <div
              key={job.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                backgroundColor: 'white'
              }}
            >
              <h4 style={{ marginTop: 0 }}>{job.title}</h4>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {job.company}
              </p>
              <ApplicantCounter jobId={job.id} />
            </div>
          ))}
        </div>
      </section>

      {/* مثال 4: التحكم في إظهار العداد (للشركات) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>4. التحكم في إظهار العداد (للشركات)</h2>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          backgroundColor: 'white'
        }}>
          <h3>إعدادات الوظيفة: مطور Backend</h3>
          
          <ApplicantCountToggle
            jobId="507f1f77bcf86cd799439016"
            initialValue={true}
            onToggle={handleToggle}
          />

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              💡 <strong>نصيحة:</strong> إظهار عدد المتقدمين يمكن أن يزيد من جاذبية الوظيفة
              (يدل على شعبيتها) أو يقلل منها (إذا كان العدد كبيراً جداً).
            </p>
          </div>
        </div>
      </section>

      {/* مثال 5: حالات مختلفة للعداد */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>5. حالات مختلفة للعداد</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>لا يوجد متقدمين (0):</p>
            <ApplicantCounter jobId="507f1f77bcf86cd799439017" />
          </div>

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>عدد قليل (1-4):</p>
            <ApplicantCounter jobId="507f1f77bcf86cd799439018" />
          </div>

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>عدد متوسط (5-19):</p>
            <ApplicantCounter jobId="507f1f77bcf86cd799439019" />
          </div>

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>عدد كبير (20+):</p>
            <ApplicantCounter jobId="507f1f77bcf86cd799439020" />
          </div>
        </div>
      </section>

      {/* مثال 6: استخدام في قائمة الوظائف */}
      <section>
        <h2>6. استخدام في قائمة الوظائف</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: '507f1f77bcf86cd799439021', title: 'مهندس DevOps', location: 'الدمام' },
            { id: '507f1f77bcf86cd799439022', title: 'مدير منتج', location: 'الرياض' },
            { id: '507f1f77bcf86cd799439023', title: 'مطور React', location: 'جدة' },
            { id: '507f1f77bcf86cd799439024', title: 'محلل أمن سيبراني', location: 'الخبر' }
          ].map((job) => (
            <div
              key={job.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0' }}>{job.title}</h4>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                  {job.location}
                </p>
              </div>
              <ApplicantCounter jobId={job.id} inline={true} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ApplicantCounterExample;
