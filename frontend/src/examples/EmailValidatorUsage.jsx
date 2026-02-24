import React, { useState } from 'react';
import EmailValidator from '../components/auth/EmailValidator';

/**
 * EmailValidator Usage Example
 * 
 * يوضح كيفية استخدام مكون EmailValidator
 * 
 * الميزات المعروضة:
 * - التحقق الفوري أثناء الكتابة (debounced)
 * - أيقونات الحالة (loading, success, error)
 * - رسائل الخطأ والنجاح
 * - اقتراحات تصحيح الأخطاء
 * - رابط تسجيل الدخول للبريد الموجود
 * - دعم متعدد اللغات
 */
function EmailValidatorUsage() {
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        EmailValidator Component - أمثلة الاستخدام
      </h1>

      {/* Example 1: Basic Usage */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          1. الاستخدام الأساسي
        </h2>
        <EmailValidator
          value={email}
          onChange={setEmail}
          placeholder="أدخل البريد الإلكتروني"
        />
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <strong>القيمة الحالية:</strong> {email || '(فارغ)'}
        </div>
      </section>

      {/* Example 2: In a Form */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          2. داخل نموذج تسجيل
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted:', formData);
            alert('تم إرسال النموذج! (تحقق من console)');
          }}
          className="space-y-4"
        >
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-[#D4816180] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#304B60]"
              placeholder="أدخل اسمك الكامل"
              required
            />
          </div>

          {/* Email Field with Validator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <EmailValidator
              value={formData.email}
              onChange={(value) =>
                setFormData({ ...formData, email: value })
              }
              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-[#D4816180] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#304B60]"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#304B60] text-white py-3 rounded-lg hover:bg-[#D48161] transition-colors font-semibold"
          >
            تسجيل
          </button>
        </form>
      </section>

      {/* Example 3: Custom Debounce Delay */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          3. تأخير مخصص (1000ms)
        </h2>
        <EmailValidator
          value={email}
          onChange={setEmail}
          placeholder="تأخير أطول للتحقق"
          debounceDelay={1000}
        />
        <p className="mt-2 text-sm text-gray-600">
          سيتم التحقق بعد ثانية واحدة من التوقف عن الكتابة
        </p>
      </section>

      {/* Example 4: Disabled State */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          4. حالة معطلة
        </h2>
        <EmailValidator
          value="disabled@example.com"
          onChange={() => {}}
          placeholder="حقل معطل"
          disabled={true}
        />
      </section>

      {/* Testing Examples */}
      <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          🧪 أمثلة للاختبار
        </h2>
        <div className="space-y-2 text-sm text-blue-900">
          <p>
            <strong>بريد صحيح:</strong> test@example.com
          </p>
          <p>
            <strong>خطأ إملائي:</strong> test@gmial.com (سيقترح gmail.com)
          </p>
          <p>
            <strong>بريد غير صحيح:</strong> notanemail
          </p>
          <p>
            <strong>بريد موجود:</strong> (سيعتمد على قاعدة البيانات)
          </p>
        </div>
      </section>

      {/* Code Example */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          📝 مثال الكود
        </h2>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {`import EmailValidator from './components/auth/EmailValidator';

function MyForm() {
  const [email, setEmail] = useState('');

  return (
    <EmailValidator
      value={email}
      onChange={setEmail}
      placeholder="أدخل البريد الإلكتروني"
      required
      debounceDelay={500}
    />
  );
}`}
        </pre>
      </section>

      {/* Props Documentation */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          📚 الخصائص (Props)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-right">الخاصية</th>
                <th className="px-4 py-2 text-right">النوع</th>
                <th className="px-4 py-2 text-right">افتراضي</th>
                <th className="px-4 py-2 text-right">الوصف</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-mono">value</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">-</td>
                <td className="px-4 py-2">قيمة البريد الإلكتروني</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">onChange</td>
                <td className="px-4 py-2">function</td>
                <td className="px-4 py-2">-</td>
                <td className="px-4 py-2">دالة تغيير القيمة</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">placeholder</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">-</td>
                <td className="px-4 py-2">النص التوضيحي</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">required</td>
                <td className="px-4 py-2">boolean</td>
                <td className="px-4 py-2">false</td>
                <td className="px-4 py-2">هل الحقل مطلوب</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">disabled</td>
                <td className="px-4 py-2">boolean</td>
                <td className="px-4 py-2">false</td>
                <td className="px-4 py-2">هل الحقل معطل</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">debounceDelay</td>
                <td className="px-4 py-2">number</td>
                <td className="px-4 py-2">500</td>
                <td className="px-4 py-2">تأخير التحقق (ms)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">className</td>
                <td className="px-4 py-2">string</td>
                <td className="px-4 py-2">''</td>
                <td className="px-4 py-2">CSS classes إضافية</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default EmailValidatorUsage;
