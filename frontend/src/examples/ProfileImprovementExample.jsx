/**
 * Profile Improvement Component - Usage Examples
 * أمثلة استخدام مكون تحسين الملف الشخصي
 */

import React from 'react';
import ProfileImprovement from '../components/ProfileImprovement';
import { AppProvider } from '../context/AppContext';

/**
 * مثال 1: استخدام أساسي
 * Basic Usage Example
 */
export const BasicExample = () => {
  return (
    <AppProvider>
      <div style={{ padding: '2rem' }}>
        <h1>Profile Improvement - Basic Example</h1>
        <ProfileImprovement />
      </div>
    </AppProvider>
  );
};

/**
 * مثال 2: في صفحة الملف الشخصي
 * In Profile Page Example
 */
export const ProfilePageExample = () => {
  return (
    <AppProvider>
      <div className="profile-page">
        <header>
          <h1>My Profile</h1>
        </header>
        
        <main>
          {/* معلومات المستخدم الأساسية */}
          <section className="user-info">
            <h2>User Information</h2>
            {/* ... */}
          </section>

          {/* مكون تحسين الملف الشخصي */}
          <section className="profile-improvement-section">
            <ProfileImprovement />
          </section>

          {/* أقسام أخرى */}
          <section className="user-experience">
            <h2>Experience</h2>
            {/* ... */}
          </section>
        </main>
      </div>
    </AppProvider>
  );
};

/**
 * مثال 3: في صفحة منفصلة
 * Standalone Page Example
 */
export const StandalonePageExample = () => {
  return (
    <AppProvider>
      <div className="improvement-page">
        <div className="page-header">
          <h1>Improve Your Profile</h1>
          <p>Follow these suggestions to make your profile stand out</p>
        </div>

        <ProfileImprovement />

        <div className="page-footer">
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </AppProvider>
  );
};

/**
 * مثال 4: مع تخصيص
 * With Customization Example
 */
export const CustomizedExample = () => {
  const handleRefresh = () => {
    console.log('Profile analysis refreshed');
  };

  return (
    <AppProvider>
      <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <ProfileImprovement onRefresh={handleRefresh} />
        </div>
      </div>
    </AppProvider>
  );
};

/**
 * مثال 5: مع لغات مختلفة
 * Multi-language Example
 */
export const MultiLanguageExample = () => {
  const [language, setLanguage] = React.useState('ar');

  return (
    <AppProvider value={{ language }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => setLanguage('ar')}>العربية</button>
          <button onClick={() => setLanguage('en')}>English</button>
          <button onClick={() => setLanguage('fr')}>Français</button>
        </div>

        <ProfileImprovement />
      </div>
    </AppProvider>
  );
};

/**
 * مثال 6: مع معالجة الأخطاء
 * With Error Handling Example
 */
export const ErrorHandlingExample = () => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // محاكاة خطأ
    const timer = setTimeout(() => {
      setHasError(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error Loading Profile Analysis</h2>
        <p>Please try again later</p>
        <button onClick={() => setHasError(false)}>Retry</button>
      </div>
    );
  }

  return (
    <AppProvider>
      <ProfileImprovement />
    </AppProvider>
  );
};

/**
 * مثال 7: مع تتبع التقدم
 * With Progress Tracking Example
 */
export const ProgressTrackingExample = () => {
  const [history, setHistory] = React.useState([
    { date: '2026-01-01', score: 45 },
    { date: '2026-01-15', score: 60 },
    { date: '2026-02-01', score: 75 },
    { date: '2026-02-15', score: 85 }
  ]);

  return (
    <AppProvider>
      <div style={{ padding: '2rem' }}>
        {/* رسم بياني للتقدم */}
        <div style={{ marginBottom: '2rem' }}>
          <h2>Your Progress</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            {history.map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div 
                  style={{ 
                    width: '60px', 
                    height: `${item.score * 2}px`, 
                    backgroundColor: '#4CAF50',
                    borderRadius: '4px'
                  }}
                ></div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {item.score}%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* مكون تحسين الملف */}
        <ProfileImprovement />
      </div>
    </AppProvider>
  );
};

/**
 * مثال 8: مع إشعارات
 * With Notifications Example
 */
export const NotificationsExample = () => {
  const [notification, setNotification] = React.useState(null);

  const handleSuggestionClick = (suggestion) => {
    setNotification(`You clicked: ${suggestion.title}`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppProvider>
      <div style={{ padding: '2rem' }}>
        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}>
            {notification}
          </div>
        )}

        <ProfileImprovement onSuggestionClick={handleSuggestionClick} />
      </div>
    </AppProvider>
  );
};

// تصدير جميع الأمثلة
export default {
  BasicExample,
  ProfilePageExample,
  StandalonePageExample,
  CustomizedExample,
  MultiLanguageExample,
  ErrorHandlingExample,
  ProgressTrackingExample,
  NotificationsExample
};
