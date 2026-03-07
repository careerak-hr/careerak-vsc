import React from 'react';
import SalaryIndicator from '../components/SalaryIndicator';

/**
 * أمثلة استخدام مكون SalaryIndicator
 * يوضح الحالات المختلفة: أقل من المتوسط، متوسط، أعلى من المتوسط
 */
const SalaryIndicatorExample = () => {
  // مثال 1: راتب أقل من المتوسط
  const belowAverageEstimate = {
    provided: 4000,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'below',
    percentageDiff: 33
  };

  // مثال 2: راتب متوسط
  const averageEstimate = {
    provided: 6000,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'average',
    percentageDiff: 0
  };

  // مثال 3: راتب أعلى من المتوسط
  const aboveAverageEstimate = {
    provided: 7500,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'above',
    percentageDiff: 25
  };

  // مثال 4: بيانات غير كافية (null)
  const noEstimate = null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        أمثلة مكون SalaryIndicator
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* مثال 1: أقل من المتوسط */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>1. راتب أقل من المتوسط</h3>
          <SalaryIndicator estimate={belowAverageEstimate} />
        </div>

        {/* مثال 2: متوسط */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>2. راتب متوسط</h3>
          <SalaryIndicator estimate={averageEstimate} />
        </div>

        {/* مثال 3: أعلى من المتوسط */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>3. راتب أعلى من المتوسط</h3>
          <SalaryIndicator estimate={aboveAverageEstimate} />
        </div>
      </div>

      {/* مثال 4: بدون بيانات */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>4. بدون بيانات كافية</h3>
        <SalaryIndicator estimate={noEstimate} />
        <p style={{ marginTop: '1rem', color: '#6b7280', fontStyle: 'italic' }}>
          لا يتم عرض المكون عندما لا تتوفر بيانات كافية
        </p>
      </div>

      {/* مثال 5: استخدام في صفحة تفاصيل الوظيفة */}
      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>مثال: استخدام في صفحة تفاصيل الوظيفة</h2>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>مطور Full Stack</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>شركة التقنية المتقدمة - الرياض</p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <SalaryIndicator estimate={aboveAverageEstimate} currency="ريال" />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>كود المثال:</h4>
          <pre style={{ 
            backgroundColor: '#1f2937', 
            color: '#f3f4f6', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            overflow: 'auto'
          }}>
{`import SalaryIndicator from '../components/SalaryIndicator';

function JobDetailPage({ job }) {
  const [salaryEstimate, setSalaryEstimate] = useState(null);

  useEffect(() => {
    // جلب تقدير الراتب من API
    fetch(\`/api/jobs/\${job.id}/salary-estimate\`)
      .then(res => res.json())
      .then(data => setSalaryEstimate(data));
  }, [job.id]);

  return (
    <div>
      <h1>{job.title}</h1>
      <p>{job.company.name} - {job.location}</p>
      
      {salaryEstimate && (
        <SalaryIndicator 
          estimate={salaryEstimate} 
          currency="ريال" 
        />
      )}
    </div>
  );
}`}
          </pre>
        </div>
      </div>

      {/* ملاحظات الاستخدام */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>ملاحظات الاستخدام</h3>
        <ul style={{ color: '#1e3a8a', lineHeight: '1.8' }}>
          <li>المكون يعرض نطاق الراتب (الأدنى - الأعلى) بوضوح</li>
          <li>يستخدم ألوان مميزة: أحمر (أقل)، أصفر (متوسط)، أخضر (أعلى)</li>
          <li>يعرض عدد الوظائف المستخدمة في الحساب لزيادة الثقة</li>
          <li>يتضمن tooltip توضيحي لشرح كيفية الحساب</li>
          <li>متجاوب تماماً مع جميع أحجام الشاشات</li>
          <li>يدعم Dark Mode و RTL</li>
          <li>يعرض null بشكل آمن عندما لا تتوفر بيانات</li>
        </ul>
      </div>
    </div>
  );
};

export default SalaryIndicatorExample;
