import React from 'react';
import SecurityScore from '../components/SecurityScore/SecurityScore';

/**
 * مثال على استخدام مكون Security Score
 */
const SecurityScoreExample = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px', textAlign: 'center' }}>
        أمثلة على Security Score
      </h1>

      {/* مثال 1: الوضع الكامل */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>الوضع الكامل (Full Mode)</h2>
        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
          يعرض جميع التفاصيل: الدرجة، العوامل، التوصيات، والنصائح
        </p>
        <SecurityScore />
      </section>

      {/* مثال 2: الوضع المضغوط */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>الوضع المضغوط (Compact Mode)</h2>
        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
          يعرض الدرجة فقط مع إمكانية توسيع التفاصيل
        </p>
        <SecurityScore compact={true} />
      </section>

      {/* معلومات إضافية */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>كيفية الاستخدام</h2>
        <div style={{ 
          background: '#f9fafb', 
          padding: '24px', 
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`// استيراد المكون
import SecurityScore from './components/SecurityScore/SecurityScore';

// الاستخدام الأساسي (الوضع الكامل)
<SecurityScore />

// الوضع المضغوط
<SecurityScore compact={true} />

// في صفحة الإعدادات أو الملف الشخصي
function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <SecurityScore />
    </div>
  );
}

// في Dashboard
function Dashboard() {
  return (
    <div>
      <h1>لوحة التحكم</h1>
      <SecurityScore compact={true} />
    </div>
  );
}`}
          </pre>
        </div>
      </section>

      {/* معلومات عن العوامل */}
      <section>
        <h2 style={{ marginBottom: '16px' }}>عوامل حساب Security Score</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>
              قوة كلمة المرور (25 نقطة)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              يتم حسابها بناءً على zxcvbn score (0-4)
            </p>
          </div>

          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>
              تأكيد البريد (20 نقطة)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              20 نقطة إذا تم تأكيد البريد الإلكتروني
            </p>
          </div>

          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>
              المصادقة الثنائية (30 نقطة)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              30 نقطة إذا تم تفعيل 2FA
            </p>
          </div>

          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>
              حسابات OAuth (15 نقطة)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              5 نقاط لكل حساب مرتبط (حد أقصى 15)
            </p>
          </div>

          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>
              اكتمال الملف (10 نقاط)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              بناءً على: الهاتف، الدولة، المدينة، الصورة
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityScoreExample;
