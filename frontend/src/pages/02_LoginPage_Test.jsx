import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPageTest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    console.log(`Input changed: ${name} = ${type === 'checkbox' ? checked : value}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
    alert('تم إرسال بيانات تسجيل الدخول!');
  };

  // أبسط الأساليب الممكنة
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#E3DAD1',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: 'white',
    border: '2px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    // إجبار التفاعل
    pointerEvents: 'auto',
    cursor: 'text',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    touchAction: 'manipulation',
    WebkitTouchCallout: 'default',
    WebkitUserModify: 'read-write'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#304B60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '30px', borderRadius: '10px' }}>
        
        {/* الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #304B60', margin: '0 auto 20px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ color: '#304B60', margin: '0', fontSize: '36px' }}>Careerak</h1>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>اختبار تسجيل الدخول</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* حقل الإيميل */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              البريد الإلكتروني أو اسم المستخدم:
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="اكتب بريدك الإلكتروني هنا"
              style={inputStyle}
              autoComplete="username"
            />
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              كلمة المرور:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="اكتب كلمة المرور"
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>

          {/* تذكرني */}
          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                style={{ marginLeft: '10px', cursor: 'pointer' }}
              />
              تذكرني
            </label>
          </div>

          {/* زر تسجيل الدخول */}
          <button type="submit" style={buttonStyle}>
            تسجيل الدخول
          </button>

          {/* رابط إنشاء حساب جديد */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ margin: '0', color: '#666' }}>
              ليس لديك حساب؟{' '}
              <span 
                onClick={() => navigate('/auth')} 
                style={{ color: '#304B60', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
              >
                إنشاء حساب جديد
              </span>
            </p>
          </div>

          {/* عرض البيانات المدخلة */}
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>البيانات المدخلة:</h3>
            <p><strong>الإيميل:</strong> {formData.email || 'فارغ'}</p>
            <p><strong>كلمة المرور:</strong> {formData.password ? '***' : 'فارغ'}</p>
            <p><strong>تذكرني:</strong> {formData.rememberMe ? 'نعم' : 'لا'}</p>
          </div>

        </form>
      </div>
    </div>
  );
}