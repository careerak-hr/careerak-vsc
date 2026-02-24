import React, { useState } from 'react';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { AppProvider } from '../context/AppContext';

/**
 * PasswordGenerator Example
 * مثال على استخدام مكون PasswordGenerator
 */
function PasswordGeneratorExample() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordGenerated = (generatedPassword) => {
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    console.log('Generated password:', generatedPassword);
  };

  return (
    <AppProvider>
      <div style={{ 
        maxWidth: '600px', 
        margin: '2rem auto', 
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          color: '#304B60'
        }}>
          مثال على مولد كلمات المرور
        </h1>

        {/* Password Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            كلمة المرور
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #D4816180',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <PasswordStrengthIndicator password={password} />
          )}
        </div>

        {/* Password Generator */}
        <PasswordGenerator 
          onPasswordGenerated={handlePasswordGenerated}
        />

        {/* Confirm Password Field */}
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            تأكيد كلمة المرور
          </label>
          
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #D4816180',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          
          {/* Password Match Indicator */}
          {password && confirmPassword && (
            <div style={{ 
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: password === confirmPassword ? '#10b981' : '#ef4444'
            }}>
              {password === confirmPassword ? (
                <span>✓ كلمات المرور متطابقة</span>
              ) : (
                <span>✗ كلمات المرور غير متطابقة</span>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={!password || password !== confirmPassword}
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '0.75rem',
            backgroundColor: password && password === confirmPassword ? '#304B60' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: password && password === confirmPassword ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
          onClick={() => {
            alert('تم التسجيل بنجاح!');
            console.log('Password:', password);
          }}
        >
          تسجيل
        </button>

        {/* Info Box */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: '#1e40af'
          }}>
            💡 نصائح
          </h3>
          <ul style={{ 
            fontSize: '0.875rem', 
            color: '#1e3a8a',
            paddingRight: '1.5rem',
            margin: 0
          }}>
            <li>استخدم زر "اقتراح كلمة مرور قوية" لتوليد كلمة مرور آمنة</li>
            <li>كلمة المرور المولدة تحتوي على جميع أنواع الأحرف</li>
            <li>يمكنك نسخ كلمة المرور بنقرة واحدة</li>
            <li>يمكنك توليد كلمة مرور جديدة إذا لم تعجبك الأولى</li>
          </ul>
        </div>
      </div>
    </AppProvider>
  );
}

export default PasswordGeneratorExample;
