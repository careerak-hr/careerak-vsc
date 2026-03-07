import React from 'react';
import { useViewPreference } from '../hooks/useViewPreference';
import ViewToggle from '../components/ViewToggle/ViewToggle';

/**
 * مثال على استخدام ViewToggle مع useViewPreference
 */
function ViewToggleExample() {
  const [view, toggleView] = useViewPreference();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>مثال على View Toggle</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <ViewToggle view={view} onToggle={toggleView} />
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '0.5rem' 
      }}>
        <p>العرض الحالي: <strong>{view === 'grid' ? 'شبكي' : 'قائمة'}</strong></p>
        <p>التفضيل محفوظ في localStorage</p>
        <p>جرب إعادة تحميل الصفحة - سيتم الاحتفاظ بتفضيلك</p>
      </div>

      {/* محاكاة عرض الوظائف */}
      <div style={{ marginTop: '2rem' }}>
        <h2>الوظائف</h2>
        
        {view === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #ddd'
              }}>
                <h3>وظيفة {i}</h3>
                <p>وصف الوظيفة...</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                display: 'flex',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3>وظيفة {i}</h3>
                  <p>وصف الوظيفة مع تفاصيل أكثر في عرض القائمة...</p>
                </div>
                <button style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#D48161',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}>
                  تقديم
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewToggleExample;
