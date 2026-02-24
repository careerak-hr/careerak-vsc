import React, { useState } from 'react';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { AppProvider } from '../context/AppContext';

/**
 * مثال على استخدام مكون PasswordStrengthIndicator
 * يوضح جميع الميزات والحالات المختلفة
 */
function PasswordStrengthIndicatorExample() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);

  const examples = [
    { label: 'ضعيف جداً', value: '123' },
    { label: 'ضعيف', value: 'password' },
    { label: 'متوسط', value: 'Password1' },
    { label: 'جيد', value: 'Password123' },
    { label: 'قوي', value: 'P@ssw0rd!123' }
  ];

  return (
    <AppProvider>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          مثال على مؤشر قوة كلمة المرور
        </h1>

        {/* حقل إدخال كلمة المرور */}
        <div className="mb-8">
          <label htmlFor="password" className="block text-lg font-semibold mb-2">
            كلمة المرور:
          </label>
          <input
            id="password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة مرور لاختبار المؤشر"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {/* مؤشر قوة كلمة المرور */}
          {password && (
            <PasswordStrengthIndicator
              password={password}
              onStrengthChange={(newStrength) => {
                setStrength(newStrength);
                console.log('Password strength changed:', newStrength);
              }}
            />
          )}
        </div>

        {/* أمثلة سريعة */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">أمثلة سريعة:</h2>
          <div className="grid grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPassword(example.value)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {example.label}: {example.value}
              </button>
            ))}
          </div>
        </div>

        {/* معلومات القوة الحالية */}
        {strength && (
          <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <h2 className="text-xl font-semibold mb-4">معلومات القوة:</h2>
            <div className="space-y-2">
              <p><strong>النتيجة:</strong> {strength.score}/4</p>
              <p><strong>التصنيف:</strong> {strength.label}</p>
              <p><strong>النسبة المئوية:</strong> {strength.percentage.toFixed(0)}%</p>
              <p><strong>اللون:</strong> <span style={{ color: strength.color }}>●</span> {strength.color}</p>
              <p><strong>وقت الاختراق:</strong> {strength.crackTime}</p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">المتطلبات المستوفاة:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className={strength.requirements.length ? 'text-green-600' : 'text-red-600'}>
                    8 أحرف على الأقل: {strength.requirements.length ? '✓' : '✗'}
                  </li>
                  <li className={strength.requirements.uppercase ? 'text-green-600' : 'text-red-600'}>
                    حرف كبير: {strength.requirements.uppercase ? '✓' : '✗'}
                  </li>
                  <li className={strength.requirements.lowercase ? 'text-green-600' : 'text-red-600'}>
                    حرف صغير: {strength.requirements.lowercase ? '✓' : '✗'}
                  </li>
                  <li className={strength.requirements.number ? 'text-green-600' : 'text-red-600'}>
                    رقم: {strength.requirements.number ? '✓' : '✗'}
                  </li>
                  <li className={strength.requirements.special ? 'text-green-600' : 'text-red-600'}>
                    رمز خاص: {strength.requirements.special ? '✓' : '✗'}
                  </li>
                </ul>
              </div>

              {strength.feedback && strength.feedback.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">نصائح التحسين:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {strength.feedback.map((tip, i) => (
                      <li key={i} className="text-blue-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ملاحظات */}
        <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">ملاحظات:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>المكون يستخدم مكتبة zxcvbn لحساب قوة كلمة المرور</li>
            <li>يتم تحميل zxcvbn بشكل lazy (عند الحاجة فقط)</li>
            <li>التحديث فوري أثناء الكتابة</li>
            <li>يدعم 3 لغات: العربية، الإنجليزية، الفرنسية</li>
            <li>يدعم RTL للغة العربية</li>
          </ul>
        </div>
      </div>
    </AppProvider>
  );
}

export default PasswordStrengthIndicatorExample;
