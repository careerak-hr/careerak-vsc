import React, { useState } from 'react';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import PasswordGenerator from '../components/auth/PasswordGenerator';
import { AppProvider } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

/**
 * أمثلة شاملة على استخدام PasswordStrengthIndicator
 * يوضح جميع حالات الاستخدام الشائعة
 */
function PasswordStrengthIndicatorUsage() {
  return (
    <AppProvider>
      <div className="max-w-4xl mx-auto p-8 space-y-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          أمثلة استخدام PasswordStrengthIndicator
        </h1>

        {/* مثال 1: الاستخدام الأساسي */}
        <Example1BasicUsage />

        {/* مثال 2: مع Callback */}
        <Example2WithCallback />

        {/* مثال 3: مع Show/Hide Password */}
        <Example3WithShowHide />

        {/* مثال 4: مع Password Generator */}
        <Example4WithGenerator />

        {/* مثال 5: نموذج تسجيل كامل */}
        <Example5FullForm />

        {/* مثال 6: مع Validation Rules */}
        <Example6WithValidation />

        {/* مثال 7: اختبار اللغات */}
        <Example7Languages />
      </div>
    </AppProvider>
  );
}

/**
 * مثال 1: الاستخدام الأساسي
 */
function Example1BasicUsage() {
  const [password, setPassword] = useState('');

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">1️⃣ الاستخدام الأساسي</h2>
      <p className="text-gray-600 mb-4">
        أبسط طريقة لاستخدام المكون - فقط مرر كلمة المرور
      </p>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="أدخل كلمة المرور"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />

        {password && (
          <PasswordStrengthIndicator password={password} />
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>الكود:</strong>
        </p>
        <pre className="text-xs mt-2 overflow-x-auto">
{`<PasswordStrengthIndicator password={password} />`}
        </pre>
      </div>
    </section>
  );
}

/**
 * مثال 2: مع Callback للتغييرات
 */
function Example2WithCallback() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">2️⃣ مع Callback للتغييرات</h2>
      <p className="text-gray-600 mb-4">
        استخدم onStrengthChange للحصول على معلومات القوة
      </p>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="أدخل كلمة المرور"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />

        {password && (
          <PasswordStrengthIndicator
            password={password}
            onStrengthChange={setStrength}
          />
        )}
      </div>

      {strength && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold mb-2">معلومات القوة:</p>
          <ul className="text-sm space-y-1">
            <li>النتيجة: {strength.score}/4</li>
            <li>التصنيف: {strength.label}</li>
            <li>النسبة: {strength.percentage.toFixed(0)}%</li>
            <li>اللون: <span style={{ color: strength.color }}>●</span> {strength.color}</li>
          </ul>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>الكود:</strong>
        </p>
        <pre className="text-xs mt-2 overflow-x-auto">
{`<PasswordStrengthIndicator
  password={password}
  onStrengthChange={setStrength}
/>`}
        </pre>
      </div>
    </section>
  );
}

/**
 * مثال 3: مع Show/Hide Password
 */
function Example3WithShowHide() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">3️⃣ مع Show/Hide Password</h2>
      <p className="text-gray-600 mb-4">
        دمج مع أيقونة عين لإظهار/إخفاء كلمة المرور
      </p>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {password && (
          <PasswordStrengthIndicator password={password} />
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>الكود:</strong>
        </p>
        <pre className="text-xs mt-2 overflow-x-auto">
{`<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
<PasswordStrengthIndicator password={password} />`}
        </pre>
      </div>
    </section>
  );
}

/**
 * مثال 4: مع Password Generator
 */
function Example4WithGenerator() {
  const [password, setPassword] = useState('');

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">4️⃣ مع Password Generator</h2>
      <p className="text-gray-600 mb-4">
        دمج مع مولد كلمات المرور القوية
      </p>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="أدخل كلمة المرور أو اقترح واحدة"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />

        <PasswordGenerator onGenerate={setPassword} />

        {password && (
          <PasswordStrengthIndicator password={password} />
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>الكود:</strong>
        </p>
        <pre className="text-xs mt-2 overflow-x-auto">
{`<input
  type="text"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
<PasswordGenerator onGenerate={setPassword} />
<PasswordStrengthIndicator password={password} />`}
        </pre>
      </div>
    </section>
  );
}

/**
 * مثال 5: نموذج تسجيل كامل
 */
function Example5FullForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passwordStrength || passwordStrength.score < 2) {
      alert('كلمة المرور ضعيفة جداً!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('كلمتا المرور غير متطابقتين!');
      return;
    }

    setSubmitted(true);
    console.log('Form submitted:', formData);
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">5️⃣ نموذج تسجيل كامل</h2>
      <p className="text-gray-600 mb-4">
        مثال على نموذج تسجيل كامل مع التحقق من القوة
      </p>

      {submitted ? (
        <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
          <p className="text-green-700 font-semibold">
            ✅ تم التسجيل بنجاح!
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            تسجيل آخر
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              الاسم:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="الاسم الكامل"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              البريد الإلكتروني:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              كلمة المرور:
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator
                password={formData.password}
                onStrengthChange={setPasswordStrength}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              تأكيد كلمة المرور:
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="أعد إدخال كلمة المرور"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ كلمتا المرور غير متطابقتين
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!passwordStrength || passwordStrength.score < 2}
            className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            تسجيل
          </button>
        </form>
      )}
    </section>
  );
}

/**
 * مثال 6: مع Validation Rules
 */
function Example6WithValidation() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0 && newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    } else {
      setError('');
    }
  };

  const handleStrengthChange = (newStrength) => {
    setStrength(newStrength);

    if (newStrength.score < 2) {
      setError('كلمة المرور ضعيفة جداً. يرجى اتباع النصائح أدناه.');
    } else {
      setError('');
    }
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">6️⃣ مع Validation Rules</h2>
      <p className="text-gray-600 mb-4">
        عرض رسائل خطأ مخصصة بناءً على القوة
      </p>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="أدخل كلمة المرور"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
        />

        {error && (
          <p className="text-sm text-red-600 mt-1 font-semibold">
            ⚠️ {error}
          </p>
        )}

        {password && (
          <PasswordStrengthIndicator
            password={password}
            onStrengthChange={handleStrengthChange}
          />
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>الكود:</strong>
        </p>
        <pre className="text-xs mt-2 overflow-x-auto">
{`const handleStrengthChange = (newStrength) => {
  if (newStrength.score < 2) {
    setError('كلمة المرور ضعيفة جداً');
  } else {
    setError('');
  }
};`}
        </pre>
      </div>
    </section>
  );
}

/**
 * مثال 7: اختبار اللغات
 */
function Example7Languages() {
  const [password, setPassword] = useState('Test123!');
  const [language, setLanguage] = useState('ar');

  return (
    <section className="p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-4">7️⃣ اختبار اللغات</h2>
      <p className="text-gray-600 mb-4">
        المكون يدعم 3 لغات: العربية، الإنجليزية، الفرنسية
      </p>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          اختر اللغة:
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              language === 'ar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              language === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              language === 'fr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Français
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          كلمة المرور:
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />

        {password && (
          <AppProvider language={language}>
            <PasswordStrengthIndicator password={password} />
          </AppProvider>
        )}
      </div>
    </section>
  );
}

export default PasswordStrengthIndicatorUsage;
