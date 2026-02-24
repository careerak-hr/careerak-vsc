import React, { useState } from 'react';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';

/**
 * مثال على استخدام مكون PasswordGenerator
 * يوضح كيفية دمج المكون مع حقل كلمة المرور ومؤشر القوة
 */
function PasswordGeneratorUsage() {
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('ar');

  const handlePasswordGenerated = (generatedPassword) => {
    setPassword(generatedPassword);
    console.log('Generated password:', generatedPassword);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Amiri, serif', color: '#304B60', marginBottom: '2rem' }}>
        {language === 'ar' ? 'مثال على مولد كلمات المرور' : 'Password Generator Example'}
      </h1>

      {/* اختيار اللغة */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ fontFamily: 'Amiri, serif', marginRight: '1rem' }}>
          {language === 'ar' ? 'اللغة:' : 'Language:'}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '2px solid #D4816180',
            fontFamily: 'Amiri, serif'
          }}
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* مثال 1: استخدام بسيط */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Amiri, serif', color: '#304B60', marginBottom: '1rem' }}>
          {language === 'ar' ? '1. استخدام بسيط' : '1. Simple Usage'}
        </h2>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'Amiri, serif' }}>
            {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '2px solid #D4816180',
              fontFamily: 'Amiri, serif',
              fontSize: '1rem'
            }}
            autoComplete="new-password"
          />
          
          <PasswordGenerator
            onGenerate={handlePasswordGenerated}
            language={language}
          />
        </div>
      </div>

      {/* مثال 2: مع مؤشر القوة */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Amiri, serif', color: '#304B60', marginBottom: '1rem' }}>
          {language === 'ar' ? '2. مع مؤشر قوة كلمة المرور' : '2. With Password Strength Indicator'}
        </h2>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'Amiri, serif' }}>
            {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '2px solid #D4816180',
              fontFamily: 'Amiri, serif',
              fontSize: '1rem'
            }}
            autoComplete="new-password"
          />
          
          <PasswordGenerator
            onGenerate={handlePasswordGenerated}
            language={language}
          />
          
          {password && (
            <PasswordStrengthIndicator
              password={password}
              language={language}
            />
          )}
        </div>
      </div>

      {/* مثال 3: في نموذج تسجيل */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Amiri, serif', color: '#304B60', marginBottom: '1rem' }}>
          {language === 'ar' ? '3. في نموذج تسجيل' : '3. In Registration Form'}
        </h2>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'Amiri, serif' }}>
              {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
            </label>
            <input
              type="email"
              placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '2px solid #D4816180',
                fontFamily: 'Amiri, serif',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'Amiri, serif' }}>
              {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '2px solid #D4816180',
                fontFamily: 'Amiri, serif',
                fontSize: '1rem'
              }}
              autoComplete="new-password"
            />
            
            <PasswordGenerator
              onGenerate={handlePasswordGenerated}
              language={language}
            />
            
            {password && (
              <PasswordStrengthIndicator
                password={password}
                language={language}
              />
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#304B60',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontFamily: 'Amiri, serif',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#D48161'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#304B60'}
          >
            {language === 'ar' ? 'تسجيل' : 'Register'}
          </button>
        </form>
      </div>

      {/* معلومات إضافية */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#E3DAD1',
        borderRadius: '0.5rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ fontFamily: 'Amiri, serif', color: '#304B60', marginBottom: '1rem' }}>
          {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
        </h3>
        <ul style={{ fontFamily: 'Amiri, serif', color: '#304B60', lineHeight: '1.8' }}>
          <li>
            {language === 'ar'
              ? 'كلمات المرور المولدة تحتوي على 14 حرف (12-32 حرف)'
              : 'Generated passwords contain 14 characters (12-32 characters)'}
          </li>
          <li>
            {language === 'ar'
              ? 'تتضمن: أحرف كبيرة، صغيرة، أرقام، ورموز خاصة'
              : 'Includes: uppercase, lowercase, numbers, and special characters'}
          </li>
          <li>
            {language === 'ar'
              ? 'يمكن نسخ كلمة المرور بنقرة واحدة'
              : 'Password can be copied with one click'}
          </li>
          <li>
            {language === 'ar'
              ? 'يمكن توليد كلمة مرور جديدة في أي وقت'
              : 'New password can be generated at any time'}
          </li>
          <li>
            {language === 'ar'
              ? 'يدعم password managers (autocomplete="new-password")'
              : 'Supports password managers (autocomplete="new-password")'}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PasswordGeneratorUsage;
