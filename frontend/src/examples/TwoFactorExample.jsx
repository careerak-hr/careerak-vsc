import React, { useState } from 'react';
import { TwoFactorSetup, TwoFactorVerify, TwoFactorSettings } from '../components/auth';

/**
 * أمثلة استخدام مكونات المصادقة الثنائية (2FA)
 */

// مثال 1: صفحة الإعدادات
export function SettingsPageExample() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>إعدادات الأمان</h1>
      <p>قم بتفعيل المصادقة الثنائية لحماية حسابك</p>
      
      <TwoFactorSettings />
    </div>
  );
}

// مثال 2: إعداد 2FA
export function SetupExample() {
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✓ تم تفعيل المصادقة الثنائية بنجاح!</h2>
        <p>حسابك الآن محمي بطبقة أمان إضافية</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <TwoFactorSetup
        onComplete={() => {
          console.log('2FA enabled successfully!');
          setCompleted(true);
        }}
        onCancel={() => {
          console.log('Setup cancelled');
          alert('تم إلغاء الإعداد');
        }}
      />
    </div>
  );
}

// مثال 3: التحقق من 2FA أثناء تسجيل الدخول
export function LoginWithTwoFactorExample() {
  const [step, setStep] = useState('login'); // 'login' | '2fa' | 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    // محاكاة API call
    console.log('Logging in with:', email, password);

    // محاكاة استجابة تتطلب 2FA
    setTimeout(() => {
      setUserId('mock-user-id-123');
      setStep('2fa');
    }, 1000);
  };

  if (step === 'success') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✓ تم تسجيل الدخول بنجاح!</h2>
        <p>مرحباً بك في لوحة التحكم</p>
      </div>
    );
  }

  if (step === '2fa') {
    return (
      <div style={{ padding: '2rem' }}>
        <TwoFactorVerify
          userId={userId}
          onSuccess={(data) => {
            console.log('2FA verified successfully!', data);
            setStep('success');
          }}
          onCancel={() => {
            console.log('2FA cancelled');
            setStep('login');
            setUserId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>تسجيل الدخول</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #ddd' }}
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #ddd' }}
        />
        
        <button
          type="submit"
          style={{
            padding: '0.75rem',
            background: '#304B60',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}

// مثال 4: عرض جميع الأمثلة
export default function TwoFactorExamples() {
  const [activeExample, setActiveExample] = useState('settings');

  const examples = {
    settings: { title: 'صفحة الإعدادات', component: <SettingsPageExample /> },
    setup: { title: 'إعداد 2FA', component: <SetupExample /> },
    login: { title: 'تسجيل الدخول مع 2FA', component: <LoginWithTwoFactorExample /> }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Navigation */}
      <div style={{
        background: '#304B60',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        {Object.entries(examples).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => setActiveExample(key)}
            style={{
              padding: '0.5rem 1rem',
              background: activeExample === key ? '#D48161' : 'transparent',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        {examples[activeExample].component}
      </div>

      {/* Info */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#304B60' }}>ℹ️ معلومات</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
          هذه أمثلة توضيحية لمكونات المصادقة الثنائية. في الإنتاج، ستتصل بـ API حقيقي.
        </p>
      </div>
    </div>
  );
}
