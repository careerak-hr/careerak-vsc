import React from 'react';
import { useNavigate } from 'react-router-dom';
import JoinInterviewButton from '../components/VideoInterview/JoinInterviewButton';

/**
 * مثال على استخدام JoinInterviewButton
 * 
 * يوضح كيفية دمج الزر في صفحة تفاصيل المقابلة
 */
const JoinInterviewButtonExample = () => {
  const navigate = useNavigate();

  // مثال 1: مقابلة مجدولة بعد ساعة
  const scheduledInterviewId = '507f1f77bcf86cd799439011';

  // مثال 2: مقابلة مجدولة بعد 3 دقائق (يمكن الانضمام قريباً)
  const upcomingInterviewId = '507f1f77bcf86cd799439012';

  // مثال 3: مقابلة جارية الآن
  const activeInterviewId = '507f1f77bcf86cd799439013';

  // معالجة الانضمام للمقابلة
  const handleJoin = (interviewId) => {
    console.log('Joining interview:', interviewId);
    // الانتقال لصفحة المقابلة
    navigate(`/video-interview/${interviewId}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#304B60' }}>
        أمثلة على زر الانضمام للمقابلة
      </h1>

      {/* مثال 1: مقابلة مجدولة */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#304B60', marginBottom: '1rem' }}>
          1. مقابلة مجدولة بعد ساعة
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          الزر معطل ويعرض الوقت المتبقي حتى يمكن الانضمام (5 دقائق قبل الموعد)
        </p>
        <JoinInterviewButton
          interviewId={scheduledInterviewId}
          onJoin={() => handleJoin(scheduledInterviewId)}
        />
      </div>

      {/* مثال 2: مقابلة قريبة */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#304B60', marginBottom: '1rem' }}>
          2. مقابلة تبدأ خلال 3 دقائق
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          الزر نشط ويمكن الانضمام الآن (خلال 5 دقائق من الموعد)
        </p>
        <JoinInterviewButton
          interviewId={upcomingInterviewId}
          onJoin={() => handleJoin(upcomingInterviewId)}
        />
      </div>

      {/* مثال 3: مقابلة جارية */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#304B60', marginBottom: '1rem' }}>
          3. مقابلة جارية الآن
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          الزر نشط ويعرض "المقابلة جارية - انضم الآن"
        </p>
        <JoinInterviewButton
          interviewId={activeInterviewId}
          onJoin={() => handleJoin(activeInterviewId)}
        />
      </div>

      {/* ملاحظات الاستخدام */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#E3DAD1',
        borderRadius: '0.75rem',
        borderLeft: '4px solid #D48161',
      }}>
        <h3 style={{ color: '#304B60', marginBottom: '1rem' }}>
          📝 ملاحظات الاستخدام
        </h3>
        <ul style={{ color: '#4b5563', lineHeight: '1.8' }}>
          <li>الزر يتحقق من حالة المقابلة تلقائياً كل دقيقة</li>
          <li>يمكن الانضمام من 5 دقائق قبل الموعد حتى ساعة بعد البدء</li>
          <li>الزر يدعم 3 لغات: العربية، الإنجليزية، الفرنسية</li>
          <li>التصميم متجاوب ويعمل على جميع الأجهزة</li>
          <li>يدعم الوضع الداكن (Dark Mode)</li>
          <li>يدعم RTL/LTR تلقائياً</li>
        </ul>
      </div>

      {/* كود الاستخدام */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#1f2937',
        borderRadius: '0.75rem',
        color: '#e5e7eb',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        overflow: 'auto',
      }}>
        <pre style={{ margin: 0 }}>
{`import JoinInterviewButton from './components/VideoInterview/JoinInterviewButton';

// في مكون صفحة المقابلة
<JoinInterviewButton
  interviewId={interviewId}
  onJoin={() => navigate(\`/video-interview/\${interviewId}\`)}
  className="custom-class" // اختياري
/>`}
        </pre>
      </div>
    </div>
  );
};

export default JoinInterviewButtonExample;
